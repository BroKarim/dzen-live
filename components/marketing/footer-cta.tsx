import Link from "next/link";
import { AppleIcon, WindowsIcon, LinuxIcon } from "./icons";

export function FooterCTA() {
  return (
    <section className="relative mb-4 w-full overflow-hidden rounded-xl bg-muted px-6 py-20 text-center sm:mb-6 sm:px-8 sm:py-24 lg:px-10 lg:py-28 dark:bg-surface">
      <div aria-hidden="true" className="absolute inset-0 bg-cover bg-center dark:hidden" style={{ backgroundImage: "url('/images/athas/athas-sky-bg.webp')" }} />
      <div aria-hidden="true" className="absolute inset-0 hidden bg-cover bg-center dark:block" style={{ backgroundImage: "url('/images/athas/athas-sky-dark-bg.webp')" }} />

      <div className="relative mx-auto max-w-3xl">
        <h2 className="text-3xl leading-tight text-white sm:text-4xl [text-shadow:0_2px_18px_rgb(0_0_0_/_0.35)]">Ready to try Athas?</h2>
        <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
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
    </section>
  );
}
