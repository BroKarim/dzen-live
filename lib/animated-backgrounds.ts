import type { ComponentType } from "react";
import { RetroGrid } from "@/components/control-panel/animated-background/retro-grid";

export interface AnimatedBackgroundMeta {
  id: string;
  label: string;
  component: ComponentType<any>;
  preview: string;
  defaultConfig: Record<string, unknown>;
  configFields: {
    key: string;
    label: string;
    type: "number" | "string" | "range";
    min?: number;
    max?: number;
    step?: number;
    default: unknown;
  }[];
}

export const ANIMATED_BACKGROUNDS: Record<string, AnimatedBackgroundMeta> = {
  "retro-grid": {
    id: "retro-grid",
    label: "Retro Grid",
    component: RetroGrid,
    preview:
      "linear-gradient(135deg, rgba(128,128,128,0.3) 0%, rgba(128,128,128,0.1) 50%, rgba(128,128,128,0.3) 100%)",
    defaultConfig: {
      angle: 65,
      cellSize: 60,
      opacity: 0.5,
      lightLineColor: "gray",
      darkLineColor: "gray",
    },
    configFields: [
      { key: "angle", label: "Angle", type: "range", min: 1, max: 89, default: 65 },
      { key: "cellSize", label: "Cell Size", type: "number", min: 20, max: 200, step: 10, default: 60 },
      { key: "opacity", label: "Opacity", type: "range", min: 0.05, max: 1, step: 0.05, default: 0.5 },
      { key: "lightLineColor", label: "Line (Light)", type: "string", default: "gray" },
      { key: "darkLineColor", label: "Line (Dark)", type: "string", default: "gray" },
    ],
  },
};

export function getAnimatedBackgroundComponent(
  id: string,
): ComponentType<any> | null {
  return ANIMATED_BACKGROUNDS[id]?.component ?? null;
}

export function getAnimatedBackgroundMeta(
  id: string,
): AnimatedBackgroundMeta | null {
  return ANIMATED_BACKGROUNDS[id] ?? null;
}
