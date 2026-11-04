import Link from "next/link";
import { notFound } from "next/navigation";
import { requireUser } from "@/lib/session";
import { prisma } from "@/lib/prisma";

export default async function ResultsPage({
  params,
}: {
  params: Promise<{ attemptId: string }>;
}) {
  const session = await requireUser();
  const { attemptId } = await params;

  const attempt = await prisma.attempt.findFirst({
    where: { id: attemptId, userId: session.user.id },
    include: {
      subject: { include: { exam: true } },
      topic: true,
      subtopic: true,
      answers: {
        include: { question: true },
        orderBy: { id: "asc" },
      },
    },
  });

  if (!attempt) notFound();

  const score = attempt.score ?? 0;
  const total = attempt.questionCount || attempt.answers.length;

  return (
    <div className="space-y-6">
      <div>
        <p className="chip w-fit capitalize">{attempt.mode} results</p>
        <h1 className="mt-3 font-[family-name:var(--font-syne)] text-4xl font-extrabold">
          {score}/{total}
        </h1>
        <p className="mt-2 text-cream-muted">
          {attempt.subject.exam.family} · {attempt.subject.name}
          {attempt.topic ? ` · ${attempt.topic.name}` : ""}
          {attempt.subtopic ? ` · ${attempt.subtopic.name}` : ""}
        </p>
      </div>

      <div className="surface overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-[var(--line)] text-cream-muted">
            <tr>
              <th className="px-4 py-3 font-medium">#</th>
              <th className="px-4 py-3 font-medium">Your answer</th>
              <th className="px-4 py-3 font-medium">Correct</th>
              <th className="px-4 py-3 font-medium">Result</th>
            </tr>
          </thead>
          <tbody>
            {attempt.answers.map((a, i) => (
              <tr key={a.id} className="border-b border-[var(--line)] last:border-0">
                <td className="px-4 py-3">{i + 1}</td>
                <td className="px-4 py-3">{a.givenAnswer || "—"}</td>
                <td className="px-4 py-3 text-cream-muted">{a.question.correctAnswer}</td>
                <td className="px-4 py-3">
                  <span className={a.isCorrect ? "text-lime" : "text-coral"}>
                    {a.isCorrect ? "Correct" : "Incorrect"}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex flex-wrap gap-3">
        <Link href="/profile" className="btn-primary">
          View profile results
        </Link>
        <Link href="/dashboard" className="btn-ghost">
          Dashboard
        </Link>
      </div>
    </div>
  );
}
