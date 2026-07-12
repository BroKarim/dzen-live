import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { ProfileEditorData } from "@/server/user/profile/payloads";
import { applyStyleToProfile, type StyleTarget } from "@/lib/text-style";
import { EDITOR_DRAFT_VERSION, normalizeEditorDraft } from "@/lib/editor-draft";

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

        // Always normalize server + draft so dirty compare uses same shape
        const normalizedServer = normalizeEditorDraft(serverProfile) ?? serverProfile;
        const { draftProfile: rawDraft } = state;
        const draftProfile = rawDraft ? normalizeEditorDraft(rawDraft) : null;

        // Case 1: No existing draft (or unusable after normalize) — init fresh
        if (!draftProfile) {
          set({ originalProfile: normalizedServer, draftProfile: normalizedServer, isDirty: false, _draftVersion: 0 });
          return;
        }

        // Case 2: Draft belongs to a different profile (e.g. user switched account)
        if (draftProfile.id !== normalizedServer.id) {
          set({ originalProfile: normalizedServer, draftProfile: normalizedServer, isDirty: false, _draftVersion: 0 });
          return;
        }

        // Case 3: Draft contains stale link IDs that no longer exist in the DB.
        const serverLinkIds = new Set((normalizedServer.links ?? []).map((l) => l.id));
        const hasStaleLinks = (draftProfile.links ?? []).some((l) => !String(l.id).startsWith("temp-") && !serverLinkIds.has(l.id));

        if (hasStaleLinks) {
          set({ originalProfile: normalizedServer, draftProfile: normalizedServer, isDirty: false, _draftVersion: 0 });
          return;
        }

        // Draft is valid — keep in-progress edits; update original to latest server snapshot
        const hasDirtyChanges = JSON.stringify(draftProfile) !== JSON.stringify(normalizedServer);
        set({
          originalProfile: normalizedServer,
          draftProfile,
          isDirty: hasDirtyChanges,
        });
      },

      updateDraft: (profile) => {
        const { originalProfile, _draftVersion } = get();
        const normalized = normalizeEditorDraft(profile) ?? profile;
        set({
          draftProfile: normalized,
          isDirty: JSON.stringify(normalized) !== JSON.stringify(originalProfile),
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
      version: EDITOR_DRAFT_VERSION,
      // Only persist the draft — originalProfile always comes fresh from the server
      partialize: (state) => ({
        draftProfile: state.draftProfile,
      }),
      migrate: (persisted: unknown, fromVersion: number) => {
        const state = (persisted ?? {}) as { draftProfile?: unknown };
        // Too old / unversioned → discard draft; onRehydrateStorage handles normalization
        if (fromVersion < EDITOR_DRAFT_VERSION) {
          return { draftProfile: null };
        }
        const normalized = state.draftProfile ? normalizeEditorDraft(state.draftProfile) : null;
        return { draftProfile: normalized };
      },
      onRehydrateStorage: () => (state) => {
        try {
          if (state?.draftProfile) {
            const normalized = normalizeEditorDraft(state.draftProfile);
            useEditorStore.setState({ draftProfile: normalized });
          }
        } finally {
          state?.setHasHydrated(true);
        }
      },
    },
  ),
);
