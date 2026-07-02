"use client";

import { useMemo } from "react";
import { Sparkles, RotateCcw } from "lucide-react";
import type { ProfileEditorData } from "@/server/user/profile/payloads";
import { isStyleEmpty, type TextStyle } from "@/lib/text-style";

interface ResetStylesIndicatorProps {
  profile: ProfileEditorData;
  onUpdate: (profile: ProfileEditorData) => void;
}

export function ResetStylesIndicator({ profile, onUpdate }: ResetStylesIndicatorProps) {
  const counts = useMemo(() => {
    let total = 0;
    let profileCount = 0;
    let linkCount = 0;
    if (!isStyleEmpty(profile.displayNameStyle as TextStyle | null)) {
      total++;
      profileCount++;
    }
    if (!isStyleEmpty(profile.bioStyle as TextStyle | null)) {
      total++;
      profileCount++;
    }
    profile.links?.forEach((l) => {
      if (!isStyleEmpty(l.titleStyle as TextStyle | null)) {
        total++;
        linkCount++;
      }
    });
    return { total, profileCount, linkCount };
  }, [profile.displayNameStyle, profile.bioStyle, profile.links]);

  if (counts.total === 0) {
    return (
      <div className="flex items-center gap-2 px-3 py-2 rounded-lg border border-dashed border-white/10 bg-white/[0.02]">
        <Sparkles className="size-3.5 text-muted-foreground shrink-0" />
        <div className="flex flex-col">
          <span className="text-[11px] font-medium leading-tight">Customize per-element styles</span>
          <span className="text-[10px] text-muted-foreground leading-tight">Click any text in the preview to change its color or font.</span>
        </div>
      </div>
    );
  }

  const handleReset = () => {
    onUpdate({
      ...profile,
      displayNameStyle: null,
      bioStyle: null,
      links: profile.links?.map((l) => ({ ...l, titleStyle: null })),
    });
  };

  const parts: string[] = [];
  if (counts.profileCount > 0) parts.push(`${counts.profileCount} profile text`);
  if (counts.linkCount > 0) parts.push(`${counts.linkCount} link title${counts.linkCount > 1 ? "s" : ""}`);
  const breakdown = parts.join(" · ");

  return (
    <div className="flex items-center gap-2 px-3 py-2 rounded-lg border border-primary/20 bg-primary/5">
      <div className="size-7 rounded-md bg-primary/15 flex items-center justify-center shrink-0">
        <Sparkles className="size-3.5 text-primary" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-[11px] font-medium leading-tight">{counts.total} custom style{counts.total > 1 ? "s" : ""} active</div>
        <div className="text-[10px] text-muted-foreground leading-tight truncate">{breakdown}</div>
      </div>
      <button onClick={handleReset} className="flex items-center gap-1 h-7 px-2.5 text-[10px] font-medium rounded-md bg-white/5 hover:bg-destructive/20 hover:text-destructive text-muted-foreground transition-colors shrink-0" title="Reset all custom styles">
        <RotateCcw className="size-3" />
        <span>Reset all</span>
      </button>
    </div>
  );
}
