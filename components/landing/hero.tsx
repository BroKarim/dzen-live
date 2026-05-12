"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useSession } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import Image from "next/image";

export function Hero() {
  const [username, setUsername] = useState("");
  const { data: session } = useSession();
  const { push } = useRouter();
  const [isHovered, setIsHovered] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  const handleClaim = (e: React.FormEvent) => {
    e.preventDefault();
    if (!username) return;

    if (!session) {
      push(`/login?username=${username}`);
    } else {
      push("/editor");
    }
  };

  return (
    <main className="relative min-h-screen overflow-hidden bg-zinc-950">
      <div className="absolute inset-0 z-0">
        <Image
          src="https://res.cloudinary.com/dctl5pihh/image/upload/f_auto,q_auto,w_1920/background_valoru.jpg"
          alt="Hero background"
          fill
          sizes="100vw"
          priority
          quality={90}
          className={`object-cover transition-[transform,opacity] duration-700 ${isHovered ? "scale-105" : "scale-100"} ${imageLoaded ? "opacity-100" : "opacity-90 scale-110"}`}
          onLoad={() => setImageLoaded(true)}
          onError={(e) => {
            console.error("Image failed to load:", e);
            // Fallback to original URL if transformation fails
            const target = e.target as HTMLImageElement;
            target.src = "https://res.cloudinary.com/dctl5pihh/image/upload/v1768287477/background_valoru.jpg";
          }}
        />
      </div>

      <div className="absolute inset-0 z-10 bg-black/40 backdrop-blur-[2px]" />

      <div className="relative z-20 min-h-screen flex flex-col justify-between p-8 md:p-12 lg:p-16 text-white">
        {/* Header Section */}
        <header className="flex mt-32 md:mt-8 flex-col md:flex-row md:items-start md:justify-between gap-8">
          {/* Title and Input - Top Left */}
          <div className="max-w-xl order-1">
            <h1 className="tracking-tight text-balance text-white drop-shadow-2xl font-serif font-thin lg:text-8xl md:text-8xl text-7xl">
              Nonchalantt
              <br />
              Link in Bio
            </h1>

            {/* Username Claim Form */}
            <div className="mt-8 group relative flex items-center w-full max-w-md transition-all">
              <form onSubmit={handleClaim} className="relative flex-1 flex items-center w-full group">
                <div className="relative w-full flex items-center">
                  <div className="w-full flex items-center gap-0 px-4 h-12 transition-all  backdrop-blur-xl hover:bg-white/20 border border-white/20 rounded-full text-white font-medium shadow-2xl">
                    <span className="text-white/40 font-medium select-none text-sm sm:text-base whitespace-nowrap">dzenn.live/</span>
                    <input
                      type="text"
                      placeholder="username"
                      value={username}
                      onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/\s+/g, ""))}
                      required
                      className="flex-1 border-none text-white placeholder:text-white/20 h-full px-1  focus:outline-none  rounded-none font-medium text-sm sm:text-base cursor-text"
                    />
                  </div>
                  <Button
                    type="submit"
                    className="absolute right-1 h-10 px-6 rounded-full text-xs font-bold transition-all bg-primary text-primary-foreground hover:opacity-90 active:scale-95 shadow-lg whitespace-nowrap"
                    onMouseEnter={() => setIsHovered(true)}
                    onMouseLeave={() => setIsHovered(false)}
                  >
                    Claim Page
                  </Button>
                </div>
              </form>
            </div>
          </div>

          {/* Description - Top Right */}
          <div className="max-w-sm md:text-right order-2">
            <p className="text-white/90 text-base leading-relaxed drop-shadow-lg md:text-base">
              Replace your boring static website with a stunning,
              <br />
              interactive link-in-bio that actually converts.
              <br />
              Built for creators who demand excellence.
            </p>
          </div>
        </header>

        {/* Stats Section - Bottom */}
        <footer className="fixed bottom-0 left-0 right-0 z-30 p-8 md:p-12 lg:p-16">
          <div className="grid grid-cols-3 gap-4 md:gap-8 lg:gap-12">
            {/* Stat 1 - Open Source */}
            <div className="text-center sm:text-left">
              <div className="md:text-7xl lg:text-8xl text-white drop-shadow-2xl text-center font-extralight text-4xl">100%</div>
              <div className="mt-2 md:text-base text-white/70 tracking-widest uppercase text-center text-xs">Open Source</div>
            </div>

            {/* Stat 2 - Beautiful Design */}
            <div className="text-center">
              <div className="md:text-7xl lg:text-8xl text-white drop-shadow-2xl font-extralight text-4xl">∞</div>
              <div className="mt-2 md:text-base text-white/70 tracking-widest uppercase text-xs">Design Freedom</div>
            </div>

            {/* Stat 3 - Deep Analytics */}
            <div className="text-center sm:text-right">
              <div className="md:text-7xl lg:text-8xl text-white drop-shadow-2xl text-center font-extralight text-4xl">360°</div>
              <div className="mt-2 md:text-base text-white/70 tracking-widest uppercase text-center text-xs">Deep Analytics</div>
            </div>
          </div>
        </footer>
      </div>
    </main>
  );
}
