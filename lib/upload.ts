import { compressImage } from "@/lib/media";
import { getUploadUrl } from "@/server/upload/actions";

export interface UploadOptions {
  allowedTypes: string[];
  maxSizeMB: number;
  compression?: {
    maxSizeMB: number;
    maxWidthOrHeight: number;
  };
  skipCompressionFor?: string[];
}

export async function uploadFile(file: File, options: UploadOptions): Promise<string> {
  if (!options.allowedTypes.includes(file.type)) {
    throw new Error(`Invalid file type. Allowed: ${options.allowedTypes.map((t) => t.split("/")[1]).join(", ").toUpperCase()}`);
  }

  if (file.size > options.maxSizeMB * 1024 * 1024) {
    throw new Error(`File too large (max ${options.maxSizeMB}MB)`);
  }

  if (options.compression && (!options.skipCompressionFor || !options.skipCompressionFor.some((f) => file.type.includes(f)))) {
    try {
      file = await compressImage(file, options.compression);
    } catch {
      // Compression failure is non-blocking — proceed with original
    }
  }

  const uploadRes = await getUploadUrl(file.name, file.type);

  if (!uploadRes.success || !uploadRes.url) {
    throw new Error(uploadRes.error || "Failed to get upload URL");
  }

  const res = await fetch(uploadRes.url, {
    method: "PUT",
    body: file,
    headers: { "Content-Type": file.type },
  });

  if (!res.ok) throw new Error("Failed to upload to S3");

  return uploadRes.publicUrl!;
}
