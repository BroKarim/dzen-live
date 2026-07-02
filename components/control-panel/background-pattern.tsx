"use client";

import { Button2 } from "@/components/ui/button-2";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Grid3x3, Sparkles, Circle, Waves, StretchHorizontal, Grid2x2, RotateCcw } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import type { ProfileEditorData } from "@/server/user/profile/payloads";
import { Input } from "@/components/ui/input";

interface BackgroundPatternProps {
  profile: ProfileEditorData;
  onUpdate: (profile: ProfileEditorData) => void;
}

export default function BackgroundPattern({ profile, onUpdate }: BackgroundPatternProps) {
  const defaultPattern = {
    type: "none",
    color: "#ffffff",
    opacity: 10,
    thickness: 100,
    scale: 100,
  };

  const bgPattern = (profile.bgPattern as any) || defaultPattern;

  // Ensure we have percentage values for thickness and scale
  const safeThickness = typeof bgPattern.thickness === "number" && bgPattern.thickness >= 13 ? bgPattern.thickness : 100;
  const safeScale = typeof bgPattern.scale === "number" && bgPattern.scale >= 13 ? bgPattern.scale : 100;

  const patterns = [
    { id: "none", label: "None", icon: Circle },
    { id: "grid", label: "Grid", icon: Grid3x3 },
    { id: "dots", label: "Dots", icon: Grid2x2 },
    { id: "stripes", label: "Stripes", icon: StretchHorizontal },
    { id: "waves", label: "Waves", icon: Waves },
    { id: "noise", label: "Noise", icon: Sparkles },
  ];

  const handleUpdatePattern = (updates: Partial<typeof defaultPattern>) => {
    const newPattern = {
      ...bgPattern,
      ...updates,
    };

    onUpdate({
      ...profile,
      bgPattern: newPattern,
    });
  };

  const handleReset = () => {
    onUpdate({
      ...profile,
      bgPattern: defaultPattern,
    });
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
              <p className="text-xs text-muted-foreground leading-relaxed">Add geometric patterns to your background</p>
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
                    onClick={() => handleUpdatePattern({ type: pattern.id })}
                    className={`flex flex-col items-center gap-1.5 p-2 rounded-md border transition-all ${isActive ? "border-primary bg-primary/10 text-primary" : "border-border hover:border-primary/50"}`}
                  >
                    <Icon className="size-4" />
                    <span className="text-[10px] font-medium">{pattern.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Pattern Controls - Only show if not "none" */}
          {bgPattern.type !== "none" && (
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
