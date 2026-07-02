"use client";

import { AlignCenterVertical, AlignEndVertical, AlignStartVertical } from "lucide-react";
import { ProfileLayout } from "@/lib/generated/prisma/enums";
import { cn } from "@/lib/utils";
import type { ProfileEditorData } from "@/server/user/profile/payloads";

interface ProfileLayoutSelectorProps {
  profile: ProfileEditorData;
  onUpdate: (profile: ProfileEditorData) => void;
}

export function ProfileLayoutSelector({ profile, onUpdate }: ProfileLayoutSelectorProps) {
  const layouts = [
    { id: ProfileLayout.left_stack, icon: AlignEndVertical, label: "Left Stack" },
    { id: ProfileLayout.center, icon: AlignCenterVertical, label: "Centered" },
    { id: ProfileLayout.left_row, icon: AlignStartVertical, label: "Left Row" },
  ];

  const handleLayoutChange = (layout: ProfileLayout) => {
    onUpdate({ ...profile, layout });
  };

  return (
    <div className="space-y-1">
      <div className="grid grid-cols-3 gap-2">
        {layouts.map((layoutItem) => {
          const Icon = layoutItem.icon;
          const isActive = profile.layout === layoutItem.id;

          return (
            <button
              key={layoutItem.id}
              type="button"
              onClick={() => handleLayoutChange(layoutItem.id)}
              className={`flex flex-col items-center justify-center gap-1.5 rounded-xl border-2 p-2.5 transition-all ${
                isActive ? "shadow-dzenn border-none bg-primary/10 text-primary" : "border-white/5 bg-transparent text-muted-foreground hover:border-white/10 hover:text-foreground"
              }`}
            >
              <Icon className={cn("h-4 w-4 transition-opacity", isActive ? "text-primary opacity-100" : "opacity-60")} />
              <span className="text-[10px]  tracking-wider font-semibold">{layoutItem.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
