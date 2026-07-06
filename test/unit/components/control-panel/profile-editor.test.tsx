import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@/test/utils";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { ProfileEditor } from "@/components/control-panel/profile-editor";
import type { ProfileEditorData } from "@/server/user/profile/payloads";

const baseProfile: ProfileEditorData = {
  id: "test-1",
  username: "testuser",
  userId: "user-1",
  displayName: "Test User",
  bio: "Hello world",
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

function StatefulWrapper({ onUpdate }: { onUpdate: ReturnType<typeof vi.fn> }) {
  const [profile, setProfile] = useState(baseProfile);
  return (
    <ProfileEditor
      profile={profile}
      onUpdate={(p) => {
        setProfile(p);
        onUpdate(p);
      }}
    />
  );
}

describe("ProfileEditor", () => {
  it("renders display name input", () => {
    render(<ProfileEditor profile={baseProfile} onUpdate={vi.fn()} />);
    expect(screen.getByDisplayValue("Test User")).toBeInTheDocument();
  });

  it("renders bio textarea", () => {
    render(<ProfileEditor profile={baseProfile} onUpdate={vi.fn()} />);
    expect(screen.getByDisplayValue("Hello world")).toBeInTheDocument();
  });

  it("shows bio character count", () => {
    render(<ProfileEditor profile={{ ...baseProfile, bio: "Hello" }} onUpdate={vi.fn()} />);
    expect(screen.getByText("5/160")).toBeInTheDocument();
  });

  it("calls onUpdate when display name changes", async () => {
    const onUpdate = vi.fn();
    render(<StatefulWrapper onUpdate={onUpdate} />);

    const input = screen.getByDisplayValue("Test User");
    await userEvent.clear(input);
    await userEvent.type(input, "New Name");

    expect(onUpdate).toHaveBeenCalled();
    const lastCall = onUpdate.mock.calls[onUpdate.mock.calls.length - 1][0];
    expect(lastCall.displayName).toBe("New Name");
  });

  it("calls onUpdate when bio changes", async () => {
    const onUpdate = vi.fn();
    render(<StatefulWrapper onUpdate={onUpdate} />);

    const textarea = screen.getByDisplayValue("Hello world");
    await userEvent.clear(textarea);
    await userEvent.type(textarea, "New bio text");

    expect(onUpdate).toHaveBeenCalled();
    const lastCall = onUpdate.mock.calls[onUpdate.mock.calls.length - 1][0];
    expect(lastCall.bio).toBe("New bio text");
  });

  it("calls onUpdate with empty string when display name is cleared", async () => {
    const onUpdate = vi.fn();
    render(<StatefulWrapper onUpdate={onUpdate} />);

    const input = screen.getByDisplayValue("Test User");
    await userEvent.clear(input);

    expect(onUpdate).toHaveBeenCalled();
    const lastCall = onUpdate.mock.calls[onUpdate.mock.calls.length - 1][0];
    expect(lastCall.displayName).toBe("");
  });

  it("calls onUpdate with empty string when bio is cleared", async () => {
    const onUpdate = vi.fn();
    render(<StatefulWrapper onUpdate={onUpdate} />);

    const textarea = screen.getByDisplayValue("Hello world");
    await userEvent.clear(textarea);

    expect(onUpdate).toHaveBeenCalled();
    const lastCall = onUpdate.mock.calls[onUpdate.mock.calls.length - 1][0];
    expect(lastCall.bio).toBe("");
  });
});
