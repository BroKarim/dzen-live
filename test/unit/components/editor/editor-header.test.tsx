import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@/test/utils";
import React from "react";

vi.mock("@/components/domain-view", () => ({
  DomainView: ({ value }: { value: string }) => React.createElement("span", { "data-testid": "domain-view" }, value),
}));

vi.mock("next/link", () => ({
  default: ({ children }: { children: React.ReactNode }) => React.createElement("a", null, children),
}));

const { useEditorStore } = vi.hoisted(() => ({
  useEditorStore: vi.fn(),
}));

vi.mock("@/lib/stores/editor-store", () => ({
  useEditorStore,
}));

import EditorHeader from "@/app/editor/_components.tsx/editor-header";
import type { ProfileEditorData } from "@/server/user/profile/payloads";

const baseProfile: ProfileEditorData = {
  id: "test-1",
  username: "serveruser",
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

function makeStore(overrides: Record<string, unknown>) {
  return { isDirty: false, discardChanges: vi.fn(), draftProfile: null, ...overrides };
}

describe("editor-header", () => {
  it("renders username from prop when store draft is null", () => {
    useEditorStore.mockReturnValue(makeStore({ draftProfile: null }));
    render(<EditorHeader profile={baseProfile} saveStatus="idle" onRetry={vi.fn()} />);
    const domainView = screen.getByTestId("domain-view");
    expect(domainView.textContent).toContain("serveruser");
  });

  it("prefers draftProfile username over prop username", () => {
    const draft = { ...baseProfile, username: "draftuser" };
    useEditorStore.mockReturnValue(makeStore({ draftProfile: draft }));
    render(<EditorHeader profile={baseProfile} saveStatus="idle" onRetry={vi.fn()} />);
    const domainView = screen.getByTestId("domain-view");
    expect(domainView.textContent).toContain("draftuser");
  });

  it("falls back to 'user' when both draft and prop username empty", () => {
    useEditorStore.mockReturnValue(makeStore({ draftProfile: null }));
    const noUsername = { ...baseProfile, username: "" };
    render(<EditorHeader profile={noUsername} saveStatus="idle" onRetry={vi.fn()} />);
    const domainView = screen.getByTestId("domain-view");
    expect(domainView.textContent).toContain("user");
  });
});
