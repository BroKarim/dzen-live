"use client";

import { Label } from "@/components/ui/label";
import { THEMES, ProfileTheme } from "@/lib/themes";
import type { ProfileEditorData } from "@/server/user/profile/payloads";
import { updateTheme } from "@/server/user/profile/actions";
import { useEffect, useRef, useState, useMemo } from "react";
import { toast } from "sonner";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Icons } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { Check, ChevronDown, Palette } from "lucide-react";
import { cn } from "@/lib/utils";

interface ThemeSelectorProps {
  profile: ProfileEditorData;
  onUpdate: (profile: ProfileEditorData) => void;
}

interface ThemeIconProps {
  theme: ProfileTheme;
  className?: string;
}

function ThemeIcon({ theme, className }: ThemeIconProps) {
  if (theme.icon && Icons[theme.icon as keyof typeof Icons]) {
    const Icon = Icons[theme.icon as keyof typeof Icons];
    return <Icon className={cn("size-4 shrink-0", className)} />;
  }
  return <div className={cn("size-4 shrink-0 rounded-full border border-black/5 dark:border-white/10 shadow-sm", className)} style={{ background: theme.variables["--primary"] || theme.variables["--foreground"] }} />;
}

// Extract theme item to separate component for better performance
function ThemeItem({ theme, isActive, onSelect }: { theme: ProfileTheme & { fontName: string }; isActive: boolean; onSelect: () => void }) {
  return (
    <button
      onClick={onSelect}
      role="option"
      aria-selected={isActive}
      className={cn("w-full flex items-center justify-between gap-3 p-2.5 rounded-lg transition-all text-left", "hover:bg-zinc-100 dark:hover:bg-zinc-800/80", isActive && "bg-zinc-100/80 dark:bg-zinc-800/50")}
    >
      <div className="flex items-center gap-3">
        <div className={cn("p-2 rounded-lg transition-colors", isActive ? "bg-white dark:bg-zinc-950 shadow-sm border border-zinc-200 dark:border-zinc-700" : "bg-zinc-100 dark:bg-zinc-900")}>
          <ThemeIcon theme={theme} className="size-4" />
        </div>
        <div className="flex flex-col">
          <span className={cn("text-sm font-medium", isActive ? "text-foreground" : "text-muted-foreground")}>{theme.name}</span>
          <span className="text-[10px] text-muted-foreground/60 capitalize leading-none pt-0.5">{theme.fontName}</span>
        </div>
      </div>
      {isActive && <Check className="size-4 text-primary" />}
    </button>
  );
}

export function ThemeSelector({ profile, onUpdate }: ThemeSelectorProps) {
  const saveTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    // Debounce save to database
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    saveTimeoutRef.current = setTimeout(async () => {
      const result = await updateTheme(profile.theme);
      if (!result.success) {
        toast.error(result.error || "Failed to save theme");
      }
    }, 500);

    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [profile.theme]);

  // Pre-compute themes with font names to avoid repeated string operations
  const themesWithFontNames = useMemo(
    () =>
      Object.values(THEMES).map((theme) => ({
        ...theme,
        fontName: theme.variables["--font-sans"].split(",")[0].trim(),
      })),
    [],
  );

  const currentTheme = THEMES[profile.theme] || THEMES["default"];

  const handleThemeSelect = (themeId: string) => {
    onUpdate({ ...profile, theme: themeId });
    setOpen(false);
  };

  return (
    <div className="space-y-3">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            aria-controls="theme-listbox"
            className="w-full h-12 justify-between bg-zinc-50 dark:bg-zinc-900/50 border-zinc-200 dark:border-zinc-800 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-all active:scale-[0.98]"
          >
            <div className="flex items-center gap-3">
              <div className="p-1.5 rounded-lg bg-primary/10 text-primary">
                <ThemeIcon theme={currentTheme} className="size-4" />
              </div>
              <div className="flex flex-col items-start leading-tight">
                <span className="text-sm font-semibold">{currentTheme.name}</span>
                <span className="text-[10px] text-muted-foreground opacity-70 uppercase tracking-tighter transition-all">Typography Preset</span>
              </div>
            </div>
            <ChevronDown className="ml-2 size-4 shrink-0 opacity-50 transition-transform duration-200 group-data-[state=open]:rotate-180" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[310px] p-0 overflow-hidden border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 shadow-2xl" align="center" sideOffset={8}>
          <div className="p-2 border-b border-zinc-200/50 dark:border-zinc-800/50 bg-zinc-50/50 dark:bg-zinc-900/30 flex items-center gap-2">
            <div className="p-1 rounded bg-zinc-200 dark:bg-zinc-800">
              <Palette className="size-3 text-zinc-500" />
            </div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Select Typography</span>
          </div>
          <div id="theme-listbox" role="listbox" className="max-h-[350px] overflow-y-auto p-1 custom-scrollbar">
            {themesWithFontNames.map((theme) => (
              <ThemeItem key={theme.id} theme={theme} isActive={profile.theme === theme.id} onSelect={() => handleThemeSelect(theme.id)} />
            ))}
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
