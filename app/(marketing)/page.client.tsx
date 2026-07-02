"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { instrumentSerif } from "@/lib/fonts";
import { useSession } from "@/lib/auth-client";
import Link from "next/link";
import Image from "next/image";

const HIGHLIGHT_FEATURES = [
  {
    title: "100% Free",
    desc: "All core features are completely free, no hidden fees or subscription required.",
  },
  {
    title: "Open Source",
    desc: "Fully transparent codebase you can audit, fork, and contribute to.",
  },
  {
    title: "360° Deep Analytics",
    desc: "Gain comprehensive insights with real‑time, granular analytics for every link.",
  },
] as const;

const DEMO_FEATURES = [
  {
    tag: "Profile",
    title: "Your identity, your way.",
    mediaSrc: "https://d1uuiykksp6inc.cloudfront.net/demo/v0/final1.mp4",
  },
  {
    tag: "Theme",
    title: "Make it yours, down to the last pixel.",
    mediaSrc: "https://d1uuiykksp6inc.cloudfront.net/demo/v0/final2-v1.mp4",
  },
  {
    tag: "Analytics",
    title: "Know exactly who's clicking, and from where.",
    mediaSrc: "https://d1uuiykksp6inc.cloudfront.net/demo/v0/demo3.webp",
  },
] as const;

function FeatureMedia({ src, alt }: { src: string; alt: string }) {
  const isVideo = src.endsWith(".mp4") || src.endsWith(".webm");

  return (
    <div className="w-full relative rounded-md overflow-hidden bg-foreground/5 border border-foreground/10">
      {isVideo ? <video src={src} className="w-full h-auto object-cover" autoPlay muted loop playsInline preload="metadata" aria-label={alt} /> : <Image src={src} alt={alt} width={1200} height={800} className="w-full h-auto object-cover block" sizes="(max-width: 768px) 100vw, 50vw" />}
      <div className="absolute inset-0 rounded-md border border-foreground/20 z-10 pointer-events-none" />
    </div>
  );
}
const shadowClass = "shadow-dzenn";

export default function MarketingPageClient() {
  const { data: session } = useSession();

  return (
    <main className="flex-1 flex flex-col items-center">
      <section className="flex flex-col items-center text-center pt-16 pb-8 px-4">
        {/* Beta badge */}
        <Badge className="md:mb-2 bg-purple-200 text-black hover:bg-purple-100 border-0 px-4 py-1 text-[10px] font-medium rounded-md">Currently in Beta</Badge>

        {/* Headline */}
        <h1 className={`text-4xl sm:text-6xl md:text-5xl font-normal text-gray-900 leading-tight mb-2 max-w-2xl ${instrumentSerif.className}`}>
          Nonchalant
          <br />
          Link In Bio
        </h1>

        {/* Subheadline */}
        <p className="text-gray-400 text-[10px] md:text-lg max-w-md mb-10 leading-relaxed">
          Replace your boring static website with a stunning,
          <br />
          interactive link-in-bio that actually converts.
        </p>

        {/* CTA Buttons */}
        <div className="flex items-center gap-3 mb-4">
          <Link href={session ? "/editor" : "/login"}>
            <Button className={`${shadowClass} bg-[#222]  text-sm  text-white px-6 py-2.5 gap-2 transition-all hover:scale-105 active:scale-95 shrink-0 hover:bg-[#222] shadow-none`}>{session ? "Lets start" : "Try for free"}</Button>
          </Link>
        </div>

        <p className="text-[10px] md:text-sm text-gray-400">Under active construction · Many new features are coming.</p>
      </section>

      {/* App Preview Window */}
      <section className="w-full max-w-4xl mx-auto pb-10">
        <div className="px-4 sm:px-8 pb-8 max-h-[450px] overflow-hidden animate-fade-in">
          <Image src="/images/demo1.webp" alt="App Preview" width={3132} height={2060} className="w-full h-auto object-cover rounded-xl shadow-popover" sizes="(max-width: 768px) 100vw, 800px" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 border-y border-primary/20">
          {HIGHLIGHT_FEATURES.map((feature, i) => (
            <div key={feature.title} className={`p-6 sm:p-8 ${i < 2 ? "border-b md:border-b-0 md:border-r border-primary/20" : ""}`}>
              <h3 className="text-sm font-semibold text-gray-900 mb-2">{feature.title}</h3>
              <p className="text-sm text-gray-500 leading-relaxed">{feature.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Feature section */}
      <section className="w-full max-w-4xl mx-auto">
        <div className="flex flex-col">
          {DEMO_FEATURES.map((feature, idx) => (
            <div key={feature.tag} style={{ animationDelay: `${0.1 * (idx + 1)}s` }} className="flex flex-col gap-4 px-4 sm:px-8 py-12 border-b border-primary/20 animate-blur-fade-slide-in [will-change:transform,opacity]">
              <div>
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em]">{feature.tag}</span>
                <h3 className="text-2xl font-medium tracking-tight md:text-3xl text-gray-900 mt-2 mb-6">{feature.title}</h3>
              </div>
              <FeatureMedia src={feature.mediaSrc} alt={feature.title} />
            </div>
          ))}
        </div>
      </section>

      <section className="w-full">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-16 flex flex-col items-center">
          <h1 className={`text-4xl sm:text-6xl md:text-5xl font-normal text-gray-900 leading-tight mb-2 max-w-2xl ${instrumentSerif.className}`}>Create what matters now.</h1>
          <Link href={session ? "/editor" : "/login"}>
            <Button className={`${shadowClass} bg-[#222] font-bold text-sm  text-white px-6 py-2.5 gap-2 transition-all hover:scale-105 active:scale-95 shrink-0 hover:bg-[#222]`}>{session ? "Lets start" : "Lets start"}</Button>
          </Link>
        </div>
      </section>
    </main>
  );
}
