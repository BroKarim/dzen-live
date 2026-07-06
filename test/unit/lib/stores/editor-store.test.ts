import { describe, it, expect, beforeEach, vi } from "vitest";

vi.mock("zustand/middleware", () => ({
  persist: (config: any) => config,
}));

import { useEditorStore } from "@/lib/stores/editor-store";
import type { ProfileEditorData } from "@/server/user/profile/payloads";

const serverProfile: ProfileEditorData = {
  id: "profile-1",
  username: "testuser",
  userId: "user-1",
  displayName: "Test User",
  bio: "Hello world",
  avatarUrl: null,
  layout: "center",
  displayNameStyle: null,
  bioStyle: null,
  bgType: "color",
  bgColor: "#000000",
  bgWallpaper: null,
  bgImage: null,
  blurAmount: 0,
  padding: 16,
  cardTexture: "base",
  bgEffects: null,
  bgPattern: null,
  isPublished: false,
  links: [
    {
      id: "link-1",
      title: "GitHub",
      url: "https://github.com",
      description: null,
      mediaUrl: null,
      position: 0,
      isActive: true,
      buttonColor: null,
      buttonTextColor: null,
      titleStyle: null,
    },
  ],
  socials: [
    { id: "social-1", platform: "twitter", url: "https://twitter.com/user" },
  ],
};

function resetStore() {
  useEditorStore.setState({
    originalProfile: null,
    draftProfile: null,
    isDirty: false,
    _draftVersion: 0,
    stylePopover: null,
    _hasHydrated: true,
  });
}

beforeEach(() => {
  resetStore();
});

