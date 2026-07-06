"use client";

import { Button2 } from "@/components/ui/button-2";
import { IntensitySlider } from "@/components/ui/intesity-slider";
import { Label } from "@/components/ui/label";
import { Settings2, RotateCcw } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import type { ProfileEditorData } from "@/server/user/profile/payloads";

interface BackgroundEffectsProps {
  profile: ProfileEditorData;
  onUpdate: (profile: ProfileEditorData) => void;
}

interface BackgroundEffectValues {
  [key: string]: number;
}

const defaultEffects: BackgroundEffectValues = {
  blur: 0,
  noise: 0,
  brightness: 100,
  saturation: 100,
  contrast: 100,
};

export default function BackgroundEffects({ profile, onUpdate }: BackgroundEffectsProps) {
  const bgEffects = (profile.bgEffects as BackgroundEffectValues | null) ?? defaultEffects;

  const settings = [
    { id: "blur", label: "Blur", min: 0, max: 20, step: 1, unit: "px" },
    { id: "noise", label: "Grain / Noise", min: 0, max: 100, step: 1, unit: "%" },
    { id: "brightness", label: "Brightness", min: 50, max: 150, step: 1, unit: "%" },
    { id: "saturation", label: "Saturation", min: 0, max: 200, step: 1, unit: "%" },
    { id: "contrast", label: "Contrast", min: 50, max: 150, step: 1, unit: "%" },
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
        <Button2 className="flex-1 bg-[#222] rounded-full shadow-dzenn text-white  hover:bg-zinc-700 transition-all duration-200">
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
              const value = bgEffects[item.id] ?? (item.id === "blur" || item.id === "noise" ? 0 : 100);

              return (
                <div key={item.id} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm font-medium">
                      <Label className="text-xs">{item.label}</Label>
                    </div>
                    <span className="text-xs font-mono text-muted-foreground">
                      {value}
                      {item.unit}
                    </span>
                  </div>
                  <IntensitySlider value={value} min={item.min} max={item.max} step={item.step} onValueChange={(val) => handleUpdateEffect(item.id, val)} />
                </div>
              );
            })}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
