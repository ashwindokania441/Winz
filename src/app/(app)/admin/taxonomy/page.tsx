import { requireAdmin } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { TaxonomyForm } from "./TaxonomyForm";

export default async function TaxonomyPage() {
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
    <div className="space-y-8">
      <div>
        <p className="chip w-fit">Admin</p>
        <h1 className="mt-3 font-[family-name:var(--font-syne)] text-4xl font-extrabold">
          Taxonomy
        </h1>
        <p className="mt-2 text-cream-muted">
          Add subjects, topics, and subtopics when the bank needs new branches.
        </p>
      </div>

      <TaxonomyForm exams={exams} />

      <section className="space-y-4">
        {exams.map((exam) => (
          <div key={exam.id} className="surface p-5">
            <h2 className="font-[family-name:var(--font-syne)] text-lg font-bold">
              {exam.family} · {exam.name}
            </h2>
            <ul className="mt-3 space-y-2 text-sm text-cream-muted">
              {exam.subjects.map((s) => (
                <li key={s.id}>
                  <span className="text-cream">{s.name}</span>
                  <ul className="ml-4 mt-1 list-disc">
                    {s.topics.map((t) => (
                      <li key={t.id}>
                        {t.name}
                        {t.subtopics.length > 0 && (
                          <span className="text-cream-muted">
                            {" "}
                            — {t.subtopics.map((st) => st.name).join(", ")}
                          </span>
                        )}
                      </li>
                    ))}
                  </ul>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </section>
    </div>
  );
}
