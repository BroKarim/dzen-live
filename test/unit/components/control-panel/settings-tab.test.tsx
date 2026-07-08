import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, act } from "@/test/utils";
import React from "react";

vi.mock("sonner", () => ({
  toast: {
    loading: vi.fn().mockReturnValue("toast-id"),
    success: vi.fn(),
    error: vi.fn(),
    dismiss: vi.fn(),
  },
}));

const { mockCheckUsernameAvailability, useEditorStore: mockUseEditorStore } = vi.hoisted(() => ({
  mockCheckUsernameAvailability: vi.fn(),
  useEditorStore: vi.fn(),
}));

vi.mock("@/lib/stores/editor-store", () => ({
  useEditorStore: mockUseEditorStore,
}));

vi.mock("@/server/user/settings/actions", () => ({
  updateProfileUsername: vi.fn(),
  togglePublishStatus: vi.fn(),
  deleteProfileOrAccount: vi.fn(),
  checkUsernameAvailability: mockCheckUsernameAvailability,
}));

vi.mock("@/lib/auth-client", () => ({
  authClient: { signOut: vi.fn() },
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn(), refresh: vi.fn() }),
}));

import { SettingsTab } from "@/components/control-panel/tabs/settings-tab";
import type { ProfileEditorData } from "@/server/user/profile/payloads";
import { fireEvent } from "@testing-library/react";

const baseProfile: ProfileEditorData = {
  id: "test-1",
  username: "testuser",
  userId: "user-1",
  displayName: "Test User",
  bio: null,
  avatarUrl: null,
  layout: "center" as const,
  displayNameStyle: null,
  bioStyle: null,
  bgType: "color" as const,
  bgColor: "#000000",
  bgWallpaper: null,
  bgImage: null,
  blurAmount: 0,
  padding: 16,
  cardTexture: "base" as const,
  bgEffects: null,
  bgPattern: null,
  isPublished: false,
  links: [],
  socials: [],
};

function makeStore(overrides: Record<string, unknown> = {}) {
  return {
    isDirty: false,
    draftProfile: null,
    updateDraft: vi.fn(),
    ...overrides,
  };
}

describe("settings-tab", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    mockCheckUsernameAvailability.mockResolvedValue(true);
    mockUseEditorStore.mockReturnValue(makeStore());
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("renders username input with profile value", () => {
    render(<SettingsTab profile={baseProfile} />);
    const input = screen.getByLabelText("Username") as HTMLInputElement;
    expect(input.value).toBe("testuser");
  });

  it("calls updateDraft on username change", () => {
    const updateDraft = vi.fn();
    mockUseEditorStore.mockReturnValue(makeStore({ draftProfile: baseProfile, updateDraft }));

    render(<SettingsTab profile={baseProfile} />);
    const input = screen.getByLabelText("Username");

    act(() => {
      fireEvent.change(input, { target: { value: "newuser" } });
    });

    expect(updateDraft).toHaveBeenCalledWith(
      expect.objectContaining({ username: "newuser" }),
    );
  });

  it("shows checking indicator after debounce", () => {
    mockUseEditorStore.mockReturnValue(makeStore({ draftProfile: baseProfile }));

    render(<SettingsTab profile={baseProfile} />);
    const input = screen.getByLabelText("Username");

    act(() => {
      fireEvent.change(input, { target: { value: "different" } });
    });

    act(() => {
      vi.advanceTimersByTime(300);
    });

    expect(screen.getByText("Checking availability...")).toBeInTheDocument();
  });

  it("shows error when username is taken", async () => {
    mockCheckUsernameAvailability.mockResolvedValue(false);
    mockUseEditorStore.mockReturnValue(makeStore({ draftProfile: baseProfile }));

    render(<SettingsTab profile={baseProfile} />);
    const input = screen.getByLabelText("Username");

    act(() => {
      fireEvent.change(input, { target: { value: "takenname" } });
    });

    act(() => {
      vi.advanceTimersByTime(300);
    });

    await act(async () => {
      await vi.runAllTimersAsync();
    });

    expect(screen.getByText("Username is already taken")).toBeInTheDocument();
  });

  it("disables save button when username has error", async () => {
    mockCheckUsernameAvailability.mockResolvedValue(false);
    mockUseEditorStore.mockReturnValue(makeStore({ draftProfile: baseProfile }));

    render(<SettingsTab profile={baseProfile} />);
    const input = screen.getByLabelText("Username");

    act(() => {
      fireEvent.change(input, { target: { value: "taken" } });
    });

    act(() => {
      vi.advanceTimersByTime(300);
    });

    await act(async () => {
      await vi.runAllTimersAsync();
    });

    const saveBtn = screen.getByRole("button", { name: "Save Settings" });
    expect(saveBtn).toBeDisabled();
  });
});
