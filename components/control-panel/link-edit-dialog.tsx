"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";
import { LinkSchema } from "@/server/user/links/schema";
import type { TextStyle } from "@/lib/text-style";

export interface LinkData {
  id: string;
  title: string;
  url: string;
  isActive: boolean;
  position: number;
  buttonColor?: string | null;
  buttonTextColor?: string | null;
  titleStyle?: TextStyle | null;
}

interface LinkEditDialogProps {
  link: LinkData | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (link: LinkData) => void;
}

export function LinkEditDialog({ link, open, onOpenChange, onSave }: LinkEditDialogProps) {
  const [isSaving] = useState(false);
  const [editData, setEditData] = useState({
    title: link?.title || "",
    url: link?.url || "",
  });

  const handleSave = () => {
    if (!link) return;

    const payload = {
      title: editData.title,
      url: editData.url.trim(),
      position: link.position,
      isActive: link.isActive,
      buttonColor: link.buttonColor ?? null,
      buttonTextColor: link.buttonTextColor ?? null,
      titleStyle: link.titleStyle ?? null,
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
          <Input
            value={editData.title}
            onChange={(e) => setEditData((prev) => ({ ...prev, title: e.target.value }))}
            placeholder="Link title"
            className="h-10 text-sm"
          />

          <Input
            value={editData.url}
            onChange={(e) => setEditData((prev) => ({ ...prev, url: e.target.value }))}
            placeholder="https://example.com"
            className="h-10 text-sm"
          />

          <div className="flex gap-2 pt-2">
            <Button onClick={handleSave} disabled={isSaving || !editData.title} size="sm" className="flex-1 h-9 text-sm">
              {isSaving && <Loader2 className="size-3.5 animate-spin mr-1.5" />}
              Save Changes
            </Button>
            <Button onClick={() => onOpenChange(false)} variant="ghost" size="sm" className="h-9 text-sm" disabled={isSaving}>
              Cancel
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
