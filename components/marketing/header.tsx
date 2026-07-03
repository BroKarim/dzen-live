"use client";

import Image from "next/image";
import Link from "next/link";
import { MenuIcon } from "./icons";

export function Header() {
  return (
    <header className="fixed top-3 left-0 z-50 w-full px-4 sm:px-6">
      <nav className="relative mx-auto max-w-screen-2xl isolate px-4 transition-all duration-300 ease-out sm:px-6">
        <div className="relative flex h-16 items-center">
          <Link href="/athas" className="z-10 flex items-center text-foreground">
            <Image src="/images/athas/logo.png" alt="Athas" width={32} height={32} className="size-8 shrink-0 rounded" />
          </Link>

          <div className="absolute left-1/2 hidden -translate-x-1/2 items-center gap-0 md:flex">
            <Link
              href="/athas/pricing"
              className="inline-flex h-9 items-center rounded-md px-3 font-sans text-sm font-medium text-white/85 transition-colors hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/80 focus-visible:ring-offset-transparent"
            >
              Pricing
            </Link>
            <Link
              href="/athas/extensions"
              className="inline-flex h-9 items-center rounded-md px-3 font-sans text-sm font-medium text-white/85 transition-colors hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/80 focus-visible:ring-offset-transparent"
            >
              Extensions
            </Link>
            <Link
              href="/athas/blog"
              className="inline-flex h-9 items-center rounded-md px-3 font-sans text-sm font-medium text-white/85 transition-colors hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/80 focus-visible:ring-offset-transparent"
            >
              Resources
            </Link>
          </div>

          <div className="flex-1" />

          <div className="z-10 hidden items-center gap-2 md:flex">
            <Link
              href="/athas/download"
              className="inline-flex h-9 min-w-44 cursor-pointer items-center justify-center gap-2 whitespace-nowrap rounded-full border-0 bg-white px-5 font-sans text-sm font-semibold text-neutral-950 transition-all hover:bg-white/90"
            >
              Download
            </Link>
          </div>

          <button
            type="button"
            aria-label="Open menu"
            className="inline-flex size-11 cursor-pointer items-center justify-center gap-2 whitespace-nowrap rounded-full font-sans text-sm font-semibold text-foreground transition-all hover:bg-muted/70 hover:text-foreground md:hidden [&_svg]:size-6"
          >
            <MenuIcon className="size-6" />
          </button>
        </div>
      </nav>
    </header>
  );
}
