"use server";

import { db } from "@/lib/db";
import { withAuth } from "@/server/user/auth";
import { revalidatePath } from "next/cache";
import { deleteFromS3 } from "@/lib/s3";
import { Prisma } from "@/lib/generated/prisma/client";
import { SaveProfileSchema } from "./schema";

function toJsonInput(v: unknown): Prisma.InputJsonValue | typeof Prisma.JsonNull | undefined {
  if (v === null) return Prisma.JsonNull;
  if (v === undefined) return undefined;
  return v as Prisma.InputJsonValue;
}

export const saveProfile = withAuth("profile/save", async (user, data: unknown) => {
  const parsed = SaveProfileSchema.safeParse(data);
  if (!parsed.success) {
    return { success: false as const, error: parsed.error.message };
  }

  const draft = parsed.data;

  const profile = await db.profile.findFirst({
    where: { userId: user.id },
    include: {
      links: { select: { id: true, title: true, url: true, description: true, mediaUrl: true, position: true, isActive: true, buttonColor: true, buttonTextColor: true, titleStyle: true } },
      socials: { select: { id: true, platform: true, url: true, position: true } },
    },
  });

  if (!profile) throw new Error("Profile not found");

  const operations: Prisma.PrismaPromise<any>[] = [];
  const s3KeysToClean: string[] = [];

  // ── Profile scalars ──────────────────────────────────────────────────────────

  const updateData: Record<string, any> = {};
  const scalarFields = ["displayName", "bio", "avatarUrl", "layout", "bgType", "bgColor", "bgWallpaper", "bgImage", "cardTexture"] as const;

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

  // Track avatar S3 cleanup
  if (profile.avatarUrl && draft.avatarUrl !== undefined && profile.avatarUrl !== draft.avatarUrl) {
    s3KeysToClean.push(profile.avatarUrl);
  }

  if (Object.keys(updateData).length > 0) {
    operations.push(db.profile.update({ where: { id: profile.id }, data: updateData }));
  }

  // ── Links ────────────────────────────────────────────────────────────────────

  const dbLinkIds = new Set(profile.links.map((l) => l.id));
  const dbLinksMap = new Map(profile.links.map((l) => [l.id, l]));
  const draftLinks = draft.links ?? [];

  for (let i = 0; i < draftLinks.length; i++) {
    const { id, titleStyle, ...linkFields } = draftLinks[i];

    if (!id || !dbLinkIds.has(id)) {
      operations.push(
        db.link.create({
          data: {
            ...linkFields,
            titleStyle: toJsonInput(titleStyle),
            position: i,
            profileId: profile.id,
          },
        }),
      );
    } else {
      const dbLink = dbLinksMap.get(id)!;
      if (dbLink.mediaUrl && linkFields.mediaUrl !== undefined && linkFields.mediaUrl !== dbLink.mediaUrl) {
        s3KeysToClean.push(dbLink.mediaUrl);
      }

      operations.push(
        db.link.update({
          where: { id },
          data: {
            ...linkFields,
            position: i,
            ...(titleStyle !== undefined ? { titleStyle: toJsonInput(titleStyle) } : {}),
          },
        }),
      );
    }
  }

  for (const dbLink of profile.links) {
    if (!draftLinks.some((dl) => dl.id === dbLink.id)) {
      if (dbLink.mediaUrl) s3KeysToClean.push(dbLink.mediaUrl);
      operations.push(db.link.deleteMany({ where: { id: dbLink.id } }));
    }
  }

  // ── Socials ──────────────────────────────────────────────────────────────────

  const dbSocialIds = new Set(profile.socials.map((s) => s.id));
  const draftSocials = draft.socials ?? [];

  for (let i = 0; i < draftSocials.length; i++) {
    const { id, ...socialFields } = draftSocials[i];

    if (!id || !dbSocialIds.has(id)) {
      operations.push(
        db.socialLink.create({
          data: { ...socialFields, position: i, profileId: profile.id },
        }),
      );
    } else {
      operations.push(
        db.socialLink.update({
          where: { id },
          data: { ...socialFields, position: i },
        }),
      );
    }
  }

  for (const dbSocial of profile.socials) {
    if (!draftSocials.some((ds) => ds.id === dbSocial.id)) {
      operations.push(db.socialLink.deleteMany({ where: { id: dbSocial.id } }));
    }
  }

  // ── Execute ──────────────────────────────────────────────────────────────────

  await db.$transaction(operations);

  // Post-commit S3 cleanup (non-blocking)
  if (s3KeysToClean.length > 0) {
    Promise.allSettled(
      s3KeysToClean.map((key) =>
        deleteFromS3(key).catch((err) => console.error(`[profile/save] S3 cleanup failed:`, err)),
      ),
    );
  }

  revalidatePath(`/${user.username}`);

  // ── Return refreshed links + socials (real IDs, correct positions) ──────────

  const finalLinks = await db.link.findMany({
    where: { profileId: profile.id },
    select: { id: true, title: true, url: true, description: true, mediaUrl: true, position: true, isActive: true, buttonColor: true, buttonTextColor: true, titleStyle: true },
    orderBy: { position: "asc" },
  });

  const finalSocials = await db.socialLink.findMany({
    where: { profileId: profile.id },
    select: { id: true, platform: true, url: true },
    orderBy: { position: "asc" },
  });

  return { success: true as const, links: finalLinks, socials: finalSocials };
});
