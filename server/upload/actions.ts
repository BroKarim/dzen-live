"use server";

import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { uploadBase64ToS3, getPresignedUploadUrl, deleteFromS3 } from "@/lib/s3";

export async function uploadImage(base64: string, fileName: string) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return { success: false, error: "Unauthorized" };
    }

    const url = await uploadBase64ToS3(base64, fileName);

    return { success: true, url };
  } catch (error) {
    console.error("Failed to upload image:", error);
    return { success: false, error: "Failed to upload image" };
  }
}


export async function getUploadUrl(
  fileName: string,
  contentType: string,
  assetType: "avatar" | "bgImage" = "avatar",
) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return { success: false, error: "Unauthorized" };
    }

    if (!contentType.startsWith("image/")) {
      return { success: false, error: "Only images are allowed" };
    }

    const folder = `uploads/${session.user.id}/${assetType}`;
    const { url, key, publicUrl } = await getPresignedUploadUrl(fileName, contentType, folder);

    return { success: true, url, key, publicUrl };
  } catch (error) {
    console.error("Failed to get upload URL:", error);
    return { success: false, error: "Failed to get upload URL" };
  }
}

export async function deleteImage(url: string) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return { success: false as const, error: "Unauthorized" };
    }

    await deleteFromS3(url);

    return { success: true as const };
  } catch (error) {
    console.error("Failed to delete image:", error);
    return { success: false as const, error: "Failed to delete image" };
  }
}
