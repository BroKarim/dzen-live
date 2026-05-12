"use client";

import { Button2 } from "@/components/ui/button-2";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Sparkles, Sun, Droplets, Contrast, EyeOff, Settings2, RotateCcw } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import type { ProfileEditorData } from "@/server/user/profile/payloads";

interface BackgroundEffectsProps {
  profile: ProfileEditorData;
  onUpdate: (profile: ProfileEditorData) => void;
}

export default function BackgroundEffects({ profile, onUpdate }: BackgroundEffectsProps) {
  const defaultEffects = {
    blur: 0,
    noise: 0,
    brightness: 100,
    saturation: 100,
    contrast: 100,
  };

  const bgEffects = (profile.bgEffects as any) || defaultEffects;

  const settings = [
    { id: "blur", label: "Blur", icon: EyeOff, min: 0, max: 20, step: 1, unit: "px" },
    { id: "noise", label: "Grain / Noise", icon: Sparkles, min: 0, max: 100, step: 1, unit: "%" },
    { id: "brightness", label: "Brightness", icon: Sun, min: 50, max: 150, step: 1, unit: "%" },
    { id: "saturation", label: "Saturation", icon: Droplets, min: 0, max: 200, step: 1, unit: "%" },
    { id: "contrast", label: "Contrast", icon: Contrast, min: 50, max: 150, step: 1, unit: "%" },
  ];

  const handleUpdateEffect = (id: string, value: number) => {
    const newEffects = {
      ...bgEffects,
      [id]: value,
    };

    onUpdate({
      ...profile,
      bgEffects: newEffects,
    });
  };

  const handleReset = () => {
    onUpdate({
      ...profile,
      bgEffects: defaultEffects,
    });
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button2 variant="blue" className="flex-1 rounded-full">
          <Settings2 className="size-4 mr-2" />
          Effects
        </Button2>
      </PopoverTrigger>
      <PopoverContent className="w-80" align="start">
        <div className="space-y-4">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <h4 className="font-medium text-sm leading-none">Background Effects</h4>
              <p className="text-xs text-muted-foreground leading-relaxed">Adjust visual effects for your background</p>
            </div>
            <Button2 variant="ghost" size="icon" className="size-8 text-muted-foreground hover:text-foreground" onClick={handleReset} title="Reset to defaults">
              <RotateCcw className="size-4" />
            </Button2>
          </div>

          <div className="space-y-4">
            {settings.map((item) => {
              const Icon = item.icon;
              const value = bgEffects[item.id] ?? (item.id === "blur" || item.id === "noise" ? 0 : 100);

              return (
                <div key={item.id} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm font-medium">
                      <Icon className="size-4 text-muted-foreground" />
                      <Label className="text-xs">{item.label}</Label>
                    </div>
                    <span className="text-xs font-mono text-muted-foreground">
                      {value}
                      {item.unit}
                    </span>
                  </div>
                  <Slider value={[value]} min={item.min} max={item.max} step={item.step} onValueChange={(val: any) => handleUpdateEffect(item.id, val[0])} />
                </div>
              );
            })}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
