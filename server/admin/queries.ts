import { db } from "@/lib/db";

export interface AdminStats {
  totalUsers: number;
  totalProfiles: number;
  totalLinks: number;
  totalClicks: number;
  publishedProfiles: number;
  unpublishedProfiles: number;
  onboaredUsers: number;
  unonboardedUsers: number;
}

export async function getAdminStats(): Promise<AdminStats> {
  const [userCount, profileCount, linkCount, clickCount, publishedCount, onboardedCount] = await Promise.all([
    db.user.count(),
    db.profile.count(),
    db.link.count(),
    db.linkClick.count(),
    db.profile.count({ where: { isPublished: true } }),
    db.user.count({ where: { isOnboarded: true } }),
  ]);

  return {
    totalUsers: userCount,
    totalProfiles: profileCount,
    totalLinks: linkCount,
    totalClicks: clickCount,
    publishedProfiles: publishedCount,
    unpublishedProfiles: profileCount - publishedCount,
    onboaredUsers: onboardedCount,
    unonboardedUsers: userCount - onboardedCount,
  };
}

export interface AdminUserRow {
  id: string;
  name: string;
  email: string;
  onboarded: boolean;
  role: string;
  createdAt: Date;
  updatedAt: Date;
  profileCount: number;
  linkCount: number;
  clickCount: number;
  lastSessionAt: Date | null;
}

export interface GetAllUsersParams {
  search?: string;
  role?: "USER" | "ADMIN" | null;
  page?: number;
  pageSize?: number;
}

export interface GetAllUsersResult {
  users: AdminUserRow[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export async function getAllUsers(params?: GetAllUsersParams): Promise<GetAllUsersResult> {
  const page = Math.max(1, params?.page ?? 1);
  const pageSize = Math.min(100, Math.max(1, params?.pageSize ?? 20));

  const where: any = {};
  if (params?.search) {
    where.OR = [
      { name: { contains: params.search, mode: "insensitive" } },
      { email: { contains: params.search, mode: "insensitive" } },
    ];
  }
  if (params?.role) {
    where.role = params.role;
  }

  const [total, users] = await Promise.all([
    db.user.count({ where }),
    db.user.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
  ]);

  const rows: AdminUserRow[] = [];

  for (const user of users) {
    const [profileIds, lastSession] = await Promise.all([
      db.profile.findMany({
        where: { userId: user.id },
        select: { id: true },
      }),
      db.session.findFirst({
        where: { userId: user.id },
        orderBy: { createdAt: "desc" },
        select: { createdAt: true },
      }),
    ]);

    const ids = profileIds.map((p) => p.id);
    const profileCount = ids.length;

    const [linkCount, clickCount] = profileCount > 0
      ? await Promise.all([
          db.link.count({ where: { profileId: { in: ids } } }),
          db.linkClick.count({ where: { link: { profileId: { in: ids } } } }),
        ])
      : [0, 0];

    rows.push({
      id: user.id,
      name: user.name,
      email: user.email,
      onboarded: user.isOnboarded,
      role: user.role,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      profileCount,
      linkCount,
      clickCount,
      lastSessionAt: lastSession?.createdAt ?? null,
    });
  }

  return {
    users: rows,
    total,
    page,
    pageSize,
    totalPages: Math.ceil(total / pageSize),
  };
}

export interface AdminProfileRow {
  id: string;
  username: string;
  displayName: string | null;
  userId: string;
  userName: string;
  isPublished: boolean;
  bgType: string;
  createdAt: Date;
  updatedAt: Date;
  linkCount: number;
  clickCount: number;
}

export async function getAllProfiles(): Promise<AdminProfileRow[]> {
  const profiles = await db.profile.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      user: { select: { name: true } },
    },
  });

  const rows: AdminProfileRow[] = [];

  for (const profile of profiles) {
    const [linkCount, clickCount] = await Promise.all([
      db.link.count({ where: { profileId: profile.id } }),
      db.linkClick.count({ where: { link: { profileId: profile.id } } }),
    ]);

    rows.push({
      id: profile.id,
      username: profile.username,
      displayName: profile.displayName,
      userId: profile.userId,
      userName: profile.user.name,
      isPublished: profile.isPublished,
      bgType: profile.bgType,
      createdAt: profile.createdAt,
      updatedAt: profile.updatedAt,
      linkCount,
      clickCount,
    });
  }

  return rows;
}

