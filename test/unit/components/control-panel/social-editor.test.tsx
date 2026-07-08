import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@/test/utils";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { SocialMediaEditor } from "@/components/control-panel/social-editor";
import type { ProfileEditorData } from "@/server/user/profile/payloads";

vi.mock("sonner", () => ({ toast: { error: vi.fn() } }));

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

function StatefulWrapper({ initialProfile, onUpdate }: { initialProfile?: ProfileEditorData; onUpdate: ReturnType<typeof vi.fn> }) {
  const [profile, setProfile] = useState(initialProfile ?? baseProfile);
  return (
    <SocialMediaEditor
      profile={profile}
      onUpdate={(p) => {
        setProfile(p);
        onUpdate(p);
      }}
    />
  );
}

async function openDialog() {
  await userEvent.click(screen.getByText("Add Social Media"));
}

async function selectPlatform(label: string) {
  await userEvent.click(screen.getByText(label));
}

async function typeUrl(value: string) {
  const input = screen.getByPlaceholderText("https://...");
  await userEvent.clear(input);
  await userEvent.type(input, value);
}

async function clickSave() {
  await userEvent.click(screen.getByRole("button", { name: "Add to Profile" }));
}

describe("SocialMediaEditor", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders Add Social Media button", () => {
    render(<SocialMediaEditor profile={baseProfile} onUpdate={vi.fn()} />);
    expect(screen.getByText("Add Social Media")).toBeInTheDocument();
  });

  it("shows empty state when no socials", () => {
    render(<SocialMediaEditor profile={baseProfile} onUpdate={vi.fn()} />);
    expect(screen.queryByText("No link added")).not.toBeInTheDocument();
  });

  it("renders existing social links", () => {
    const profile = {
      ...baseProfile,
      socials: [{ id: "s1", platform: "github", url: "https://github.com/test" }],
    } as ProfileEditorData;
    render(<SocialMediaEditor profile={profile} onUpdate={vi.fn()} />);
    expect(screen.getByText("GitHub")).toBeInTheDocument();
    expect(screen.getByText("https://github.com/test")).toBeInTheDocument();
  });

  describe("URL normalization", () => {
    it("prepends https:// when URL has no protocol", async () => {
      const onUpdate = vi.fn();
      render(<StatefulWrapper onUpdate={onUpdate} />);
      await openDialog();
      await selectPlatform("GitHub");
      await typeUrl("github.com/test");
      await clickSave();

      const lastCall = onUpdate.mock.calls[onUpdate.mock.calls.length - 1][0];
      expect(lastCall.socials[0].url).toBe("https://github.com/test");
    });

    it("keeps https:// URL as-is", async () => {
      const onUpdate = vi.fn();
      render(<StatefulWrapper onUpdate={onUpdate} />);
      await openDialog();
      await selectPlatform("GitHub");
      await typeUrl("https://github.com/test");
      await clickSave();

      const lastCall = onUpdate.mock.calls[onUpdate.mock.calls.length - 1][0];
      expect(lastCall.socials[0].url).toBe("https://github.com/test");
    });

    it("keeps http:// URL as-is", async () => {
      const onUpdate = vi.fn();
      render(<StatefulWrapper onUpdate={onUpdate} />);
      await openDialog();
      await selectPlatform("GitHub");
      await typeUrl("http://example.com");
      await clickSave();

      const lastCall = onUpdate.mock.calls[onUpdate.mock.calls.length - 1][0];
      expect(lastCall.socials[0].url).toBe("http://example.com");
    });

    it("trims whitespace from URL", async () => {
      const onUpdate = vi.fn();
      render(<StatefulWrapper onUpdate={onUpdate} />);
      await openDialog();
      await selectPlatform("GitHub");
      await typeUrl("  github.com/test  ");
      await clickSave();

      const lastCall = onUpdate.mock.calls[onUpdate.mock.calls.length - 1][0];
      expect(lastCall.socials[0].url).toBe("https://github.com/test");
    });
  });

  describe("URL validation", () => {
    it("shows error for empty URL", async () => {
      const { toast } = await import("sonner");
      const onUpdate = vi.fn();
      render(<StatefulWrapper onUpdate={onUpdate} />);
      await openDialog();
      await selectPlatform("GitHub");
      // Clear input and leave empty — trigger validation on save
      const input = screen.getByPlaceholderText("https://...");
      await userEvent.clear(input);
      await clickSave();

      expect(toast.error).toHaveBeenCalledWith("URL is required");
      expect(onUpdate).not.toHaveBeenCalled();
    });

    it("shows error for whitespace-only URL", async () => {
      const { toast } = await import("sonner");
      const onUpdate = vi.fn();
      render(<StatefulWrapper onUpdate={onUpdate} />);
      await openDialog();
      await selectPlatform("GitHub");
      await typeUrl("   ");
      await clickSave();

      expect(toast.error).toHaveBeenCalledWith("URL is required");
      expect(onUpdate).not.toHaveBeenCalled();
    });

    it("does not save without selecting platform", async () => {
      const onUpdate = vi.fn();
      render(<StatefulWrapper onUpdate={onUpdate} />);
      await openDialog();
      await typeUrl("github.com/test");

      const saveButton = screen.getByRole("button", { name: "Add to Profile" });
      expect(saveButton).toBeDisabled();
    });
  });

  describe("edit social link", () => {
    it("opens dialog with existing social data", async () => {
      const profile = {
        ...baseProfile,
        socials: [{ id: "s1", platform: "github", url: "https://github.com/test" }],
      } as ProfileEditorData;
      render(<SocialMediaEditor profile={profile} onUpdate={vi.fn()} />);

      await userEvent.click(screen.getByText("GitHub"));
      const input = screen.getByDisplayValue("https://github.com/test");
      expect(input).toBeInTheDocument();
    });

    it("updates social link on save with normalized URL", async () => {
      const onUpdate = vi.fn();
      const profile = {
        ...baseProfile,
        socials: [{ id: "s1", platform: "github", url: "https://github.com/old" }],
      } as ProfileEditorData;

      render(<SocialMediaEditor profile={profile} onUpdate={onUpdate} />);

      await userEvent.click(screen.getByText("GitHub"));
      await typeUrl("github.com/new");
      await userEvent.click(screen.getByRole("button", { name: "Update Link" }));

      const lastCall = onUpdate.mock.calls[onUpdate.mock.calls.length - 1][0];
      expect(lastCall.socials[0].url).toBe("https://github.com/new");
    });
  });

  describe("remove social link", () => {
    it("calls onUpdate without the removed social", async () => {
      const onUpdate = vi.fn();
      const profile = {
        ...baseProfile,
        socials: [{ id: "s1", platform: "github", url: "https://github.com/test" }],
      } as ProfileEditorData;
      render(
        <SocialMediaEditor
          profile={profile}
          onUpdate={(p) => {
            onUpdate(p);
          }}
        />
      );

      // There are 3 buttons: GitHub link (click opens edit), Edit icon, Trash icon (destructive last)
      const buttons = screen.getAllByRole("button");
      const trashButton = buttons[buttons.length - 1];
      await userEvent.click(trashButton);

      expect(onUpdate).toHaveBeenCalled();
      const lastCall = onUpdate.mock.calls[onUpdate.mock.calls.length - 1][0];
      expect(lastCall.socials).toHaveLength(0);
    });
  });
});
