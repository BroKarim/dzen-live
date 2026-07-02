import type { Prisma } from "@/lib/generated/prisma/client";

export const profileEditorPayload = {
  id: true,
  userId: true,
  username: true,
  displayName: true,
  bio: true,
  avatarUrl: true,
  layout: true,
  displayNameStyle: true,
  bioStyle: true,
  bgType: true,
  bgColor: true,
  bgGradientFrom: true,
  bgGradientTo: true,
  bgWallpaper: true,
  bgImage: true,
  blurAmount: true,
  padding: true,
  cardTexture: true,
  bgEffects: true,
  bgPattern: true,
  isPublished: true,
  socials: { select: { id: true, platform: true, url: true }, orderBy: { position: "asc" } },
  links: {
    select: {
      id: true,
      title: true,
      url: true,
      isActive: true,
      description: true,
      mediaUrl: true,
      position: true,
      buttonColor: true,
      buttonTextColor: true,
      titleStyle: true,
    },
    orderBy: { position: "asc" },
  },
} satisfies Prisma.ProfileSelect;

export const profilePublicPayload = {
  username: true,
  displayName: true,
  bio: true,
  avatarUrl: true,
  layout: true,
  displayNameStyle: true,
  bioStyle: true,
  bgType: true,
  bgColor: true,
  bgGradientFrom: true,
  bgGradientTo: true,
  bgWallpaper: true,
  bgImage: true,
  blurAmount: true,
  padding: true,
  cardTexture: true,
  bgEffects: true,
  bgPattern: true,
  socials: {
    select: {
      platform: true,
      url: true,
      position: true,
    },
    orderBy: { position: "asc" as const },
  },
  links: {
    select: {
      title: true,
      url: true,
      description: true,
      mediaUrl: true,
      position: true,
      titleStyle: true,
    },
    where: { isActive: true },
    orderBy: { position: "asc" as const },
  },
} satisfies Prisma.ProfileSelect;

export type ProfileEditorData = Prisma.ProfileGetPayload<{
  select: typeof profileEditorPayload;
}>;

type ProfilePublicData = Prisma.ProfileGetPayload<{
  select: typeof profilePublicPayload;
}>;
