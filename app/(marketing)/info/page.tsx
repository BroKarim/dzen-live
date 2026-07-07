import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Why Dzenn",
  description: "Learn about the mindset behind Dzenn—why digital identity became stale and how we're redefining the link-in-bio for modern creators.",
  alternates: {
    canonical: "/info",
  },
};

export default function WhyPage() {
  return (
    <main className="flex-1 flex flex-col items-center justify-center px-8 py-24">
      <div className="max-w-2xl w-full">
        {/* Main Title */}
        <div className="mb-16 text-center">
          <h1 className="text-5xl md:text-7xl font-serif font-thin text-gray-900 tracking-tighter">Dzenn</h1>
          <p className="mt-4 text-gray-400 uppercase tracking-[0.3em] text-[10px] font-bold">Not your ordinary linktree</p>
        </div>

        {/* The Philosophy */}
        <section className="mb-14 text-center">
          <p className="text-gray-400 leading-relaxed text-base md:text-lg font-light">
            Dzenn was born from a simple realization: digital identity has become stale. Inspired by the nonchalant aesthetic of modern web design, we built a platform for creators who demand more than just a list of buttons. We believe
            your <span className="text-gray-900 font-medium">link-in-bio</span> should be a reflection of your vibe — premium, interactive, and undeniably you.
          </p>
        </section>

        {/* Visual Excellence */}
        <section className="mb-14 text-center">
          <h2 className="text-gray-800 text-[10px] uppercase tracking-[0.2em] font-black mb-6">Visual Excellence</h2>
          <p className="text-gray-400 leading-relaxed text-base md:text-lg font-light">
            We prioritize quality over quantity. From our signature <span className="text-gray-900 font-medium">Glassy Textures</span> to dynamic background patterns like Waves and Noise, every element of Dzenn is engineered to hit
            different. We provide the tools — you provide the vibes.
          </p>
        </section>

        {/* Open Source */}
        <section className="mb-14 text-center">
          <h2 className="text-gray-800 text-[10px] uppercase tracking-[0.2em] font-black mb-6">Open Source & Free</h2>
          <p className="text-gray-400 leading-relaxed text-base md:text-lg font-light">
            Dzenn is fully open source. No hidden fees, no locked features. The entire codebase is available for you to audit, fork, and contribute to. Built by the community, for the community.
          </p>
          <div className="mt-8 flex w-full justify-center gap-6">
            <Link href="https://github.com/BroKarim/dzenn-live" className="text-gray-900 hover:text-gray-400 text-xs font-medium transition-colors underline underline-offset-4">
              GitHub
            </Link>
            <Link href="https://x.com/BroKariim" className="text-gray-900 hover:text-gray-400 text-xs font-medium transition-colors underline underline-offset-4">
              X / Twitter
            </Link>
            <Link href="https://www.threads.com/@brokariim" className="text-gray-900 hover:text-gray-400 text-xs font-medium transition-colors underline underline-offset-4">
              Threads
            </Link>
          </div>
        </section>

        {/* Back */}
        <div className="text-center mt-16">
          <Link href="/" className="text-gray-400 hover:text-gray-900 text-xs transition-all duration-300 inline-flex items-center gap-2">
            ← Back home
          </Link>
        </div>
      </div>
    </main>
  );
}
