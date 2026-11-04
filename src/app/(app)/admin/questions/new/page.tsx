import { requireAdmin } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { NewQuestionForm } from "./NewQuestionForm";

export default async function NewQuestionPage() {
  await requireAdmin();
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

  return (
    <div className="space-y-6">
      <div>
        <p className="chip w-fit">Admin</p>
        <h1 className="mt-3 font-[family-name:var(--font-syne)] text-4xl font-extrabold">
          New question
        </h1>
        <p className="mt-2 text-cream-muted">
          MCQ or enter-answer · prompt image required · optional solution image.
        </p>
      </div>
      <NewQuestionForm exams={exams} />
    </div>
  );
}
