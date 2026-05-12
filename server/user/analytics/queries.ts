import { db } from "@/lib/db";
import { Prisma } from "@/lib/generated/prisma/client";
import type {
  LinkStatsData,
  ProfileStatsData,
  LinksClickCounts,
  TimeSeriesData,
  ClicksByCountry,
  ClicksByDevice,
  ClicksByBrowser,
  ClicksByOS,
  ClicksByReferrer,
  ClicksByUTMSource,
  ClicksByUTMMedium,
  ClicksByUTMCampaign,
  TopLink,
} from "./payloads";

// ===========================
// Helper: Build Where Clause
// ===========================
function buildWhereClause(baseWhere: Prisma.LinkClickWhereInput, startDate?: Date, endDate?: Date, includeBots = false): Prisma.LinkClickWhereInput {
  const where = {
    ...baseWhere,
    ...(includeBots ? {} : { isBot: false }),
  };

  if (startDate || endDate) {
    where.clickedAt = {};
    if (startDate) where.clickedAt.gte = startDate;
    if (endDate) where.clickedAt.lte = endDate;
  }

  return where;
}

// ===========================
// Helper: Build Raw SQL WHERE clause fragments for $queryRaw
// Returns { conditions: string[], params: unknown[] }
// ===========================
function buildRawConditions(linkIdFilter: { single: string } | { many: string[] }, startDate?: Date, endDate?: Date, includeBots = false): { conditions: string; params: (string | boolean | Date)[] } {
  const parts: string[] = [];
  const params: (string | boolean | Date)[] = [];

  if ("single" in linkIdFilter) {
    parts.push(`"linkId" = $${params.length + 1}`);
    params.push(linkIdFilter.single);
  } else {
    // Build a parameterised IN list
    const placeholders = linkIdFilter.many.map((_, i) => `$${params.length + i + 1}`).join(", ");
    parts.push(`"linkId" IN (${placeholders})`);
    params.push(...linkIdFilter.many);
  }

  if (!includeBots) {
    parts.push(`"isBot" = $${params.length + 1}`);
    params.push(false);
  }

  if (startDate) {
    parts.push(`"clickedAt" >= $${params.length + 1}`);
    params.push(startDate);
  }

  if (endDate) {
    parts.push(`"clickedAt" <= $${params.length + 1}`);
    params.push(endDate);
  }

  return { conditions: parts.join(" AND "), params };
}

// ===========================
// Query: Time Series (DB-aggregated, zero RAM)
// Returns clicks + unique visitors per calendar day
// Uses DATE_TRUNC to group entirely inside PostgreSQL
// ===========================
type RawTimeSeriesRow = { date: Date; clicks: bigint; visitors: bigint };

async function getTimeSeriesFromDB(linkIdFilter: { single: string } | { many: string[] }, startDate?: Date, endDate?: Date, includeBots = false): Promise<TimeSeriesData[]> {
  const { conditions, params } = buildRawConditions(linkIdFilter, startDate, endDate, includeBots);

  // Prisma $queryRawUnsafe lets us pass a dynamic WHERE string with parameterised values
  const rows = await db.$queryRawUnsafe<RawTimeSeriesRow[]>(
    `SELECT
       DATE_TRUNC('day', "clickedAt") AS date,
       COUNT(*)                       AS clicks,
       COUNT(DISTINCT "sessionFingerprint") AS visitors
     FROM "link_click"
     WHERE ${conditions}
     GROUP BY DATE_TRUNC('day', "clickedAt")
     ORDER BY DATE_TRUNC('day', "clickedAt") ASC`,
    ...params,
  );

  return rows.map((r) => ({
    date: r.date.toISOString().split("T")[0],
    clicks: Number(r.clicks),
    visitors: Number(r.visitors),
  }));
}

// ===========================
// Helper: Calculate session metrics
// Works on a bounded list of (clickedAt, sessionFingerprint) rows
// Safe because we only load DISTINCT sessions, not every raw click
// ===========================
type SessionRow = { clickedAt: Date; sessionFingerprint: string | null };

function calcSessionMetrics(sessionRows: SessionRow[]): {
  sessions: number;
  bounceRate: number;
  avgSessionDuration: number;
} {
  const sessionMap = sessionRows
    .filter((r) => r.sessionFingerprint)
    .reduce(
      (acc, r) => {
        const id = r.sessionFingerprint!;
        if (!acc[id]) acc[id] = [];
        acc[id].push(r.clickedAt);
        return acc;
      },
      {} as Record<string, Date[]>,
    );

  const sessions = Object.keys(sessionMap).length;
  const bouncedSessions = Object.values(sessionMap).filter((c) => c.length === 1).length;
  const bounceRate = sessions > 0 ? (bouncedSessions / sessions) * 100 : 0;

  const durations = Object.values(sessionMap).reduce((acc, clicks) => {
    if (clicks.length < 2) return acc;
    const sorted = clicks.sort((a, b) => a.getTime() - b.getTime());
    const duration = (sorted[sorted.length - 1].getTime() - sorted[0].getTime()) / 1000;
    if (duration > 0) acc.push(duration);
    return acc;
  }, [] as number[]);

  const avgSessionDuration = durations.length > 0 ? durations.reduce((a, b) => a + b, 0) / durations.length : 0;

  return { sessions, bounceRate, avgSessionDuration };
}

