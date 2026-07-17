"use server";

import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { getSession } from "@/server/user/auth";
import { revalidateTag } from "next/cache";
import { headers } from "next/headers";

export async function getOnboardingStatus() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) return { isOnboarded: false };

  const user = await db.user.findUnique({
    where: { id: session.user.id },
    select: {
      isOnboarded: true,
      profiles: {
        select: { username: true },
        take: 1,
      },
    },
  });

  return {
    isOnboarded: user?.isOnboarded ?? false,
    username: user?.profiles[0]?.username,
  };
}

export async function checkUsernameAvailability(username: string) {
  const [user, existing] = await Promise.all([
    getSession(),
    db.profile.findUnique({
      where: { username: username.toLowerCase() },
    }),
  ]);
  return !existing;
}

export async function setupUsername(username: string) {
  try {
    const user = await getSession();

    const formattedUsername = username.toLowerCase();

    await db.$transaction([
      db.user.update({
        where: { id: user.id },
        data: { isOnboarded: true },
      }),
      db.profile.create({
        data: {
          userId: user.id,
          username: formattedUsername,
          displayName: user.name || formattedUsername,
        },
      }),
    ]);

    revalidateTag(`profile-meta-${formattedUsername}`, "minutes");
    revalidateTag(`editor-profile-${user.id}`, "minutes");
    revalidateTag(`editor-profile-username-${formattedUsername}`, "minutes");
    return { success: true, username: formattedUsername };
  } catch (error: any) {
    console.error("[settings/actions] setupUsername:", error);
    return { success: false, error: error.message || "An error occurred" };
  }
}

function slugify(text: string) {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^\w\-]+/g, "")
    .replace(/\-\-+/g, "-")
    .replace(/^-+/, "")
    .replace(/-+$/, "");
}

export async function ensureUserHasProfile() {
  try {
    const user = await getSession();

    const dbUser = await db.user.findUnique({
      where: { id: user.id },
      include: { profiles: { take: 1 } },
    });

    if (!dbUser) throw new Error("User not found");

    if (dbUser.profiles[0]) {
      if (!dbUser.isOnboarded) {
        await db.user.update({ where: { id: dbUser.id }, data: { isOnboarded: true } });
      }
      return { success: true, username: dbUser.profiles[0].username };
    }

    let baseUsername = slugify(dbUser.name || dbUser.email.split("@")[0] || "user");
    if (baseUsername.length < 3) baseUsername = "user-" + baseUsername;

    let newUsername = baseUsername;
    let counter = 1;

    while (true) {
      const existing = await db.profile.findUnique({ where: { username: newUsername } });
      if (!existing) break;
      newUsername = `${baseUsername}-${counter}`;
      counter++;
    }

    await db.$transaction([
      db.user.update({ where: { id: dbUser.id }, data: { isOnboarded: true } }),
      db.profile.create({
        data: {
          userId: dbUser.id,
          username: newUsername,
          displayName: dbUser.name || newUsername,
          avatarUrl: dbUser.image,
        },
      }),
    ]);

    return { success: true, username: newUsername };
  } catch (error: any) {
    console.error("[settings/actions] ensureUserHasProfile:", error);
    return { success: false, error: error.message || "An error occurred" };
  }
}

export async function updateProfileUsername(username: string) {
  try {
    const user = await getSession();

    const formattedUsername = username.toLowerCase().trim();

    const existing = await db.profile.findUnique({
      where: { username: formattedUsername },
    });

    if (existing && existing.userId !== user.id) {
      return { success: false, error: "Username is already taken" };
    }

    const profile = await db.profile.findFirst({
      where: { userId: user.id },
    });

    if (!profile) {
      return { success: false, error: "Profile not found" };
    }

    await db.profile.update({
      where: { id: profile.id },
      data: { username: formattedUsername },
    });

    revalidateTag(`profile-meta-${profile.username}`, "minutes");
    revalidateTag(`profile-meta-${formattedUsername}`, "minutes");
    revalidateTag(`editor-profile-${user.id}`, "minutes");
    revalidateTag(`editor-profile-username-${profile.username}`, "minutes");
    revalidateTag(`editor-profile-username-${formattedUsername}`, "minutes");
    return { success: true, username: formattedUsername };
  } catch (error: any) {
    console.error("[settings/actions] updateProfileUsername:", error);
    return { success: false, error: error.message || "An error occurred" };
  }
}

export async function togglePublishStatus(isPublished: boolean) {
  try {
    const user = await getSession();

    const profile = await db.profile.findFirst({
      where: { userId: user.id },
    });

    if (!profile) {
      return { success: false, error: "Profile not found" };
    }

    await db.profile.update({
      where: { id: profile.id },
      data: { isPublished },
    });

    revalidateTag(`profile-meta-${profile.username}`, "minutes");
    revalidateTag(`links-${profile.id}`, "minutes");
    revalidateTag(`editor-profile-${user.id}`, "minutes");
    return { success: true };
  } catch (error: any) {
    console.error("[settings/actions] togglePublishStatus:", error);
    return { success: false, error: error.message || "An error occurred" };
  }
}

export async function deleteProfileOrAccount() {
  try {
    const user = await getSession();

    const dbUser = await db.user.findUnique({
      where: { id: user.id },
      include: { profiles: true },
    });

    if (!dbUser) {
      return { success: false, error: "User not found" };
    }

    const profileCount = dbUser.profiles.length;

    if (profileCount === 0) {
      return { success: false, error: "No profile to delete" };
    }

    if (profileCount === 1) {
      await db.user.delete({ where: { id: dbUser.id } });

      await auth.api.signOut({
        headers: await headers(),
      });

      return { success: true, redirect: "/" };
    }

    const currentProfile = dbUser.profiles[0];
    const otherProfile = dbUser.profiles.find((p) => p.id !== currentProfile.id);

    await db.profile.delete({ where: { id: currentProfile.id } });

    return {
      success: true,
      redirect: otherProfile ? `/editor/${otherProfile.username}` : "/editor",
    };
  } catch (error: any) {
    console.error("[settings/actions] deleteProfileOrAccount:", error);
    return { success: false, error: error.message || "An error occurred" };
  }
}