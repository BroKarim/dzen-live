import React from "react";
import { SOCIAL_PLATFORMS } from "@/lib/sosmed";
import { Dock, DockIcon } from "@/components/ui/dock";
import { Globe } from "lucide-react";
import type { CardTexture } from "@/lib/generated/prisma/client";

interface PreviewSocialsProps {
  profile: {
    socials: {
      id: string;
      platform: string;
      url: string;
    }[];
    cardTexture: CardTexture;
  };
}

export function PreviewSocials({ profile }: PreviewSocialsProps) {
  if (!profile.socials || profile.socials.length === 0) return null;

  const isGlassy = profile.cardTexture === "glassy";

  return (
    <div className="absolute bottom-6 left-0 right-0 z-50 px-4 pointer-events-none">
      <Dock
        iconSize={40}
        texture={profile.cardTexture}
        className={isGlassy ? "bg-transparent! border-white/20! shadow-[0_10px_30px_rgba(0,0,0,0.25),0_0_20px_rgba(255,255,255,0.1)]! backdrop-blur-lg" : "bg-zinc-900/80! border-white/5! backdrop-blur-md shadow-dzenn!"}
      >
        {profile.socials.map((social) => {
          const platform = SOCIAL_PLATFORMS.find((p) => p.id === social.platform);
          const Icon = platform?.icon || Globe;

          return (
            <DockIcon key={social.id} href={social.url} label={platform?.label || "Link"}>
              <Icon className="size-5" />
            </DockIcon>
          );
        })}
      </Dock>
    </div>
  );
}
