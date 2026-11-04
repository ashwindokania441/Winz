import Link from "next/link";
import { SiteHeader } from "@/components/SiteHeader";

export default function HomePage() {
  return (
    <div className="relative min-h-screen overflow-hidden">
      <div className="winz-grid pointer-events-none absolute inset-0" />
      <div
        className="winz-orb left-[-8%] top-[18%] h-56 w-56 bg-teal/40"
        style={{ animationDelay: "0s" }}
      />
      <div
        className="winz-orb right-[-4%] top-[8%] h-72 w-72 bg-lime/20"
        style={{ animationDelay: "2s" }}
      />
      <div
        className="winz-orb bottom-[8%] left-[35%] h-48 w-48 bg-coral/20"
        style={{ animationDelay: "4s" }}
      />

      <SiteHeader />

      <main className="relative z-10 mx-auto flex min-h-[calc(100vh-88px)] w-full max-w-6xl flex-col justify-center px-5 pb-16 pt-6 md:px-8">
        <p className="animate-rise chip w-fit">IB &amp; IGCSE math prep</p>
        <h1 className="animate-rise-delay mt-5 max-w-4xl font-[family-name:var(--font-syne)] text-5xl font-extrabold leading-[0.95] tracking-tight text-cream md:text-7xl lg:text-8xl">
          Win<span className="text-lime">z</span>
          <span className="mt-3 block text-3xl font-semibold text-cream-muted md:text-4xl lg:text-5xl">
            Practice sharp. Test ready.
          </span>
        </h1>
        <div className="brand-underline mt-5 h-1 w-28 rounded-full bg-lime" />
        <p className="animate-rise-delay-2 mt-6 max-w-xl text-lg text-cream-muted md:text-xl">
          Individual practice and timed tests for IB Math and IGCSE — with competitive
          rooms coming soon for students who want the heat.
        </p>
        <div className="animate-rise-delay-2 mt-9 flex flex-wrap gap-3">
          <Link href="/signup" className="btn-primary">
            Start free
          </Link>
          <Link href="/login" className="btn-ghost">
            I have an account
          </Link>
        </div>

        <section className="mt-16 grid gap-6 md:grid-cols-2">
          <div className="surface p-6 md:p-7">
            <p className="text-sm uppercase tracking-[0.18em] text-lime">Non-competitive</p>
            <h2 className="mt-3 font-[family-name:var(--font-syne)] text-2xl font-bold">
              Focused practice &amp; tests
            </h2>
            <p className="mt-3 text-cream-muted">
              Pick exam → subject → topic or whole syllabus. Drill alone, then sit a
              10-question test ordered from low to high difficulty. Results live on your
              profile.
            </p>
          </div>
          <div className="surface p-6 md:p-7">
            <p className="text-sm uppercase tracking-[0.18em] text-coral">Competitive</p>
            <h2 className="mt-3 font-[family-name:var(--font-syne)] text-2xl font-bold">
              Rooms &amp; head-to-head
            </h2>
            <p className="mt-3 text-cream-muted">
              Group practice rooms, friend invites by username, and contest energy —
              coming in a later phase. The cover promise is real; the mechanics ship next.
            </p>
          </div>
        </section>
      </main>
    </div>
  );
}
