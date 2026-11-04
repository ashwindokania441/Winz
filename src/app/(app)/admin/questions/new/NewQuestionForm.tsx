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
    topics: {
      id: string;
      name: string;
      subtopics: { id: string; name: string }[];
    }[];
  }[];
};

export function NewQuestionForm({ exams }: { exams: Exam[] }) {
  const router = useRouter();
  const allSubjects = useMemo(() => exams.flatMap((e) => e.subjects.map((s) => ({
    ...s,
    examLabel: `${e.family} · ${e.name}`,
  }))), [exams]);

  const [subjectId, setSubjectId] = useState(allSubjects[0]?.id || "");
  const subject = allSubjects.find((s) => s.id === subjectId);
  const [topicId, setTopicId] = useState("");
  const [subtopicId, setSubtopicId] = useState("");
  const [type, setType] = useState("mcq");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [newTopic, setNewTopic] = useState("");
  const [newSubtopic, setNewSubtopic] = useState("");

  const topics = subject?.topics || [];
  const subtopics = topics.find((t) => t.id === topicId)?.subtopics || [];

  async function addTaxonomy(kind: "topic" | "subtopic") {
    setError("");
    if (kind === "topic") {
      if (!newTopic.trim() || !subjectId) return;
      const res = await fetch("/api/admin/taxonomy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ kind: "topic", subjectId, name: newTopic }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Could not add topic");
        return;
      }
      setNewTopic("");
      router.refresh();
      setTopicId(data.topic.id);
      return;
    }
    if (!newSubtopic.trim() || !topicId) return;
    const res = await fetch("/api/admin/taxonomy", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ kind: "subtopic", topicId, name: newSubtopic }),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error || "Could not add subtopic");
      return;
    }
    setNewSubtopic("");
    router.refresh();
    setSubtopicId(data.subtopic.id);
  }

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const form = e.currentTarget;
    const fd = new FormData(form);
    fd.set("subjectId", subjectId);
    fd.set("topicId", topicId);
    fd.set("subtopicId", subtopicId);
    fd.set("type", type);

    const res = await fetch("/api/admin/questions", { method: "POST", body: fd });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) {
      setError(data.error || "Failed to save");
      return;
    }
    router.push("/admin");
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="surface space-y-5 p-6 md:p-8">
      <div className="grid gap-4 md:grid-cols-2">
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
            {allSubjects.map((s) => (
              <option key={s.id} value={s.id}>
                {s.examLabel} — {s.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="label">Type</label>
          <select className="field" value={type} onChange={(e) => setType(e.target.value)}>
            <option value="mcq">MCQ</option>
            <option value="enter_answer">Enter answer</option>
          </select>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
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
            <option value="">Optional</option>
            {topics.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
          </select>
          <div className="mt-2 flex gap-2">
            <input
              className="field"
              placeholder="Add new topic"
              value={newTopic}
              onChange={(e) => setNewTopic(e.target.value)}
            />
            <button type="button" className="btn-ghost !px-3" onClick={() => addTaxonomy("topic")}>
              Add
            </button>
          </div>
        </div>
        <div>
          <label className="label">Subtopic</label>
          <select
            className="field"
            value={subtopicId}
            onChange={(e) => setSubtopicId(e.target.value)}
            disabled={!topicId}
          >
            <option value="">Optional</option>
            {subtopics.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
          <div className="mt-2 flex gap-2">
            <input
              className="field"
              placeholder="Add new subtopic"
              value={newSubtopic}
              onChange={(e) => setNewSubtopic(e.target.value)}
              disabled={!topicId}
            />
            <button
              type="button"
              className="btn-ghost !px-3"
              onClick={() => addTaxonomy("subtopic")}
              disabled={!topicId}
            >
              Add
            </button>
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label className="label">Difficulty</label>
          <select name="difficulty" className="field" defaultValue="moderate">
            <option value="low">Low</option>
            <option value="moderate">Moderate</option>
            <option value="high">High</option>
          </select>
        </div>
        <div>
          <label className="label">Time allowance (seconds)</label>
          <input
            name="timeAllowanceSec"
            type="number"
            min={30}
            defaultValue={120}
            className="field"
          />
        </div>
      </div>

      <div>
        <label className="label">Prompt image</label>
        <input name="promptImage" type="file" accept="image/*" required className="field" />
      </div>
      <div>
        <label className="label">Solution image (optional)</label>
        <input name="solutionImage" type="file" accept="image/*" className="field" />
      </div>

      {type === "mcq" && (
        <div>
          <label className="label">Choices (one per line)</label>
          <textarea
            name="choices"
            rows={4}
            className="field"
            placeholder={"Option A\nOption B\nOption C\nOption D"}
            required
          />
        </div>
      )}

      <div>
        <label className="label">
          Correct answer {type === "mcq" ? "(exact choice text)" : "(exact match)"}
        </label>
        <input name="correctAnswer" required className="field" />
      </div>

      {error && <p className="text-sm text-coral">{error}</p>}
      <button type="submit" className="btn-primary" disabled={loading}>
        {loading ? "Saving…" : "Save question"}
      </button>
    </form>
  );
}
