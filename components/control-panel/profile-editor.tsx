"use client";

import { Camera, Loader2 } from "lucide-react";
import Image from "next/image";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import type { ProfileEditorData } from "@/server/user/profile/payloads";
import { getUploadUrl } from "@/server/upload/actions";
import { toast } from "sonner";
import { useState } from "react";
import { compressImage } from "@/lib/media";

interface ProfileEditorProps {
  profile: ProfileEditorData;
  onUpdate: (profile: ProfileEditorData) => void;
}

export function ProfileEditor({ profile, onUpdate }: ProfileEditorProps) {
  const [isUploading, setIsUploading] = useState(false);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    let file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please upload an image file");
      return;
    }

    if (file.size > 3 * 1024 * 1024) {
      toast.error("Image is too large (max 3MB)");
      return;
    }

    setIsUploading(true);

    try {
      try {
        const compressed = await compressImage(file, {
          maxSizeMB: 0.5,
          maxWidthOrHeight: 800,
        });
        file = compressed;
      } catch (compError) {
        console.warn("Compression failed, using original file", compError);
      }

      const uploadResult = await getUploadUrl(file.name, file.type);
      const url = uploadResult.url;
      const publicUrl = uploadResult.publicUrl;

      if (!uploadResult.success || !url) {
        const fallbackMsg = uploadResult.error || "Failed to get upload URL";
        toast.error(fallbackMsg);
        return;
      }

      const uploadResponse = await fetch(url, {
        method: "PUT",
        body: file,
        headers: {
          "Content-Type": file.type,
        },
      });

      if (!uploadResponse.ok) {
        toast.error("Failed to upload to storage");
        return;
      }

      onUpdate({
        ...profile,
        avatarUrl: publicUrl!,
      });
    } catch (error: any) {
      console.error("Upload error:", error);
      toast.error(error.message || "Failed to upload avatar");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <div className="relative group cursor-pointer shrink-0">
          <div className="size-14 rounded-xl overflow-hidden shadow-dzenn border-none flex items-center justify-center transition-all group-hover:border-primary/50 relative">
            {profile.avatarUrl ? <Image src={profile.avatarUrl} alt="Avatar" fill sizes="56px" className="object-cover" unoptimized /> : <Camera className="size-5 text-muted-foreground" />}
          </div>
          <input type="file" accept="image/*" aria-label="Upload avatar" className="absolute inset-0 opacity-0 cursor-pointer" onChange={handleImageUpload} disabled={isUploading} />
          <div className="absolute inset-0 flex items-center justify-center rounded-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none bg-black/40">
            {isUploading ? <Loader2 className="size-4 text-white animate-spin" /> : <Camera className="size-4 text-white" />}
          </div>
        </div>

        <div className="flex-1">
          <Input
            value={profile.displayName || ""}
            onChange={(e) => onUpdate({ ...profile, displayName: e.target.value })}
            placeholder="Display Name"
            className="h-9 text-sm font-medium bg-transparent border-0 rounded-md px-1 focus-visible:ring-0 focus-visible:shadow-dzenn border-none"
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <Textarea
          value={profile.bio || ""}
          onChange={(e) => onUpdate({ ...profile, bio: e.target.value })}
          placeholder="Write a short bio..."
          rows={2}
          className="text-sm resize-none focus-visible:ring-1 focus-visible:ring-primary/50 shadow-dzenn border-none"
        />
        <div className="flex justify-end items-center">
          <span className="text-[10px] text-muted-foreground tabular-nums">{(profile.bio || "").length}/160</span>
        </div>
      </div>
    </div>
  );
}
