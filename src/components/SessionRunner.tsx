"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

type Q = {
  id: string;
  type: string;
  difficulty: string;
  promptImageUrl: string;
  timeAllowanceSec: number;
  choices: string[] | null;
};

type Props = {
  mode: "test" | "practice";
  subjectId: string;
  topicId?: string | null;
  subtopicId?: string | null;
  difficulty?: string | null;
  wholeSyllabus?: boolean;
};

export function SessionRunner(props: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [attemptId, setAttemptId] = useState<string | null>(null);
  const [questions, setQuestions] = useState<Q[]>([]);
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<
    Record<string, { givenAnswer: string; timeSpentSec: number }>
  >({});
  const [currentAnswer, setCurrentAnswer] = useState("");
  const [startedAt, setStartedAt] = useState(Date.now());
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError("");
      const res = await fetch("/api/attempts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mode: props.mode,
          subjectId: props.subjectId,
          topicId: props.topicId,
          subtopicId: props.subtopicId,
          difficulty: props.difficulty,
          wholeSyllabus: props.wholeSyllabus,
        }),
      });
      const data = await res.json();
      if (cancelled) return;
      if (!res.ok) {
        setError(data.error || "Could not start session");
        setLoading(false);
        return;
      }
      setAttemptId(data.attempt.id);
      setQuestions(data.questions);
      setStartedAt(Date.now());
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [
    props.mode,
    props.subjectId,
    props.topicId,
    props.subtopicId,
    props.difficulty,
    props.wholeSyllabus,
  ]);

  const q = questions[index];
  const progress = useMemo(
    () => (questions.length ? ((index + 1) / questions.length) * 100 : 0),
    [index, questions.length]
  );

  async function commitAndMaybeAdvance(final = false) {
    if (!q || !attemptId) return;
    const spent = Math.max(1, Math.round((Date.now() - startedAt) / 1000));
    const nextAnswers = {
      ...answers,
      [q.id]: { givenAnswer: currentAnswer, timeSpentSec: spent },
    };
    setAnswers(nextAnswers);

    if (!final && index < questions.length - 1) {
      setIndex(index + 1);
      const nextQ = questions[index + 1];
      setCurrentAnswer(nextAnswers[nextQ.id]?.givenAnswer || "");
      setStartedAt(Date.now());
      return;
    }

    setSubmitting(true);
    const payload = questions.map((item) => ({
      questionId: item.id,
      givenAnswer: nextAnswers[item.id]?.givenAnswer || "",
      timeSpentSec: nextAnswers[item.id]?.timeSpentSec || 0,
    }));
    const res = await fetch("/api/attempts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "submit", attemptId, answers: payload }),
    });
    const data = await res.json();
    setSubmitting(false);
    if (!res.ok) {
      setError(data.error || "Submit failed");
      return;
    }
    router.push(`/results/${attemptId}`);
  }

  if (loading) {
    return (
      <div className="surface p-8 text-center text-cream-muted">
        Loading {props.mode} questions…
      </div>
    );
  }

  if (error) {
    return (
      <div className="surface space-y-4 p-8">
        <p className="text-coral">{error}</p>
        <a href="/dashboard" className="btn-ghost inline-flex">
          Back to dashboard
        </a>
      </div>
    );
  }

  if (!q) return null;

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="chip uppercase tracking-wide">{props.mode}</p>
          <h1 className="mt-2 font-[family-name:var(--font-syne)] text-2xl font-bold">
            Question {index + 1} of {questions.length}
          </h1>
        </div>
        <div className="text-right text-sm text-cream-muted">
          <div>Difficulty: {q.difficulty}</div>
          <div>~{q.timeAllowanceSec}s allowance</div>
        </div>
      </div>

      <div className="h-1.5 overflow-hidden rounded-full bg-white/10">
        <div
          className="h-full rounded-full bg-lime transition-all duration-500"
          style={{ width: `${progress}%` }}
        />
      </div>

      <div className="surface overflow-hidden p-3 md:p-5">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={q.promptImageUrl}
          alt="Question prompt"
          className="mx-auto max-h-[420px] w-full rounded-xl object-contain"
        />
      </div>

      <div className="surface space-y-4 p-5">
        {q.type === "mcq" && q.choices ? (
          <div className="grid gap-2">
            {q.choices.map((choice) => (
              <button
                key={choice}
                type="button"
                onClick={() => setCurrentAnswer(choice)}
                className={`rounded-xl border px-4 py-3 text-left transition ${
                  currentAnswer === choice
                    ? "border-lime bg-lime/10 text-cream"
                    : "border-[var(--line)] hover:border-lime/40"
                }`}
              >
                {choice}
              </button>
            ))}
          </div>
        ) : (
          <div>
            <label className="label">Your answer (exact match)</label>
            <input
              className="field"
              value={currentAnswer}
              onChange={(e) => setCurrentAnswer(e.target.value)}
              placeholder="Type your answer"
            />
          </div>
        )}

        <div className="flex flex-wrap gap-3">
          {index < questions.length - 1 ? (
            <button
              type="button"
              className="btn-primary"
              onClick={() => commitAndMaybeAdvance(false)}
              disabled={submitting}
            >
              Next
            </button>
          ) : (
            <button
              type="button"
              className="btn-primary"
              onClick={() => commitAndMaybeAdvance(true)}
              disabled={submitting}
            >
              {submitting ? "Submitting…" : "Submit"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
