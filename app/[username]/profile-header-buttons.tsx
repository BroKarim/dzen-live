"use client";

import { useState } from "react";
import type * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { Share2 } from "lucide-react";
import { ShareDialog } from "@/components/share-dialog";
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from "@/components/ui/tooltip";

interface ProfileHeaderButtonsProps {
  name: string;
  username: string | null;
  avatarUrl: string | null;
}

export function ProfileHeaderButtons({ name, username, avatarUrl }: ProfileHeaderButtonsProps) {
  const [shareDialogOpen, setShareDialogOpen] = useState(false);

  return (
    <>
      <TooltipProvider>
        <div className="flex items-center justify-end">
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                type="button"
                onClick={() => setShareDialogOpen(true)}
                className="flex size-10 items-center justify-center rounded-full bg-white/10 backdrop-blur-md text-white border border-white/10 hover:bg-white/20 transition-all shadow-xl"
                aria-label="Share profile"
              >
                <Share2 className="size-4" />
              </button>
            </TooltipTrigger>
            <TooltipContent>Share profile</TooltipContent>
          </Tooltip>
        </div>
      </TooltipProvider>

      {username && <ShareDialog open={shareDialogOpen} onOpenChange={setShareDialogOpen} name={name} username={username} avatarUrl={avatarUrl} />}
    </>
  );
}
