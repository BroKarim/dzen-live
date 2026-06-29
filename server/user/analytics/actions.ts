"use server";

import { withAuth } from "@/server/user/auth";
import { db } from "@/lib/db";
import { linkStatsQuerySchema, profileStatsQuerySchema, linkClickCountQuerySchema, linksClickCountsQuerySchema } from "./schema";
import { getLinkStats, getProfileStats, getLinkClickCount, getLinksClickCounts } from "./queries";

export const getLinkAnalyticsAction = withAuth("analytics/actions", async (user, params: { linkId: string; startDate?: string; endDate?: string; includeBots?: boolean }) => {
  const validated = linkStatsQuerySchema.safeParse({
    linkId: params.linkId,
    startDate: params.startDate ? new Date(params.startDate) : undefined,
    endDate: params.endDate ? new Date(params.endDate) : undefined,
    includeBots: params.includeBots ?? false,
  });

  if (!validated.success) {
    return { success: false, error: validated.error.issues[0].message };
  }

  const link = await db.link.findFirst({
    where: { id: validated.data.linkId, profile: { userId: user.id } },
  });

  if (!link) {
    return { success: false, error: "Link not found or unauthorized" };
  }

  const stats = await getLinkStats(validated.data.linkId, validated.data.startDate, validated.data.endDate, validated.data.includeBots);
  return { success: true, data: stats };
});

export const getProfileAnalyticsAction = withAuth("analytics/actions", async (user, params: { startDate?: string; endDate?: string; includeBots?: boolean }) => {
  const profile = await db.profile.findFirst({ where: { userId: user.id } });

  if (!profile) {
    return { success: false, error: "Profile not found" };
  }

  const validated = profileStatsQuerySchema.safeParse({
    profileId: profile.id,
    startDate: params.startDate ? new Date(params.startDate) : undefined,
    endDate: params.endDate ? new Date(params.endDate) : undefined,
    includeBots: params.includeBots ?? false,
  });

  if (!validated.success) {
    return { success: false, error: validated.error.issues[0].message };
  }

  const stats = await getProfileStats(validated.data.profileId, validated.data.startDate, validated.data.endDate, validated.data.includeBots);
  return { success: true, data: stats };
});

export const getLinkClickCountAction = withAuth("analytics/actions", async (user, params: { linkId: string; includeBots?: boolean }) => {
  const validated = linkClickCountQuerySchema.safeParse({
    linkId: params.linkId,
    includeBots: params.includeBots ?? false,
  });

  if (!validated.success) {
    return { success: false, error: validated.error.issues[0].message };
  }

  const link = await db.link.findFirst({
    where: { id: validated.data.linkId, profile: { userId: user.id } },
  });

  if (!link) {
    return { success: false, error: "Link not found or unauthorized" };
  }

  const count = await getLinkClickCount(validated.data.linkId, validated.data.includeBots);
  return { success: true, count };
});

export const getLinksClickCountsAction = withAuth("analytics/actions", async (user, params: { includeBots?: boolean }) => {
  const profile = await db.profile.findFirst({
    where: { userId: user.id },
    include: { links: { select: { id: true } } },
  });

  if (!profile) {
    return { success: false, error: "Profile not found" };
  }

  const linkIds = profile.links.map((l) => l.id);

  if (linkIds.length === 0) {
    return { success: true, counts: {} };
  }

  const validated = linksClickCountsQuerySchema.safeParse({
    linkIds,
    includeBots: params.includeBots ?? false,
  });

  if (!validated.success) {
    return { success: false, error: validated.error.issues[0].message };
  }

  const counts = await getLinksClickCounts(validated.data.linkIds, validated.data.includeBots);
  return { success: true, counts };
});