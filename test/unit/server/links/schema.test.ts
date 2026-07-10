import { describe, it, expect } from "vitest";
import { LinkSchema, SocialLinkSchema } from "@/server/user/links/schema";

describe("LinkSchema", () => {
  it("validates a correct link", () => {
    const result = LinkSchema.safeParse({
      title: "My Portfolio",
      url: "https://example.com",
    });
    expect(result.success).toBe(true);
  });

  it("rejects empty title", () => {
    const result = LinkSchema.safeParse({ title: "", url: "https://example.com" });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].path).toContain("title");
    }
  });

  it("rejects title over 100 characters", () => {
    const result = LinkSchema.safeParse({ title: "x".repeat(101), url: "https://example.com" });
    expect(result.success).toBe(false);
  });

  it("rejects invalid URL", () => {
    const result = LinkSchema.safeParse({ title: "Test", url: "not-a-url" });
    expect(result.success).toBe(false);
  });

  it("rejects empty URL", () => {
    const result = LinkSchema.safeParse({ title: "Test", url: "" });
    expect(result.success).toBe(false);
  });

  it("accepts valid long URLs", () => {
    const result = LinkSchema.safeParse({ title: "Test", url: "https://example.com/" + "a".repeat(500) });
    expect(result.success).toBe(true);
  });

  it("strips obsolete description/mediaUrl fields (schema evolution)", () => {
    const result = LinkSchema.safeParse({
      title: "Test",
      url: "https://example.com",
      description: "legacy field",
      mediaUrl: "https://example.com/image.jpg",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).not.toHaveProperty("description");
      expect(result.data).not.toHaveProperty("mediaUrl");
    }
  });

  it("accepts buttonColor and titleStyle", () => {
    const result = LinkSchema.safeParse({
      title: "Styled",
      url: "https://example.com",
      buttonColor: "#111111",
      buttonTextColor: "#ffffff",
      titleStyle: { color: "#fff", fontFamily: "inter" },
    });
    expect(result.success).toBe(true);
  });

  it("uses default isActive true", () => {
    const result = LinkSchema.parse({ title: "Test", url: "https://example.com" });
    expect(result.isActive).toBe(true);
  });
});

describe("SocialLinkSchema", () => {
  it("validates a correct social link", () => {
    const result = SocialLinkSchema.safeParse({
      platform: "twitter",
      url: "https://twitter.com/testuser",
    });
    expect(result.success).toBe(true);
  });

  it("rejects empty platform", () => {
    const result = SocialLinkSchema.safeParse({ platform: "", url: "https://example.com" });
    expect(result.success).toBe(false);
  });

  it("rejects invalid social URL", () => {
    const result = SocialLinkSchema.safeParse({ platform: "twitter", url: "not-a-url" });
    expect(result.success).toBe(false);
  });
});
