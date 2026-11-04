import Link from "next/link";
import { auth } from "@/lib/auth";

export async function SiteHeader() {
  const session = await auth();
  const isAdmin = session?.user?.role === "admin";

  return (
    <header className="relative z-20 mx-auto flex w-full max-w-6xl items-center justify-between px-5 py-5 md:px-8">
      <Link href="/" className="font-[family-name:var(--font-syne)] text-2xl font-extrabold tracking-tight">
        <span className="text-cream">Win</span>
        <span className="text-lime">z</span>
      </Link>
      <nav className="flex items-center gap-2 text-sm md:gap-3">
        <Link href="/testimonials" className="hidden text-cream-muted hover:text-cream sm:inline">
          Stories
        </Link>
        <Link href="/contact" className="hidden text-cream-muted hover:text-cream sm:inline">
          Contact
        </Link>
        {session ? (
          <>
            <Link href="/dashboard" className="btn-ghost !py-2 !px-3 text-sm">
              Dashboard
            </Link>
            {isAdmin && (
              <Link href="/admin" className="btn-ghost !py-2 !px-3 text-sm">
                Admin
              </Link>
            )}
            <Link href="/profile" className="btn-primary !py-2 !px-3 text-sm">
              Profile
            </Link>
          </>
        ) : (
          <>
            <Link href="/login" className="btn-ghost !py-2 !px-3 text-sm">
              Log in
            </Link>
            <Link href="/signup" className="btn-primary !py-2 !px-3 text-sm">
              Sign up
            </Link>
          </>
        )}
      </nav>
    </header>
  );
}
