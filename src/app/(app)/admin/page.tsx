import Link from "next/link";
import { requireAdmin } from "@/lib/session";
import { prisma } from "@/lib/prisma";

export default async function AdminPage() {
  await requireAdmin();
  const [questionCount, subjectCount, topicCount] = await Promise.all([
    prisma.question.count(),
    prisma.subject.count(),
    prisma.topic.count(),
  ]);

  const recent = await prisma.question.findMany({
    orderBy: { createdAt: "desc" },
    take: 8,
    include: {
      subject: { include: { exam: true } },
      topic: true,
      subtopic: true,
    },
  });

  return (
    <div className="space-y-8">
      <div>
        <p className="chip w-fit">Admin</p>
        <h1 className="mt-3 font-[family-name:var(--font-syne)] text-4xl font-extrabold">
          Question bank
        </h1>
        <p className="mt-2 text-cream-muted">
          Single admin account — upload MCQ and enter-answer questions with images.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="surface p-5">
          <p className="text-sm text-cream-muted">Questions</p>
          <p className="mt-2 font-[family-name:var(--font-syne)] text-3xl font-bold text-lime">
            {questionCount}
          </p>
        </div>
        <div className="surface p-5">
          <p className="text-sm text-cream-muted">Subjects</p>
          <p className="mt-2 font-[family-name:var(--font-syne)] text-3xl font-bold">
            {subjectCount}
          </p>
        </div>
        <div className="surface p-5">
          <p className="text-sm text-cream-muted">Topics</p>
          <p className="mt-2 font-[family-name:var(--font-syne)] text-3xl font-bold">
            {topicCount}
          </p>
        </div>
      </div>

      <div className="flex flex-wrap gap-3">
        <Link href="/admin/questions/new" className="btn-primary">
          New question
        </Link>
        <Link href="/admin/taxonomy" className="btn-ghost">
          Manage taxonomy
        </Link>
      </div>

      <section>
        <h2 className="font-[family-name:var(--font-syne)] text-xl font-bold">
          Recent questions
        </h2>
        <div className="surface mt-4 overflow-hidden">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-[var(--line)] text-cream-muted">
              <tr>
                <th className="px-4 py-3 font-medium">Type</th>
                <th className="px-4 py-3 font-medium">Difficulty</th>
                <th className="px-4 py-3 font-medium">Subject</th>
                <th className="px-4 py-3 font-medium">Topic</th>
              </tr>
            </thead>
            <tbody>
              {recent.map((q) => (
                <tr key={q.id} className="border-b border-[var(--line)] last:border-0">
                  <td className="px-4 py-3">{q.type}</td>
                  <td className="px-4 py-3 capitalize">{q.difficulty}</td>
                  <td className="px-4 py-3">{q.subject.name}</td>
                  <td className="px-4 py-3 text-cream-muted">
                    {q.topic?.name || "—"}
                    {q.subtopic ? ` · ${q.subtopic.name}` : ""}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
