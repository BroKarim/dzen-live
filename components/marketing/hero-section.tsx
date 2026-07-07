"use client";

import Image from "next/image";
import { useSession } from "@/lib/auth-client";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export function HeroSection() {
  const { data: session } = useSession();
  return (
    <section className="-mt-16">
      <div className="mx-auto max-w-none px-0">
        <div className="relative isolate overflow-hidden rounded-b-2xl px-6 pt-44 pb-10 sm:px-10 lg:pt-48 lg:pb-14">
          <div aria-hidden="true" className="absolute inset-0 z-[-1] bg-cover bg-center bg-no-repeat dark:hidden" style={{ backgroundImage: "url('/images/tokyo-night.webp')" }} />
          <div aria-hidden="true" className="absolute inset-0 z-[-1] hidden bg-cover bg-center bg-no-repeat dark:block" style={{ backgroundImage: "url('/images/tokyo-night.webp')" }} />

          <div className="mx-auto max-w-3xl text-center">
            <div className="flex justify-center">
              <Link href="/athas/changelog" className="inline-flex items-center rounded-md px-3 py-1.5 font-mono text-sm text-white/75 transition-colors hover:bg-white/15 hover:text-white">
                currently in beta
              </Link>
            </div>

            <h1 className="mx-auto mt-5 max-w-[34rem] text-4xl font-medium leading-none tracking-tight text-white sm:text-5xl lg:text-6xl [text-shadow:0_2px_22px_rgb(0_0_0_/_0.3)]">Nonchalant <br/>Link In Bio.</h1>

            <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
              <Link href={session ? "/editor" : "/login"}>
                <Button className={`shadow-dzenn bg-[#222] min-w-44  text-sm  text-white px-6 py-2.5 gap-2 transition-all hover:scale-105 active:scale-95 shrink-0 hover:bg-[#222] shadow-none`}>
                  {session ? "Lets start" : "Try for free"}
                </Button>
              </Link>
            </div>
          </div>

          <div className="mt-16">
            <div className="overflow-hidden">
              <Image src="/images/demo1.webp" alt="Athas Code Editor" width={2400} height={1552} className="w-full" priority />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
