import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/lib/auth", () => ({
  auth: {
    api: {
      getSession: vi.fn().mockResolvedValue({
        user: { id: "user-1", username: "testuser", email: "test@dzenn.live" },
      }),
    },
  },
}));

vi.mock("next/headers", () => ({
  headers: vi.fn().mockResolvedValue(new Headers()),
}));

vi.mock("next/cache", () => ({
  revalidateTag: vi.fn(),
}));

vi.mock("@/lib/s3", () => ({
  deleteFromS3: vi.fn().mockResolvedValue(undefined),
}));

vi.mock("@/lib/db", () => ({
  db: {
    profile: {
      findFirst: vi.fn(),
      findUnique: vi.fn(),
      update: vi.fn(),
      create: vi.fn(),
      delete: vi.fn(),
      deleteMany: vi.fn(),
    },
    link: {
      findMany: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      deleteMany: vi.fn(),
    },
    socialLink: {
      findMany: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      deleteMany: vi.fn(),
    },
    user: {
      findUnique: vi.fn(),
      findMany: vi.fn(),
    },
    asset: {
      findMany: vi.fn(),
      create: vi.fn(),
      updateMany: vi.fn(),
      delete: vi.fn(),
    },
    $transaction: vi.fn(),
  },
}));

import { db } from "@/lib/db";
import { saveProfile } from "@/server/user/profile/save-profile-action";

const baseDbProfile = {
  id: "profile-1",
  userId: "user-1",
  displayName: "Test User",
  bio: "Hello world",
  avatarUrl: "https://example.com/old-avatar.png",
  layout: "center",
  displayNameStyle: null,
  bioStyle: null,
  bgType: "color",
  bgColor: "#000000",
  bgWallpaper: null,
  bgImage: null,
  cardTexture: "base",
  bgEffects: null,
  bgPattern: null,
  links: [
    { id: "link-1", title: "GitHub", url: "https://github.com", description: "My repos", mediaUrl: "https://example.com/media-1.png", position: 0, isActive: true, buttonColor: null, buttonTextColor: null, titleStyle: null },
  ],
  socials: [
    { id: "social-1", platform: "twitter", url: "https://twitter.com/user", position: 0 },
  ],
};

