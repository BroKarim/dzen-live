"use client";

import { Button2 } from "@/components/ui/button-2";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Grid3x3, Sparkles, Circle, Waves, StretchHorizontal, Grid2x2, RotateCcw } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import type { ProfileEditorData } from "@/server/user/profile/payloads";
import { Input } from "@/components/ui/input";
import { ANIMATED_BACKGROUNDS, type AnimatedBackgroundMeta } from "@/lib/animated-backgrounds";

interface BackgroundPatternProps {
  profile: ProfileEditorData;
  onUpdate: (profile: ProfileEditorData) => void;
}

const defaultPattern = {
  type: "none",
  color: "#ffffff",
  opacity: 10,
  thickness: 100,
  scale: 100,
};

export default function BackgroundPattern({ profile, onUpdate }: BackgroundPatternProps) {
  const bgPattern = (profile.bgPattern as any) || defaultPattern;

  const isAnimated = bgPattern.type === "animated";
  const animatedId = isAnimated ? bgPattern.animatedId : null;
  const animatedConfig = (isAnimated ? bgPattern.animatedConfig : null) as Record<string, unknown> | null;
  const selectedMeta = animatedId ? ANIMATED_BACKGROUNDS[animatedId] : null;

  const safeThickness = typeof bgPattern.thickness === "number" && bgPattern.thickness >= 13 ? bgPattern.thickness : 100;
  const safeScale = typeof bgPattern.scale === "number" && bgPattern.scale >= 13 ? bgPattern.scale : 100;

  const patterns = [
    { id: "none", label: "None", icon: Circle },
    { id: "grid", label: "Grid", icon: Grid3x3 },
    { id: "dots", label: "Dots", icon: Grid2x2 },
    { id: "stripes", label: "Stripes", icon: StretchHorizontal },
    { id: "waves", label: "Waves", icon: Waves },
    { id: "noise", label: "Noise", icon: Sparkles },
    { id: "animated", label: "Animated", icon: Sparkles },
  ];

  const handleUpdatePattern = (updates: Record<string, unknown>) => {
    const newPattern = { ...bgPattern, ...updates };
    onUpdate({ ...profile, bgPattern: newPattern });
  };

  const handleSelectAnimated = (meta: AnimatedBackgroundMeta) => {
    handleUpdatePattern({
      type: "animated",
      animatedId: meta.id,
      animatedConfig: meta.defaultConfig,
    });
  };

  const handleAnimatedConfigChange = (nextConfig: Record<string, unknown>) => {
    handleUpdatePattern({ animatedConfig: nextConfig });
  };

  const handleReset = () => {
    onUpdate({ ...profile, bgPattern: defaultPattern });
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button2 variant="blue" className="flex-1 rounded-full">
          <Grid3x3 className="size-4 mr-2" />
          Pattern
        </Button2>
      </PopoverTrigger>
      <PopoverContent className="w-80" align="start">
        <div className="space-y-4">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <h4 className="font-medium text-sm leading-none">Background Pattern</h4>
              <p className="text-xs text-muted-foreground leading-relaxed">Add decorative patterns to your background</p>
            </div>
            <Button2 variant="ghost" size="icon" className="size-8 text-muted-foreground hover:text-foreground" onClick={handleReset} title="Reset to defaults">
              <RotateCcw className="size-4" />
            </Button2>
          </div>

          {/* Pattern Type Selector */}
          <div className="space-y-2">
            <Label className="text-xs">Pattern Type</Label>
            <div className="grid grid-cols-3 gap-2">
              {patterns.map((pattern) => {
                const Icon = pattern.icon;
                const isActive = bgPattern.type === pattern.id;

                return (
                  <button
                    key={pattern.id}
                    type="button"
                    onClick={() => {
                      if (pattern.id === "animated") {
                        handleUpdatePattern({
                          type: "animated",
                          animatedId: "retro-grid",
                          animatedConfig: ANIMATED_BACKGROUNDS["retro-grid"].defaultConfig,
                        });
                      } else {
                        handleUpdatePattern({ type: pattern.id });
                      }
                    }}
                    className={`flex flex-col items-center gap-1.5 p-2 rounded-md border transition-all ${isActive ? "border-primary bg-primary/10 text-primary" : "border-border hover:border-primary/50"}`}
                  >
                    <Icon className="size-4" />
                    <span className="text-[10px] font-medium">{pattern.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Animated Pattern Controls */}
          {isAnimated && (
            <div className="space-y-3 rounded-xl border bg-muted/30 p-4">
              <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                Animated Background
              </p>
              <div className="flex flex-wrap gap-1 justify-between">
                {Object.values(ANIMATED_BACKGROUNDS).map((meta: AnimatedBackgroundMeta) => {
                  const isSelected = animatedId === meta.id;
                  return (
                    <button
                      key={meta.id}
                      type="button"
                      onClick={() => handleSelectAnimated(meta)}
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

              {selectedMeta && animatedConfig && (
                <div className="space-y-3 mt-2">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                    {selectedMeta.label} Settings
                  </p>
                  {selectedMeta.configFields.map((field) => (
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
                            value={String(animatedConfig[field.key] ?? field.default)}
                            onChange={(e) => handleAnimatedConfigChange({ ...animatedConfig, [field.key]: parseFloat(e.target.value) })}
                            className="h-1 w-24 accent-primary"
                          />
                          <span className="text-[10px] text-muted-foreground w-8 text-right tabular-nums">
                            {String(animatedConfig[field.key] ?? field.default)}
                          </span>
                        </div>
                      ) : field.type === "boolean" ? (
                        <button
                          type="button"
                          onClick={() => handleAnimatedConfigChange({ ...animatedConfig, [field.key]: !(animatedConfig[field.key] ?? field.default) })}
                          className={`relative h-6 w-11 rounded-full transition-colors ${
                            animatedConfig[field.key] ?? field.default ? "bg-primary" : "bg-muted-foreground/30"
                          }`}
                        >
                          <span
                            className={`absolute left-0.5 top-0.5 size-5 rounded-full bg-white transition-transform ${
                              animatedConfig[field.key] ?? field.default ? "translate-x-5" : "translate-x-0"
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
                          onChange={(e) => handleAnimatedConfigChange({ ...animatedConfig, [field.key]: parseFloat(e.target.value) })}
                          className="h-7 w-20 rounded-md border bg-background px-2 text-xs"
                        />
                      ) : (
                        <div className="flex items-center gap-2">
                          <div
                            className="size-5 rounded-full border"
                            style={{ backgroundColor: String(animatedConfig[field.key] ?? field.default) }}
                          />
                          <input
                            type="text"
                            value={String(animatedConfig[field.key] ?? field.default)}
                            onChange={(e) => handleAnimatedConfigChange({ ...animatedConfig, [field.key]: e.target.value })}
                            className="h-7 w-20 rounded-md border bg-background px-2 text-xs"
                          />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Static Pattern Controls - Only show if not "none" and not "animated" */}
          {bgPattern.type !== "none" && !isAnimated && (
            <>
              {/* Color Picker */}
              <div className="space-y-2">
                <Label className="text-xs">Color</Label>
                <div className="flex items-center gap-3">
                  <div className="relative h-8 w-12 overflow-hidden rounded-md border shadow-sm">
                    <Input type="color" value={bgPattern.color || "#ffffff"} onChange={(e) => handleUpdatePattern({ color: e.target.value })} className="absolute -inset-2 h-12 w-16 cursor-pointer" />
                  </div>
                  <span className="text-xs font-mono text-muted-foreground">{bgPattern.color}</span>
                </div>
              </div>

              {/* Opacity */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-xs">Opacity</Label>
                  <span className="text-xs font-mono text-muted-foreground">{bgPattern.opacity}%</span>
                </div>
                <Slider value={[bgPattern.opacity]} min={0} max={50} step={1} onValueChange={(val) => handleUpdatePattern({ opacity: val[0] })} />
              </div>

              {/* Thickness */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-xs">Thickness</Label>
                  <span className="text-xs font-mono text-muted-foreground">{safeThickness}%</span>
                </div>
                <Slider value={[safeThickness]} min={13} max={200} step={1} onValueChange={(val) => handleUpdatePattern({ thickness: val[0] })} />
              </div>

              {/* Scale */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-xs">Scale</Label>
                  <span className="text-xs font-mono text-muted-foreground">{safeScale}%</span>
                </div>
                <Slider value={[safeScale]} min={13} max={200} step={1} onValueChange={(val) => handleUpdatePattern({ scale: val[0] })} />
              </div>
            </>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
