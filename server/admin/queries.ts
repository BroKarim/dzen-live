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
  const [userCount, profileCount, linkCount, clickCount, publishedCount] = await Promise.all([
    db.user.count(),
    db.profile.count(),
    db.link.count(),
    db.linkClick.count(),
    db.profile.count({ where: { isPublished: true } }),
  ]);

  const onboardedCount = await db.user.count({ where: { isOnboarded: true } });

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

export async function getAllUsers(): Promise<AdminUserRow[]> {
  const users = await db.user.findMany({
    orderBy: { createdAt: "desc" },
  });

  const rows: AdminUserRow[] = [];

  for (const user of users) {
    const profileIds = await db.profile.findMany({
      where: { userId: user.id },
      select: { id: true },
    });

    const ids = profileIds.map((p) => p.id);
    const profileCount = ids.length;

    const linkCount = profileCount > 0
      ? await db.link.count({ where: { profileId: { in: ids } } })
      : 0;

    const clickCount = profileCount > 0
      ? await db.linkClick.count({
          where: { link: { profileId: { in: ids } } },
        })
      : 0;

    const lastSession = await db.session.findFirst({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      select: { createdAt: true },
    });

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

  return rows;
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
    const linkCount = await db.link.count({
      where: { profileId: profile.id },
    });

    const clickCount = await db.linkClick.count({
      where: { link: { profileId: profile.id } },
    });

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

  const profileRows = await Promise.all(
    profiles.map(async (p) => {
      const linkCount = await db.link.count({ where: { profileId: p.id } });
      const clickCount = await db.linkClick.count({
        where: { link: { profileId: p.id } },
      });
      return {
        id: p.id,
        username: p.username,
        displayName: p.displayName,
        isPublished: p.isPublished,
        linkCount,
        clickCount,
      };
    }),
  );

  const sessionCount = await db.session.count({ where: { userId: user.id } });

  const lastSession = await db.session.findFirst({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    select: { createdAt: true },
  });

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
