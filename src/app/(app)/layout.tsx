import { AppNav } from "@/components/AppNav";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen">
      <AppNav />
      <div className="mx-auto max-w-6xl px-5 py-8 md:px-8">{children}</div>
    </div>
  );
}
