"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

const PRESET_COLORS = [
  { name: "White", value: "#ffffff" },
  { name: "Black", value: "#000000" },
  { name: "Slate", value: "#64748b" },
  { name: "Red", value: "#ef4444" },
  { name: "Orange", value: "#f97316" },
  { name: "Amber", value: "#f59e0b" },
  { name: "Emerald", value: "#10b981" },
  { name: "Blue", value: "#3b82f6" },
] as const;

interface ColorPickerProps {
  value: string | undefined;
  onChange: (color: string | undefined) => void;
}

type Hsl = { h: number; s: number; l: number };

const clamp = (n: number, min: number, max: number) => Math.min(max, Math.max(min, n));

function hexToHsl(hex: string): Hsl {
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      case b:
        h = (r - g) / d + 4;
        break;
    }
    h /= 6;
  }
  return { h: h * 360, s: s * 100, l: l * 100 };
}

function hslToHex({ h, s, l }: Hsl): string {
  s = clamp(s, 0, 100) / 100;
  l = clamp(l, 0, 100) / 100;
  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = l - c / 2;
  let r = 0,
    g = 0,
    b = 0;
  if (h < 60) [r, g, b] = [c, x, 0];
  else if (h < 120) [r, g, b] = [x, c, 0];
  else if (h < 180) [r, g, b] = [0, c, x];
  else if (h < 240) [r, g, b] = [0, x, c];
  else if (h < 300) [r, g, b] = [x, 0, c];
  else [r, g, b] = [c, 0, x];
  const toHex = (v: number) =>
    clamp(Math.round((v + m) * 255), 0, 255)
      .toString(16)
      .padStart(2, "0");
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

function isValidHex(v: string) {
  return /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(v);
}

export function ColorPicker({ value, onChange }: ColorPickerProps) {
  const [hsl, setHsl] = useState<Hsl>(() => (value && isValidHex(value) ? hexToHsl(value) : { h: 0, s: 100, l: 50 }));
  const gradientRef = useRef<HTMLDivElement>(null);
  const hueRef = useRef<HTMLDivElement>(null);
  const draggingRef = useRef<"sat" | "hue" | null>(null);
  const onChangeRef = useRef(onChange);
  const hslRef = useRef(hsl);
  const prevHslRef = useRef(hsl);

  useEffect(() => {
    onChangeRef.current = onChange;
    hslRef.current = hsl;
  });

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      if (draggingRef.current === "sat") {
        const el = gradientRef.current;
        if (!el) return;
        const rect = el.getBoundingClientRect();
        const x = clamp(e.clientX - rect.left, 0, rect.width);
        const y = clamp(e.clientY - rect.top, 0, rect.height);
        const s = (x / rect.width) * 100;
        const l = 100 - (y / rect.height) * 100;
        const next: Hsl = { h: hslRef.current.h, s, l };
        setHsl(next);
        onChangeRef.current(hslToHex(next));
      } else if (draggingRef.current === "hue") {
        const el = hueRef.current;
        if (!el) return;
        const rect = el.getBoundingClientRect();
        const x = clamp(e.clientX - rect.left, 0, rect.width);
        const h = (x / rect.width) * 360;
        const next: Hsl = { h, s: hslRef.current.s, l: hslRef.current.l };
        setHsl(next);
        onChangeRef.current(hslToHex(next));
      }
    };
    const onUp = () => (draggingRef.current = null);
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };
  }, []);

  const handleGradientMouseDown = (e: React.MouseEvent) => {
    draggingRef.current = "sat";
    const el = gradientRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = clamp(e.clientX - rect.left, 0, rect.width);
    const y = clamp(e.clientY - rect.top, 0, rect.height);
    const s = (x / rect.width) * 100;
    const l = 100 - (y / rect.height) * 100;
    const next: Hsl = { h: hsl.h, s, l };
    setHsl(next);
    onChange(hslToHex(next));
  };

  const handleHueMouseDown = (e: React.MouseEvent) => {
    draggingRef.current = "hue";
    const el = hueRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = clamp(e.clientX - rect.left, 0, rect.width);
    const h = (x / rect.width) * 360;
    const next: Hsl = { h, s: hsl.s, l: hsl.l };
    setHsl(next);
    onChange(hslToHex(next));
  };

  const handlePreset = (hex: string) => {
    onChange(hex);
    setHsl(hexToHsl(hex));
  };

  const currentHex = value && isValidHex(value) ? value : "#ffffff";

  return (
    <div className="space-y-3 w-full">
      {/* Preset Colors Grid */}
      <div className="grid grid-cols-8 gap-1.5">
        {PRESET_COLORS.map((c) => (
          <button
            key={c.value}
            type="button"
            onClick={() => handlePreset(c.value)}
            className={cn("aspect-square rounded-md border border-white/10 transition-all hover:scale-110", currentHex.toLowerCase() === c.value.toLowerCase() && "ring-2 ring-white ring-offset-2 ring-offset-zinc-950")}
            style={{ backgroundColor: c.value }}
            title={c.name}
            aria-label={c.name}
          />
        ))}
      </div>

      {/* Custom Picker Container - Sekarang Selalu Tampil */}
      <div className="space-y-2.5 rounded-lg border border-white/10 bg-zinc-900/50 p-2.5">
        <div
          ref={gradientRef}
          onMouseDown={handleGradientMouseDown}
          role="slider"
          tabIndex={0}
          aria-label="Saturation and lightness"
          aria-valuenow={Math.round(hsl.s)}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuetext={`saturation ${Math.round(hsl.s)}%, lightness ${Math.round(hsl.l)}%`}
          className="relative h-28 w-full rounded-md cursor-crosshair touch-none"
          style={{
            backgroundColor: hslToHex({ h: hsl.h, s: 100, l: 50 }),
            backgroundImage: "linear-gradient(to right, #fff, transparent), linear-gradient(to top, #000, transparent)",
          }}
        >
          <div className="absolute size-3 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white shadow-md pointer-events-none" style={{ left: `${hsl.s}%`, top: `${100 - hsl.l}%` }} />
        </div>

        <div
          ref={hueRef}
          onMouseDown={handleHueMouseDown}
          role="slider"
          tabIndex={0}
          aria-label="Hue"
          aria-valuenow={Math.round(hsl.h)}
          aria-valuemin={0}
          aria-valuemax={360}
          aria-valuetext={`${Math.round(hsl.h)} degrees`}
          className="relative h-2.5 w-full rounded-full cursor-pointer touch-none"
          style={{ background: "linear-gradient(to right, #f00 0%, #ff0 17%, #0f0 33%, #0ff 50%, #00f 67%, #f0f 83%, #f00 100%)" }}
        >
          <div
            className="absolute top-1/2 size-3 -translate-y-1/2 -translate-x-1/2 rounded-full border-2 border-white shadow-md pointer-events-none"
            style={{ left: `${(hsl.h / 360) * 100}%`, backgroundColor: hslToHex({ h: hsl.h, s: 100, l: 50 }) }}
          />
        </div>
      </div>
    </div>
  );
}
