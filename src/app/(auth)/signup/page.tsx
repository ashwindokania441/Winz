import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { SignupForm } from "./SignupForm";

export default async function SignupPage() {
  const exams = await prisma.exam.findMany({
    orderBy: [{ family: "asc" }, { name: "asc" }],
    include: { subjects: { orderBy: { name: "asc" } } },
  });

  return (
    <div className="relative min-h-screen">
      <div className="winz-grid pointer-events-none absolute inset-0 opacity-40" />
      <header className="relative z-10 mx-auto flex max-w-6xl px-5 py-5 md:px-8">
        <Link href="/" className="font-[family-name:var(--font-syne)] text-2xl font-bold">
          Win<span className="text-lime">z</span>
        </Link>
      </header>
      <main className="relative z-10 mx-auto max-w-lg px-5 pb-16 pt-6">
        <h1 className="font-[family-name:var(--font-syne)] text-4xl font-extrabold">
          Join Winz
        </h1>
        <p className="mt-2 text-cream-muted">
          Create your student account and pick the subjects you care about.
        </p>
        <SignupForm exams={exams} />
        <p className="mt-5 text-sm text-cream-muted">
          Already practicing?{" "}
          <Link href="/login" className="text-lime hover:underline">
            Log in
          </Link>
        </p>
      </main>
    </div>
  );
}
