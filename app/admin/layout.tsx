import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user || session.user.role !== "ADMIN") {
    redirect("/");
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-10 border-b bg-background/80 backdrop-blur-sm">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <Link href="/admin" className="text-sm font-bold tracking-tight">
              Admin
            </Link>
            <nav className="flex gap-2 text-sm text-muted-foreground">
              <Link href="/admin" className="hover:text-foreground transition-colors">
                Overview
              </Link>
              <span>/</span>
              <Link href="/admin/users" className="hover:text-foreground transition-colors">
                Users
              </Link>
              <span>/</span>
              <Link href="/admin/profiles" className="hover:text-foreground transition-colors">
                Profiles
              </Link>
            </nav>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <span className="text-muted-foreground">{session.user.email}</span>
            <Link href="/editor" className="text-muted-foreground hover:text-foreground transition-colors">
              Editor
            </Link>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-7xl px-4 py-6">
        {children}
      </main>
    </div>
  );
}
