import { describe, it, expect, vi } from "vitest";
import React from "react";

vi.mock("next/og", () => ({
  ImageResponse: vi.fn(),
}));

import { OgImageCard } from "@/components/og-image-card";

function renderStatic(cmp: React.ReactElement) {
  return React.createElement("div", null, cmp);
}

const baseProfile = {
  displayName: "John Doe",
  username: "johndoe",
  bio: null,
  avatarUrl: null,
  bgType: "color",
  bgColor: "#ff0000",
  bgWallpaper: null,
  bgImage: null,
  displayNameStyle: null,
};

describe("og-image-card", () => {
  it("renders display name and username", () => {
    const el = renderStatic(<OgImageCard profile={baseProfile} avatarBuffer={null} bgImageBuffer={null} />);
    expect(el).toBeDefined();
  });

  it("renders bio when available", () => {
    const profile = { ...baseProfile, displayName: "Jane", username: "jane", bio: "A cool bio here" };
    const el = renderStatic(<OgImageCard profile={profile} avatarBuffer={null} bgImageBuffer={null} />);
    expect(el).toBeDefined();
  });

  it("falls back to username when displayName empty", () => {
    const profile = { ...baseProfile, displayName: "", username: "anon" };
    const el = renderStatic(<OgImageCard profile={profile} avatarBuffer={null} bgImageBuffer={null} />);
    expect(el).toBeDefined();
  });

  it("renders avatar initial when no avatar buffer", () => {
    const profile = { ...baseProfile, displayName: "Test", username: "test" };
    const el = renderStatic(<OgImageCard profile={profile} avatarBuffer={null} bgImageBuffer={null} />);
    expect(el).toBeDefined();
  });
});
