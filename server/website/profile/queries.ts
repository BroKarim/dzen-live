import { db } from "@/lib/db";
import { publicProfileMetaPayload } from "./payloads";
import { cacheLife, cacheTag } from "next/cache";

export async function getPublicProfileMeta(username: string) {
  "use cache";
  cacheTag(`profile-meta-${username}`);
  cacheLife("minutes");

  return await db.profile.findUnique({
    where: { username },
    select: publicProfileMetaPayload,
  });
}

export async function getPublicLinks(profileId: string) {
  "use cache";
  cacheTag(`links-${profileId}`);
  cacheLife("minutes");

  return await db.link.findMany({
    where: { profileId, isActive: true },
    select: {
      id: true,
      title: true,
      url: true,
      position: true,
      titleStyle: true,
    },
    orderBy: { position: "asc" },
  });
}

export async function getPublicProfile(username: string) {
  const meta = await getPublicProfileMeta(username);
  if (!meta) return null;
  const links = await getPublicLinks(meta.id);
  return { ...meta, links };
}

export async function getPublishedProfiles(limit?: number, offset?: number) {
  "use cache";
  cacheTag("published-profiles");
  cacheLife("minutes");

  return await db.profile.findMany({
    where: {
      isPublished: true,
    },
    select: {
      username: true,
      displayName: true,
      avatarUrl: true,
      user: {
        select: {
          name: true,
          image: true,
        },
      },
    },
    ...(limit ? { take: limit } : {}),
    ...(offset ? { skip: offset } : {}),
    orderBy: {
      createdAt: "desc",
    },
  });
}

export async function getPublishedProfileCount() {
  "use cache";
  cacheTag("published-profiles-count");
  cacheLife("minutes");

  return await db.profile.count({
    where: {
      isPublished: true,
    },
  });
}
