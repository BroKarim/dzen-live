"use client";

import { RotateCcw, Loader2, Check, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { DomainView } from "@/components/domain-view";
import { ProfileEditorData } from "@/server/user/profile/payloads";
import { useEditorStore } from "@/lib/stores/editor-store";

type SaveStatus = "idle" | "saving" | "saved" | "error-retryable" | "error-validation";

interface EditorHeaderProps {
  profile: ProfileEditorData;
  saveStatus: SaveStatus;
  onRetry: () => void;
}

export default function EditorHeader({ profile, saveStatus, onRetry }: EditorHeaderProps) {
  const baseUrl = (process.env.NEXT_PUBLIC_APP_URL || "dzenn.live").replace(/https?:\/\//, "");
  const { isDirty, discardChanges, draftProfile } = useEditorStore();
  const username = draftProfile?.username || profile.username || "user";
  const fullUrl = `${baseUrl}/${username}`;

  const handleDiscard = () => {
    discardChanges();
  };

  return (
    <header className="bg-background/95 sticky top-0 z-50 px-4 md:px-6 py-3 border-b">
      <div className="flex items-center justify-between gap-2">
        {/* Left: Logo + DomainView */}
        <div className="flex items-center gap-3 min-w-0">
          <Link href="/" className="size-9 md:w-10 md:h-10 flex items-center justify-center rounded-full bg-[#222] border-none text-white font-bold text-sm transition-all hover:scale-105 active:scale-95 shrink-0 shadow-dzenn">
            Dz
          </Link>
          {/* DomainView hidden on mobile */}
          <div className="hidden sm:block min-w-0">
            <DomainView
              placeholder={fullUrl}
              value={fullUrl}
              buttonCopy={{
                idle: "Copy",
                success: "Copied!",
              }}
            />
          </div>
        </div>

        {/* Right: Status indicator & Discard Button */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Discard: visible when dirty */}
          {isDirty && (
            <Button onClick={handleDiscard} size="sm" variant="ghost" className="h-8 gap-1.5 text-xs hover:bg-destructive/10 hover:text-destructive transition-colors px-2">
              <RotateCcw className="size-3.5" />
              <span className="hidden sm:inline">Discard</span>
            </Button>
          )}

          {/* Status indicator */}
          <StatusIndicator status={saveStatus} onRetry={onRetry} />
        </div>
      </div>
    </header>
  );
}

function StatusIndicator({ status, onRetry }: { status: SaveStatus; onRetry: () => void }) {
  switch (status) {
    case "saving":
      return (
        <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
          <Loader2 className="size-3.5 animate-spin" />
          <span className="hidden sm:inline">Saving...</span>
        </span>
      );

    case "saved":
      return (
        <span className="inline-flex items-center gap-1.5 text-xs text-emerald-600 animate-in fade-in">
          <Check className="size-3.5" />
          <span className="hidden sm:inline">Saved</span>
        </span>
      );

    case "error-retryable":
      return (
        <Button onClick={onRetry} size="sm" variant="ghost" className="h-8 gap-1.5 text-xs text-destructive hover:bg-destructive/10 px-2">
          <AlertTriangle className="size-3.5" />
          <span className="hidden sm:inline">Save failed</span>
          <span className="underline">Retry</span>
        </Button>
      );

    case "error-validation":
      return (
        <span className="inline-flex items-center gap-1.5 text-xs text-destructive">
          <AlertTriangle className="size-3.5" />
          <span className="hidden sm:inline">Save failed</span>
        </span>
      );

    default:
      return null;
  }
}
