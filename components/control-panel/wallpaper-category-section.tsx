"use client";

import { useState, useCallback } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import Image from "next/image";
import type { BackgroundPreset } from "@/server/website/background-presets/schema";

interface WallpaperCategorySectionProps {
  category: string;
  wallpapers: BackgroundPreset[];
  selectedWallpaper: string | null;
  onSelect: (url: string) => void;
}

export default function WallpaperCategorySection({ category, wallpapers, selectedWallpaper, onSelect }: WallpaperCategorySectionProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  // Memoize handlers to avoid recreating on every render
  const handleExpand = useCallback(() => setIsExpanded(true), []);
  const handleCollapse = useCallback(() => setIsExpanded(false), []);

  // Tampilkan 5 gambar pertama + 1 button expand
  const initialDisplayCount = 5;
  const hasMore = wallpapers.length > initialDisplayCount;
  const displayedWallpapers = isExpanded ? wallpapers : wallpapers.slice(0, initialDisplayCount);

  return (
    <div className="space-y-2">
      <div className="grid grid-cols-3 gap-2">
        {displayedWallpapers.map((preset) => {
          const isSelected = selectedWallpaper === preset.url;

          return (
            <button
              key={preset.id}
              type="button"
              onClick={() => onSelect(preset.url)}
              className={`relative h-20 overflow-hidden rounded-lg border-2 transition-[border-color,transform] duration-200 ${
                isSelected ? "border-primary ring-2 ring-primary/20 ring-offset-2 ring-offset-background scale-105" : "border-transparent hover:border-primary/50 hover:scale-105"
              }`}
              title={preset.name}
            >
              {/* Use Next.js Image for better performance in grids */}
              <Image src={preset.url} fill className="object-cover" alt={preset.name} sizes="(max-width: 768px) 33vw, 150px" />
              {isSelected && <div className="absolute inset-0 bg-primary/10 border-2 border-primary/30" />}
            </button>
          );
        })}

        {/* Expand/Collapse Button - Positioned at cell 6 (row 2, col 3) */}
        {hasMore && !isExpanded && (
          <button
            type="button"
            onClick={handleExpand}
            className="relative h-20 overflow-hidden rounded-lg border-2 border-dashed border-muted-foreground/30 bg-muted/20 hover:bg-muted/40 hover:border-primary/50 transition-colors hover:scale-105 flex flex-col items-center justify-center gap-1"
          >
            <ChevronDown className="size-6 text-muted-foreground" />
            <span className="text-[10px] font-medium text-muted-foreground">+{wallpapers.length - initialDisplayCount} more</span>
          </button>
        )}
      </div>

      {/* Collapse Button - Shown when expanded */}
      {isExpanded && hasMore && (
        <button type="button" onClick={handleCollapse} className="w-full py-2 rounded-lg border-2 border-dashed border-muted-foreground/30 bg-muted/20 hover:bg-muted/40 hover:border-primary/50 transition-colors flex items-center justify-center gap-2">
          <ChevronUp className="size-4 text-muted-foreground" />
          <span className="text-xs font-medium text-muted-foreground">Show Less</span>
        </button>
      )}
    </div>
  );
}
