"use client";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useSession } from "@/lib/auth-client";

export function FooterCTA() {
  const { data: session } = useSession();
  return (
    <section className="relative mb-4 w-full overflow-hidden rounded-xl bg-muted px-6 py-20 text-center sm:mb-6 sm:px-8 sm:py-24 lg:px-10 lg:py-28 dark:bg-surface">
      <div aria-hidden="true" className="absolute inset-0 bg-cover bg-center dark:hidden" style={{ backgroundImage: "url('/images/athas/athas-sky-bg.webp')" }} />
      <div aria-hidden="true" className="absolute inset-0 hidden bg-cover bg-center dark:block" style={{ backgroundImage: "url('/images/athas/athas-sky-dark-bg.webp')" }} />

      <div className="relative mx-auto max-w-3xl">
        <h2 className="text-3xl leading-tight text-white sm:text-4xl [text-shadow:0_2px_18px_rgb(0_0_0_/_0.35)]">Ready to try?</h2>
        <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
          <Link href={session ? "/editor" : "/login"}>
            <Button className={`shadow-dzenn bg-[#222] min-w-44  text-sm  text-white px-6 py-2.5 gap-2 transition-all hover:scale-105 active:scale-95 shrink-0 hover:bg-[#222] shadow-none`}>{session ? "Lets start" : "Try for free"}</Button>
          </Link>
        </div>
        <div className="mt-6 flex flex-wrap items-center justify-center gap-x-5 gap-y-3 text-sm text-white/80">
          <span className="tracking-tight">&copy; 2026 Dzenn Live.</span>
        </div>
      </div>
    </section>
  );
}
