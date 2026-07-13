"use server";

import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";

async function requireAdmin() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) throw new Error("Unauthorized");
  if (session.user.role !== "ADMIN") throw new Error("Forbidden: admin role required");
  return session.user;
}

export async function deleteUser(
  userId: string,
  mode: "soft" | "hard" = "hard",
): Promise<{ success: boolean; error?: string }> {
  try {
    await requireAdmin();

    const user = await db.user.findUnique({
      where: { id: userId },
      include: { profiles: { select: { id: true } } },
    });

    if (!user) {
      return { success: false, error: "User not found" };
    }

    if (mode === "hard") {
      await db.user.delete({ where: { id: userId } });
    } else {
      await db.profile.updateMany({
        where: { userId },
        data: { isPublished: false },
      });
    }

    revalidatePath("/admin");
    return { success: true };
  } catch (error: any) {
    console.error("[admin/actions] deleteUser:", error);
    return { success: false, error: error.message || "Failed to delete user" };
  }
}

export async function deleteProfile(
  profileId: string,
  mode: "soft" | "hard" = "hard",
): Promise<{ success: boolean; error?: string }> {
  try {
    await requireAdmin();

    const profile = await db.profile.findUnique({ where: { id: profileId } });
    if (!profile) {
      return { success: false, error: "Profile not found" };
    }

    if (mode === "hard") {
      await db.profile.delete({ where: { id: profileId } });
    } else {
      await db.profile.update({
        where: { id: profileId },
        data: { isPublished: false },
      });
    }

    revalidatePath("/admin");
    return { success: true };
  } catch (error: any) {
    console.error("[admin/actions] deleteProfile:", error);
    return { success: false, error: error.message || "Failed to delete profile" };
  }
}
