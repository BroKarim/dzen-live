import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { ProfileEditorData } from "@/server/user/profile/payloads";
import { applyStyleToProfile, type StyleTarget } from "@/lib/text-style";

interface PopoverAnchor {
  target: StyleTarget;
  x: number;
  y: number;
}

interface EditorState {
  originalProfile: ProfileEditorData | null;
  draftProfile: ProfileEditorData | null;
  isDirty: boolean;
  _hasHydrated: boolean;
  _draftVersion: number;
  stylePopover: PopoverAnchor | null;

  setHasHydrated: (state: boolean) => void;
  initializeEditor: (profile: ProfileEditorData) => void;
  updateDraft: (profile: ProfileEditorData) => void;
  markAsSaved: () => void;
  discardChanges: () => void;
  clearDraft: () => void;
  openStylePopover: (anchor: PopoverAnchor) => void;
  closeStylePopover: () => void;
  setElementStyle: (target: StyleTarget, style: { color?: string; fontFamily?: string } | null) => void;
}

export const useEditorStore = create<EditorState>()(
  persist(
    (set, get) => ({
      originalProfile: null,
      draftProfile: null,
      isDirty: false,
      _hasHydrated: false,
      _draftVersion: 0,
      stylePopover: null,

      setHasHydrated: (state) => set({ _hasHydrated: state }),

      initializeEditor: (serverProfile) => {
        const state = get();
        if (!state._hasHydrated) return;

        const { draftProfile } = state;

        // Case 1: No existing draft — initialize fresh from server
        if (!draftProfile) {
          set({ originalProfile: serverProfile, draftProfile: serverProfile, isDirty: false, _draftVersion: 0 });
          return;
        }

        // Case 2: Draft belongs to a different profile (e.g. user switched account)
        if (draftProfile.id !== serverProfile.id) {
          set({ originalProfile: serverProfile, draftProfile: serverProfile, isDirty: false, _draftVersion: 0 });
          return;
        }

        // Case 3: Draft contains stale link IDs that no longer exist in the DB.
        // This happens after a failed duplicate-save scenario (see NOTE in TODO.md).
        // We detect "stale" as a non-temp ID that isn't in the server's current link list.
        const serverLinkIds = new Set((serverProfile.links ?? []).map((l) => l.id));
        const hasStaleLinks = (draftProfile.links ?? []).some((l) => !String(l.id).startsWith("temp-") && !serverLinkIds.has(l.id));

        if (hasStaleLinks) {
          set({ originalProfile: serverProfile, draftProfile: serverProfile, isDirty: false, _draftVersion: 0 });
          return;
        }

        // Draft is valid — keep the user's in-progress edits as-is.
        // Always update originalProfile to the latest server snapshot so that
        // save diffs are calculated correctly on the next Save.
        const hasDirtyChanges = JSON.stringify(draftProfile) !== JSON.stringify(serverProfile);
        set({
          originalProfile: serverProfile,
          draftProfile, // preserve existing draft
          isDirty: hasDirtyChanges,
        });
      },

      updateDraft: (profile) => {
        const { originalProfile, _draftVersion } = get();
        set({
          draftProfile: profile,
          isDirty: JSON.stringify(profile) !== JSON.stringify(originalProfile),
          _draftVersion: _draftVersion + 1,
        });
      },

      markAsSaved: () => {
        const { draftProfile } = get();
        set({ originalProfile: draftProfile, isDirty: false });
      },

      discardChanges: () => {
        const { originalProfile } = get();
        set({ draftProfile: originalProfile, isDirty: false });
      },

      clearDraft: () => {
        set({ originalProfile: null, draftProfile: null, isDirty: false });
      },

      openStylePopover: (anchor) => set({ stylePopover: anchor }),
      closeStylePopover: () => set({ stylePopover: null }),

      setElementStyle: (target, style) => {
        const { draftProfile, originalProfile, _draftVersion } = get();
        if (!draftProfile) return;
        const next = applyStyleToProfile(draftProfile, target, style) as typeof draftProfile;
        set({
          draftProfile: next,
          isDirty: JSON.stringify(next) !== JSON.stringify(originalProfile),
          _draftVersion: _draftVersion + 1,
        });
      },
    }),
    {
      name: "dzenn-editor-draft",
      // Only persist the draft — originalProfile always comes fresh from the server
      partialize: (state) => ({
        draftProfile: state.draftProfile,
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    },
  ),
);
