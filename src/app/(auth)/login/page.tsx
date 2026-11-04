import Link from "next/link";
import { LoginForm } from "./LoginForm";

export default function LoginPage() {
  return (
    <div className="relative min-h-screen">
      <div className="winz-grid pointer-events-none absolute inset-0 opacity-40" />
      <header className="relative z-10 mx-auto flex max-w-6xl px-5 py-5 md:px-8">
        <Link href="/" className="font-[family-name:var(--font-syne)] text-2xl font-bold">
          Win<span className="text-lime">z</span>
        </Link>
      </header>
      <main className="relative z-10 mx-auto max-w-md px-5 pb-16 pt-8">
        <h1 className="font-[family-name:var(--font-syne)] text-4xl font-extrabold">
          Welcome back
        </h1>
        <p className="mt-2 text-cream-muted">Log in with your username or email.</p>
        <LoginForm />
        <p className="mt-5 text-sm text-cream-muted">
          New here?{" "}
          <Link href="/signup" className="text-lime hover:underline">
            Create an account
          </Link>
        </p>
      </main>
    </div>
  );
}
