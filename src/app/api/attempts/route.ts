import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { gradeAnswer } from "@/lib/grading";

const startSchema = z.object({
  mode: z.enum(["test", "practice"]),
  subjectId: z.string(),
  topicId: z.string().optional().nullable(),
  subtopicId: z.string().optional().nullable(),
  difficulty: z.enum(["low", "moderate", "high"]).optional().nullable(),
  wholeSyllabus: z.boolean().optional(),
});

const DIFF_ORDER = ["low", "moderate", "high"] as const;

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();

    // Submit answers
    if (body.action === "submit") {
      const attemptId = String(body.attemptId || "");
      const answers = body.answers as Array<{
        questionId: string;
        givenAnswer: string;
        timeSpentSec?: number;
      }>;

      const attempt = await prisma.attempt.findFirst({
        where: { id: attemptId, userId: session.user.id },
      });
      if (!attempt || attempt.completedAt) {
        return NextResponse.json({ error: "Invalid attempt" }, { status: 400 });
      }

      const questionIds = answers.map((a) => a.questionId);
      const questions = await prisma.question.findMany({
        where: { id: { in: questionIds } },
      });
      const byId = Object.fromEntries(questions.map((q) => [q.id, q]));

      let correct = 0;
      for (const a of answers) {
        const q = byId[a.questionId];
        if (!q) continue;
        const isCorrect = gradeAnswer(q.type, a.givenAnswer || "", q.correctAnswer);
        if (isCorrect) correct += 1;
        await prisma.attemptAnswer.create({
          data: {
            attemptId,
            questionId: q.id,
            givenAnswer: a.givenAnswer || "",
            isCorrect,
            timeSpentSec: a.timeSpentSec || 0,
          },
        });
      }

      const updated = await prisma.attempt.update({
        where: { id: attemptId },
        data: {
          completedAt: new Date(),
          score: correct,
          questionCount: answers.length,
        },
      });

      return NextResponse.json({ attempt: updated });
    }

    // Start attempt
    const data = startSchema.parse(body);
    const where: {
      subjectId: string;
      topicId?: string;
      subtopicId?: string;
      difficulty?: string | { in: string[] };
    } = { subjectId: data.subjectId };

    if (!data.wholeSyllabus) {
      if (data.subtopicId) where.subtopicId = data.subtopicId;
      else if (data.topicId) where.topicId = data.topicId;
    }

    let pool = await prisma.question.findMany({ where });

    if (data.mode === "test") {
      // Prefer low → moderate → high ordering for the set
      pool = [...pool].sort((a, b) => {
        const ai = DIFF_ORDER.indexOf(a.difficulty as (typeof DIFF_ORDER)[number]);
        const bi = DIFF_ORDER.indexOf(b.difficulty as (typeof DIFF_ORDER)[number]);
        return (ai === -1 ? 99 : ai) - (bi === -1 ? 99 : bi);
      });
      if (data.difficulty) {
        // If a ceiling difficulty is chosen, include up to that level
        const maxIdx = DIFF_ORDER.indexOf(data.difficulty);
        pool = pool.filter((q) => {
          const idx = DIFF_ORDER.indexOf(q.difficulty as (typeof DIFF_ORDER)[number]);
          return idx !== -1 && idx <= maxIdx;
        });
      }
    } else if (data.difficulty) {
      pool = pool.filter((q) => q.difficulty === data.difficulty);
    }

    // Shuffle within difficulty bands for practice; keep band order for tests
    if (data.mode === "practice") {
      pool = pool.sort(() => Math.random() - 0.5);
    } else {
      const bands: Record<string, typeof pool> = { low: [], moderate: [], high: [] };
      for (const q of pool) {
        if (bands[q.difficulty]) bands[q.difficulty].push(q);
      }
      for (const k of DIFF_ORDER) {
        bands[k] = bands[k].sort(() => Math.random() - 0.5);
      }
      pool = [...bands.low, ...bands.moderate, ...bands.high];
    }

    const count = data.mode === "test" ? 10 : Math.min(10, Math.max(1, pool.length));
    const selected = pool.slice(0, count);

    if (selected.length === 0) {
      return NextResponse.json(
        { error: "No questions available for this selection. Ask admin to add some." },
        { status: 404 }
      );
    }

    const attempt = await prisma.attempt.create({
      data: {
        userId: session.user.id,
        mode: data.mode,
        subjectId: data.subjectId,
        topicId: data.topicId || null,
        subtopicId: data.subtopicId || null,
        difficulty: data.difficulty || null,
        questionCount: selected.length,
      },
    });

    return NextResponse.json({
      attempt,
      questions: selected.map((q) => ({
        id: q.id,
        type: q.type,
        difficulty: q.difficulty,
        promptImageUrl: q.promptImageUrl,
        timeAllowanceSec: q.timeAllowanceSec,
        choices: q.choicesJson ? JSON.parse(q.choicesJson) : null,
      })),
    });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json(
        { error: err.issues[0]?.message || "Invalid input" },
        { status: 400 }
      );
    }
    console.error(err);
    return NextResponse.json({ error: "Attempt failed" }, { status: 500 });
  }
}
