"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Upload, Image as ImageIcon, Palette, Sparkles } from "lucide-react";
import type { ProfileEditorData } from "@/server/user/profile/payloads";
import { BACKGROUND_COLORS } from "@/lib/background-colors";
import { getBackgroundPresets } from "@/server/website/background-presets/actions";
import type { BackgroundPreset } from "@/server/website/background-presets/schema";
import { useEffect, useState } from "react";
import WallpaperCategorySection from "./wallpaper-category-section";
import { ANIMATED_BACKGROUNDS, type AnimatedBackgroundMeta } from "@/lib/animated-backgrounds";

interface BackgroundOptionsProps {
  profile: ProfileEditorData;
  onUpdate: (profile: ProfileEditorData) => void;
}

export default function BackgroundOptions({ profile, onUpdate }: BackgroundOptionsProps) {
  const [wallpaperPresets, setWallpaperPresets] = useState<BackgroundPreset[]>([]);
  const [isLoadingWallpapers, setIsLoadingWallpapers] = useState(true);

  useEffect(() => {
    async function loadWallpapers() {
      setIsLoadingWallpapers(true);
      const presets = await getBackgroundPresets();
      setWallpaperPresets(presets);
      setIsLoadingWallpapers(false);
    }
    loadWallpapers();
  }, []);

  const handleBackgroundChange = (updates: Partial<ProfileEditorData>) => {
    onUpdate({ ...profile, ...updates });
  };

  const wallpapersByCategory = (() => {
    const grouped = new Map<string, BackgroundPreset[]>();

    wallpaperPresets.forEach((preset) => {
      const category = preset.category || "Uncategorized";
      if (!grouped.has(category)) {
        grouped.set(category, []);
      }
      grouped.get(category)!.push(preset);
    });

    return Array.from(grouped.entries()).map(([category, wallpapers]) => ({
      category,
      wallpapers,
    }));
  })();

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        handleBackgroundChange({
          bgType: "image",
          bgImage: reader.result as string,
        });
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <Tabs value={profile.bgType} defaultValue="wallpaper" onValueChange={(v) => handleBackgroundChange({ bgType: v as any })}>
      <TabsList className="grid w-full grid-cols-4 h-auto bg-transparent  p-1 gap-1">
        <TabsTrigger value="color" className="p-0 h-full w-full">
          <div className="size-full rounded-md border-2 border-dashed border-muted-foreground/30 flex items-center justify-center gap-2 bg-muted/20">
            <Palette className="size-6 text-muted-foreground" />
            <span className="text-[10px] font-medium text-muted-foreground">Color</span>
          </div>
        </TabsTrigger>
        <TabsTrigger value="animated" className="p-0 h-full w-full">
          <div className="size-full rounded-md border-2 border-dashed border-muted-foreground/30 flex items-center justify-center gap-2 bg-muted/20">
            <Sparkles className="size-6 text-muted-foreground" />
            <span className="text-[10px] font-medium text-muted-foreground">Animated</span>
          </div>
        </TabsTrigger>
        <TabsTrigger value="wallpaper" className="p-0 h-full w-full">
          <div className="size-full rounded-md border-2 border-dashed border-muted-foreground/30 flex items-center justify-center gap-2 bg-muted/20">
            <ImageIcon className="size-6 text-muted-foreground" />
            <span className="text-[10px] font-medium text-muted-foreground">Wallpaper</span>
          </div>
        </TabsTrigger>
        <TabsTrigger value="image" className="p-0 h-full w-full">
          <div className="size-full rounded-md border-2 border-dashed border-muted-foreground/30 flex items-center justify-center gap-2 bg-muted/20">
            <Upload className="size-6 text-muted-foreground" />
            <span className="text-[10px] font-medium text-muted-foreground">Image</span>
          </div>
        </TabsTrigger>
      </TabsList>

      <TabsContent value="color" className="space-y-4 pt-4">
        <div className="flex flex-wrap gap-1 justify-between">
          {BACKGROUND_COLORS.map((color) => (
            <button
              key={color}
              type="button"
              onClick={() => handleBackgroundChange({ bgType: "color", bgColor: color })}
              className={`relative aspect-square size-10 rounded-md transition-all duration-200 ${
                profile.bgColor === color ? "ring-2 ring-primary ring-offset-2 ring-offset-background scale-110 z-10" : "hover:scale-110 active:scale-95 border border-black/5"
              }`}
              style={{ backgroundColor: color }}
            >
              {profile.bgColor === color && <div className="absolute inset-0 rounded-md border-2 border-primary/20 animate-pulse" />}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-3 rounded-xl border bg-muted/30 p-3">
          <div className="relative h-8 w-12 overflow-hidden rounded-md border shadow-sm">
            <Input type="color" value={profile.bgColor || "#000000"} onChange={(e) => handleBackgroundChange({ bgType: "color", bgColor: e.target.value })} className="absolute -inset-2 h-12 w-16 cursor-pointer" />
          </div>
          <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Custom Color</span>
        </div>
      </TabsContent>

      <TabsContent value="animated" className="space-y-4 pt-4">
        <div className="flex flex-wrap gap-1 justify-between">
          {Object.values(ANIMATED_BACKGROUNDS).map((meta: AnimatedBackgroundMeta) => {
            const isSelected = profile.bgAnimated === meta.id;
            return (
              <button
                key={meta.id}
                type="button"
                onClick={() =>
                  handleBackgroundChange({
                    bgType: "animated",
                    bgAnimated: meta.id,
                    bgAnimatedConfig: meta.defaultConfig,
                  })
                }
                className={`relative aspect-square size-10 rounded-md transition-all duration-200 ${
                  isSelected
                    ? "ring-2 ring-primary ring-offset-2 ring-offset-background scale-110 z-10"
                    : "hover:scale-110 active:scale-95 border border-black/5"
                }`}
                style={{ background: meta.preview }}
                title={meta.label}
              >
                {isSelected && (
                  <div className="absolute inset-0 rounded-md border-2 border-primary/20 animate-pulse" />
                )}
                <span className="absolute -bottom-4 left-1/2 -translate-x-1/2 text-[8px] text-muted-foreground whitespace-nowrap">
                  {meta.label}
                </span>
              </button>
            );
          })}
        </div>

        {profile.bgAnimated && profile.bgAnimatedConfig && (
          <AnimatedConfigControls
            meta={ANIMATED_BACKGROUNDS[profile.bgAnimated]}
            config={profile.bgAnimatedConfig as Record<string, unknown>}
            onConfigChange={(nextConfig) =>
              handleBackgroundChange({ bgAnimatedConfig: nextConfig })
            }
          />
        )}
      </TabsContent>

      <TabsContent value="wallpaper" className="space-y-4 pt-4">
        {isLoadingWallpapers ? (
          <div className="grid grid-cols-3 gap-2">
            {[...Array(6)].map((_, i) => (
              <div key={`skeleton-${i}`} className="h-20 w-full animate-pulse rounded-lg bg-muted/50" />
            ))}
          </div>
        ) : wallpaperPresets.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-muted-foreground/20 bg-muted/10 py-12 text-center">
            <ImageIcon className="size-8 text-muted-foreground/50" />
            <p className="text-sm font-medium text-muted-foreground">No wallpapers available</p>
            <p className="text-xs text-muted-foreground/70">Wallpapers will appear here once added</p>
          </div>
        ) : (
          <div className="space-y-6">
            {wallpapersByCategory.map(({ category, wallpapers }) => (
              <WallpaperCategorySection key={category} category={category} wallpapers={wallpapers} selectedWallpaper={profile.bgWallpaper} onSelect={(url) => handleBackgroundChange({ bgType: "wallpaper", bgWallpaper: url })} />
            ))}
          </div>
        )}
      </TabsContent>
      <TabsContent value="image" className="space-y-4 pt-4">
        <div className="flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-muted-foreground/20 bg-muted/10 py-12 text-center">
          {/* <Upload className="size-8 text-muted-foreground/50" />
          <p className="text-sm font-medium text-muted-foreground">Custom Image Upload</p> */}
          <span className="bg-primary/10 text-primary text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-widest border border-primary/20 mt-1">Coming Soon</span>
          {/* <p className="text-[10px] text-muted-foreground/70 max-w-[180px] mt-1">We're optimizing our storage to give you the best performance.</p> */}
        </div>

        {/* Original Upload Logic - Temporarily Hidden
        <div className="flex flex-col gap-4">
          <div className="relative group flex h-32 w-full flex-col items-center justify-center rounded-xl border-2 border-dashed border-muted transition-colors hover:border-primary/50">
            {profile.bgImage ? (
              <Image src={profile.bgImage} fill className="rounded-lg object-cover" alt="upload" />
            ) : (
              <div className="flex flex-col items-center gap-2 text-muted-foreground">
                <Upload className="size-6" />
                <span className="text-xs">Upload Background</span>
              </div>
            )}
            <input type="file" accept="image/*" onChange={handleImageUpload} className="absolute inset-0 cursor-pointer opacity-0" />
          </div>
          {profile.bgImage && (
            <Button variant="outline" size="sm" onClick={() => handleBackgroundChange({ bgImage: null })} className="w-full text-destructive">
              Remove Image
            </Button>
          )}
        </div>
        */}
      </TabsContent>
    </Tabs>
  );
}

function AnimatedConfigControls({
  meta,
  config,
  onConfigChange,
}: {
  meta: AnimatedBackgroundMeta;
  config: Record<string, unknown>;
  onConfigChange: (config: Record<string, unknown>) => void;
}) {
  const handleChange = (key: string, value: unknown) => {
    onConfigChange({ ...config, [key]: value });
  };

  return (
    <div className="space-y-3 rounded-xl border bg-muted/30 p-4">
      <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
        {meta.label} Settings
      </p>
      {meta.configFields.map((field) => (
        <div key={field.key} className="flex items-center justify-between gap-3">
          <label className="text-xs font-medium text-muted-foreground capitalize">
            {field.label}
          </label>
          {field.type === "range" ? (
            <div className="flex items-center gap-2">
              <input
                type="range"
                min={field.min}
                max={field.max}
                step={field.step ?? 0.05}
                value={String(config[field.key] ?? field.default)}
                onChange={(e) => handleChange(field.key, parseFloat(e.target.value))}
                className="h-1 w-24 accent-primary"
              />
              <span className="text-[10px] text-muted-foreground w-8 text-right tabular-nums">
                {String(config[field.key] ?? field.default)}
              </span>
            </div>
          ) : field.type === "boolean" ? (
            <button
              type="button"
              onClick={() => handleChange(field.key, !(config[field.key] ?? field.default))}
              className={`relative h-6 w-11 rounded-full transition-colors ${
                config[field.key] ?? field.default ? "bg-primary" : "bg-muted-foreground/30"
              }`}
            >
              <span
                className={`absolute left-0.5 top-0.5 size-5 rounded-full bg-white transition-transform ${
                  config[field.key] ?? field.default ? "translate-x-5" : "translate-x-0"
                }`}
              />
            </button>
          ) : field.type === "number" ? (
            <input
              type="number"
              min={field.min}
              max={field.max}
              step={field.step ?? 10}
              value={String(config[field.key] ?? field.default)}
              onChange={(e) => handleChange(field.key, parseFloat(e.target.value))}
              className="h-7 w-20 rounded-md border bg-background px-2 text-xs"
            />
          ) : (
            <div className="flex items-center gap-2">
              <div
                className="size-5 rounded-full border"
                style={{ backgroundColor: String(config[field.key] ?? field.default) }}
              />
              <input
                type="text"
                value={String(config[field.key] ?? field.default)}
                onChange={(e) => handleChange(field.key, e.target.value)}
                className="h-7 w-20 rounded-md border bg-background px-2 text-xs"
              />
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
