import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

const schema = z.object({
  firstName: z.string().min(1).max(80),
  lastName: z.string().min(1).max(80),
  username: z
    .string()
    .min(3)
    .max(32)
    .regex(/^[a-zA-Z0-9_]+$/, "Username: letters, numbers, underscore only"),
  email: z.string().email(),
  password: z.string().min(8).max(128),
  examId: z.string().min(1),
  subjectIds: z.array(z.string()).min(1),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const data = schema.parse(body);

    const existing = await prisma.user.findFirst({
      where: {
        OR: [
          { email: data.email.toLowerCase() },
          { username: data.username },
        ],
      },
    });
    if (existing) {
      const field = existing.email === data.email.toLowerCase() ? "email" : "username";
      return NextResponse.json(
        { error: `That ${field} is already taken` },
        { status: 409 }
      );
    }

    const exam = await prisma.exam.findUnique({ where: { id: data.examId } });
    if (!exam) {
      return NextResponse.json({ error: "Invalid exam" }, { status: 400 });
    }

    const subjects = await prisma.subject.findMany({
      where: { id: { in: data.subjectIds }, examId: data.examId },
    });
    if (subjects.length !== data.subjectIds.length) {
      return NextResponse.json(
        { error: "Subjects must belong to the selected exam" },
        { status: 400 }
      );
    }

    const passwordHash = await bcrypt.hash(data.password, 10);
    const user = await prisma.user.create({
      data: {
        firstName: data.firstName.trim(),
        lastName: data.lastName.trim(),
        username: data.username,
        email: data.email.toLowerCase(),
        passwordHash,
        targetExamId: data.examId,
        role: "student",
        subjects: {
          create: data.subjectIds.map((subjectId) => ({ subjectId })),
        },
      },
      select: { id: true, username: true, email: true },
    });

    return NextResponse.json({ user }, { status: 201 });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json(
        { error: err.issues[0]?.message || "Invalid input" },
        { status: 400 }
      );
    }
    console.error(err);
    return NextResponse.json({ error: "Signup failed" }, { status: 500 });
  }
}