export interface AdminUserDetail extends AdminUserRow {
  profiles: {
    id: string;
    username: string;
    displayName: string | null;
    isPublished: boolean;
    linkCount: number;
    clickCount: number;
  }[];
  sessionCount: number;
  accountProviders: string[];
}

export interface AdminAssetRow {
  id: string;
  key: string;
  url: string;
  type: string;
  isActive: boolean;
  userId: string;
  userName: string;
  profileId: string;
  profileUsername: string;
  createdAt: Date;
}

export interface AssetSummary {
  total: number;
  active: number;
  orphaned: number;
  byType: { type: string; count: number }[];
}

export async function getAssetSummary(): Promise<AssetSummary> {
  const [total, active, byType] = await Promise.all([
    db.asset.count(),
    db.asset.count({ where: { isActive: true } }),
    db.asset.groupBy({ by: ["type"], _count: true }),
  ]);

  return {
    total,
    active,
    orphaned: total - active,
    byType: byType.map((b) => ({ type: b.type, count: b._count })),
  };
}

export async function getAllAssets(): Promise<AdminAssetRow[]> {
  const assets = await db.asset.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      user: { select: { name: true } },
      profile: { select: { username: true } },
    },
  });

  return assets.map((a) => ({
    id: a.id,
    key: a.key,
    url: a.url,
    type: a.type,
    isActive: a.isActive,
    userId: a.userId,
    userName: a.user.name,
    profileId: a.profileId,
    profileUsername: a.profile.username,
    createdAt: a.createdAt,
  }));
}

export interface GrowthDataPoint {
  date: string;
  users: number;
  profiles: number;
}

export async function getGrowthData(days = 30): Promise<GrowthDataPoint[]> {
  const since = new Date();
  since.setDate(since.getDate() - days);
  since.setHours(0, 0, 0, 0);

  const [userDates, profileDates] = await Promise.all([
    db.user.findMany({
      where: { createdAt: { gte: since } },
      select: { createdAt: true },
      orderBy: { createdAt: "asc" },
    }),
    db.profile.findMany({
      where: { createdAt: { gte: since } },
      select: { createdAt: true },
      orderBy: { createdAt: "asc" },
    }),
  ]);

  const pointMap = new Map<string, { users: number; profiles: number }>();

  for (let i = 0; i < days; i++) {
    const d = new Date(since);
    d.setDate(d.getDate() + i);
    const key = d.toISOString().slice(0, 10);
    pointMap.set(key, { users: 0, profiles: 0 });
  }

  let userIdx = 0;
  let profileIdx = 0;

  for (const [key] of pointMap) {
    const end = new Date(key + "T23:59:59.999Z");
    while (userIdx < userDates.length && userDates[userIdx].createdAt <= end) {
      pointMap.get(key)!.users++;
      userIdx++;
    }
    while (profileIdx < profileDates.length && profileDates[profileIdx].createdAt <= end) {
      pointMap.get(key)!.profiles++;
      profileIdx++;
    }
  }

  let cumUsers = 0;
  let cumProfiles = 0;

  return Array.from(pointMap.entries()).map(([date, counts]) => {
    cumUsers += counts.users;
    cumProfiles += counts.profiles;
    return { date, users: cumUsers, profiles: cumProfiles };
  });
}

export interface UserClickAnalytics {
  dailyClicks: { date: string; count: number }[];
  topReferrers: { referrer: string; count: number }[];
  topCountries: { country: string; count: number }[];
  topDevices: { device: string; count: number }[];
  profiles: {
    id: string;
    username: string;
    displayName: string | null;
    linkCount: number;
    clickCount: number;
  }[];
  totalClicks: number;
}

