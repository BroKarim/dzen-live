"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { MenuIcon } from "./icons";
import { useSession } from "@/lib/auth-client";
import { LazyMotion, m, domAnimation, useScroll, useMotionValueEvent, type Transition } from "framer-motion";

const HEADER_TRANSITION: Transition = {
  type: "spring",
  stiffness: 460,
  damping: 34,
  mass: 0.62,
};

export function Header() {
  const { data: session, isPending } = useSession();
  const [isScrolled, setIsScrolled] = useState(false);

  const { scrollY } = useScroll();

  useMotionValueEvent(scrollY, "change", (latest) => {
    if (latest > 50) {
      setIsScrolled(true);
    } else {
      setIsScrolled(false);
    }
  });

  function scrollToFeatures() {
    document.getElementById("features")?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  return (
    <header className="fixed top-0 left-0 z-50 w-full pt-4 px-4 sm:px-6 flex justify-center pointer-events-none">
      <LazyMotion features={domAnimation}>
        <m.nav
          layout="size"
          transition={HEADER_TRANSITION}
          animate={{
          maxWidth: isScrolled ? "540px" : "1400px",
          backgroundColor: isScrolled ? "rgba(24, 24, 27, 0.8)" : "rgba(24, 24, 27, 0)",
          backdropFilter: isScrolled ? "blur(12px)" : "blur(0px)",
          borderColor: isScrolled ? "rgba(63, 63, 70, 0.4)" : "rgba(63, 63, 70, 0)",
          paddingLeft: isScrolled ? "1.25rem" : "1rem",
          paddingRight: isScrolled ? "1.25rem" : "1rem",
          borderRadius: isScrolled ? "9999px" : "0px",
          boxShadow: isScrolled ? "0 20px 40px -15px rgba(0,0,0,0.7)" : "0 0px 0px rgba(0,0,0,0)",
        }}
        className="relative w-full flex h-14 items-center justify-between border border-solid pointer-events-auto"
      >
        {/* logo */}
        <div className="flex items-center shrink-0">
          <Link href="/" className="z-10 flex items-center text-foreground">
            <Image src="/images/logo.png" alt="dzenn" width={32} height={32} className="size-8 shrink-0 rounded" />
          </Link>
        </div>

        {/* navigation links */}
        <div className="hidden items-center gap-1 md:flex mx-4 shrink-0">
          <button
            type="button"
            onClick={scrollToFeatures}
            className="inline-flex h-9 cursor-pointer items-center rounded-md px-3 font-sans text-sm font-medium text-white/85 transition-colors hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/80"
          >
            Features
          </button>
          <Link
            href="/info"
            className="inline-flex h-9 items-center rounded-md px-3 font-sans text-sm font-medium text-white/85 transition-colors hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/80"
          >
            Info
          </Link>
          <Link
            href="https://github.com/BroKarim/dzenn-live"
            className="inline-flex h-9 items-center rounded-md px-3 font-sans text-sm font-medium text-white/85 transition-colors hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/80"
          >
            Github
          </Link>
        </div>

        {/* action */}
        <div className="z-10 hidden items-center gap-2 md:flex shrink-0">
          {isPending ? (
            <div className="px-4 py-1.5 w-16 h-5 animate-pulse bg-zinc-800 rounded-full" />
          ) : session ? (
            <Link href="/editor" className="shadow-dzenn bg-[#222] inline-flex text-center group px-5 py-1.5 rounded-full text-[13px] font-medium text-white hover:bg-zinc-700 transition-all duration-200 justify-center items-center gap-1.5">
              Editor
            </Link>
          ) : (
            <Link href="/login" className="shadow-dzenn bg-[#222] inline-flex text-center group px-5 py-1.5 rounded-full text-[13px] font-medium text-white hover:bg-zinc-700 transition-all duration-200 justify-center items-center gap-1.5">
              Login
            </Link>
          )}
        </div>

        {/* Mobile menu button */}
        <button
          type="button"
          aria-label="Open menu"
          className="inline-flex size-10 cursor-pointer items-center justify-center gap-2 whitespace-nowrap rounded-full font-sans text-sm font-semibold text-foreground transition-all hover:bg-muted/70 md:hidden [&_svg]:size-5"
        >
          <MenuIcon className="size-5" />
        </button>
        </m.nav>
      </LazyMotion>
    </header>
  );
}
