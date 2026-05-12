"use server";

import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";

export async function getOnboardingStatus() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
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
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) throw new Error("Unauthorized");
  const existing = await db.profile.findUnique({
    where: { username: username.toLowerCase() },
  });
  return !existing;
}

export async function setupUsername(username: string) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (!session?.user) throw new Error("Unauthorized");

  const formattedUsername = username.toLowerCase();

  // Update User & Create Initial Profile in one transaction
  await db.$transaction([
    db.user.update({
      where: { id: session.user.id },
      data: {
        isOnboarded: true,
      },
    }),
    db.profile.create({
      data: {
        userId: session.user.id,
        username: formattedUsername,
        displayName: session.user.name || formattedUsername,
        // Default design state bisa ditaruh di sini
      },
    }),
  ]);

  revalidatePath("/dashboard");
  return { success: true, username: formattedUsername };
}

function slugify(text: string) {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-") // Replace spaces with -
    .replace(/[^\w\-]+/g, "") // Remove all non-word chars
    .replace(/\-\-+/g, "-") // Replace multiple - with single -
    .replace(/^-+/, "") // Trim - from start
    .replace(/-+$/, ""); // Trim - from end
}

export async function ensureUserHasProfile() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (!session?.user) throw new Error("Unauthorized");

  // Check existing
  const user = await db.user.findUnique({
    where: { id: session.user.id },
    include: { profiles: { take: 1 } },
  });

  if (!user) throw new Error("User not found");

  if (user.profiles[0]) {
    // Ensure isOnboarded is true if profile exists
    if (!user.isOnboarded) {
      await db.user.update({ where: { id: user.id }, data: { isOnboarded: true } });
    }
    return { success: true, username: user.profiles[0].username };
  }

  // Create new profile
  let baseUsername = slugify(user.name || user.email.split("@")[0] || "user");
  if (baseUsername.length < 3) baseUsername = "user-" + baseUsername; // ensure min length

  let username = baseUsername;
  let counter = 1;

  while (true) {
    const existing = await db.profile.findUnique({ where: { username } });
    if (!existing) break;
    username = `${baseUsername}-${counter}`;
    counter++;
  }

  await db.$transaction([
    db.user.update({
      where: { id: session.user.id },
      data: { isOnboarded: true },
    }),
    db.profile.create({
      data: {
        userId: session.user.id,
        username,
        displayName: user.name || username,
        avatarUrl: user.image,
      },
    }),
  ]);

  return { success: true, username };
}

export async function updateProfileUsername(username: string) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (!session?.user) throw new Error("Unauthorized");

  const formattedUsername = username.toLowerCase().trim();

  // Check availability
  const existing = await db.profile.findUnique({
    where: { username: formattedUsername },
  });

  if (existing && existing.userId !== session.user.id) {
    return { success: false, error: "Username is already taken" };
  }

  // Get user's profile
  const profile = await db.profile.findFirst({
    where: { userId: session.user.id },
  });

  if (!profile) {
    return { success: false, error: "Profile not found" };
  }

  // Update username
  await db.profile.update({
    where: { id: profile.id },
    data: { username: formattedUsername },
  });

  revalidatePath("/editor");
  revalidatePath(`/editor/${formattedUsername}`);
  return { success: true, username: formattedUsername };
}

export async function togglePublishStatus(isPublished: boolean) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (!session?.user) throw new Error("Unauthorized");

  const profile = await db.profile.findFirst({
    where: { userId: session.user.id },
  });

  if (!profile) {
    return { success: false, error: "Profile not found" };
  }

  await db.profile.update({
    where: { id: profile.id },
    data: { isPublished },
  });

  revalidatePath("/editor");
  revalidatePath(`/${profile.username}`);
  return { success: true };
}

export async function deleteProfileOrAccount() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (!session?.user) throw new Error("Unauthorized");

  // Get all user profiles
  const user = await db.user.findUnique({
    where: { id: session.user.id },
    include: { profiles: true },
  });

  if (!user) {
    return { success: false, error: "User not found" };
  }

  const profileCount = user.profiles.length;

  if (profileCount === 0) {
    return { success: false, error: "No profile to delete" };
  }

  if (profileCount === 1) {
    // Delete entire user account (cascade will delete profile)
    await db.user.delete({
      where: { id: session.user.id },
    });

    // Sign out user
    await auth.api.signOut({
      headers: await headers(),
    });

    return { success: true, redirect: "/" };
  } else {
    // Delete current profile, redirect to another
    const currentProfile = user.profiles[0];
    const otherProfile = user.profiles.find((p) => p.id !== currentProfile.id);

    await db.profile.delete({
      where: { id: currentProfile.id },
    });

    revalidatePath("/editor");
    return {
      success: true,
      redirect: otherProfile ? `/editor/${otherProfile.username}` : "/editor",
    };
  }
}
