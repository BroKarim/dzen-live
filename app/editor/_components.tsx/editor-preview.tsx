"use client";

import { PreviewBackground, PreviewProfile, PreviewSocials, PreviewLinks } from "@/components/preview";
import type { ProfileEditorData } from "@/server/user/profile/payloads";
import { useEffect } from "react";
import { loadStyleFonts, type StyleTarget } from "@/lib/text-style";

interface PreviewProps {
  profile: ProfileEditorData;
  viewMode: "mobile" | "desktop";
  onStyleTargetClick?: (target: StyleTarget) => void;
}

export default function Preview({ profile, viewMode, onStyleTargetClick }: PreviewProps) {
  useEffect(() => {
    const cleanup = loadStyleFonts(profile);
    return cleanup;
  }, [profile]);

  return (
    <div className="flex flex-1 flex-col gap-4 overflow-hidden">
      <div className="relative flex flex-1 items-center justify-center overflow-hidden bg-[#181819] shadow-dzenn border-none rounded-2xl p-4 sm:p-8">
        <div
          className={`relative transition-all duration-500  ease-in-out overflow-hidden shadow-2xl ${
            viewMode === "mobile" ? "aspect-9/19 w-full max-w-[360px] rounded-[2.5rem] border-4 border-zinc-950" : "h-full w-full rounded-xl border-border border"
          }`}
          style={{ backgroundColor: "transparent" }}
        >
          <div className="absolute inset-0 rounded-[inherit] overflow-hidden pointer-events-none">
            <PreviewBackground profile={profile} />
          </div>

          <div className="relative h-full overflow-y-auto  no-scrollbar" style={{ padding: `${profile.padding}px` }}>
            <div className="mx-auto space-y-4 flex w-full  rounded-2xl max-w-[420px] flex-col items-center pb-24 pt-12">
              <PreviewProfile
                profile={{
                  displayName: profile.displayName,
                  bio: profile.bio,
                  avatarUrl: profile.avatarUrl,
                  layout: profile.layout as unknown as string,
                  displayNameStyle: (profile.displayNameStyle as any) ?? null,
                  bioStyle: (profile.bioStyle as any) ?? null,
                }}
                mode="editor"
                onStyleTargetClick={onStyleTargetClick}
              />
              <PreviewLinks
                profile={{
                  links: (profile.links ?? []).map((l) => ({ ...l, titleStyle: (l as any).titleStyle ?? null })),
                  cardTexture: profile.cardTexture,
                }}
                mode="editor"
                onStyleTargetClick={onStyleTargetClick}
              />
            </div>
          </div>
          <PreviewSocials profile={profile} />
        </div>
      </div>
    </div>
  );
}