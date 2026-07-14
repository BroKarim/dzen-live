"use server";

import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { deleteFromS3 } from "@/lib/s3";

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

    // Clean up S3 assets before deletion
    const userAssets = await db.asset.findMany({ where: { userId } });
    for (const asset of userAssets) {
      await deleteFromS3(asset.url).catch((err) => console.error("[admin] S3 cleanup failed:", err));
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

    // Clean up S3 assets for this profile
    const profileAssets = await db.asset.findMany({ where: { profileId } });
    for (const asset of profileAssets) {
      await deleteFromS3(asset.url).catch((err) => console.error("[admin] S3 cleanup failed:", err));
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

export async function deleteAsset(
  assetId: string,
): Promise<{ success: boolean; error?: string }> {
  try {
    await requireAdmin();

    const asset = await db.asset.findUnique({ where: { id: assetId } });
    if (!asset) {
      return { success: false, error: "Asset not found" };
    }

    await deleteFromS3(asset.url);
    await db.asset.delete({ where: { id: assetId } });

    revalidatePath("/admin/assets");
    return { success: true };
  } catch (error: any) {
    console.error("[admin/actions] deleteAsset:", error);
    return { success: false, error: error.message || "Failed to delete asset" };
  }
}
