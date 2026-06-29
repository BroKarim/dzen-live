// server/user/profile/queries.ts
import { db } from "@/lib/db";
import { profileEditorPayload } from "./payloads";
import { cacheLife, cacheTag } from "next/cache";

export async function getProfileData(userId: string) {
  "use cache";
  cacheTag(`profile-${userId}`);
  cacheLife("max");

  // Assuming we want the primary/first profile for now
  return await db.profile.findFirst({
    where: { userId },
    select: profileEditorPayload,
  });
}

export async function findProfileByUserId(userId: string) {
  return await db.profile.findFirst({
    where: { userId },
    select: profileEditorPayload,
  });
}

export async function findProfileByUsername(username: string) {
  return await db.profile.findUnique({
    where: { username },
    select: profileEditorPayload,
  });
}
