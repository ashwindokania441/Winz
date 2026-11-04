"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";

export default function ContactPage() {
  const [status, setStatus] = useState<"idle" | "ok" | "err">("idle");
  const [error, setError] = useState("");

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("idle");
    setError("");
    const form = new FormData(e.currentTarget);
    const res = await fetch("/api/contact", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: form.get("name"),
        email: form.get("email"),
        message: form.get("message"),
      }),
    });
    const data = await res.json();
    if (!res.ok) {
      setStatus("err");
      setError(data.error || "Something went wrong");
      return;
    }
    setStatus("ok");
    e.currentTarget.reset();
  }

  return (
    <div className="relative min-h-screen">
      <div className="winz-grid pointer-events-none absolute inset-0 opacity-50" />
      <header className="relative z-10 mx-auto flex max-w-6xl items-center justify-between px-5 py-5 md:px-8">
        <Link href="/" className="font-[family-name:var(--font-syne)] text-2xl font-bold">
          Win<span className="text-lime">z</span>
        </Link>
        <Link href="/login" className="btn-ghost !py-2 !px-3 text-sm">
          Log in
        </Link>
      </header>
      <main className="relative z-10 mx-auto max-w-xl px-5 pb-20 pt-6 md:px-8">
        <h1 className="font-[family-name:var(--font-syne)] text-4xl font-extrabold">
          Contact
        </h1>
        <p className="mt-3 text-cream-muted">
          Questions about Winz, schools, or partnerships? Leave a note — Phase 1 stores
          messages for Ashwin to review.
        </p>
        <form onSubmit={onSubmit} className="surface mt-8 space-y-4 p-6">
          <div>
            <label className="label" htmlFor="name">
              Name
            </label>
            <input id="name" name="name" required className="field" />
          </div>
          <div>
            <label className="label" htmlFor="email">
              Email
            </label>
            <input id="email" name="email" type="email" required className="field" />
          </div>
          <div>
            <label className="label" htmlFor="message">
              Message
            </label>
            <textarea id="message" name="message" required rows={5} className="field" />
          </div>
          {status === "ok" && (
            <p className="text-sm text-lime">Thanks — we received your message.</p>
          )}
          {status === "err" && <p className="text-sm text-coral">{error}</p>}
          <button type="submit" className="btn-primary">
            Send
          </button>
        </form>
      </main>
    </div>
  );
}
