import Link from "next/link";
import { requireUser } from "@/lib/session";
import { prisma } from "@/lib/prisma";

export default async function ProfilePage() {
  const session = await requireUser();
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: { targetExam: true },
  });

  const attempts = await prisma.attempt.findMany({
    where: { userId: session.user.id, completedAt: { not: null } },
    orderBy: { completedAt: "desc" },
    include: {
      subject: { include: { exam: true } },
      topic: true,
      subtopic: true,
    },
    take: 50,
  });

  return (
    <div className="space-y-8">
      <div>
        <p className="chip w-fit">Profile</p>
        <h1 className="mt-3 font-[family-name:var(--font-syne)] text-4xl font-extrabold">
          {user?.firstName} {user?.lastName}
        </h1>
        <p className="mt-2 text-cream-muted">
          @{user?.username} · {user?.email}
          {user?.targetExam ? ` · ${user.targetExam.name}` : ""}
        </p>
      </div>

      <section>
        <h2 className="font-[family-name:var(--font-syne)] text-xl font-bold">
          Past results
        </h2>
        {attempts.length === 0 ? (
          <p className="mt-3 text-cream-muted">
            No completed attempts yet.{" "}
            <Link href="/test" className="text-lime hover:underline">
              Take a test
            </Link>
          </p>
        ) : (
          <div className="mt-4 overflow-hidden surface">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-[var(--line)] text-cream-muted">
                <tr>
                  <th className="px-4 py-3 font-medium">When</th>
                  <th className="px-4 py-3 font-medium">Mode</th>
                  <th className="px-4 py-3 font-medium">Subject</th>
                  <th className="px-4 py-3 font-medium">Score</th>
                  <th className="px-4 py-3 font-medium"></th>
                </tr>
              </thead>
              <tbody>
                {attempts.map((a) => (
                  <tr key={a.id} className="border-b border-[var(--line)] last:border-0">
                    <td className="px-4 py-3 text-cream-muted">
                      {a.completedAt
                        ? new Date(a.completedAt).toLocaleString()
                        : "—"}
                    </td>
                    <td className="px-4 py-3 capitalize">{a.mode}</td>
                    <td className="px-4 py-3">
                      {a.subject.name}
                      {a.topic ? ` · ${a.topic.name}` : ""}
                    </td>
                    <td className="px-4 py-3 font-semibold text-lime">
                      {a.score}/{a.questionCount}
                    </td>
                    <td className="px-4 py-3">
                      <Link href={`/results/${a.id}`} className="text-cream-muted hover:text-lime">
                        View
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
