import { describe, it, expect, vi, beforeEach, afterEach, beforeAll, afterAll, afterEach as globalAfterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";

vi.mock("@/server/user/profile/save-profile-action", () => ({
  saveProfile: vi.fn(),
}));

import { useEditorStore } from "@/lib/stores/editor-store";
import { saveProfile } from "@/server/user/profile/save-profile-action";
import { useAutosave } from "@/hooks/use-autosave";
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
    { id: "link-1", title: "GitHub", url: "https://github.com", position: 0, isActive: true, buttonColor: null, buttonTextColor: null, titleStyle: null },
  ],
  socials: [
    { id: "social-1", platform: "twitter", url: "https://twitter.com/user" },
  ],
};

beforeAll(() => {
  vi.useFakeTimers();
});

afterAll(() => {
  vi.useRealTimers();
});

beforeEach(() => {
  vi.clearAllMocks();
  useEditorStore.getState().clearDraft();
  useEditorStore.getState().initializeEditor(serverProfile);
  (saveProfile as ReturnType<typeof vi.fn>).mockResolvedValue({
    success: true,
    links: serverProfile.links,
    socials: serverProfile.socials,
  });
});

afterEach(() => {
  vi.clearAllTimers();
});

describe("useAutosave", () => {
  it("returns idle status initially", () => {
    const { result } = renderHook(() => useAutosave());
    expect(result.current.status).toBe("idle");
  });

  it("does not save when isDirty is false", async () => {
    renderHook(() => useAutosave());

    await act(() => vi.advanceTimersByTime(2000));

    expect(saveProfile).not.toHaveBeenCalled();
  });

  it("fires save after debounce when isDirty becomes true", async () => {
    renderHook(() => useAutosave());

    act(() => {
      useEditorStore.getState().updateDraft({ ...serverProfile, displayName: "Modified" });
    });

    expect(saveProfile).not.toHaveBeenCalled();

    await act(() => vi.advanceTimersByTime(1500));

    expect(saveProfile).toHaveBeenCalledTimes(1);
  });

  it("does not fire before debounce interval", async () => {
    renderHook(() => useAutosave());

    act(() => {
      useEditorStore.getState().updateDraft({ ...serverProfile, displayName: "Modified" });
    });

    await act(() => vi.advanceTimersByTime(1000));

    expect(saveProfile).not.toHaveBeenCalled();
  });

  it("re-debounces when draft changes again before save fires", async () => {
    renderHook(() => useAutosave());

    act(() => {
      useEditorStore.getState().updateDraft({ ...serverProfile, displayName: "First" });
    });
    await act(() => vi.advanceTimersByTime(500));

    act(() => {
      useEditorStore.getState().updateDraft({ ...serverProfile, displayName: "Second" });
    });
    await act(() => vi.advanceTimersByTime(500));

    expect(saveProfile).not.toHaveBeenCalled();

    await act(() => vi.advanceTimersByTime(1000));

    expect(saveProfile).toHaveBeenCalledTimes(1);
  });

  it("save is called on debounce expiry", async () => {
    renderHook(() => useAutosave());

    act(() => {
      useEditorStore.getState().updateDraft({ ...serverProfile, displayName: "To Save" });
    });

    await act(() => vi.advanceTimersByTime(1500));

    expect(saveProfile).toHaveBeenCalled();
  });

  it("handles network error", async () => {
    (saveProfile as ReturnType<typeof vi.fn>).mockRejectedValueOnce(new Error("Network error"));

    renderHook(() => useAutosave());

    act(() => {
      useEditorStore.getState().updateDraft({ ...serverProfile, displayName: "Will Fail" });
    });

    await act(() => vi.advanceTimersByTime(2000));

    expect(saveProfile).toHaveBeenCalled();
  });

  it("handles validation error", async () => {
    (saveProfile as ReturnType<typeof vi.fn>).mockResolvedValueOnce({ success: false, error: "Invalid field" });

    renderHook(() => useAutosave());

    act(() => {
      useEditorStore.getState().updateDraft({ ...serverProfile, displayName: "Bad" });
    });

    await act(() => vi.advanceTimersByTime(2000));
  });

  it("retry() re-triggers save immediately", async () => {
    (saveProfile as ReturnType<typeof vi.fn>)
      .mockRejectedValueOnce(new Error("Fail"))
      .mockResolvedValueOnce({ success: true, links: serverProfile.links, socials: serverProfile.socials });

    const { result } = renderHook(() => useAutosave());

    act(() => {
      useEditorStore.getState().updateDraft({ ...serverProfile, displayName: "Retry me" });
    });

    await act(() => vi.advanceTimersByTime(2000));

    expect(saveProfile).toHaveBeenCalledTimes(1);

    await act(async () => {
      result.current.retry();
    });

    expect(saveProfile).toHaveBeenCalledTimes(2);
  });

  it("flushSave() fires immediately when dirty", async () => {
    const { result } = renderHook(() => useAutosave());

    act(() => {
      useEditorStore.getState().updateDraft({ ...serverProfile, displayName: "Flush me" });
    });

    await act(async () => {
      result.current.flushSave();
    });

    expect(saveProfile).toHaveBeenCalledTimes(1);
  });

  it("flushSave() noop when not dirty", async () => {
    const { result } = renderHook(() => useAutosave());

    await act(() => {
      result.current.flushSave();
    });

    expect(saveProfile).not.toHaveBeenCalled();
  });

  it("cleanup on unmount clears timer", () => {
    const { unmount } = renderHook(() => useAutosave());

    act(() => {
      useEditorStore.getState().updateDraft({ ...serverProfile, displayName: "Will unmount" });
    });

    unmount();

    act(() => vi.advanceTimersByTime(2000));

    expect(saveProfile).not.toHaveBeenCalled();
  });
});
