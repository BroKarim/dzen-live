"use client";

import { Button2 } from "@/components/ui/button-2";
import { Sparkles, RotateCcw } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { IntensitySlider } from "@/components/ui/intesity-slider";
import type { ProfileEditorData } from "@/server/user/profile/payloads";
import { ANIMATED_BACKGROUNDS, type AnimatedBackgroundMeta } from "@/lib/animated-backgrounds";

interface BackgroundPatternProps {
  profile: ProfileEditorData;
  onUpdate: (profile: ProfileEditorData) => void;
}

export default function BackgroundPattern({ profile, onUpdate }: BackgroundPatternProps) {
  const bgPattern = (profile.bgPattern as Record<string, unknown> | null) ?? null;

  const animatedId = bgPattern?.animatedId as string | undefined;
  const animatedConfig = bgPattern?.animatedConfig as Record<string, unknown> | null;
  const selectedMeta = animatedId ? ANIMATED_BACKGROUNDS[animatedId] : null;

  const handleSelectAnimated = (meta: AnimatedBackgroundMeta) => {
    onUpdate({
      ...profile,
      bgPattern: {
        animatedId: meta.id,
        animatedConfig: { ...meta.defaultConfig },
      },
    } as any);
  };

  const handleAnimatedConfigChange = (nextConfig: Record<string, unknown>) => {
    onUpdate({
      ...profile,
      bgPattern: { animatedId, animatedConfig: nextConfig },
    } as any);
  };

  const handleReset = () => {
    onUpdate({ ...profile, bgPattern: null } as any);
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button2 variant="blue" className="flex-1 rounded-full">
          <Sparkles className="size-4 mr-2" />
          Animated
        </Button2>
      </PopoverTrigger>
      <PopoverContent className="w-80" align="start">
        <div className="space-y-4">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <h4 className="font-medium text-sm leading-none">Animated Background</h4>
              <p className="text-xs text-muted-foreground leading-relaxed">Pick an animated pattern to overlay on your background</p>
            </div>
            <Button2
              variant="ghost"
              size="icon"
              className="size-8 text-muted-foreground hover:text-foreground"
              onClick={handleReset}
              title="Remove animated background"
            >
              <RotateCcw className="size-4" />
            </Button2>
          </div>

          <div className="grid grid-cols-4 gap-2 space-y-4">
            {Object.values(ANIMATED_BACKGROUNDS).map((meta: AnimatedBackgroundMeta) => {
              const isSelected = animatedId === meta.id;
              return (
                <button
                  key={meta.id}
                  type="button"
                  onClick={() => handleSelectAnimated(meta)}
                  className={`relative aspect-square size-12 rounded-md transition-all duration-200 ${
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
                  <span className="absolute -bottom-5 left-1/2 -translate-x-1/2 text-[8px] text-muted-foreground whitespace-nowrap">
                    {meta.label}
                  </span>
                </button>
              );
            })}
          </div>

          {selectedMeta && animatedConfig && (
            <div className="space-y-3 rounded-xl border bg-muted/30 p-4">
              <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                {selectedMeta.label} Settings
              </p>
              {selectedMeta.configFields.map((field: any) => (
                <div key={field.key} className="flex items-center justify-between gap-3">
                  <label className="text-xs font-medium text-muted-foreground capitalize">
                    {field.label}
                  </label>
                  {field.type === "range" ? (
                    <div className="flex items-center gap-2">
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
                        className="w-32"
                      />
                      <span className="text-[10px] text-muted-foreground w-8 text-right tabular-nums">
                        {String(animatedConfig[field.key] ?? field.default)}
                      </span>
                    </div>
                  ) : field.type === "boolean" ? (
                    <button
                      type="button"
                      onClick={() =>
                        handleAnimatedConfigChange({
                          ...animatedConfig,
                          [field.key]: !(animatedConfig[field.key] ?? field.default),
                        })
                      }
                      className={`relative h-6 w-11 rounded-full transition-colors ${
                        animatedConfig[field.key] ?? field.default
                          ? "bg-primary"
                          : "bg-muted-foreground/30"
                      }`}
                    >
                      <span
                        className={`absolute left-0.5 top-0.5 size-5 rounded-full bg-white transition-transform ${
                          animatedConfig[field.key] ?? field.default
                            ? "translate-x-5"
                            : "translate-x-0"
                        }`}
                      />
                    </button>
                  ) : field.type === "number" ? (
                    <input
                      type="number"
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
                        value={String(animatedConfig[field.key] ?? field.default)}
                        onChange={(e) =>
                          handleAnimatedConfigChange({
                            ...animatedConfig,
                            [field.key]: e.target.value,
                          })
                        }
                        className="h-7 w-20 rounded-md border bg-background px-2 text-xs"
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {!selectedMeta && (
            <div className="flex flex-col items-center gap-2 py-4 text-muted-foreground">
              <Sparkles className="size-8 opacity-20" />
              <span className="text-xs">Select an animated background above</span>
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
