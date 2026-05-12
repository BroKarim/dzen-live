"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, Plus, Link as LinkIcon, Image as ImageIcon, X } from "lucide-react";
import Image from "next/image";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { getUploadUrl } from "@/server/upload/actions";
import { compressImage } from "@/lib/media";
import { toast } from "sonner";

type LinkType = "url" | "payment" | "media";

interface LinkData {
  id: string;
  title: string;
  url: string;
  description: string | null;
  icon: string | null;
  mediaUrl: string | null;
  mediaType: "image" | "video" | null;
  paymentProvider: "stripe" | "lemonsqueezy" | null;
  paymentAccountId: string | null;
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
    if (link?.paymentProvider) {
      type = "payment";
    } else if (link?.mediaUrl) {
      type = "media";
    }

    return {
      isSaving: false,
      selectedType: type,
      iconPreview: link?.icon || null,
      mediaPreview: link?.mediaUrl || null,
    };
  });

  const [editData, setEditData] = useState({
    title: link?.title || "",
    url: link?.url || "",
    description: link?.description || "",
    icon: link?.icon || null,
    mediaUrl: link?.mediaUrl || null,
    mediaType: link?.mediaType || null,
    paymentProvider: link?.paymentProvider || null,
    paymentAccountId: link?.paymentAccountId || null,
  });

  const handleIconUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    let file = e.target.files?.[0];
    if (!file) return;

    const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/x-icon", "image/vnd.microsoft.icon", "image/svg+xml", "image/jpg"];
    if (!allowedTypes.includes(file.type)) {
      toast.error("Invalid file type. Please upload JPG, PNG, WebP, ICO or SVG.");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image size too large (max 5MB)");
      return;
    }

    try {
      // 1. Client-side Compression (skip for ICO/SVG)
      if (!file.type.includes("svg") && !file.type.includes("icon")) {
        try {
          const compressed = await compressImage(file, {
            maxSizeMB: 0.1,
            maxWidthOrHeight: 256,
          });
          file = compressed;
        } catch (err) {
          console.warn("Compression failed, using original", err);
        }
      }

      // 2. Get Presigned URL
      const uploadResult = await getUploadUrl(file.name, file.type);
      const url = uploadResult.url;
      const publicUrl = uploadResult.publicUrl;

      if (!uploadResult.success || !url) {
        const fallbackMsg = uploadResult.error || "Failed to get upload URL";
        throw new Error(fallbackMsg);
      }

      // 3. Upload to S3
      const res = await fetch(url, {
        method: "PUT",
        body: file,
        headers: { "Content-Type": file.type },
      });

      if (!res.ok) throw new Error("Failed to upload icon to S3");

      const updatedData = { ...editData, icon: publicUrl! };
      setEditData(updatedData);
      setUiState((prev) => ({ ...prev, iconPreview: publicUrl! }));

      if (link) {
        onSave({
          ...link,
          icon: publicUrl!,
        });
      }
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || "Error uploading icon");
      setUiState((prev) => ({ ...prev, iconPreview: editData.icon })); // Revert preview
    }
  };

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
      // 1. Client-side Compression
      try {
        const compressed = await compressImage(file, {
          maxSizeMB: 0.5,
          maxWidthOrHeight: 800,
        });
        file = compressed;
      } catch (err) {
        console.warn("Compression failed, using original", err);
      }

      // 2. Get Presigned URL
      const mediaUploadRes = await getUploadUrl(file.name, file.type);
      const mediaUrl = mediaUploadRes.url;
      const mediaPublicUrl = mediaUploadRes.publicUrl;

      if (!mediaUploadRes.success || !mediaUrl) {
        const fallbackMsg = mediaUploadRes.error || "Failed to get upload URL";
        throw new Error(fallbackMsg);
      }

      // 3. Upload to S3
      const res = await fetch(mediaUrl, {
        method: "PUT",
        body: file,
        headers: { "Content-Type": file.type },
      });

      if (!res.ok) throw new Error("Failed to upload media to S3");

      const updatedData = {
        ...editData,
        mediaUrl: mediaPublicUrl!,
        mediaType: "image" as const, // Explicitly cast
      };
      setEditData(updatedData);
      setUiState((prev) => ({ ...prev, mediaPreview: mediaPublicUrl! }));

      if (link) {
        onSave({
          ...link,
          mediaUrl: mediaPublicUrl!,
          mediaType: "image",
        });
      }
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || "Error uploading media");
      setUiState((prev) => ({ ...prev, mediaPreview: editData.mediaUrl }));
    }
  };

  const handlePaymentSelect = (provider: "stripe" | "lemonsqueezy") => {
    setEditData(prev => ({
      ...prev,
      paymentProvider: provider,
      paymentAccountId: "dummy-account-id",
    }));
  };

  const handleSave = async () => {
    if (!link) return;

    const { LinkSchema } = await import("@/server/user/links/schema");
    const payload = {
      title: editData.title,
      url: editData.url.trim(),
      description: editData.description || null,
      icon: editData.icon || null,
      mediaUrl: editData.mediaUrl || null,
      mediaType: editData.mediaType || null,
      paymentProvider: editData.paymentProvider || null,
      paymentAccountId: editData.paymentAccountId || null,
      position: link.position,
      isActive: link.isActive,
    };

    const validation = LinkSchema.safeParse(payload);
    if (!validation.success) {
      toast.error(validation.error.issues[0].message);
      return;
    }

    // Just update the local state, don't save to DB yet
    onSave({ ...link, ...payload });
    onOpenChange(false);
  };

  const typeOptions = [
    { id: "url" as LinkType, icon: LinkIcon, label: "URL" },
    // { id: "payment" as LinkType, icon: CreditCard, label: "Payment" },
    { id: "media" as LinkType, icon: ImageIcon, label: "Media" },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-sm">Edit Link</DialogTitle>
        </DialogHeader>

        <div className="space-y-3">
          {/* Icon Upload */}
          <div className="flex gap-3">
            <div className="relative shrink-0">
              <input id="edit-icon-upload" type="file" accept="image/*" onChange={handleIconUpload} className="absolute inset-0 size-full opacity-0 cursor-pointer z-20" />
              <label
                htmlFor="edit-icon-upload"
                className="size-12 rounded-lg border border-dashed border-border bg-muted/50 flex items-center justify-center cursor-pointer hover:border-primary/50 transition-colors overflow-hidden relative"
              >
                {uiState.iconPreview ? <Image src={uiState.iconPreview} alt="Icon" fill sizes="40px" className="object-cover" unoptimized /> : <Plus className="size-4 text-muted-foreground" />}
              </label>
            </div>

            <div className="flex-1 space-y-2">
              <Input value={editData.title} onChange={(e) => setEditData(prev => ({ ...prev, title: e.target.value }))} placeholder="Link title" className="h-10 text-sm" />
            </div>
          </div>

          {/* Description */}
          <Input value={editData.description} onChange={(e) => setEditData(prev => ({ ...prev, description: e.target.value }))} placeholder="Description (optional)" className="h-10 text-sm" />

          {/* Type Selector */}
          <div className="flex gap-1 p-1 bg-muted/50 rounded-lg">
            {typeOptions.map((type) => {
              const Icon = type.icon;
              const isActive = uiState.selectedType === type.id;

              return (
                <button
                  key={type.id}
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

          {/* Dynamic Content */}
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

          {/* Actions */}
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
