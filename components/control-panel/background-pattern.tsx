"use client";

import { useState } from "react";
import { Button2 } from "@/components/ui/button-2";
import { Button } from "@/components/ui/button";
import { Sparkles, RotateCcw } from "lucide-react";
import { ColorPicker } from "@/components/ui/color-picker";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { IntensitySlider } from "@/components/ui/intesity-slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { ProfileEditorData } from "@/server/user/profile/payloads";
import { ANIMATED_BACKGROUNDS, type AnimatedBackgroundMeta } from "@/lib/animated-backgrounds";

interface BgPattern {
  animatedId: string;
  animatedConfig: Record<string, unknown>;
}

interface BackgroundPatternProps {
  profile: ProfileEditorData;
  onUpdate: (profile: ProfileEditorData) => void;
}

function ColorField({
  value,
  label,
  onChange,
}: {
  value: string;
  label: string;
  onChange: (v: string) => void;
}) {
  const [open, setOpen] = useState(false);
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button type="button" aria-label={label} className="flex items-center gap-2 group">
          <div className="h-7 w-7 rounded-md border shadow-sm overflow-hidden">
            <div className="h-full w-full" style={{ backgroundColor: value }} />
          </div>
          <input
            value={value.toUpperCase()}
            disabled
            aria-label={label}
            className="h-7 w-20 rounded-md border bg-background px-2 text-xs font-mono uppercase disabled:opacity-100 disabled:cursor-default"
          />
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0 border-0 bg-[#222] shadow-dzenn">
        <ColorPicker
          value={value}
          onChange={onChange}
        />
      </PopoverContent>
    </Popover>
  );
}

