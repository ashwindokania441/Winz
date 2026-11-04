import Link from "next/link";
import { requireUser } from "@/lib/session";
import { prisma } from "@/lib/prisma";

export default async function DashboardPage() {
  const session = await requireUser();
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: {
      targetExam: true,
      subjects: {
        include: {
          subject: { include: { exam: true } },
        },
      },
    },
  });

  const subjects = user?.subjects.map((us) => us.subject) || [];

  return (
    <div className="space-y-8">
      <div>
        <p className="chip w-fit">Dashboard</p>
        <h1 className="mt-3 font-[family-name:var(--font-syne)] text-4xl font-extrabold tracking-tight">
          Hey {user?.firstName || "there"}
        </h1>
        <p className="mt-2 text-cream-muted">
          {user?.targetExam
            ? `Target exam: ${user.targetExam.family} · ${user.targetExam.name}`
            : "Pick a subject and choose Practice or Test."}
        </p>
      </div>

      <section>
        <h2 className="font-[family-name:var(--font-syne)] text-xl font-bold">
          Your subjects
        </h2>
        {subjects.length === 0 ? (
          <p className="mt-3 text-cream-muted">No subjects linked yet.</p>
        ) : (
          <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {subjects.map((s) => (
              <div key={s.id} className="surface p-5">
                <p className="text-xs uppercase tracking-[0.16em] text-cream-muted">
                  {s.exam.family}
                </p>
                <h3 className="mt-2 font-[family-name:var(--font-syne)] text-lg font-bold">
                  {s.name}
                </h3>
                <div className="mt-5 flex flex-wrap gap-2">
                  <Link
                    href={`/practice?subjectId=${s.id}`}
                    className="btn-ghost !py-2 !px-3 text-sm"
                  >
                    Practice
                  </Link>
                  <Link
                    href={`/test?subjectId=${s.id}`}
                    className="btn-primary !py-2 !px-3 text-sm"
                  >
                    Test
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="surface flex flex-wrap items-center justify-between gap-4 p-6">
        <div>
          <h2 className="font-[family-name:var(--font-syne)] text-xl font-bold">
            Start from exam flow
          </h2>
          <p className="mt-1 text-sm text-cream-muted">
            Exam → subject → Practice or Test (individual only in Phase 1).
          </p>
        </div>
        <div className="flex gap-2">
          <Link href="/practice" className="btn-ghost">
            Practice
          </Link>
          <Link href="/test" className="btn-primary">
            Test
          </Link>
        </div>
      </section>
    </div>
  );
}
