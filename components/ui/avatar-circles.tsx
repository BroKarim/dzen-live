import * as React from "react";
import { cn } from "@/lib/utils";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

interface AvatarCirclesProps {
  numPeople?: number;
  avatarUrls: {
    imageUrl: string;
    profileUrl?: string;
  }[];
  className?: string;
}

export function AvatarCircles({ numPeople, avatarUrls, className }: AvatarCirclesProps) {
  return (
    <div className={cn("flex -space-x-2 overflow-hidden", className)}>
      {avatarUrls.map((avatar) => (
        <Avatar key={avatar.imageUrl} className="inline-block border-2 border-background ring-2 ring-background">
          <AvatarImage src={avatar.imageUrl} />
          <AvatarFallback>?</AvatarFallback>
        </Avatar>
      ))}
      {(numPeople ?? 0) > 0 && <div className="flex size-10 items-center justify-center rounded-full border-2 border-background bg-muted text-xs font-medium ring-2 ring-background">+{numPeople}</div>}
    </div>
  );
}
