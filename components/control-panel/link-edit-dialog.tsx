"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, Link as LinkIcon, Image as ImageIcon } from "lucide-react";
import Image from "next/image";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { getUploadUrl } from "@/server/upload/actions";
import { compressImage } from "@/lib/media";
import { toast } from "sonner";
import { LinkSchema } from "@/server/user/links/schema";

type LinkType = "url" | "media";

const typeOptions = [
  { id: "url" as LinkType, icon: LinkIcon, label: "URL" },
  { id: "media" as LinkType, icon: ImageIcon, label: "Media" },
];

export interface LinkData {
  id: string;
  title: string;
  url: string;
  description: string | null;
  mediaUrl: string | null;
  isActive: boolean;
  position: number;
}

interface LinkEditDialogProps {
  link: LinkData | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (link: LinkData) => void;
}

export function LinkEditDialog({ link, open, onOpenChange, onSave }: LinkEditDialogProps) {
  const [uiState, setUiState] = useState(() => {
    let type: LinkType = "url";
    if (link?.mediaUrl) {
      type = "media";
    }

    return {
      isSaving: false,
      selectedType: type,
      mediaPreview: link?.mediaUrl || null,
    };
  });

  const [editData, setEditData] = useState({
    title: link?.title || "",
    url: link?.url || "",
    description: link?.description || "",
    mediaUrl: link?.mediaUrl || null,
  });

  const handleMediaUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    let file = e.target.files?.[0];
    if (!file) return;

    const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/jpg"];
    if (!allowedTypes.includes(file.type)) {
      toast.error("Invalid file type. Please upload JPG, PNG or WebP.");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      toast.error("Image size too large (max 10MB)");
      return;
    }

    try {
      try {
        const compressed = await compressImage(file, {
          maxSizeMB: 0.5,
          maxWidthOrHeight: 800,
        });
        file = compressed;
      } catch (err) {
        console.warn("Compression failed, using original", err);
      }

      const mediaUploadRes = await getUploadUrl(file.name, file.type);
      const mediaUrl = mediaUploadRes.url;
      const mediaPublicUrl = mediaUploadRes.publicUrl;

      if (!mediaUploadRes.success || !mediaUrl) {
        const fallbackMsg = mediaUploadRes.error || "Failed to get upload URL";
        toast.error(fallbackMsg);
        return;
      }

      const res = await fetch(mediaUrl, {
        method: "PUT",
        body: file,
        headers: { "Content-Type": file.type },
      });

      if (!res.ok) {
        toast.error("Failed to upload media to S3");
        return;
      }

      const updatedData = { ...editData, mediaUrl: mediaPublicUrl! };
      setEditData(updatedData);
      setUiState((prev) => ({ ...prev, mediaPreview: mediaPublicUrl! }));

      if (link) {
        onSave({
          ...link,
          mediaUrl: mediaPublicUrl!,
        });
      }
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || "Error uploading media");
      setUiState((prev) => ({ ...prev, mediaPreview: editData.mediaUrl }));
    }
  };

  const handleSave = async () => {
    if (!link) return;

    const payload = {
      title: editData.title,
      url: editData.url.trim(),
      description: editData.description || null,
      mediaUrl: editData.mediaUrl || null,
      position: link.position,
      isActive: link.isActive,
    };

    const validation = LinkSchema.safeParse(payload);
    if (!validation.success) {
      toast.error(validation.error.issues[0].message);
      return;
    }

    onSave({ ...link, ...payload });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-sm">Edit Link</DialogTitle>
        </DialogHeader>

        <div className="space-y-3">
          <Input value={editData.title} onChange={(e) => setEditData(prev => ({ ...prev, title: e.target.value }))} placeholder="Link title" className="h-10 text-sm" />

          <Input value={editData.description} onChange={(e) => setEditData(prev => ({ ...prev, description: e.target.value }))} placeholder="Description (optional)" className="h-10 text-sm" />

          <div className="flex gap-1 p-1 bg-muted/50 rounded-lg">
            {typeOptions.map((type) => {
              const Icon = type.icon;
              const isActive = uiState.selectedType === type.id;

              return (
                <button
                  key={type.id}
                  type="button"
                  onClick={() => setUiState((prev) => ({ ...prev, selectedType: type.id }))}
                  className={`
                    flex-1 flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-md text-xs font-medium transition-all
                    ${isActive ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}
                  `}
                >
                  <Icon className="size-3.5" />
                  <span>{type.label}</span>
                </button>
              );
            })}
          </div>

          {uiState.selectedType === "url" && <Input value={editData.url} onChange={(e) => setEditData(prev => ({ ...prev, url: e.target.value }))} placeholder="https://example.com" className="h-10 text-sm" />}

          {uiState.selectedType === "media" && (
            <div className="relative">
              <input id="edit-media-upload" type="file" accept="image/*" onChange={handleMediaUpload} className="absolute inset-0 size-full opacity-0 cursor-pointer z-20" />
              <label
                htmlFor="edit-media-upload"
                className="h-20 rounded-lg border border-dashed border-border bg-muted/50 flex flex-col items-center justify-center cursor-pointer hover:border-primary/50 transition-colors overflow-hidden relative"
              >
                {uiState.mediaPreview ? (
                  <Image src={uiState.mediaPreview} alt="Media" fill sizes="(max-width: 768px) 100vw, 400px" className="object-cover" unoptimized />
                ) : (
                  <>
                    <ImageIcon className="size-5 text-muted-foreground mb-1" />
                    <span className="text-[10px] text-muted-foreground">Click to upload</span>
                  </>
                )}
              </label>
            </div>
          )}

          <div className="flex gap-2 pt-2">
            <Button onClick={handleSave} disabled={uiState.isSaving || !editData.title} size="sm" className="flex-1 h-9 text-sm">
              {uiState.isSaving && <Loader2 className="size-3.5 animate-spin mr-1.5" />}
              Save Changes
            </Button>
            <Button onClick={() => onOpenChange(false)} variant="ghost" size="sm" className="h-9 text-sm" disabled={uiState.isSaving}>
              Cancel
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