export default function BackgroundPattern({ profile, onUpdate }: BackgroundPatternProps) {
  const bgPattern = (profile.bgPattern as Record<string, unknown> | null) ?? null;

  const animatedId = bgPattern?.animatedId as string | undefined;
  const animatedConfig = bgPattern?.animatedConfig as Record<string, unknown> | null;
  const hasAnimatedBg = !!animatedId;
  const selectedMeta = animatedId ? ANIMATED_BACKGROUNDS[animatedId] : null;

  const handleSelectAnimated = (meta: AnimatedBackgroundMeta) => {
    if (meta.id === "none") {
      onUpdate({ ...profile, bgPattern: null } as ProfileEditorData);
      return;
    }
    onUpdate({
      ...profile,
      bgPattern: {
        animatedId: meta.id,
        animatedConfig: { ...meta.defaultConfig },
      } satisfies BgPattern,
    } as ProfileEditorData);
  };

  const handleAnimatedConfigChange = (nextConfig: Record<string, unknown>) => {
    onUpdate({
      ...profile,
      bgPattern: { animatedId: animatedId!, animatedConfig: nextConfig } satisfies BgPattern,
    } as ProfileEditorData);
  };

  const handleReset = () => {
    onUpdate({ ...profile, bgPattern: null } as ProfileEditorData);
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button className="flex-1 bg-[#222] rounded-full shadow-dzenn text-white  hover:bg-zinc-700 transition-all duration-200">
          <Sparkles className="size-4 mr-2" />
          Animated
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 bg-[#222]" side="left" align="start">
        <div className="space-y-4">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <h4 className="font-medium text-sm leading-none">Animated Background</h4>
              <p className="text-xs text-muted-foreground leading-relaxed">Pick an animated pattern to overlay on your background</p>
            </div>
            <Button2 variant="ghost" size="icon" className="size-8 text-muted-foreground hover:text-foreground" onClick={handleReset} title="Remove animated background">
              <RotateCcw className="size-4" />
            </Button2>
          </div>

          <div className="grid grid-cols-4 gap-2 space-y-4 ">
            {Object.values(ANIMATED_BACKGROUNDS).map((meta: AnimatedBackgroundMeta) => {
              const isSelected = meta.id === "none" ? !hasAnimatedBg : animatedId === meta.id;
              return (
                <button
                  key={meta.id}
                  type="button"
                  onClick={() => handleSelectAnimated(meta)}
                  className={`relative aspect-square size-12 rounded-md bg-white p-1 transition-all duration-200 ${
                    isSelected ? "ring-2 ring-primary ring-offset-2 ring-offset-background scale-110 z-10" : "hover:scale-110 active:scale-95 border border-black/5"
                  }`}
                  style={{ backgroundImage: meta.preview }}
                  title={meta.label}
                >
                  {isSelected && <div className="absolute inset-0 rounded-md border-2 border-primary/20 animate-pulse" />}
                  <span className="absolute -bottom-5 left-1/2 -translate-x-1/2 text-[8px] text-muted-foreground whitespace-nowrap">{meta.label}</span>
                </button>
              );
            })}
          </div>

          {selectedMeta && animatedConfig && (
            <div className="space-y-3 ">
              {/* <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{selectedMeta.label} Settings</p> */}
              {selectedMeta.configFields.map((field: AnimatedBackgroundMeta["configFields"][number]) =>
                field.type === "range" ? (
                  <div key={field.key} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-medium text-muted-foreground">{field.label}</label>
                      <span className="text-xs font-mono text-muted-foreground">{String(animatedConfig[field.key] ?? field.default)}{field.unit ?? ""}</span>
                    </div>
                    <IntensitySlider
                      value={Number(animatedConfig[field.key] ?? field.default)}
                      min={field.min}
                      max={field.max}
                      step={field.step ?? 0.05}
                      onValueChange={(v) =>
                        handleAnimatedConfigChange({
                          ...animatedConfig,
                          [field.key]: v,
                        })
                      }
                    />
                  </div>
                ) : (
                  <div key={field.key} className="flex items-center justify-between gap-3">
                    <label className="text-xs font-medium text-muted-foreground capitalize">{field.label}</label>
                    {field.type === "boolean" ? (
                    <button
                      type="button"
                      aria-label={field.label}
                      aria-pressed={!!(animatedConfig[field.key] ?? field.default)}
                      onClick={() =>
                        handleAnimatedConfigChange({
                          ...animatedConfig,
                          [field.key]: !(animatedConfig[field.key] ?? field.default),
                        })
                      }
                      className={`relative h-6 w-11 rounded-full transition-colors ${(animatedConfig[field.key] ?? field.default) ? "bg-primary" : "bg-muted-foreground/30"}`}
                    >
                      <span className={`absolute left-0.5 top-0.5 size-5 rounded-full bg-white transition-transform ${(animatedConfig[field.key] ?? field.default) ? "translate-x-5" : "translate-x-0"}`} />
                    </button>
                  ) : field.type === "select" ? (
                    <Select
                      value={String(animatedConfig[field.key] ?? field.default)}
                      onValueChange={(v) =>
                        handleAnimatedConfigChange({
                          ...animatedConfig,
                          [field.key]: v,
                        })
                      }
                    >
                      <SelectTrigger className="h-7 w-32 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {field.options?.map((opt: { value: string; label: string }) => (
                          <SelectItem key={opt.value} value={opt.value}>
                            {opt.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : field.type === "color" ? (
                    <ColorField
                      value={String(animatedConfig[field.key] ?? field.default)}
                      label={field.label}
                      onChange={(v) =>
                        handleAnimatedConfigChange({
                          ...animatedConfig,
                          [field.key]: v,
                        })
                      }
                    />
                  ) : field.type === "number" ? (
                    <input
                      type="number"
                      aria-label={field.label}
                      min={field.min}
                      max={field.max}
                      step={field.step ?? 10}
                      value={String(animatedConfig[field.key] ?? field.default)}
                      onChange={(e) =>
                        handleAnimatedConfigChange({
                          ...animatedConfig,
                          [field.key]: parseFloat(e.target.value),
                        })
                      }
                      className="h-7 w-20 rounded-md border bg-background px-2 text-xs"
                    />
                  ) : (
                    <div className="flex items-center gap-2">
                      <div
                        className="size-5 rounded-full border"
                        style={{
                          backgroundColor: String(animatedConfig[field.key] ?? field.default),
                        }}
                      />
                      <input
                        type="text"
                        aria-label={field.label}
                        value={String(animatedConfig[field.key] ?? field.default)}
                        onChange={(e) =>
                          handleAnimatedConfigChange({
                            ...animatedConfig,
                            [field.key]: e.target.value,
                          })
                        }
                        className="h-8 w-full rounded-md border bg-background px-2 text-xs"
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}


        </div>
      </PopoverContent>
    </Popover>
  );
}
