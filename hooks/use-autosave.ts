"use client";

import { useEffect, useRef, useState } from "react";
import { useEditorStore } from "@/lib/stores/editor-store";
import { saveProfile } from "@/server/user/profile/save-profile-action";
import { normalizeEditorDraft } from "@/lib/editor-draft";

type SaveStatus = "idle" | "saving" | "saved" | "error-retryable" | "error-validation";

const DEBOUNCE_MS = 1500;
const SAVED_FADE_MS = 2000;

export function useAutosave() {
  const [status, setStatus] = useState<SaveStatus>("idle");
  const [lastError, setLastError] = useState<string | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const fadeRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const versionAtSaveStart = useRef<number>(0);

  const { isDirty, _draftVersion } = useEditorStore();

  function clearTimers() {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    if (fadeRef.current) {
      clearTimeout(fadeRef.current);
      fadeRef.current = null;
    }
  }

  async function performSave() {
    const state = useEditorStore.getState();
    if (!state.draftProfile || !state.isDirty) return;

    const draftProfile = state.draftProfile;
    const currentVersion = state._draftVersion;

    versionAtSaveStart.current = currentVersion;
    setStatus("saving");
    setLastError(null);

    try {
      const payload = normalizeEditorDraft(draftProfile) ?? draftProfile;
      const res = await saveProfile(payload);

      if (!res.success) {
        setStatus("error-validation");
        setLastError(res.error || "Validation failed");
        console.error("[useAutosave] validation error:", res.error);
        return;
      }

      const stateAfter = useEditorStore.getState();
      if (stateAfter._draftVersion === versionAtSaveStart.current) {
        useEditorStore.getState().updateDraft({ ...payload, links: res.links, socials: res.socials });
        useEditorStore.getState().markAsSaved();
        setStatus("saved");
        setLastError(null);

        fadeRef.current = setTimeout(() => {
          setStatus("idle");
        }, SAVED_FADE_MS);
      }
    } catch (error: unknown) {
      console.error("[useAutosave] save failed:", error);
      setStatus("error-retryable");
      setLastError(error instanceof Error ? error.message : "Save failed");
    }
  }

  function retry() {
    clearTimers();
    performSave();
  }

  function flushSave() {
    const state = useEditorStore.getState();
    if (state.isDirty) {
      clearTimers();
      performSave();
    }
  }

  // Debounce timer — fires when isDirty changes to true
  useEffect(() => {
    if (!isDirty) {
      clearTimers();
      return;
    }

    if (timerRef.current) clearTimeout(timerRef.current);

    timerRef.current = setTimeout(() => {
      performSave();
    }, DEBOUNCE_MS);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [isDirty, _draftVersion, performSave, clearTimers]);

  useEffect(() => {
    return () => clearTimers();
  }, [clearTimers]);

  return { status, lastError, retry, flushSave };
}
