import { requireUser } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { ModePicker } from "@/components/ModePicker";

export default async function TestPage({
  searchParams,
}: {
  searchParams: Promise<{ subjectId?: string }>;
}) {
  const session = await requireUser();
  const sp = await searchParams;

  const userSubjects = await prisma.userSubject.findMany({
    where: { userId: session.user.id },
    include: {
      subject: {
        include: {
          exam: true,
          topics: { include: { subtopics: true }, orderBy: { name: "asc" } },
        },
      },
    },
  });

  let subjects = userSubjects.map((us) => us.subject);
  if (sp.subjectId) {
    const preferred = subjects.find((s) => s.id === sp.subjectId);
    if (preferred) {
      subjects = [preferred, ...subjects.filter((s) => s.id !== preferred.id)];
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <p className="chip w-fit">Test</p>
        <h1 className="mt-3 font-[family-name:var(--font-syne)] text-4xl font-extrabold">
          10-question assessment
        </h1>
        <p className="mt-2 max-w-2xl text-cream-muted">
          Questions are served low → high difficulty. Your score lands on your profile.
        </p>
      </div>
      <ModePicker subjects={subjects} mode="test" />
    </div>
  );
}
