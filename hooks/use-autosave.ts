"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useEditorStore } from "@/lib/stores/editor-store";
import { saveProfile } from "@/server/user/profile/save-profile-action";

type SaveStatus = "idle" | "saving" | "saved" | "error-retryable" | "error-validation";

const DEBOUNCE_MS = 1500;
const SAVED_FADE_MS = 2000;

export function useAutosave() {
  const [status, setStatus] = useState<SaveStatus>("idle");
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const fadeRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const versionAtSaveStart = useRef<number>(0);

  const { draftProfile, isDirty, _draftVersion, updateDraft, markAsSaved } = useEditorStore();

  const clearTimers = useCallback(() => {
    if (timerRef.current) { clearTimeout(timerRef.current); timerRef.current = null; }
    if (fadeRef.current) { clearTimeout(fadeRef.current); fadeRef.current = null; }
  }, []);

  const performSave = useCallback(async () => {
    if (!draftProfile || !isDirty) return;

    versionAtSaveStart.current = _draftVersion;
    setStatus("saving");

    try {
      const res = await saveProfile(draftProfile);

      if (!res.success) {
        // Validation error from server
        setStatus("error-validation");
        console.error("[useAutosave] validation error:", res.error);
        return;
      }

      // Only mark as saved if draft hasn't changed during save
      const currentVersion = useEditorStore.getState()._draftVersion;
      if (currentVersion === versionAtSaveStart.current) {
        updateDraft({ ...draftProfile, links: res.links, socials: res.socials });
        markAsSaved();
        setStatus("saved");

        // Fade to idle after 2s
        fadeRef.current = setTimeout(() => {
          setStatus("idle");
        }, SAVED_FADE_MS);
      }
      // else: newer changes pending, debounce will re-fire
    } catch (error: any) {
      console.error("[useAutosave] save failed:", error);
      setStatus("error-retryable");
    }
  }, [draftProfile, isDirty, _draftVersion, updateDraft, markAsSaved]);

  const retry = useCallback(() => {
    clearTimers();
    performSave();
  }, [clearTimers, performSave]);

  const flushSave = useCallback(() => {
    if (isDirty) {
      clearTimers();
      performSave();
    }
  }, [isDirty, clearTimers, performSave]);

  // Debounce timer — fires when isDirty changes to true
  useEffect(() => {
    if (!isDirty) {
      clearTimers();
      return;
    }

    // Clear any existing timer and set new one
    if (timerRef.current) clearTimeout(timerRef.current);

    timerRef.current = setTimeout(() => {
      performSave();
    }, DEBOUNCE_MS);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [isDirty, _draftVersion, performSave, clearTimers]);

  // Cleanup on unmount
  useEffect(() => {
    return () => clearTimers();
  }, [clearTimers]);

  return { status, retry, flushSave };
}
