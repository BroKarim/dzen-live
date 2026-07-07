"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { usePathname } from "next/navigation";
import EditorHeader from "./editor-header";
import Preview from "./editor-preview";
import ControlPanel from "./control-panel";
import { EditorDock } from "./editor-dock";
import { useEditorStore } from "@/lib/stores/editor-store";
import { useAutosave } from "@/hooks/use-autosave";
import type { ProfileEditorData } from "@/server/user/profile/payloads";
import { TextStylePopover } from "@/components/editor/text-style-popover";
import { styleTargetId, type StyleTarget } from "@/lib/text-style";

interface EditorClientProps {
  initialProfile: ProfileEditorData;
}

export default function EditorClient({ initialProfile }: EditorClientProps) {
  const [viewMode, setViewMode] = useState<"mobile" | "desktop">("mobile");

  const { draftProfile, isDirty, initializeEditor, updateDraft, _hasHydrated, openStylePopover } = useEditorStore();
  const { status, retry, flushSave } = useAutosave();
  const pathname = usePathname();

  useEffect(() => {
    const handler = (e: BeforeUnloadEvent) => {
      if (isDirty || status === "saving") {
        e.preventDefault();
        e.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [isDirty, status]);

  const flushSaveRef = useRef(flushSave);
  const prevPathnameRef = useRef(pathname);
  useEffect(() => {
    flushSaveRef.current = flushSave;
    if (prevPathnameRef.current !== pathname) {
      flushSaveRef.current();
      prevPathnameRef.current = pathname;
    }
  }, [pathname, flushSave]);

  const initRef = useRef(false);
  const initialProfileRef = useRef(initialProfile);
  useEffect(() => {
    if (_hasHydrated && !initRef.current) {
      initRef.current = true;
      initializeEditor(initialProfileRef.current);
    }
  }, [_hasHydrated, initializeEditor]);

  const handlePreviewStyleClick = useCallback((target: StyleTarget) => {
    const id = styleTargetId(target);
    const el = document.querySelector(`[data-style-target="${id}"]`) as HTMLElement | null;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    openStylePopover({
      target,
      x: rect.left + rect.width / 2,
      y: rect.bottom,
    });
  }, [openStylePopover]);

  if (!_hasHydrated) {
    return (
      <div className="h-screen w-screen flex flex-col items-center justify-center gap-4 bg-background">
        <div className="size-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        <p className="text-sm font-medium animate-pulse">Synchronizing editor...</p>
      </div>
    );
  }

  const currentProfile = draftProfile || initialProfile;

  return (
    <main className="min-h-screen flex h-screen flex-col bg-background">
      {/* Mobile: show header + "go to desktop" message, hide everything else */}
      <div className="flex md:hidden flex-col h-screen">
        <EditorHeader profile={currentProfile} saveStatus={status} onRetry={retry} />
        <div className="flex flex-1 flex-col items-center justify-center gap-3 px-8 text-center">
          <p className="font-bold text-base leading-snug">Go to desktop.</p>
          <p className="text-sm text-muted-foreground leading-relaxed">I didn&apos;t have time for mobile responsiveness, I have a life.</p>
        </div>
      </div>

      {/* Desktop: full editor layout */}
      <div className="hidden md:flex flex-col flex-1 h-screen">
        <EditorHeader profile={currentProfile} saveStatus={status} onRetry={retry} />

        <div className="flex flex-1 gap-6 overflow-hidden p-6" style={{ zoom: 0.9 }}>
          <Preview profile={currentProfile} viewMode={viewMode} onStyleTargetClick={handlePreviewStyleClick} />

          <ControlPanel profile={currentProfile} onUpdate={updateDraft} />
        </div>

        <EditorDock viewMode={viewMode} setViewMode={setViewMode} />
      </div>

      <TextStylePopover />
    </main>
  );
}
