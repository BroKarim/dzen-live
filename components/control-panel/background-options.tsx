"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Upload, Palette, Loader2 } from "lucide-react";
import Image from "next/image";
import type { ProfileEditorData } from "@/server/user/profile/payloads";
import { BACKGROUND_COLORS } from "@/lib/background-colors";
import { useState } from "react";
import { getUploadUrl, deleteImage } from "@/server/upload/actions";
import { compressImage } from "@/lib/media";
import { toast } from "sonner";

type BgType = "color" | "image";

interface BackgroundOptionsProps {
  profile: ProfileEditorData;
  onUpdate: (profile: ProfileEditorData) => void;
}

export default function BackgroundOptions({ profile, onUpdate }: BackgroundOptionsProps) {
  const [activeTab, setActiveTab] = useState(profile.bgType === "color" ? "color" : "image");
  const [isUploading, setIsUploading] = useState(false);

  const handleBackgroundChange = (updates: Partial<ProfileEditorData>) => {
    onUpdate({ ...profile, ...updates });
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    let file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please upload an image file");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image is too large (max 5MB)");
      return;
    }

    setIsUploading(true);

    (async () => {
      try {
        const compressed = await compressImage(file!, {
          maxSizeMB: 0.5,
          maxWidthOrHeight: 1920,
        });
        file = compressed;
      } catch (compError) {
        console.warn("Compression failed, using original file", compError);
      }

      const uploadResult = await getUploadUrl(file!.name, file!.type, "bgImage");
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
          "Content-Type": file!.type,
        },
      });

      if (!uploadResponse.ok) {
        toast.error("Failed to upload to storage");
        return;
      }

      // Delete old background image from S3 (fire-and-forget)
      if (profile.bgImage) {
        deleteImage(profile.bgImage).catch((err) => {
          console.error("Failed to delete old background image:", err);
        });
      }

      handleBackgroundChange({ bgType: "image", bgImage: publicUrl! });
    })().catch((error: any) => {
      console.error("Upload error:", error);
      toast.error(error.message || "Failed to upload background image");
    }).finally(() => {
      setIsUploading(false);
    });
  };

  return (
    <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as BgType)}>
      <TabsList className="h-10 rounded-[99px] bg-[#222] gap-1 w-full justify-center items-center shadow-dzenn inline-flex overflow-hidden ">
        <TabsTrigger value="color" asChild className="rounded-full w-full  data-[state=active]:shadow-[inset_0_1px_rgb(255_255_255/0.15)] transition-all">
          <div className="flex items-center justify-center gap-2">
            <Palette className="size-5 text-muted-foreground" />
            <span className="text-[10px] font-medium text-muted-foreground">Color</span>
          </div>
        </TabsTrigger>
        <TabsTrigger value="image" asChild className="rounded-full w-full  data-[state=active]:shadow-[inset_0_1px_rgb(255_255_255/0.15)] transition-all">
          <div className="flex items-center justify-center gap-2">
            <Upload className="size-5 text-muted-foreground" />
            <span className="text-[10px] font-medium text-muted-foreground">Image</span>
          </div>
        </TabsTrigger>
      </TabsList>

      <TabsContent value="color" className="space-y-4 pt-4">
        <div className="flex flex-wrap gap-2">
          {BACKGROUND_COLORS.map((color) => (
            <button
              key={color}
              type="button"
              onClick={() => handleBackgroundChange({ bgType: "color", bgColor: color })}
              className={`relative aspect-square size-10 rounded-md transition-all duration-200 ${
                profile.bgColor === color ? "ring-2 ring-primary ring-offset-2 ring-offset-background scale-110 z-10" : "hover:scale-110 active:scale-95 border border-black/5"
              }`}
              style={{ backgroundColor: color }}
            >
              {profile.bgColor === color && <div className="absolute inset-0 rounded-md border-2 border-primary/20 animate-pulse" />}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-3 ">
          <Input type="color" value={profile.bgColor || "#000000"} onChange={(e) => handleBackgroundChange({ bgType: "color", bgColor: e.target.value })} className="absolute -inset-2 h-12 w-16 cursor-pointer border border-white" />
          <div className="relative h-8 w-12 overflow-hidden rounded-md border shadow-sm"></div>
          <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Custom Color</span>
        </div>
      </TabsContent>
      <TabsContent value="image" className="space-y-4 pt-4">
        <div className="flex flex-col gap-4">
          <div className="relative group flex h-32 w-full flex-col items-center justify-center rounded-xl border-2 border-dashed border-muted transition-colors hover:border-primary/50 overflow-hidden">
            {profile.bgImage ? (
              <Image src={profile.bgImage} fill className="rounded-lg object-cover" alt="Background preview" unoptimized sizes="(max-width: 768px) 100vw, 300px" />
            ) : (
              <div className="flex flex-col items-center gap-2 text-muted-foreground">
                <Upload className="size-6" />
                <span className="text-xs">Upload Background</span>
              </div>
            )}
            {isUploading && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-lg">
                <Loader2 className="size-6 text-white animate-spin" />
              </div>
            )}
            <input type="file" accept="image/*" onChange={handleImageUpload} className="absolute inset-0 cursor-pointer opacity-0" disabled={isUploading} aria-label="Upload background image" />
          </div>
          {profile.bgImage && (
            <Button variant="outline" size="sm" onClick={() => handleBackgroundChange({ bgImage: null })} className="w-full text-destructive">
              Remove Image
            </Button>
          )}
        </div>
      </TabsContent>
    </Tabs>
  );
}
