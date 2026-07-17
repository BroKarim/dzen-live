"use server";

import { db } from "@/lib/db";
import { withAuth } from "@/server/user/auth";
import { revalidateTag } from "next/cache";
import { deleteFromS3 } from "@/lib/s3";
import { Prisma } from "@/lib/generated/prisma/client";
import { SaveProfileSchema } from "./schema";

function toJsonInput(v: unknown): Prisma.InputJsonValue | typeof Prisma.JsonNull | undefined {
  if (v === null) return Prisma.JsonNull;
  if (v === undefined) return undefined;
  return v as Prisma.InputJsonValue;
}

const LINK_SELECT = {
  id: true,
  title: true,
  url: true,
  position: true,
  isActive: true,
  buttonColor: true,
  buttonTextColor: true,
  titleStyle: true,
} as const;

/** Allowlisted link fields only — never spread raw draft into Prisma. */
function toLinkWrite(
  draftLink: {
    title: string;
    url: string;
    isActive?: boolean;
    buttonColor?: string | null;
    buttonTextColor?: string | null;
    titleStyle?: unknown;
  },
  position: number,
) {
  return {
    title: draftLink.title,
    url: draftLink.url,
    position,
    isActive: draftLink.isActive ?? true,
    buttonColor: draftLink.buttonColor ?? null,
    buttonTextColor: draftLink.buttonTextColor ?? null,
    titleStyle: toJsonInput(draftLink.titleStyle ?? null),
  };
}

function toSocialWrite(
  draftSocial: { platform: string; url: string },
  position: number,
) {
  return {
    platform: draftSocial.platform,
    url: draftSocial.url,
    position,
  };
}

