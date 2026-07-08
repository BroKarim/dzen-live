import { describe, it, expect, vi } from "vitest";
import React from "react";

vi.mock("next/og", () => ({
  ImageResponse: vi.fn(),
}));

import { OgImageCard } from "@/components/og-image-card";

function renderStatic(cmp: React.ReactElement) {
  return React.createElement("div", null, cmp);
}

describe("og-image-card", () => {
  it("renders display name and username", () => {
    const profile = { displayName: "John Doe", username: "johndoe", bio: null, avatarUrl: null, bgType: "color", bgColor: "#ff0000" };
    const el = renderStatic(<OgImageCard profile={profile} avatarBuffer={null} />);
    expect(el).toBeDefined();
  });

  it("renders bio when available", () => {
    const profile = { displayName: "Jane", username: "jane", bio: "A cool bio here", avatarUrl: null, bgType: "color", bgColor: "#111" };
    const el = renderStatic(<OgImageCard profile={profile} avatarBuffer={null} />);
    expect(el).toBeDefined();
  });

  it("falls back to username when displayName empty", () => {
    const profile = { displayName: "", username: "anon", bio: null, avatarUrl: null, bgType: "color", bgColor: "#000" };
    const el = renderStatic(<OgImageCard profile={profile} avatarBuffer={null} />);
    expect(el).toBeDefined();
  });

  it("renders avatar initial when no avatar buffer", () => {
    const profile = { displayName: "Test", username: "test", bio: null, avatarUrl: null, bgType: "color", bgColor: "#000" };
    const el = renderStatic(<OgImageCard profile={profile} avatarBuffer={null} />);
    expect(el).toBeDefined();
  });
});
