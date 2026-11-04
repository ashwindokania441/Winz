"use client";

import { FormEvent, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

type Exam = {
  id: string;
  family: string;
  name: string;
  subjects: {
    id: string;
    name: string;
    topics: { id: string; name: string }[];
  }[];
};

export function TaxonomyForm({ exams }: { exams: Exam[] }) {
  const router = useRouter();
  const [kind, setKind] = useState<"subject" | "topic" | "subtopic">("topic");
  const [examId, setExamId] = useState(exams[0]?.id || "");
  const subjects = useMemo(
    () => exams.find((e) => e.id === examId)?.subjects || [],
    [exams, examId]
  );
  const [subjectId, setSubjectId] = useState(subjects[0]?.id || "");
  const topics = useMemo(
    () => subjects.find((s) => s.id === subjectId)?.topics || [],
    [subjects, subjectId]
  );
  const [topicId, setTopicId] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [ok, setOk] = useState("");

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setOk("");
    const body =
      kind === "subject"
        ? { kind, examId, name }
        : kind === "topic"
          ? { kind, subjectId, name }
          : { kind, topicId, name };

    const res = await fetch("/api/admin/taxonomy", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error || "Failed");
      return;
    }
    setOk("Added");
    setName("");
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="surface space-y-4 p-6">
      <div className="flex flex-wrap gap-2">
        {(["subject", "topic", "subtopic"] as const).map((k) => (
          <button
            key={k}
            type="button"
            onClick={() => setKind(k)}
            className={`rounded-full border px-3 py-1.5 text-sm capitalize ${
              kind === k
                ? "border-lime bg-lime/15 text-cream"
                : "border-[var(--line)] text-cream-muted"
            }`}
          >
            {k}
          </button>
        ))}
      </div>

      {kind === "subject" && (
        <div>
          <label className="label">Exam</label>
          <select className="field" value={examId} onChange={(e) => setExamId(e.target.value)}>
            {exams.map((e) => (
              <option key={e.id} value={e.id}>
                {e.family} · {e.name}
              </option>
            ))}
          </select>
        </div>
      )}

      {(kind === "topic" || kind === "subtopic") && (
        <>
          <div>
            <label className="label">Exam (filter)</label>
            <select
              className="field"
              value={examId}
              onChange={(e) => {
                setExamId(e.target.value);
                const next = exams.find((x) => x.id === e.target.value)?.subjects[0];
                setSubjectId(next?.id || "");
                setTopicId("");
              }}
            >
              {exams.map((e) => (
                <option key={e.id} value={e.id}>
                  {e.family} · {e.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="label">Subject</label>
            <select
              className="field"
              value={subjectId}
              onChange={(e) => {
                setSubjectId(e.target.value);
                setTopicId("");
              }}
            >
              {subjects.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>
        </>
      )}

      {kind === "subtopic" && (
        <div>
          <label className="label">Topic</label>
          <select className="field" value={topicId} onChange={(e) => setTopicId(e.target.value)}>
            <option value="">Select topic</option>
            {topics.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
          </select>
        </div>
      )}

      <div>
        <label className="label">Name</label>
        <input className="field" value={name} onChange={(e) => setName(e.target.value)} required />
      </div>
      {error && <p className="text-sm text-coral">{error}</p>}
      {ok && <p className="text-sm text-lime">{ok}</p>}
      <button type="submit" className="btn-primary">
        Add {kind}
      </button>
    </form>
  );
}
