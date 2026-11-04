import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { randomUUID } from "crypto";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

async function requireAdminApi() {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "admin") return null;
  return session;
}

export async function GET() {
  const session = await requireAdminApi();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const questions = await prisma.question.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      subject: { include: { exam: true } },
      topic: true,
      subtopic: true,
    },
    take: 100,
  });
  return NextResponse.json({ questions });
}

export async function POST(req: Request) {
  const session = await requireAdminApi();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const form = await req.formData();
    const type = String(form.get("type") || "");
    const difficulty = String(form.get("difficulty") || "");
    const subjectId = String(form.get("subjectId") || "");
    const topicId = String(form.get("topicId") || "") || null;
    const subtopicId = String(form.get("subtopicId") || "") || null;
    const correctAnswer = String(form.get("correctAnswer") || "").trim();
    const timeAllowanceSec = Number(form.get("timeAllowanceSec") || 120);
    const choicesRaw = String(form.get("choices") || "");

    if (!["mcq", "enter_answer"].includes(type)) {
      return NextResponse.json({ error: "Invalid type" }, { status: 400 });
    }
    if (!["low", "moderate", "high"].includes(difficulty)) {
      return NextResponse.json({ error: "Invalid difficulty" }, { status: 400 });
    }
    if (!subjectId || !correctAnswer) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const promptFile = form.get("promptImage");
    if (!(promptFile instanceof File) || promptFile.size === 0) {
      return NextResponse.json({ error: "Prompt image required" }, { status: 400 });
    }

    const uploadDir = path.join(process.cwd(), "uploads", "questions");
    fs.mkdirSync(uploadDir, { recursive: true });

    const saveFile = async (file: File, prefix: string) => {
      const ext = path.extname(file.name) || ".png";
      const name = `${prefix}-${randomUUID()}${ext}`;
      const buf = Buffer.from(await file.arrayBuffer());
      fs.writeFileSync(path.join(uploadDir, name), buf);
      return `/uploads/questions/${name}`;
    };

    const promptImageUrl = await saveFile(promptFile, "prompt");
    let solutionImageUrl: string | null = null;
    const solutionFile = form.get("solutionImage");
    if (solutionFile instanceof File && solutionFile.size > 0) {
      solutionImageUrl = await saveFile(solutionFile, "solution");
    }

    let choicesJson: string | null = null;
    if (type === "mcq") {
      const choices = choicesRaw
        .split("\n")
        .map((c) => c.trim())
        .filter(Boolean);
      if (choices.length < 2) {
        return NextResponse.json(
          { error: "MCQ needs at least 2 choices (one per line)" },
          { status: 400 }
        );
      }
      if (!choices.includes(correctAnswer)) {
        return NextResponse.json(
          { error: "Correct answer must match one choice exactly" },
          { status: 400 }
        );
      }
      choicesJson = JSON.stringify(choices);
    }

    const question = await prisma.question.create({
      data: {
        type,
        difficulty,
        subjectId,
        topicId,
        subtopicId,
        correctAnswer,
        timeAllowanceSec: Number.isFinite(timeAllowanceSec) ? timeAllowanceSec : 120,
        choicesJson,
        promptImageUrl,
        solutionImageUrl,
        createdByAdminId: session.user.id,
      },
    });

    return NextResponse.json({ question }, { status: 201 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to create question" }, { status: 500 });
  }
}
