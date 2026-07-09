"use client";

import React, { useEffect } from "react";
import { PreviewBackground, PreviewProfile, PreviewSocials, PreviewLinks } from "@/components/preview";
import { sendTrackingBeacon } from "./tracking";
import { ProfileHeaderButtons } from "./profile-header-buttons";
import { loadStyleFonts } from "@/lib/text-style";

export function ProfileView({ user: profile }: { user: any }) {
  const avatarUrl = profile.avatarUrl || null;

  useEffect(() => {
    const cleanup = loadStyleFonts(profile);
    return cleanup;
  }, [profile]);

  return (
    <div className="relative min-h-screen w-full overflow-x-hidden transition-colors duration-300">
      <PreviewBackground profile={profile} />

      <div className="relative z-10 min-h-screen" style={{ padding: `${profile.padding || 32}px` }}>
        <div className="absolute top-0 left-0 right-0 z-20 px-6 pt-8">
          <ProfileHeaderButtons name={profile.user?.name} username={profile.username} avatarUrl={avatarUrl} bgType={profile.bgType} bgColor={profile.bgColor} bgWallpaper={profile.bgWallpaper} bgImage={profile.bgImage} />
        </div>

        <div className="mx-auto flex w-full max-w-[420px] flex-col items-center pb-24 pt-12 space-y-4">
          <PreviewProfile profile={profile} isFullBio={true} mode="public" />
          <PreviewSocials profile={profile} />
          <PreviewLinks
            profile={profile}
            mode="public"
            renderLink={(link, card) =>
              React.cloneElement(card as React.ReactElement<any>, {
                onBeforeNavigate: () => sendTrackingBeacon(link.id),
              })
            }
          />
        </div>
      </div>
    </div>
  );
}