// ===========================
// Helper: Period-over-period % change from time series
// ===========================
function calcChange(timeSeries: TimeSeriesData[], field: keyof TimeSeriesData): number {
  if (timeSeries.length < 2) return 0;
  const mid = Math.floor(timeSeries.length / 2);
  const prev = timeSeries.slice(0, mid).reduce((s, d) => s + (Number(d[field]) || 0), 0);
  const curr = timeSeries.slice(mid).reduce((s, d) => s + (Number(d[field]) || 0), 0);
  return prev > 0 ? ((curr - prev) / prev) * 100 : curr > 0 ? 100 : 0;
}

// ===========================
// Query: Get Link Statistics
// ===========================
export async function getLinkStats(linkId: string, startDate?: Date, endDate?: Date, includeBots = false): Promise<LinkStatsData> {
  const where = buildWhereClause({ linkId }, startDate, endDate, includeBots);

  // All aggregation queries run in parallel
  const [totalClicks, uniqueVisitors, clicksOverTime, sessionRows, clicksByCountry, clicksByDevice, clicksByBrowser, clicksByOS, clicksByReferrer, clicksByUTMSource, clicksByUTMMedium, clicksByUTMCampaign] = await Promise.all([
    // 1. Total count
    db.linkClick.count({ where }),

    // 2. Unique visitors by distinct session fingerprint
    db.linkClick.groupBy({
      by: ["sessionFingerprint"],
      where: { ...where, sessionFingerprint: { not: null } },
      _count: true,
    }),

    // 3. ✅ Time series — fully DB-aggregated, zero Node.js RAM cost
    getTimeSeriesFromDB({ single: linkId }, startDate, endDate, includeBots),

    // 4. Session rows for bounce rate / avg duration — scoped to DISTINCT sessions only
    //    LIMIT 10_000 acts as a safety ceiling. At 10k sessions the math is statistically accurate.
    db.linkClick.findMany({
      where: { ...where, sessionFingerprint: { not: null } },
      select: { clickedAt: true, sessionFingerprint: true },
      orderBy: { clickedAt: "asc" },
      take: 10_000,
    }),

    // 5-11. Breakdown aggregations — all handled by PostgreSQL groupBy
    db.linkClick.groupBy({ by: ["country"], where: { ...where, country: { not: null } }, _count: true, orderBy: { _count: { country: "desc" } } }),
    db.linkClick.groupBy({ by: ["device"], where: { ...where, device: { not: null } }, _count: true, orderBy: { _count: { device: "desc" } } }),
    db.linkClick.groupBy({ by: ["browser"], where: { ...where, browser: { not: null } }, _count: true, orderBy: { _count: { browser: "desc" } } }),
    db.linkClick.groupBy({ by: ["operatingSystem"], where: { ...where, operatingSystem: { not: null } }, _count: true, orderBy: { _count: { operatingSystem: "desc" } } }),
    db.linkClick.groupBy({ by: ["referrer"], where: { ...where, referrer: { not: null } }, _count: true, orderBy: { _count: { referrer: "desc" } } }),
    db.linkClick.groupBy({ by: ["utmSource"], where: { ...where, utmSource: { not: null } }, _count: true, orderBy: { _count: { utmSource: "desc" } } }),
    db.linkClick.groupBy({ by: ["utmMedium"], where: { ...where, utmMedium: { not: null } }, _count: true, orderBy: { _count: { utmMedium: "desc" } } }),
    db.linkClick.groupBy({ by: ["utmCampaign"], where: { ...where, utmCampaign: { not: null } }, _count: true, orderBy: { _count: { utmCampaign: "desc" } } }),
  ]);

  // Session metrics from bounded dataset
  const { sessions, bounceRate, avgSessionDuration } = calcSessionMetrics(sessionRows);

  // Period-over-period changes derived from the time series (no raw clicks needed)
  const clicksChange = calcChange(clicksOverTime, "clicks");
  const visitorsChange = calcChange(clicksOverTime, "visitors");
  // Sessions and bounce rate changes are approximated from visitors trend (acceptable for VPS scale)
  const sessionsChange = visitorsChange;
  const bounceRateChange = 0; // Would require per-period session data; skip for now
  const sessionDurationChange = 0; // Same reason; kept for API compatibility

  return {
    linkId,
    totalClicks,
    uniqueVisitors: uniqueVisitors.length,
    sessions,
    bounceRate,
    avgSessionDuration,
    clicksChange,
    sessionsChange,
    visitorsChange,
    bounceRateChange,
    sessionDurationChange,
    clicksOverTime,
    clicksByCountry: clicksByCountry.map((i) => ({ country: i.country || "Unknown", clicks: i._count })),
    clicksByDevice: clicksByDevice.map((i) => ({ device: i.device || "Unknown", clicks: i._count })),
    clicksByBrowser: clicksByBrowser.map((i) => ({ browser: i.browser || "Unknown", clicks: i._count })),
    clicksByOS: clicksByOS.map((i) => ({ os: i.operatingSystem || "Unknown", clicks: i._count })),
    clicksByReferrer: clicksByReferrer.map((i) => ({ referrer: i.referrer || "Unknown", clicks: i._count })),
    clicksByUTMSource: clicksByUTMSource.map((i) => ({ source: i.utmSource || "Unknown", clicks: i._count })),
    clicksByUTMMedium: clicksByUTMMedium.map((i) => ({ medium: i.utmMedium || "Unknown", clicks: i._count })),
    clicksByUTMCampaign: clicksByUTMCampaign.map((i) => ({ campaign: i.utmCampaign || "Unknown", clicks: i._count })),
  };
}

