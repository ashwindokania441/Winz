import Link from "next/link";
import { SiteHeader } from "@/components/SiteHeader";

const STORIES = [
  {
    quote:
      "Winz made topic drills feel intentional — I stopped guessing which worksheet to open.",
    name: "Maya",
    detail: "IB Math AA SL",
  },
  {
    quote:
      "The low-to-high test flow matches how my mock papers feel. Ten questions, clear score.",
    name: "Jonah",
    detail: "IGCSE Edexcel Higher",
  },
  {
    quote:
      "Seeing past attempts on my profile kept me honest about which subtopics still wobble.",
    name: "Priya",
    detail: "CIE Additional Mathematics",
  },
];

export default function TestimonialsPage() {
  return (
    <div className="relative min-h-screen">
      <div className="winz-grid pointer-events-none absolute inset-0 opacity-60" />
      <SiteHeader />
      <main className="relative z-10 mx-auto max-w-6xl px-5 pb-20 pt-8 md:px-8">
        <p className="chip w-fit">Stories</p>
        <h1 className="mt-4 font-[family-name:var(--font-syne)] text-4xl font-extrabold tracking-tight md:text-5xl">
          Students who train with <span className="text-lime">Winz</span>
        </h1>
        <p className="mt-4 max-w-2xl text-cream-muted">
          Early voices from the Phase 1 community — focused practice, honest tests, less
          noise.
        </p>
        <div className="mt-10 grid gap-5 md:grid-cols-3">
          {STORIES.map((s) => (
            <blockquote key={s.name} className="surface flex flex-col justify-between p-6">
              <p className="text-lg leading-relaxed text-cream">&ldquo;{s.quote}&rdquo;</p>
              <footer className="mt-6 text-sm text-cream-muted">
                <span className="font-semibold text-cream">{s.name}</span> · {s.detail}
              </footer>
            </blockquote>
          ))}
        </div>
        <Link href="/signup" className="btn-primary mt-10 inline-flex">
          Join Winz
        </Link>
      </main>
    </div>
  );
}