export async function getUserClickAnalytics(id: string): Promise<UserClickAnalytics | null> {
  const user = await db.user.findUnique({
    where: { id },
    select: { id: true },
  });

  if (!user) return null;

  const profiles = await db.profile.findMany({
    where: { userId: id },
    select: { id: true, username: true, displayName: true },
  });

  const profileMap = new Map(profiles.map((p) => [p.id, p]));
  const profileIds = profiles.map((p) => p.id);

  const [allClicks, profileLinkCounts] = await Promise.all([
    db.linkClick.findMany({
      where: {
        link: { profileId: { in: profileIds } },
        isBot: false,
      },
      select: {
        clickedAt: true,
        referrer: true,
        country: true,
        device: true,
        link: { select: { profileId: true } },
      },
      orderBy: { clickedAt: "desc" },
    }),
    Promise.all(
      profiles.map(async (p) => {
        const count = await db.link.count({ where: { profileId: p.id } });
        return { profileId: p.id, count };
      }),
    ),
  ]);

  const linkCountMap = new Map(profileLinkCounts.map((l) => [l.profileId, l.count]));
  const profileClicks: Map<string, number> = new Map();
  for (const pid of profileIds) profileClicks.set(pid, 0);

  const since = new Date();
  since.setDate(since.getDate() - 30);
  since.setHours(0, 0, 0, 0);
  const dailyMap = new Map<string, number>();
  for (let i = 0; i < 30; i++) {
    const d = new Date(since);
    d.setDate(d.getDate() + i);
    dailyMap.set(d.toISOString().slice(0, 10), 0);
  }

  const referrerMap = new Map<string, number>();
  const countryMap = new Map<string, number>();
  const deviceMap = new Map<string, number>();

  for (const click of allClicks) {
    const dateKey = click.clickedAt.toISOString().slice(0, 10);
    if (dailyMap.has(dateKey)) dailyMap.set(dateKey, dailyMap.get(dateKey)! + 1);

    const ref = click.referrer || "Direct";
    referrerMap.set(ref, (referrerMap.get(ref) || 0) + 1);

    const country = click.country || "Unknown";
    countryMap.set(country, (countryMap.get(country) || 0) + 1);

    const device = click.device || "Unknown";
    deviceMap.set(device, (deviceMap.get(device) || 0) + 1);

    const pid = click.link.profileId;
    profileClicks.set(pid, (profileClicks.get(pid) || 0) + 1);
  }

  const dailyClicks = Array.from(dailyMap.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, count]) => ({ date, count }));

  return {
    dailyClicks,
    topReferrers: Array.from(referrerMap.entries())
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([referrer, count]) => ({ referrer, count })),
    topCountries: Array.from(countryMap.entries())
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([country, count]) => ({ country, count })),
    topDevices: Array.from(deviceMap.entries())
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([device, count]) => ({ device, count })),
    profiles: profiles.map((p) => ({
      id: p.id,
      username: p.username,
      displayName: p.displayName,
      linkCount: linkCountMap.get(p.id) || 0,
      clickCount: profileClicks.get(p.id) || 0,
    })),
    totalClicks: allClicks.length,
  };
}

export async function getUserDetail(id: string): Promise<AdminUserDetail | null> {
  const user = await db.user.findUnique({
    where: { id },
    include: {
      accounts: { select: { providerId: true } },
    },
  });

  if (!user) return null;

  const profiles = await db.profile.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
  });

  const [[profileRows, sessionCount], lastSession] = await Promise.all([
    Promise.all([
      Promise.all(
        profiles.map(async (p) => {
          const [linkCount, clickCount] = await Promise.all([
            db.link.count({ where: { profileId: p.id } }),
            db.linkClick.count({ where: { link: { profileId: p.id } } }),
          ]);
          return {
            id: p.id,
            username: p.username,
            displayName: p.displayName,
            isPublished: p.isPublished,
            linkCount,
            clickCount,
          };
        }),
      ),
      db.session.count({ where: { userId: user.id } }),
    ]),
    db.session.findFirst({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      select: { createdAt: true },
    }),
  ]);

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    onboarded: user.isOnboarded,
    role: user.role,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
    profileCount: profiles.length,
    linkCount: profileRows.reduce((s, p) => s + p.linkCount, 0),
    clickCount: profileRows.reduce((s, p) => s + p.clickCount, 0),
    lastSessionAt: lastSession?.createdAt ?? null,
    profiles: profileRows,
    sessionCount,
    accountProviders: user.accounts.map((a) => a.providerId),
  };
}
