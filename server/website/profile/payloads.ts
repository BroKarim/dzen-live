import type { Prisma } from "@/lib/generated/prisma/client";

/**
 * Payload for public profile pages
 * Only includes fields that are actually rendered on the public view
 */
export const publicProfilePayload = {
  // Profile Info
  username: true,
  displayName: true,
  bio: true,
  avatarUrl: true,
  layout: true,
  isPublished: true,
  displayNameStyle: true,
  bioStyle: true,
  padding: true,

  // User Info (via relation)
  user: {
    select: {
      name: true,
      image: true,
    },
  },

  // Background
  bgType: true,
  bgColor: true,
  bgWallpaper: true,
  bgImage: true,
  bgEffects: true,
  bgPattern: true,

  // Card Styling
  cardTexture: true,

  // Socials
  socials: {
    select: {
      id: true,
      platform: true,
      url: true,
    },
    orderBy: { position: "asc" as const },
  },

  // Links (only active ones)
  links: {
    select: {
      id: true,
      title: true,
      url: true,
      position: true,
      titleStyle: true,
    },
    where: { isActive: true },
    orderBy: { position: "asc" as const },
  },
} satisfies Prisma.ProfileSelect;

type PublicProfileData = Prisma.ProfileGetPayload<{
  select: typeof publicProfilePayload;
}>;
