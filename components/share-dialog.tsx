"use client";

import { useState } from "react";
import type * as React from "react";
import { Copy, Check, ExternalLink, Share2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from "@/components/ui/tooltip";
import { toastSuccess } from "@/lib/toast";

interface ShareDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  name: string;
  username: string | null;
  avatarUrl: string | null;
}

export function ShareDialog({ open, onOpenChange, name, username, avatarUrl }: ShareDialogProps) {
  const [copied, setCopied] = useState(false);
  const profileUrl = username ? `https://dzenn.live/${username}` : "";

  const handleCopy = async () => {
    if (!profileUrl) return;

    try {
      await navigator.clipboard.writeText(profileUrl);
      setCopied(true);
      toastSuccess("Link copied!", "Your profile link has been copied to clipboard");
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error("Failed to copy:", error);
    }
  };

  const handleOpen = () => {
    if (profileUrl) {
      window.open(profileUrl, "_blank", "noopener,noreferrer");
    }
  };

  const handleShare = async () => {
    if (!profileUrl) return;

    if (navigator.share) {
      try {
        await navigator.share({
          title: `${name} | OneURL`,
          text: `Check out ${name}'s profile on OneURL`,
          url: profileUrl,
        });
      } catch (error) {
        if ((error as Error).name !== "AbortError") {
          console.error("Error sharing:", error);
        }
      }
    } else {
      handleCopy();
    }
  };

  if (!username) {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Share your link</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* og-image for user */}
          <div className="rounded-lg bg-white p-6">
            <div className="flex flex-col items-center space-y-3">
              <Avatar className="size-16 border-2">
                {avatarUrl && <AvatarImage src={avatarUrl} alt={name} />}
                <AvatarFallback>
                  <svg className="size-8 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </AvatarFallback>
              </Avatar>
              <div className="text-center">
                <p className="font-semibold text-lg">{name}</p>
                <p className="text-sm text-muted-foreground">@{username}</p>
              </div>
            </div>
          </div>

          <div className="relative">
            <div className="flex items-center gap-2 rounded-lg border bg-background px-4 py-3">
              <span className="flex-1 font-mono text-sm text-foreground truncate">{profileUrl}</span>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button type="button" onClick={handleCopy} className="flex size-8 items-center justify-center rounded-md hover:bg-accent transition-colors shrink-0" aria-label="Copy link">
                      {copied ? <Check className="size-4 text-primary" /> : <Copy className="size-4 text-muted-foreground" />}
                    </button>
                  </TooltipTrigger>
                  <TooltipContent>{copied ? "Copied!" : "Copy link"}</TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
