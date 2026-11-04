"use client";

import { FormEvent, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";

type Exam = {
  id: string;
  family: string;
  name: string;
  subjects: { id: string; name: string }[];
};

export function SignupForm({ exams }: { exams: Exam[] }) {
  const router = useRouter();
  const [examId, setExamId] = useState(exams[0]?.id || "");
  const [subjectIds, setSubjectIds] = useState<string[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const subjects = useMemo(
    () => exams.find((e) => e.id === examId)?.subjects || [],
    [exams, examId]
  );

  function toggleSubject(id: string) {
    setSubjectIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  }

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    if (!subjectIds.length) {
      setError("Pick at least one subject");
      return;
    }
    setLoading(true);
    const form = new FormData(e.currentTarget);
    const payload = {
      firstName: String(form.get("firstName") || ""),
      lastName: String(form.get("lastName") || ""),
      username: String(form.get("username") || ""),
      email: String(form.get("email") || ""),
      password: String(form.get("password") || ""),
      examId,
      subjectIds,
    };
    const res = await fetch("/api/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) {
      setLoading(false);
      setError(data.error || "Signup failed");
      return;
    }

    const login = await signIn("credentials", {
      identifier: payload.username,
      password: payload.password,
      redirect: false,
    });
    setLoading(false);
    if (login?.error) {
      router.push("/login");
      return;
    }
    router.push("/dashboard");
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="surface mt-8 space-y-4 p-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="label" htmlFor="firstName">
            First name
          </label>
          <input id="firstName" name="firstName" required className="field" />
        </div>
        <div>
          <label className="label" htmlFor="lastName">
            Last name
          </label>
          <input id="lastName" name="lastName" required className="field" />
        </div>
      </div>
      <div>
        <label className="label" htmlFor="username">
          Username
        </label>
        <input id="username" name="username" required className="field" />
      </div>
      <div>
        <label className="label" htmlFor="email">
          Email
        </label>
        <input id="email" name="email" type="email" required className="field" />
      </div>
      <div>
        <label className="label" htmlFor="password">
          Password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          required
          minLength={8}
          className="field"
        />
      </div>
      <div>
        <label className="label" htmlFor="exam">
          Target exam
        </label>
        <select
          id="exam"
          className="field"
          value={examId}
          onChange={(e) => {
            setExamId(e.target.value);
            setSubjectIds([]);
          }}
        >
          {exams.map((exam) => (
            <option key={exam.id} value={exam.id}>
              {exam.family} · {exam.name}
            </option>
          ))}
        </select>
      </div>
      <div>
        <p className="label">Interested subjects</p>
        <div className="flex flex-wrap gap-2">
          {subjects.map((s) => {
            const on = subjectIds.includes(s.id);
            return (
              <button
                key={s.id}
                type="button"
                onClick={() => toggleSubject(s.id)}
                className={`rounded-full border px-3 py-1.5 text-sm ${
                  on
                    ? "border-lime bg-lime/15 text-cream"
                    : "border-[var(--line)] text-cream-muted"
                }`}
              >
                {s.name}
              </button>
            );
          })}
        </div>
      </div>
      {error && <p className="text-sm text-coral">{error}</p>}
      <button type="submit" className="btn-primary w-full" disabled={loading}>
        {loading ? "Creating…" : "Create account"}
      </button>
    </form>
  );
}
