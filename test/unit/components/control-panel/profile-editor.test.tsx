import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@/test/utils";
import { ProfileEditor } from "@/components/control-panel/profile-editor";

const baseProfile = {
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
  createdAt: new Date(),
  updatedAt: new Date(),
};

describe("ProfileEditor", () => {
  it("renders display name input", () => {
    const onUpdate = vi.fn();
    render(<ProfileEditor profile={baseProfile} onUpdate={onUpdate} />);
    expect(screen.getByDisplayValue("Test User")).toBeInTheDocument();
  });

  it("renders bio textarea", () => {
    const onUpdate = vi.fn();
    render(<ProfileEditor profile={baseProfile} onUpdate={onUpdate} />);
    expect(screen.getByDisplayValue("Hello world")).toBeInTheDocument();
  });

  it("shows bio character count", () => {
    const onUpdate = vi.fn();
    render(<ProfileEditor profile={{ ...baseProfile, bio: "Hello" }} onUpdate={onUpdate} />);
    expect(screen.getByText("5/160")).toBeInTheDocument();
  });
});
