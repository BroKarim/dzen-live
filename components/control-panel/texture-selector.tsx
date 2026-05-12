"use client";

import Image from "next/image";
import { Label } from "@/components/ui/label";
import { m, LazyMotion, domAnimation } from "framer-motion";
import { Check } from "lucide-react";
import type { ProfileEditorData } from "@/server/user/profile/payloads";

interface CardTextureSelectorProps {
  profile: ProfileEditorData;
  onUpdate: (profile: ProfileEditorData) => void;
}

export function CardTextureSelector({ profile, onUpdate }: CardTextureSelectorProps) {
  const textures = [
    {
      id: "base",
      label: "Default",
      preview: "/images/textures/basic.jpg",
      description: "Solid & clean",
    },
    {
      id: "glassy",
      label: "Glassy",
      preview: "/images/textures/glassy.jpg",
      description: "Modern blur",
    },
  ];

  return (
    <LazyMotion features={domAnimation}>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Label className="text-[11px] font-bold uppercase tracking-[0.15em] text-muted-foreground/80">Texture</Label>
          <span className="text-[10px] font-medium text-primary/60 bg-primary/5 px-2 py-0.5 rounded-full border border-primary/10">{textures.find((t) => t.id === profile.cardTexture)?.label || "Default"}</span>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {textures.map((t) => {
            const isActive = profile.cardTexture === t.id;

            return (
              <m.button
                key={t.id}
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => onUpdate({ ...profile, cardTexture: t.id as any })}
                className={`group relative flex h-20 overflow-hidden rounded-xl border-2 transition-all duration-300 ${
                  isActive ? "border-primary shadow-[0_0_20px_rgba(var(--primary),0.15)] ring-2 ring-primary/20 ring-offset-2 ring-offset-background" : "border-zinc-800 bg-zinc-900/50 hover:border-zinc-700"
                }`}
              >
                {/* Image Preview Container */}
                <div className="relative h-full w-full overflow-hidden bg-zinc-950">
                  <Image
                    src={t.preview}
                    alt={t.label}
                    fill
                    sizes="(max-width: 768px) 50vw, 33vw"
                    className={`object-cover transition-all duration-500 ${isActive ? "opacity-100 scale-110" : "opacity-60 grayscale-[0.5] group-hover:scale-110 group-hover:grayscale-0 group-hover:opacity-40"}`}
                  />

                  {/* Hover Overlay with Label */}
                  <div className={`absolute inset-0 flex items-center justify-center bg-black/60 opacity-0 transition-opacity duration-300 group-hover:opacity-100 ${isActive ? "!opacity-0" : ""}`}>
                    <span className="text-[10px] font-bold uppercase tracking-widest text-white">{t.label}</span>
                  </div>

                  {/* Active Overlay */}
                  <div className={`absolute inset-0 transition-opacity duration-300 ${isActive ? "bg-primary/10" : "bg-transparent"}`} />

                  {isActive && (
                    <m.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="absolute right-2 top-2 flex size-5 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg z-10">
                      <Check className="size-3 stroke-[3]" />
                    </m.div>
                  )}
                </div>
              </m.button>
            );
          })}
        </div>
      </div>
    </LazyMotion>
  );
}