export const saveProfile = withAuth("profile/save", async (user, data: unknown) => {
  try {
    const parsed = SaveProfileSchema.safeParse(data);
    if (!parsed.success) {
      return { success: false as const, error: parsed.error.message };
    }

    const draft = parsed.data;

    const profile = await db.profile.findFirst({
      where: { userId: user.id },
      include: {
        links: { select: LINK_SELECT },
        socials: { select: { id: true, platform: true, url: true, position: true } },
      },
    });

    if (!profile) {
      return { success: false as const, error: "Profile not found" };
    }

    // ── Username uniqueness check ─────────────────────────────────────────────
    if (draft.username !== undefined && draft.username !== profile.username) {
      const existingWithUsername = await db.profile.findUnique({ where: { username: draft.username } });
      if (existingWithUsername) {
        return { success: false as const, error: "Username is already taken" };
      }
    }

    const operations: Prisma.PrismaPromise<unknown>[] = [];
    const s3KeysToClean: string[] = [];

    // ── Profile scalars ───────────────────────────────────────────────────────

    const updateData: Record<string, unknown> = {};
    const scalarFields = ["username", "displayName", "bio", "avatarUrl", "layout", "bgType", "bgColor", "bgWallpaper", "bgImage", "cardTexture"] as const;

    for (const field of scalarFields) {
      const draftVal = draft[field];
      if (draftVal !== undefined && draftVal !== profile[field]) {
        updateData[field] = draftVal;
      }
    }

    const jsonFields = ["displayNameStyle", "bioStyle", "bgEffects", "bgPattern"] as const;
    for (const field of jsonFields) {
      const draftVal = draft[field];
      if (draftVal !== undefined) {
        if (JSON.stringify(draftVal) !== JSON.stringify(profile[field])) {
          updateData[field] = toJsonInput(draftVal);
        }
      }
    }

    // Track avatar + bgImage S3 cleanup (old file deletion)
    if (profile.avatarUrl && draft.avatarUrl !== undefined && profile.avatarUrl !== draft.avatarUrl) {
      s3KeysToClean.push(profile.avatarUrl);
    }
    if (profile.bgImage && draft.bgImage !== undefined && profile.bgImage !== draft.bgImage) {
      s3KeysToClean.push(profile.bgImage);
    }

    // ── Asset tracking (new uploads only) ─────────────────────────────────────
    const S3_PUBLIC_URL = process.env.S3_PUBLIC_URL!;

    if (draft.avatarUrl !== undefined && draft.avatarUrl !== profile.avatarUrl) {
      operations.push(
        db.asset.updateMany({
          where: { profileId: profile.id, type: "avatar", isActive: true },
          data: { isActive: false },
        }),
      );
      if (draft.avatarUrl?.startsWith(S3_PUBLIC_URL)) {
        const key = draft.avatarUrl.replace(`${S3_PUBLIC_URL}/`, "");
        operations.push(
          db.asset.create({
            data: { key, url: draft.avatarUrl, type: "avatar", userId: user.id, profileId: profile.id, isActive: true },
          }),
        );
      }
    }

    if (draft.bgImage !== undefined && draft.bgImage !== profile.bgImage) {
      operations.push(
        db.asset.updateMany({
          where: { profileId: profile.id, type: "bgImage", isActive: true },
          data: { isActive: false },
        }),
      );
      if (draft.bgImage?.startsWith(S3_PUBLIC_URL)) {
        const key = draft.bgImage.replace(`${S3_PUBLIC_URL}/`, "");
        operations.push(
          db.asset.create({
            data: { key, url: draft.bgImage, type: "bgImage", userId: user.id, profileId: profile.id, isActive: true },
          }),
        );
      }
    }

    if (Object.keys(updateData).length > 0) {
      operations.push(db.profile.update({ where: { id: profile.id }, data: updateData }));
    }

    // ── Links (allowlisted writes) ────────────────────────────────────────────

    const dbLinkIds = new Set(profile.links.map((l) => l.id));
    const draftLinks = draft.links ?? [];

    for (let i = 0; i < draftLinks.length; i++) {
      const draftLink = draftLinks[i];
      const { id } = draftLink;
      const write = toLinkWrite(draftLink, i);

      if (!id || !dbLinkIds.has(id)) {
        operations.push(
          db.link.create({
            data: {
              ...write,
              profileId: profile.id,
            },
          }),
        );
      } else {
        operations.push(
          db.link.update({
            where: { id },
            data: write,
          }),
        );
      }
    }

    for (const dbLink of profile.links) {
      if (!draftLinks.some((dl) => dl.id === dbLink.id)) {
        operations.push(db.link.deleteMany({ where: { id: dbLink.id } }));
      }
    }

    // ── Socials (allowlisted writes) ──────────────────────────────────────────

    const dbSocialIds = new Set(profile.socials.map((s) => s.id));
    const draftSocials = draft.socials ?? [];

    for (let i = 0; i < draftSocials.length; i++) {
      const draftSocial = draftSocials[i];
      const { id } = draftSocial;
      const write = toSocialWrite(draftSocial, i);

      if (!id || !dbSocialIds.has(id)) {
        operations.push(
          db.socialLink.create({
            data: { ...write, profileId: profile.id },
          }),
        );
      } else {
        operations.push(
          db.socialLink.update({
            where: { id },
            data: write,
          }),
        );
      }
    }

    for (const dbSocial of profile.socials) {
      if (!draftSocials.some((ds) => ds.id === dbSocial.id)) {
        operations.push(db.socialLink.deleteMany({ where: { id: dbSocial.id } }));
      }
    }

    // ── Execute ───────────────────────────────────────────────────────────────

    await db.$transaction(operations);

    // Post-commit S3 cleanup (non-blocking)
    if (s3KeysToClean.length > 0) {
      Promise.allSettled(
        s3KeysToClean.map((key) =>
          deleteFromS3(key).catch((err) => console.error(`[profile/save] S3 cleanup failed:`, err)),
        ),
      );
    }

    revalidateTag(`links-${profile.id}`, "minutes");
    revalidateTag(`profile-meta-${profile.username}`, "minutes");
    revalidateTag(`editor-profile-${user.id}`, "minutes");
    revalidateTag(`editor-profile-username-${draft.username ?? profile.username}`, "minutes");

    // ── Return refreshed links + socials (real IDs, correct positions) ────────

    const finalLinks = await db.link.findMany({
      where: { profileId: profile.id },
      select: LINK_SELECT,
      orderBy: { position: "asc" },
    });

    const finalSocials = await db.socialLink.findMany({
      where: { profileId: profile.id },
      select: { id: true, platform: true, url: true },
      orderBy: { position: "asc" },
    });

    return { success: true as const, links: finalLinks, socials: finalSocials };
  } catch (error) {
    console.error("[profile/save] unexpected error:", error);
    // P2022 = column does not exist (schema mismatch between code and DB)
    if (error instanceof Error && "code" in error && error.code === "P2022") {
      return { success: false as const, error: "Save failed due to a data format mismatch. Try discarding changes or refreshing the page." };
    }
    throw error;
  }
});
