"use client";

import Image from "next/image";
import { styleTargetId, type StyleTarget, type TextStyle } from "@/lib/text-style";
import { getFontVariable } from "@/lib/font-catalog";

type Mode = "editor" | "public";

interface PreviewProfileProps {
  profile: {
    displayName: string | null;
    bio: string | null;
    avatarUrl: string | null;
    layout: string;
    displayNameStyle?: TextStyle | null;
    bioStyle?: TextStyle | null;
  };
  isFullBio?: boolean;
  mode?: Mode;
  onStyleTargetClick?: (target: StyleTarget) => void;
}

export function PreviewProfile({ profile, isFullBio, mode = "public", onStyleTargetClick }: PreviewProfileProps) {
  const isEditor = mode === "editor";

  const handleClick = (e: React.MouseEvent<HTMLElement>) => {
    if (!isEditor) return;
    const target = (e.target as HTMLElement).closest("[data-style-target]") as HTMLElement | null;
    if (!target) return;
    const id = target.dataset.styleTarget!;
    e.stopPropagation();
    onStyleTargetClick?.({ type: "profile", field: id === "profile.displayName" ? "displayName" : "bio" });
  };

  const editableClass = isEditor ? "cursor-pointer rounded transition-all duration-150 hover:outline hover:outline-1 hover:outline-dashed hover:outline-white/40 hover:outline-offset-2" : "";

  const dnFontVar = profile.displayNameStyle?.fontFamily ? getFontVariable(profile.displayNameStyle.fontFamily) : undefined;
  const dnFontFamily = profile.displayNameStyle?.fontFamily
    ? dnFontVar
      ? `var(${dnFontVar}), var(--font-geist-sans)`
      : `"${profile.displayNameStyle.fontFamily}", var(--font-sans)`
    : undefined;

  const bioFontVar = profile.bioStyle?.fontFamily ? getFontVariable(profile.bioStyle.fontFamily) : undefined;
  const bioFontFamily = profile.bioStyle?.fontFamily
    ? bioFontVar
      ? `var(${bioFontVar}), var(--font-geist-sans)`
      : `"${profile.bioStyle.fontFamily}", var(--font-sans)`
    : undefined;

  return (
    <div
      onClick={handleClick}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') handleClick(e as any); }}
      role="presentation"
      className={`mb-8 flex w-full gap-4 transition-all duration-300 ${profile.layout === "center" ? "flex-col items-center text-center" : profile.layout === "left_stack" ? "flex-col items-start text-left" : "items-center  text-left"}`}
    >
      <div className="size-20 shrink-0 overflow-hidden rounded-full shadow-lg border-2 border-white/10 relative">
        {profile.avatarUrl ? (
          <Image src={profile.avatarUrl} alt="Avatar" fill className="object-cover" priority sizes="96px" />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-zinc-800 text-2xl font-bold text-white tracking-tighter">{profile.displayName?.charAt(0).toUpperCase() || "B"}</div>
        )}
      </div>

      <div className="flex flex-col min-w-0">
        <h2
          data-style-target={styleTargetId({ type: "profile", field: "displayName" })}
          className={`text-xl font-bold mb-0.5 ${editableClass}`}
          style={{
            ...(profile.displayNameStyle?.color ? { color: profile.displayNameStyle.color } : { color: "var(--foreground)" }),
            ...(dnFontFamily ? { fontFamily: dnFontFamily } : {}),
          }}
        >
          {profile.displayName || "Your Name"}
        </h2>
        <p
          data-style-target={styleTargetId({ type: "profile", field: "bio" })}
          className={`text-sm font-medium ${!isFullBio && "line-clamp-2"} ${editableClass}`}
          style={{
            ...(profile.bioStyle?.color ? { color: profile.bioStyle.color } : { color: "var(--accent)" }),
            ...(bioFontFamily ? { fontFamily: bioFontFamily } : {}),
          }}
        >
          {profile.bio || "Add your bio here"}
        </p>
      </div>
    </div>
  );
}
