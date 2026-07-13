import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

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
            <a href="/admin" className="text-sm font-bold tracking-tight">
              Admin
            </a>
            <nav className="flex gap-2 text-sm text-muted-foreground">
              <a href="/admin" className="hover:text-foreground transition-colors">
                Overview
              </a>
              <span>/</span>
              <a href="/admin/users" className="hover:text-foreground transition-colors">
                Users
              </a>
              <span>/</span>
              <a href="/admin/profiles" className="hover:text-foreground transition-colors">
                Profiles
              </a>
            </nav>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <span className="text-muted-foreground">{session.user.email}</span>
            <a href="/editor" className="text-muted-foreground hover:text-foreground transition-colors">
              Editor
            </a>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-7xl px-4 py-6">
        {children}
      </main>
    </div>
  );
}
