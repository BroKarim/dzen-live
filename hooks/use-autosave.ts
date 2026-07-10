"use client";

import { useEffect, useRef, useState, useCallback } from "react";
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

  const { draftProfile, isDirty, _draftVersion, updateDraft, markAsSaved } = useEditorStore();

  const clearTimers = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    if (fadeRef.current) {
      clearTimeout(fadeRef.current);
      fadeRef.current = null;
    }
  }, []);

  const performSave = useCallback(async () => {
    if (!draftProfile || !isDirty) return;

    versionAtSaveStart.current = _draftVersion;
    setStatus("saving");
    setLastError(null);

    try {
      // Normalize before send so obsolete localStorage fields never hit the server
      const payload = normalizeEditorDraft(draftProfile) ?? draftProfile;
      const res = await saveProfile(payload);

      if (!res.success) {
        setStatus("error-validation");
        setLastError(res.error || "Validation failed");
        console.error("[useAutosave] validation error:", res.error);
        return;
      }

      // Only mark as saved if draft hasn't changed during save
      const currentVersion = useEditorStore.getState()._draftVersion;
      if (currentVersion === versionAtSaveStart.current) {
        updateDraft({ ...payload, links: res.links, socials: res.socials });
        markAsSaved();
        setStatus("saved");
        setLastError(null);

        // Fade to idle after 2s
        fadeRef.current = setTimeout(() => {
          setStatus("idle");
        }, SAVED_FADE_MS);
      }
      // else: newer changes pending, debounce will re-fire
    } catch (error: unknown) {
      console.error("[useAutosave] save failed:", error);
      setStatus("error-retryable");
      setLastError(error instanceof Error ? error.message : "Save failed");
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

  return { status, lastError, retry, flushSave };
}