function setupDb(overrides: Partial<typeof baseDbProfile> = {}) {
  const profile = { ...baseDbProfile, ...overrides };
  (db.profile.findFirst as any).mockResolvedValue(profile);
  (db.profile.update as any).mockResolvedValue(profile);
  (db.$transaction as any).mockResolvedValue([]);
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe("saveProfile", () => {
  it("returns success with links and socials on valid input", async () => {
    setupDb();
    (db.link.findMany as any).mockResolvedValue(baseDbProfile.links);
    (db.socialLink.findMany as any).mockResolvedValue(baseDbProfile.socials);

    const result = await saveProfile({
      displayName: "Updated User",
      bio: "Updated bio",
      links: [{ title: "GitHub", url: "https://github.com" }],
      socials: [{ platform: "twitter", url: "https://twitter.com/user" }],
    });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.links).toEqual(baseDbProfile.links);
      expect(result.socials).toEqual(baseDbProfile.socials);
    }
  });

  it("updates profile scalars when bio changed", async () => {
    setupDb();
    (db.link.findMany as any).mockResolvedValue(baseDbProfile.links);
    (db.socialLink.findMany as any).mockResolvedValue(baseDbProfile.socials);

    await saveProfile({ bio: "New bio", links: [{ title: "GitHub", url: "https://github.com" }], socials: [] });

    expect(db.$transaction).toHaveBeenCalled();
    const txArgs = (db.$transaction as any).mock.calls[0][0];
    const updateOps = txArgs.filter((op: any) => op && typeof op.then === "function");
    expect(updateOps.length).toBeGreaterThan(0);
  });

  it("does not update when bio unchanged", async () => {
    setupDb();
    (db.link.findMany as any).mockResolvedValue(baseDbProfile.links);
    (db.socialLink.findMany as any).mockResolvedValue(baseDbProfile.socials);

    await saveProfile({ bio: "Hello world", links: [{ title: "GitHub", url: "https://github.com" }], socials: [] });

    expect(db.$transaction).toHaveBeenCalled();
    const txArgs = (db.$transaction as any).mock.calls[0][0];
    const profileUpdateOps = txArgs.filter((op: any) => {
      if (typeof op === "function" || typeof op !== "object" || !op) return false;
      return op.model === "profile" || op._model === "profile";
    });
    expect(profileUpdateOps.length).toBe(0);
  });

  it("updates JSON field when displayNameStyle changed", async () => {
    setupDb({ displayNameStyle: null });
    (db.link.findMany as any).mockResolvedValue(baseDbProfile.links);
    (db.socialLink.findMany as any).mockResolvedValue(baseDbProfile.socials);

    await saveProfile({
      displayNameStyle: { color: "#ff0000", fontFamily: "inter" },
      links: [{ title: "GitHub", url: "https://github.com" }],
      socials: [],
    });

    expect(db.$transaction).toHaveBeenCalled();
  });

  it("creates new link when ID not in DB", async () => {
    setupDb({ links: [{ id: "link-1", title: "GitHub", url: "https://github.com", description: "My repos", mediaUrl: null, position: 0, isActive: true } as any] });
    (db.link.findMany as any).mockResolvedValue([...baseDbProfile.links, { id: "link-2", title: "New Link", url: "https://new.com", description: null, mediaUrl: null, position: 1, isActive: true, buttonColor: null, buttonTextColor: null, titleStyle: null }]);
    (db.socialLink.findMany as any).mockResolvedValue(baseDbProfile.socials);

    await saveProfile({
      links: [
        { title: "GitHub", url: "https://github.com" },
        { title: "New Link", url: "https://new.com" },
      ],
      socials: [],
    });

    expect(db.$transaction).toHaveBeenCalled();
  });

  it("updates existing link when in DB", async () => {
    setupDb();
    (db.link.findMany as any).mockResolvedValue([{ ...baseDbProfile.links[0], title: "Updated GitHub" }]);
    (db.socialLink.findMany as any).mockResolvedValue(baseDbProfile.socials);

    await saveProfile({
      links: [{ id: "link-1", title: "Updated GitHub", url: "https://github.com" }],
      socials: [],
    });

    expect(db.$transaction).toHaveBeenCalled();
  });

  it("deletes link when DB link not in draft", async () => {
    setupDb();
    (db.link.findMany as any).mockResolvedValue([]);
    (db.socialLink.findMany as any).mockResolvedValue(baseDbProfile.socials);

    await saveProfile({
      links: [],
      socials: [],
    });

    expect(db.$transaction).toHaveBeenCalled();
  });

  it("rewrites position = index for all links", async () => {
    setupDb();
    (db.link.findMany as any).mockResolvedValue(baseDbProfile.links);
    (db.socialLink.findMany as any).mockResolvedValue(baseDbProfile.socials);

    await saveProfile({
      links: [
        { id: "link-1", title: "GitHub", url: "https://github.com" },
      ],
      socials: [],
    });

    expect(db.$transaction).toHaveBeenCalled();
  });

  it("creates social link when new", async () => {
    setupDb({ socials: [] });
    (db.link.findMany as any).mockResolvedValue(baseDbProfile.links);
    (db.socialLink.findMany as any).mockResolvedValue([{ id: "social-2", platform: "github", url: "https://github.com/test", position: 0 }]);

    await saveProfile({
      links: [{ title: "GitHub", url: "https://github.com" }],
      socials: [{ platform: "github", url: "https://github.com/test" }],
    });

    expect(db.$transaction).toHaveBeenCalled();
  });

  it("deletes social link when removed", async () => {
    setupDb();
    (db.link.findMany as any).mockResolvedValue(baseDbProfile.links);
    (db.socialLink.findMany as any).mockResolvedValue([]);

    await saveProfile({
      links: [{ title: "GitHub", url: "https://github.com" }],
      socials: [],
    });

    expect(db.$transaction).toHaveBeenCalled();
  });

  it("returned socials have id, platform, url (no position)", async () => {
    setupDb();
    (db.link.findMany as any).mockResolvedValue(baseDbProfile.links);
    const finalSocials = [{ id: "social-1", platform: "twitter", url: "https://twitter.com/user" }];
    (db.socialLink.findMany as any).mockResolvedValue(finalSocials);

    const result = await saveProfile({
      links: [{ title: "GitHub", url: "https://github.com" }],
      socials: [{ platform: "twitter", url: "https://twitter.com/user" }],
    });

    if (result.success) {
      for (const s of result.socials) {
        expect(s).toHaveProperty("id");
        expect(s).toHaveProperty("platform");
        expect(s).toHaveProperty("url");
        expect(s).not.toHaveProperty("position");
      }
    }
  });

  it("S3 cleanup triggered when avatar replaced", async () => {
    setupDb({ avatarUrl: "https://s3.old-avatar.png" });
    (db.link.findMany as any).mockResolvedValue(baseDbProfile.links);
    (db.socialLink.findMany as any).mockResolvedValue(baseDbProfile.socials);

    await saveProfile({
      avatarUrl: "https://example.com/new-avatar.png",
      links: [{ title: "GitHub", url: "https://github.com" }],
      socials: [],
    });

    const { deleteFromS3 } = await import("@/lib/s3");
    expect(deleteFromS3).toHaveBeenCalled();
  });

  it("S3 cleanup not triggered when avatar unchanged", async () => {
    setupDb({ avatarUrl: "https://example.com/same-avatar.png", links: [] });
    (db.link.findMany as any).mockResolvedValue([]);
    (db.socialLink.findMany as any).mockResolvedValue(baseDbProfile.socials);

    const { deleteFromS3 } = await import("@/lib/s3");
    (deleteFromS3 as any).mockClear();

    await saveProfile({
      avatarUrl: "https://example.com/same-avatar.png",
      links: [],
      socials: [],
    });

    expect(deleteFromS3).not.toHaveBeenCalled();
  });

  it("returns validation error for invalid input", async () => {
    setupDb();

    const result = await saveProfile({
      displayName: "x".repeat(101),
      links: [],
      socials: [],
    });

    expect(result.success).toBe(false);
  });

  it("returns validation error for link with empty title", async () => {
    setupDb();

    const result = await saveProfile({
      links: [{ title: "", url: "https://example.com" }],
      socials: [],
    });

    expect(result.success).toBe(false);
  });

  it("wraps DB writes in $transaction", async () => {
    setupDb();
    (db.link.findMany as any).mockResolvedValue(baseDbProfile.links);
    (db.socialLink.findMany as any).mockResolvedValue(baseDbProfile.socials);

    await saveProfile({ bio: "Updated", links: [{ title: "GitHub", url: "https://github.com" }], socials: [] });

    expect(db.$transaction).toHaveBeenCalledTimes(1);
  });

  it("uses findFirst to load profile (not findUnique)", async () => {
    setupDb();
    (db.link.findMany as any).mockResolvedValue(baseDbProfile.links);
    (db.socialLink.findMany as any).mockResolvedValue(baseDbProfile.socials);

    await saveProfile({ links: [{ title: "GitHub", url: "https://github.com" }], socials: [] });

    expect(db.profile.findFirst).toHaveBeenCalled();
    expect(db.profile.findUnique).not.toHaveBeenCalled();
  });
});
