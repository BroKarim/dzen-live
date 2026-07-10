"use server";

import { db } from "@/lib/db";
import { withAuth } from "@/server/user/auth";
import { SocialLinkSchema, LinkSchema, SocialLinkInput, LinkInput } from "./schema";
import { revalidatePath } from "next/cache";
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
    select: { id: true },
  });

  if (!existing) throw new Error("Link not found");

  // Allowlist only — never spread raw partial into Prisma
  const write: Record<string, unknown> = {};
  if (data.title !== undefined) write.title = data.title;
  if (data.url !== undefined) write.url = data.url;
  if (data.position !== undefined) write.position = data.position;
  if (data.isActive !== undefined) write.isActive = data.isActive;
  if (data.buttonColor !== undefined) write.buttonColor = data.buttonColor;
  if (data.buttonTextColor !== undefined) write.buttonTextColor = data.buttonTextColor;
  if (data.titleStyle !== undefined) write.titleStyle = toJsonInput(data.titleStyle);

  await db.link.update({
    where: { id },
    data: write,
  });

  revalidatePath(`/${user.username}`);
  return { success: true as const };
});

/** @deprecated Use {@link saveProfile} from `server/user/profile/save-profile-action` instead. Kept as rollback path during auto-save migration. */
export const deleteLink = withAuth("links/actions", async (user, id: string) => {
  // deleteMany avoids P2025 if record was already deleted
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
