"use client";

import { useMemo, useState } from "react";
import Link from "next/link";

type Topic = { id: string; name: string; subtopics: { id: string; name: string }[] };
type Subject = {
  id: string;
  name: string;
  exam: { id: string; name: string; family: string };
  topics: Topic[];
};

export function ModePicker({
  subjects,
  mode,
}: {
  subjects: Subject[];
  mode: "practice" | "test";
}) {
  const [subjectId, setSubjectId] = useState(subjects[0]?.id || "");
  const subject = useMemo(
    () => subjects.find((s) => s.id === subjectId),
    [subjects, subjectId]
  );
  const [scope, setScope] = useState<"syllabus" | "topic" | "subtopic">("syllabus");
  const [topicId, setTopicId] = useState("");
  const [subtopicId, setSubtopicId] = useState("");
  const [difficulty, setDifficulty] = useState("high");

  const topics = subject?.topics || [];
  const subtopics = topics.find((t) => t.id === topicId)?.subtopics || [];

  const href = useMemo(() => {
    if (!subjectId) return "#";
    if (scope === "topic" && !topicId) return "#";
    if (scope === "subtopic" && (!topicId || !subtopicId)) return "#";

    const params = new URLSearchParams();
    params.set("subjectId", subjectId);
    if (scope === "topic" && topicId) params.set("topicId", topicId);
    if (scope === "subtopic" && subtopicId) {
      params.set("topicId", topicId);
      params.set("subtopicId", subtopicId);
    }
    if (scope === "syllabus") params.set("wholeSyllabus", "1");
    if (mode === "test") params.set("difficulty", difficulty);
    return `/${mode}/session?${params.toString()}`;
  }, [subjectId, scope, topicId, subtopicId, difficulty, mode]);

  const canStart = href !== "#";

  if (!subjects.length) {
    return (
      <div className="surface p-6 text-cream-muted">
        No subjects on your account yet. Update signup choices or ask admin.
      </div>
    );
  }

  return (
    <div className="surface space-y-5 p-6 md:p-8">
      <div>
        <label className="label">Subject</label>
        <select
          className="field"
          value={subjectId}
          onChange={(e) => {
            setSubjectId(e.target.value);
            setTopicId("");
            setSubtopicId("");
          }}
        >
          {subjects.map((s) => (
            <option key={s.id} value={s.id}>
              {s.exam.family} · {s.name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="label">Scope</label>
        <div className="flex flex-wrap gap-2">
          {(
            [
              ["syllabus", "Whole syllabus"],
              ["topic", "Topic"],
              ["subtopic", "Subtopic"],
            ] as const
          ).map(([value, label]) => (
            <button
              key={value}
              type="button"
              onClick={() => setScope(value)}
              className={`rounded-full border px-4 py-2 text-sm ${
                scope === value
                  ? "border-lime bg-lime/10 text-cream"
                  : "border-[var(--line)] text-cream-muted"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {(scope === "topic" || scope === "subtopic") && (
        <div>
          <label className="label">Topic</label>
          <select
            className="field"
            value={topicId}
            onChange={(e) => {
              setTopicId(e.target.value);
              setSubtopicId("");
            }}
          >
            <option value="">Select topic</option>
            {topics.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
          </select>
        </div>
      )}

      {scope === "subtopic" && (
        <div>
          <label className="label">Subtopic</label>
          <select
            className="field"
            value={subtopicId}
            onChange={(e) => setSubtopicId(e.target.value)}
          >
            <option value="">Select subtopic</option>
            {subtopics.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        </div>
      )}

      {mode === "test" && (
        <div>
          <label className="label">Difficulty ceiling (questions ordered low → high)</label>
          <select
            className="field"
            value={difficulty}
            onChange={(e) => setDifficulty(e.target.value)}
          >
            <option value="low">Low</option>
            <option value="moderate">Up to moderate</option>
            <option value="high">Up to high</option>
          </select>
        </div>
      )}

      {canStart ? (
        <Link href={href} className="btn-primary inline-flex">
          Start {mode}
        </Link>
      ) : (
        <span className="btn-primary inline-flex cursor-not-allowed opacity-50">
          Start {mode}
        </span>
      )}
    </div>
  );
}
