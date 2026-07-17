"use client";

import React from "react"
import { Icons } from "@/components/icons"

interface ViewModeToggleProps {
  viewMode: "mobile" | "desktop"
  setViewMode: (mode: "mobile" | "desktop") => void
}

export function ViewModeToggle({ viewMode, setViewMode }: ViewModeToggleProps) {
  return (
    <div className="flex justify-center">
      <div className="flex items-center gap-1 rounded-lg   p-1">
        <button
          type="button"
          onClick={() => setViewMode("mobile")}
          className={`flex items-center gap-2 rounded-md px-3 py-1.5 text-xs font-medium transition-all ${
            viewMode === "mobile"
              ? "bg-background text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <Icons.phone className="size-4" />
          Mobile
        </button>
        <button
          type="button"
          onClick={() => setViewMode("desktop")}
          className={`flex items-center gap-2 rounded-md px-3 py-1.5 text-xs font-medium transition-all ${
            viewMode === "desktop"
              ? "bg-background text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <Icons.monitor className="size-4" />
          Desktop
        </button>
      </div>
    </div>
  )
}
