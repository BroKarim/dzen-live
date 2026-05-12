"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";
import { useSession } from "@/lib/auth-client";
import { ArrowRightIcon } from "lucide-react";
import { usePathname } from "next/navigation";

export function LandingNav() {
  const { data: session, isPending } = useSession();

  const navLinks = [
    { name: "Index", href: "/" },
    { name: "Info", href: "/info" },
  ];

  const pathname = usePathname();

  const shadowClass = "shadow-dzenn";

  return (
    <nav className="fixed top-4 left-4 md:left-16 z-50 flex items-center gap-3">
      {/* logo */}
      <Link href="/" className={cn("size-10 flex items-center justify-center rounded-full bg-[#222] border-none text-white font-bold text-sm transition-all hover:scale-105 active:scale-95 shrink-0", shadowClass)}>
        Dz
      </Link>

      {/* nav links */}
      <div className={cn("flex items-center gap-1 p-1 rounded-full bg-[#222] border-none", shadowClass)}>
        {navLinks.map((link) => {
          const isActive = pathname === link.href;
          return (
            <Link key={link.name} href={link.href} className={cn("px-4 py-1.5 text-[13px] font-medium transition-colors duration-200", isActive ? "text-purple-400 " : "text-zinc-400 hover:text-white")}>
              {link.name}
            </Link>
          );
        })}
        {isPending ? (
          <div className="px-4 py-1.5 w-16 h-5 animate-pulse bg-zinc-800 rounded-full" />
        ) : session ? (
          <Link href="/editor" className="group px-4 py-1.5 rounded-full text-[13px] font-medium text-white bg-zinc-800 hover:bg-zinc-700 transition-all duration-200 flex items-center gap-1.5">
            Editor
            <ArrowRightIcon className="size-3.5 transition-transform group-hover:translate-x-0.5" />
          </Link>
        ) : (
          <Link href="/login" className="px-4 py-1.5 rounded-full text-[13px] font-medium text-zinc-400 hover:text-white transition-colors duration-200">
            Login
          </Link>
        )}
      </div>
    </nav>
  );
}
