"use client";

import { useEffect, useRef, useTransition } from "react";
import { usePathname, useRouter } from "next/navigation";
import EditorHeader from "./editor-header";
import Preview from "./editor-preview";
import ControlPanel from "./control-panel";
import { EditorDock } from "./editor-dock";
import { useEditorStore } from "@/lib/stores/editor-store";
import { useAutosave } from "@/hooks/use-autosave";
import { EditorUIProvider, useEditorUIContext } from "@/lib/contexts/editor-ui";
import { togglePublishStatus } from "@/server/user/settings/actions";
import type { ProfileEditorData } from "@/server/user/profile/payloads";
import { TextStylePopover } from "@/components/editor/text-style-popover";
import { styleTargetId, type StyleTarget } from "@/lib/text-style";

interface EditorClientProps {
  initialProfile: ProfileEditorData;
}

export default function EditorClient({ initialProfile }: EditorClientProps) {
  return (
    <EditorUIProvider>
      <EditorClientInner initialProfile={initialProfile} />
    </EditorUIProvider>
  );
}

function EditorClientInner({ initialProfile }: EditorClientProps) {
  const { viewMode, setViewMode, openStylePopover } = useEditorUIContext();

  const { draftProfile, isDirty, initializeEditor, updateDraft, _hasHydrated } = useEditorStore();
  const { status, flushSave } = useAutosave();
  const router = useRouter();
  const pathname = usePathname();
  const [, startRedirectTransition] = useTransition();

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

  // Redirect when username changes after auto-save
  const savedUsernameRef = useRef(initialProfile.username);
  useEffect(() => {
    if (status === "saved") {
      const { draftProfile } = useEditorStore.getState();
      const newUsername = draftProfile?.username;
      if (newUsername && newUsername !== savedUsernameRef.current) {
        savedUsernameRef.current = newUsername;
        startRedirectTransition(() => {
          router.replace(`/editor/${newUsername}`);
        });
      }
    }
  }, [status, router]);

  function handlePreviewStyleClick(target: StyleTarget) {
    const id = styleTargetId(target);
    const el = document.querySelector(`[data-style-target="${id}"]`) as HTMLElement | null;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    openStylePopover({
      target,
      x: rect.left + rect.width / 2,
      y: rect.bottom,
    });
  }

  async function handleTogglePublish(publish: boolean) {
    const result = await togglePublishStatus(publish);
    if (result.success) {
      const { draftProfile } = useEditorStore.getState();
      if (draftProfile) {
        updateDraft({ ...draftProfile, isPublished: publish });
      }
      router.refresh();
      return { success: true };
    }
    return { success: false, error: result.error || "Failed to update publish status" };
  }

  function handleViewSite() {
    const username = currentProfile?.username || initialProfile.username;
    if (username) {
      window.open(`https://dzenn.live/${username}`, "_blank", "noopener,noreferrer");
    }
  }

  const currentProfile = draftProfile || initialProfile;

  return (
    <main className="min-h-screen flex h-screen flex-col bg-background">
      {/* Mobile: show header + "go to desktop" message, hide everything else */}
      <div className="flex md:hidden flex-col h-screen">
        <EditorHeader profile={currentProfile} onTogglePublish={handleTogglePublish} onViewSite={handleViewSite} />
        <div className="flex flex-1 flex-col items-center justify-center gap-3 px-8 text-center">
          <p className="font-bold text-base leading-snug">Go to desktop.</p>
          <p className="text-sm text-muted-foreground leading-relaxed">I didn&apos;t have time for mobile responsiveness, I have a life.</p>
        </div>
      </div>

      {/* Desktop: full editor layout */}
      <div className="hidden md:flex flex-col flex-1 h-screen">
        <EditorHeader profile={currentProfile} onTogglePublish={handleTogglePublish} onViewSite={handleViewSite} />

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
