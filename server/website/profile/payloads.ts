import type { Prisma } from "@/lib/generated/prisma/client";

/**
 * Payload for profile meta (excludes links — fetched separately via getPublicLinks).
 * Includes id so the page can pass profileId to getPublicLinks.
 */
export const publicProfileMetaPayload = {
  id: true,
  username: true,
  displayName: true,
  bio: true,
  avatarUrl: true,
  layout: true,
  isPublished: true,
  displayNameStyle: true,
  bioStyle: true,
  padding: true,

  user: {
    select: {
      name: true,
      image: true,
    },
  },

  bgType: true,
  bgColor: true,
  bgWallpaper: true,
  bgImage: true,
  bgEffects: true,
  bgPattern: true,

  cardTexture: true,

  socials: {
    select: {
      id: true,
      platform: true,
      url: true,
    },
    orderBy: { position: "asc" as const },
  },
} satisfies Prisma.ProfileSelect;

type PublicProfileMetaData = Prisma.ProfileGetPayload<{
  select: typeof publicProfileMetaPayload;
}>;
