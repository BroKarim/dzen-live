"use client";

import { useState } from "react";
import { RotateCcw, Globe, Copy, Check, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { DomainView } from "@/components/domain-view";
import { ProfileEditorData } from "@/server/user/profile/payloads";
import { useEditorStore } from "@/lib/stores/editor-store";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { toastSuccess } from "@/lib/toast";

interface EditorHeaderProps {
  profile: ProfileEditorData;
  onTogglePublish: (publish: boolean) => Promise<{ success: boolean; error?: string }>;
  onViewSite: () => void;
}

export default function EditorHeader({ profile, onTogglePublish, onViewSite }: EditorHeaderProps) {
  const baseUrl = (process.env.NEXT_PUBLIC_APP_URL || "dzenn.live").replace(/https?:\/\//, "");
  const { isDirty, discardChanges, draftProfile } = useEditorStore();
  const username = draftProfile?.username || profile.username || "user";
  const fullUrl = `${baseUrl}/${username}`;

  const handleDiscard = () => {
    discardChanges();
  };

  return (
    <header className="bg-background/95 sticky top-0 z-50 px-4 md:px-6 py-3 border-b">
      <div className="flex items-center justify-between gap-2">
        {/* Left: Logo + DomainView */}
        <div className="flex items-center gap-3 min-w-0">
          <Link href="/" className="size-9 md:w-10 md:h-10 flex items-center justify-center rounded-full bg-[#222] border-none text-white font-bold text-sm transition-all hover:scale-105 active:scale-95 shrink-0 shadow-dzenn">
            Dz
          </Link>
          {/* DomainView hidden on mobile */}
          <div className="hidden sm:block min-w-0">
            <DomainView
              placeholder={fullUrl}
              value={fullUrl}
              buttonCopy={{
                idle: "Copy",
                success: "Copied!",
              }}
            />
          </div>
        </div>

        {/* Right: Status indicator & Discard Button */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Discard: visible when dirty */}
          {isDirty && (
            <Button onClick={handleDiscard} size="sm" variant="ghost" className="h-8 gap-1.5 text-xs hover:bg-destructive/10 hover:text-destructive transition-colors px-2">
              <RotateCcw className="size-3.5" />
              <span className="hidden sm:inline">Discard</span>
            </Button>
          )}

          {/* Publish button */}
          <PublishPopover profile={profile} onTogglePublish={onTogglePublish} onViewSite={onViewSite} />
        </div>
      </div>
    </header>
  );
}

function PublishPopover({
  profile,
  onTogglePublish,
  onViewSite,
}: {
  profile: ProfileEditorData;
  onTogglePublish: (publish: boolean) => Promise<{ success: boolean; error?: string }>;
  onViewSite: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [copied, setCopied] = useState(false);

  const isPublished = profile.isPublished;
  const name = profile.displayName || profile.username || "User";
  const username = profile.username;
  const avatarUrl = profile.avatarUrl;
  const profileUrl = username ? `https://dzenn.live/${username}` : "";
  const displayNameStyle = profile.displayNameStyle as { color?: string } | null;

  const cardBackgroundStyle: React.CSSProperties =
    profile.bgType === "color"
      ? { backgroundColor: profile.bgColor }
      : { backgroundImage: `url(${(profile.bgType === "wallpaper" ? profile.bgWallpaper : profile.bgImage) ?? ""})`, backgroundSize: "cover", backgroundPosition: "center" };

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

  async function handlePublish() {
    setIsPublishing(true);
    const result = await onTogglePublish(true);
    setIsPublishing(false);
    if (result.success) {
      setOpen(false);
    }
  }

  async function handleUnpublish() {
    setIsPublishing(true);
    const result = await onTogglePublish(false);
    setIsPublishing(false);
    if (result.success) {
      setOpen(false);
    }
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button size="sm" variant={isPublished ? "default" : "outline"} className="h-8 gap-1.5 text-xs bg-[#222]  shadow-dzenn text-white">
          <Globe className="size-3.5" />
          <span className="hidden sm:inline">{isPublished ? "Published" : "Publish"}</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80" side="bottom" align="end" sideOffset={8}>
        {!isPublished ? (
          <div className="space-y-4">
            <div>
              <h4 className="font-medium text-sm">Publish to Web</h4>
              <p className="text-xs text-muted-foreground">Make your profile publicly accessible</p>
            </div>

            <div className="rounded-lg p-6" style={cardBackgroundStyle}>
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
                  <p className="font-semibold text-lg" style={{ color: displayNameStyle?.color }}>{name}</p>
                  <p className="text-sm" style={{ color: displayNameStyle?.color }}>@{username}</p>
                </div>
              </div>
            </div>

            <Button className="w-full bg-[#222] shadow-dzenn" onClick={handlePublish} disabled={isPublishing}>
              {isPublishing ? (
                <Loader2 className="size-4 animate-spin mr-2" />
              ) : (
                <Globe className="size-4 mr-2" />
              )}
              Publish
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <h4 className="font-medium text-sm">Your Profile is Live</h4>
              <p className="text-xs text-muted-foreground">Anyone with the link can view your profile</p>
            </div>

            <div className="rounded-lg p-6" style={cardBackgroundStyle}>
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
                  <p className="font-semibold text-lg" style={{ color: displayNameStyle?.color }}>{name}</p>
                  <p className="text-sm" style={{ color: displayNameStyle?.color }}>@{username}</p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 rounded-lg border  bg-[#222] shadow-dzenn px-4 py-3">
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

            <div className="flex gap-1">
              <Button variant="outline" size="sm" className="flex-1 bg-[#222] shadow-dzenn text-white" onClick={handleUnpublish} disabled={isPublishing}>
                {isPublishing ? <Loader2 className="size-3.5 animate-spin mr-1.5" /> : null}
                Unpublish
              </Button>
              <Button variant="outline" size="sm" className="flex-1 bg-[#222] shadow-dzenn text-white" onClick={onViewSite}>
                View Site
              </Button>
            </div>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}
