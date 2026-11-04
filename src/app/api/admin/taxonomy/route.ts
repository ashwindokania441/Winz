import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

async function requireAdminApi() {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "admin") {
    return null;
  }
  return session;
}

const schema = z.discriminatedUnion("kind", [
  z.object({
    kind: z.literal("subject"),
    examId: z.string(),
    name: z.string().min(1).max(120),
  }),
  z.object({
    kind: z.literal("topic"),
    subjectId: z.string(),
    name: z.string().min(1).max(120),
  }),
  z.object({
    kind: z.literal("subtopic"),
    topicId: z.string(),
    name: z.string().min(1).max(120),
  }),
]);

export async function POST(req: Request) {
  const session = await requireAdminApi();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const data = schema.parse(await req.json());
    if (data.kind === "subject") {
      const subject = await prisma.subject.create({
        data: { examId: data.examId, name: data.name.trim() },
      });
      return NextResponse.json({ subject }, { status: 201 });
    }
    if (data.kind === "topic") {
      const topic = await prisma.topic.create({
        data: { subjectId: data.subjectId, name: data.name.trim() },
      });
      return NextResponse.json({ topic }, { status: 201 });
    }
    const subtopic = await prisma.subtopic.create({
      data: { topicId: data.topicId, name: data.name.trim() },
    });
    return NextResponse.json({ subtopic }, { status: 201 });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json(
        { error: err.issues[0]?.message || "Invalid input" },
        { status: 400 }
      );
    }
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}

export async function GET() {
  const session = await requireAdminApi();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const exams = await prisma.exam.findMany({
    orderBy: [{ family: "asc" }, { name: "asc" }],
    include: {
      subjects: {
        orderBy: { name: "asc" },
        include: {
          topics: {
            orderBy: { name: "asc" },
            include: { subtopics: { orderBy: { name: "asc" } } },
          },
        },
      },
    },
  });

  return NextResponse.json({ exams });
}
