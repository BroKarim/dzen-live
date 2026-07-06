"use server";

import { db } from "@/lib/db";
import { withAuth } from "@/server/user/auth";
import { SocialLinkSchema, LinkSchema, SocialLinkInput, LinkInput } from "./schema";
import { revalidatePath } from "next/cache";
import { deleteFromS3 } from "@/lib/s3";
import { Prisma } from "@/lib/generated/prisma/client";

async function getProfileId(userId: string) {
  const profile = await db.profile.findFirst({
    where: { userId },
    select: { id: true },
  });
  if (!profile) throw new Error("Profile not found");
  return profile.id;
}

// Convert `null` to Prisma.JsonNull so the field is set to NULL in the DB
// (vs `undefined` which leaves the field unchanged).
function toJsonInput(v: unknown): Prisma.InputJsonValue | typeof Prisma.JsonNull | undefined {
  if (v === null) return Prisma.JsonNull;
  if (v === undefined) return undefined;
  return v as Prisma.InputJsonValue;
}

// ─── Social Links ─────────────────────────────────────────────────────────────

/** @deprecated Use {@link saveProfile} from `server/user/profile/save-profile-action` instead. Kept as rollback path during auto-save migration. */
export const createSocialLink = withAuth("links/actions", async (user, data: SocialLinkInput) => {
  const profileId = await getProfileId(user.id);
  const validated = SocialLinkSchema.parse(data);

  const socialLink = await db.socialLink.create({
    data: { ...validated, profileId },
  });

  revalidatePath(`/${user.username}`);
  return { success: true as const, data: socialLink };
});

/** @deprecated Use {@link saveProfile} from `server/user/profile/save-profile-action` instead. Kept as rollback path during auto-save migration. */
export const updateSocialLink = withAuth("links/actions", async (user, id: string, data: SocialLinkInput) => {
  const validated = SocialLinkSchema.parse(data);

  await db.socialLink.update({ where: { id }, data: validated });

  revalidatePath(`/${user.username}`);
  return { success: true as const };
});

/** @deprecated Use {@link saveProfile} from `server/user/profile/save-profile-action` instead. Kept as rollback path during auto-save migration. */
export const deleteSocialLink = withAuth("links/actions", async (user, id: string) => {
  // deleteMany avoids P2025 if record was already deleted
  await db.socialLink.deleteMany({ where: { id } });

  revalidatePath(`/${user.username}`);
  return { success: true as const };
});

// ─── Links ────────────────────────────────────────────────────────────────────

/** @deprecated Use {@link saveProfile} from `server/user/profile/save-profile-action` instead. Kept as rollback path during auto-save migration. */
export const createLink = withAuth("links/actions", async (user, data: LinkInput) => {
  const profileId = await getProfileId(user.id);
  const validated = LinkSchema.parse(data);

  const { titleStyle, ...rest } = validated;

  const link = await db.link.create({
    data: { ...rest, titleStyle: toJsonInput(titleStyle), profileId },
  });

  revalidatePath(`/${user.username}`);
  return { success: true as const, data: link };
});

/** @deprecated Use {@link saveProfile} from `server/user/profile/save-profile-action` instead. Kept as rollback path during auto-save migration. */
export const updateLink = withAuth("links/actions", async (user, id: string, data: Partial<LinkInput>) => {
  const existing = await db.link.findUnique({
    where: { id },
    select: { mediaUrl: true },
  });

  if (!existing) throw new Error("Link not found");

  // Delete old S3 asset if replaced (non-blocking)
  if (data.mediaUrl && existing.mediaUrl && data.mediaUrl !== existing.mediaUrl) {
    deleteFromS3(existing.mediaUrl).catch(console.error);
  }

  const { titleStyle, ...rest } = data;

  await db.link.update({
    where: { id },
    data: {
      ...rest,
      ...(titleStyle !== undefined ? { titleStyle: toJsonInput(titleStyle) } : {}),
    },
  });

  revalidatePath(`/${user.username}`);
  return { success: true as const };
});

/** @deprecated Use {@link saveProfile} from `server/user/profile/save-profile-action` instead. Kept as rollback path during auto-save migration. */
export const deleteLink = withAuth("links/actions", async (user, id: string) => {
  const link = await db.link.findUnique({
    where: { id },
    select: { mediaUrl: true },
  });

  // Guard: record may already be gone (e.g. duplicate save scenario)
  if (!link) return { success: true as const };

  // Delete S3 asset first (non-blocking)
  if (link.mediaUrl) deleteFromS3(link.mediaUrl).catch(console.error);

  // deleteMany avoids P2025 if record was already deleted between the findUnique and delete
  await db.link.deleteMany({ where: { id } });

  revalidatePath(`/${user.username}`);
  return { success: true as const };
});

/** @deprecated Use {@link saveProfile} from `server/user/profile/save-profile-action` instead. Kept as rollback path during auto-save migration. */
export const reorderLinks = withAuth("links/actions", async (user, linkIds: string[]) => {
  // updateMany silently skips missing IDs instead of throwing P2025
  await db.$transaction(linkIds.map((id, index) => db.link.updateMany({ where: { id }, data: { position: index } })));

  revalidatePath(`/${user.username}`);
  return { success: true as const };
});