describe("editor-store", () => {
  describe("initializeEditor", () => {
    it("initial state: auto-hydrated, null draft", () => {
      const store = useEditorStore.getState();
      expect(store._hasHydrated).toBe(true);
      expect(store.draftProfile).toBeNull();
      expect(store.originalProfile).toBeNull();
    });

    it("sets draft from server profile when no draft exists", () => {
      useEditorStore.getState().initializeEditor(serverProfile);

      const state = useEditorStore.getState();
      expect(state.draftProfile).toEqual(serverProfile);
      expect(state.originalProfile).toEqual(serverProfile);
      expect(state.isDirty).toBe(false);
      expect(state._draftVersion).toBe(0);
    });

    it("skips init when explicitly not hydrated", () => {
      useEditorStore.getState().setHasHydrated(false);
      useEditorStore.getState().initializeEditor(serverProfile);
      expect(useEditorStore.getState().draftProfile).toBeNull();
    });

    it("keeps draft when same profile (case 4)", () => {
      const store = useEditorStore.getState();
      store.initializeEditor(serverProfile);

      const modified = { ...serverProfile, displayName: "Modified" };
      store.updateDraft(modified);

      const versionBefore = useEditorStore.getState()._draftVersion;

      store.initializeEditor({ ...serverProfile, bio: "Server changed bio" } as ProfileEditorData);

      const state = useEditorStore.getState();
      expect(state.draftProfile?.displayName).toBe("Modified");
      expect(state.originalProfile?.bio).toBe("Server changed bio");
      expect(state.isDirty).toBe(true);
      expect(state._draftVersion).toBe(versionBefore);
    });

    it("re-initializes for different profile — account switch (case 2)", () => {
      const store = useEditorStore.getState();
      store.initializeEditor(serverProfile);

      const differentProfile = { ...serverProfile, id: "profile-2", displayName: "Other User" };
      store.initializeEditor(differentProfile);

      const state = useEditorStore.getState();
      expect(state.draftProfile?.id).toBe("profile-2");
      expect(state.isDirty).toBe(false);
      expect(state._draftVersion).toBe(0);
    });

    it("re-initializes when draft has stale non-temp link IDs (case 3)", () => {
      const store = useEditorStore.getState();

      store.initializeEditor(serverProfile);

      const draftWithStale = {
        ...serverProfile,
        links: [
          ...serverProfile.links,
          { id: "stale-link-id", title: "Stale", url: "https://stale.com", description: null, mediaUrl: null, position: 1, isActive: true, buttonColor: null, buttonTextColor: null, titleStyle: null },
        ],
      };
      useEditorStore.setState({ draftProfile: draftWithStale as ProfileEditorData });

      store.initializeEditor(serverProfile);

      const state = useEditorStore.getState();
      expect(state.draftProfile?.links.length).toBe(1);
      expect(state.isDirty).toBe(false);
      expect(state._draftVersion).toBe(0);
    });

    it("does not reset draft when temp-ID links present (case 4)", () => {
      const store = useEditorStore.getState();

      store.initializeEditor(serverProfile);

      const draftWithTemp = {
        ...serverProfile,
        displayName: "Modified",
        links: [
          ...serverProfile.links,
          { id: "temp-new-link", title: "New", url: "https://new.com", description: null, mediaUrl: null, position: 1, isActive: true, buttonColor: null, buttonTextColor: null, titleStyle: null },
        ],
      };
      useEditorStore.setState({ draftProfile: draftWithTemp as ProfileEditorData });

      const versionBefore = useEditorStore.getState()._draftVersion;

      store.initializeEditor(serverProfile);

      const state = useEditorStore.getState();
      expect(state.draftProfile?.displayName).toBe("Modified");
      expect(state.draftProfile?.links.length).toBe(2);
      expect(state._draftVersion).toBe(versionBefore);
    });
  });

  describe("updateDraft", () => {
    it("sets draft and marks dirty when different from original", () => {
      const store = useEditorStore.getState();

      store.initializeEditor(serverProfile);

      const modified = { ...serverProfile, displayName: "New Name" };
      store.updateDraft(modified);

      const state = useEditorStore.getState();
      expect(state.draftProfile?.displayName).toBe("New Name");
      expect(state.isDirty).toBe(true);
      expect(state._draftVersion).toBe(1);
    });

    it("increments _draftVersion on every call", () => {
      const store = useEditorStore.getState();

      store.initializeEditor(serverProfile);

      store.updateDraft({ ...serverProfile, displayName: "A" });
      expect(useEditorStore.getState()._draftVersion).toBe(1);

      store.updateDraft({ ...serverProfile, displayName: "B" });
      expect(useEditorStore.getState()._draftVersion).toBe(2);

      store.updateDraft({ ...serverProfile, displayName: "C" });
      expect(useEditorStore.getState()._draftVersion).toBe(3);
    });

    it("clears isDirty when draft matches original", () => {
      const store = useEditorStore.getState();

      store.initializeEditor(serverProfile);

      store.updateDraft({ ...serverProfile, displayName: "Changed" });
      expect(useEditorStore.getState().isDirty).toBe(true);

      store.updateDraft(serverProfile);
      expect(useEditorStore.getState().isDirty).toBe(false);
    });
  });

  describe("markAsSaved", () => {
    it("syncs originalProfile to draftProfile and clears isDirty", () => {
      const store = useEditorStore.getState();

      store.initializeEditor(serverProfile);

      store.updateDraft({ ...serverProfile, displayName: "Saved Name" });

      useEditorStore.getState().markAsSaved();

      const state = useEditorStore.getState();
      expect(state.originalProfile?.displayName).toBe("Saved Name");
      expect(state.isDirty).toBe(false);
    });

    it("does NOT reset _draftVersion (monotonic)", () => {
      const store = useEditorStore.getState();

      store.initializeEditor(serverProfile);

      store.updateDraft({ ...serverProfile, displayName: "A" });
      const v = useEditorStore.getState()._draftVersion;

      useEditorStore.getState().markAsSaved();
      expect(useEditorStore.getState()._draftVersion).toBe(v);
    });
  });

  describe("discardChanges", () => {
    it("resets draft to originalProfile and clears isDirty", () => {
      const store = useEditorStore.getState();

      store.initializeEditor(serverProfile);

      store.updateDraft({ ...serverProfile, displayName: "Discarded" });
      expect(useEditorStore.getState().isDirty).toBe(true);

      useEditorStore.getState().discardChanges();

      const state = useEditorStore.getState();
      expect(state.draftProfile?.displayName).toBe("Test User");
      expect(state.isDirty).toBe(false);
    });
  });

  describe("stylePopover", () => {
    it("opens style popover with target", () => {
      useEditorStore.getState().openStylePopover({ target: { type: "link", id: "link-1" } as any, x: 100, y: 200 });
      const s = useEditorStore.getState();
      expect(s.stylePopover).not.toBeNull();
      expect(s.stylePopover?.x).toBe(100);
      expect(s.stylePopover?.y).toBe(200);
    });

    it("closes style popover", () => {
      useEditorStore.getState().openStylePopover({ target: { type: "link", id: "link-1" } as any, x: 0, y: 0 });
      useEditorStore.getState().closeStylePopover();
      expect(useEditorStore.getState().stylePopover).toBeNull();
    });
  });

  describe("setElementStyle", () => {
    it("increments _draftVersion", () => {
      const store = useEditorStore.getState();

      store.initializeEditor(serverProfile);

      store.setElementStyle({ type: "profile", field: "displayName" } as any, { color: "#ff0000" });
      expect(useEditorStore.getState()._draftVersion).toBe(1);
    });

    it("marks isDirty when style applied", () => {
      const store = useEditorStore.getState();

      store.initializeEditor(serverProfile);

      store.setElementStyle({ type: "profile", field: "displayName" } as any, { color: "#ff0000" });
      expect(useEditorStore.getState().isDirty).toBe(true);
    });

    it("noop when draftProfile is null", () => {
      useEditorStore.getState().setElementStyle({ type: "profile", field: "displayName" } as any, { color: "#ff0000" });
      expect(useEditorStore.getState().isDirty).toBe(false);
    });
  });

  describe("clearDraft", () => {
    it("clears all state", () => {
      const store = useEditorStore.getState();

      store.initializeEditor(serverProfile);
      store.updateDraft({ ...serverProfile, displayName: "A" });

      useEditorStore.getState().clearDraft();

      const state = useEditorStore.getState();
      expect(state.originalProfile).toBeNull();
      expect(state.draftProfile).toBeNull();
      expect(state.isDirty).toBe(false);
    });
  });
});