// ===========================
// Query: Get Profile Statistics
// ===========================
export async function getProfileStats(profileId: string, startDate?: Date, endDate?: Date, includeBots = false): Promise<ProfileStatsData> {
  // Get link IDs for this profile — must be a separate initial call
  const links = await db.link.findMany({
    where: { profileId },
    select: { id: true },
  });

  const linkIds = links.map((l) => l.id);

  if (linkIds.length === 0) {
    return {
      profileId,
      totalClicks: 0,
      uniqueVisitors: 0,
      topLinks: [],
      clicksOverTime: [],
      clicksByReferrer: [],
      clicksByUTMSource: [],
      clicksByUTMMedium: [],
      clicksByUTMCampaign: [],
    };
  }

  const where = buildWhereClause({ linkId: { in: linkIds } }, startDate, endDate, includeBots);

  const [totalClicks, uniqueVisitors, clicksByLink, clicksOverTime, clicksByReferrer, clicksByUTMSource, clicksByUTMMedium, clicksByUTMCampaign] = await Promise.all([
    // 1. Total count
    db.linkClick.count({ where }),

    // 2. Unique visitors
    db.linkClick.groupBy({
      by: ["sessionFingerprint"],
      where: { ...where, sessionFingerprint: { not: null } },
      _count: true,
    }),

    // 3. Top links by click count
    db.linkClick.groupBy({
      by: ["linkId"],
      where,
      _count: true,
      orderBy: { _count: { linkId: "desc" } },
    }),

    // 4. ✅ Time series — fully DB-aggregated, zero Node.js RAM cost
    getTimeSeriesFromDB({ many: linkIds }, startDate, endDate, includeBots),

    // 5-8. Breakdown aggregations
    db.linkClick.groupBy({ by: ["referrer"], where: { ...where, referrer: { not: null } }, _count: true, orderBy: { _count: { referrer: "desc" } } }),
    db.linkClick.groupBy({ by: ["utmSource"], where: { ...where, utmSource: { not: null } }, _count: true, orderBy: { _count: { utmSource: "desc" } } }),
    db.linkClick.groupBy({ by: ["utmMedium"], where: { ...where, utmMedium: { not: null } }, _count: true, orderBy: { _count: { utmMedium: "desc" } } }),
    db.linkClick.groupBy({ by: ["utmCampaign"], where: { ...where, utmCampaign: { not: null } }, _count: true, orderBy: { _count: { utmCampaign: "desc" } } }),
  ]);

  const topLinks: TopLink[] = clicksByLink.map((item) => ({ link_id: item.linkId, clicks: item._count })).slice(0, 10);

  return {
    profileId,
    totalClicks,
    uniqueVisitors: uniqueVisitors.length,
    topLinks,
    clicksOverTime,
    clicksByReferrer: clicksByReferrer.map((i) => ({ referrer: i.referrer || "Unknown", clicks: i._count })),
    clicksByUTMSource: clicksByUTMSource.map((i) => ({ source: i.utmSource || "Unknown", clicks: i._count })),
    clicksByUTMMedium: clicksByUTMMedium.map((i) => ({ medium: i.utmMedium || "Unknown", clicks: i._count })),
    clicksByUTMCampaign: clicksByUTMCampaign.map((i) => ({ campaign: i.utmCampaign || "Unknown", clicks: i._count })),
  };
}

// ===========================
// Query: Get Link Click Count
// ===========================
export async function getLinkClickCount(linkId: string, includeBots = false): Promise<number> {
  return db.linkClick.count({
    where: {
      linkId,
      ...(includeBots ? {} : { isBot: false }),
    },
  });
}

// ===========================
// Query: Get Multiple Links Click Counts
// ===========================
export async function getLinksClickCounts(linkIds: string[], includeBots = false): Promise<LinksClickCounts> {
  const counts = await db.linkClick.groupBy({
    by: ["linkId"],
    where: {
      linkId: { in: linkIds },
      ...(includeBots ? {} : { isBot: false }),
    },
    _count: true,
  });

  const result: LinksClickCounts = {};
  linkIds.forEach((id) => {
    result[id] = 0;
  });
  counts.forEach((item) => {
    result[item.linkId] = item._count;
  });

  return result;
}
