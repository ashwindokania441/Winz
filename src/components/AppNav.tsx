import Link from "next/link";
import { auth, signOut } from "@/lib/auth";

export async function AppNav() {
  const session = await auth();
  if (!session?.user) return null;
  const isAdmin = session.user.role === "admin";

  return (
    <header className="sticky top-0 z-30 border-b border-[var(--line)] bg-[rgba(7,26,31,0.85)] backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-5 py-3 md:px-8">
        <div className="flex items-center gap-5">
          <Link href="/dashboard" className="font-[family-name:var(--font-syne)] text-xl font-bold tracking-tight">
            Win<span className="text-lime">z</span>
          </Link>
          <nav className="hidden items-center gap-4 text-sm text-cream-muted md:flex">
            <Link href="/dashboard" className="hover:text-cream">
              Dashboard
            </Link>
            <Link href="/profile" className="hover:text-cream">
              Results
            </Link>
            {isAdmin && (
              <Link href="/admin" className="hover:text-cream">
                Admin
              </Link>
            )}
          </nav>
        </div>
        <div className="flex items-center gap-3 text-sm">
          <span className="hidden text-cream-muted sm:inline">@{session.user.username}</span>
          <form
            action={async () => {
              "use server";
              await signOut({ redirectTo: "/" });
            }}
          >
            <button type="submit" className="btn-ghost !py-1.5 !px-3 text-sm">
              Log out
            </button>
          </form>
        </div>
      </div>
    </header>
  );
}
