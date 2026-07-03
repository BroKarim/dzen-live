import Image from "next/image";
import Link from "next/link";
import { AppleIcon, WindowsIcon, LinuxIcon } from "./icons";

export function HeroSection() {
  return (
    <section className="-mt-16">
      <div className="mx-auto max-w-none px-0">
        <div className="relative isolate overflow-hidden rounded-b-2xl px-6 pt-44 pb-10 sm:px-10 lg:pt-48 lg:pb-14">
          <div aria-hidden="true" className="absolute inset-0 z-[-1] bg-cover bg-center bg-no-repeat dark:hidden" style={{ backgroundImage: "url('/images/athas/athas-hero-bg.webp')" }} />
          <div aria-hidden="true" className="absolute inset-0 z-[-1] hidden bg-cover bg-center bg-no-repeat dark:block" style={{ backgroundImage: "url('/images/athas/athas-hero-dark-bg.webp')" }} />

          <div className="mx-auto max-w-3xl text-center">
            <div className="flex justify-center">
              <Link href="/athas/changelog" className="inline-flex items-center rounded-md px-3 py-1.5 font-mono text-sm text-white/75 transition-colors hover:bg-white/15 hover:text-white">
                v0.8.1 — now available
              </Link>
            </div>

            <h1 className="mx-auto mt-5 max-w-[34rem] text-4xl font-medium leading-none tracking-tight text-white sm:text-5xl lg:text-6xl [text-shadow:0_2px_22px_rgb(0_0_0_/_0.3)]">Lightweight, open-source code editor.</h1>

            <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
              <Link
                href="/athas/download"
                className="inline-flex h-10 min-w-44 cursor-pointer items-center justify-center gap-2 whitespace-nowrap rounded-full border-0 bg-white px-6 font-sans text-sm font-semibold text-neutral-950 transition-all hover:bg-white/90"
              >
                Download
              </Link>
            </div>

            <div className="mt-6 flex flex-wrap items-center justify-center gap-x-5 gap-y-3 text-sm text-white/80">
              <div className="flex items-center gap-4">
                <AppleIcon className="size-4" />
                <WindowsIcon className="size-4" />
                <LinuxIcon className="size-4" />
              </div>
              <span className="tracking-tight">Available on all platforms.</span>
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
