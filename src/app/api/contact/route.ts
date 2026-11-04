import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

const schema = z.object({
  name: z.string().min(1).max(120),
  email: z.string().email(),
  message: z.string().min(5).max(4000),
});

export async function POST(req: Request) {
  try {
    const data = schema.parse(await req.json());
    await prisma.contactMessage.create({
      data: {
        name: data.name.trim(),
        email: data.email.toLowerCase(),
        message: data.message.trim(),
      },
    });
    return NextResponse.json({ ok: true });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json(
        { error: err.issues[0]?.message || "Invalid input" },
        { status: 400 }
      );
    }
    return NextResponse.json({ error: "Failed to send" }, { status: 500 });
  }
}
