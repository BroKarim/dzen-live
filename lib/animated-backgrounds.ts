import type { ComponentType } from "react";
import { RetroGrid } from "@/components/control-panel/animated-background/retro-grid";
import { DotPattern } from "@/components/control-panel/animated-background/dot-pattern";
import { StripedPattern } from "@/components/control-panel/animated-background/stripped";
import { FlickeringGrid } from "@/components/control-panel/animated-background/flickering-grid";
import { InteractiveGridPattern } from "@/components/control-panel/animated-background/grid-pattern";
import { HexagonPattern } from "@/components/control-panel/animated-background/hexagon";
import { Ripple } from "@/components/control-panel/animated-background/ripple";

export interface AnimatedBackgroundMeta {
  id: string;
  label: string;
  component: ComponentType<any>;
  preview: string;
  defaultConfig: Record<string, unknown>;
  configFields: {
    key: string;
    label: string;
    type: "number" | "string" | "range" | "boolean";
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
      "linear-gradient(135deg, rgba(0,0,0,0.3) 0%, rgba(0,0,0,0.1) 50%, rgba(0,0,0,0.3) 100%)",
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
  "dot-pattern": {
    id: "dot-pattern",
    label: "Dot Pattern",
    component: DotPattern,
    preview:
      "radial-gradient(circle, rgba(0,0,0,0.4) 1px, transparent 1px)",
    defaultConfig: {
      width: 16,
      height: 16,
      glow: false,
    },
    configFields: [
      { key: "width", label: "Spacing X", type: "number", min: 8, max: 64, step: 2, default: 16 },
      { key: "height", label: "Spacing Y", type: "number", min: 8, max: 64, step: 2, default: 16 },
      { key: "glow", label: "Glow", type: "boolean", default: false },
    ],
  },
  "flickering-grid": {
    id: "flickering-grid",
    label: "Flickering Grid",
    component: FlickeringGrid,
    preview:
      "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.2) 2px, rgba(0,0,0,0.2) 4px)",
    defaultConfig: {
      squareSize: 4,
      gridGap: 6,
      flickerChance: 0.3,
      maxOpacity: 0.3,
    },
    configFields: [
      { key: "squareSize", label: "Square Size", type: "range", min: 2, max: 20, step: 1, default: 4 },
      { key: "gridGap", label: "Gap", type: "range", min: 2, max: 30, step: 1, default: 6 },
      { key: "flickerChance", label: "Flicker Rate", type: "range", min: 0.05, max: 1, step: 0.05, default: 0.3 },
      { key: "maxOpacity", label: "Max Opacity", type: "range", min: 0.05, max: 1, step: 0.05, default: 0.3 },
    ],
  },
  "striped": {
    id: "striped",
    label: "Stripes",
    component: StripedPattern,
    preview:
      "repeating-linear-gradient(45deg, rgba(0,0,0,0.3) 0px, rgba(0,0,0,0.3) 1px, transparent 1px, transparent 8px)",
    defaultConfig: {
      direction: "left",
      width: 10,
      height: 10,
    },
    configFields: [
      { key: "direction", label: "Direction", type: "string", default: "left" },
      { key: "width", label: "Width", type: "number", min: 4, max: 40, step: 2, default: 10 },
      { key: "height", label: "Height", type: "number", min: 4, max: 40, step: 2, default: 10 },
    ],
  },
  "grid-pattern": {
    id: "grid-pattern",
    label: "Interactive Grid",
    component: InteractiveGridPattern,
    preview:
      "repeating-linear-gradient(0deg, transparent, transparent 8px, rgba(0,0,0,0.2) 8px, rgba(0,0,0,0.2) 9px), repeating-linear-gradient(90deg, transparent, transparent 8px, rgba(0,0,0,0.2) 8px, rgba(0,0,0,0.2) 9px)",
    defaultConfig: {
      width: 40,
      height: 40,
    },
    configFields: [
      { key: "width", label: "Cell Width", type: "number", min: 20, max: 100, step: 10, default: 40 },
      { key: "height", label: "Cell Height", type: "number", min: 20, max: 100, step: 10, default: 40 },
    ],
  },
  "hexagon": {
    id: "hexagon",
    label: "Hexagons",
    component: HexagonPattern,
    preview:
      "linear-gradient(120deg, rgba(0,0,0,0.2) 0%, rgba(0,0,0,0.05) 50%, rgba(0,0,0,0.2) 100%)",
    defaultConfig: {
      radius: 40,
      gap: 0,
      direction: "horizontal",
    },
    configFields: [
      { key: "radius", label: "Radius", type: "range", min: 20, max: 80, step: 5, default: 40 },
      { key: "gap", label: "Gap", type: "range", min: 0, max: 20, step: 1, default: 0 },
      { key: "direction", label: "Direction", type: "string", default: "horizontal" },
    ],
  },
  "ripple": {
    id: "ripple",
    label: "Ripple",
    component: Ripple,
    preview:
      "radial-gradient(circle at 50% 50%, rgba(0,0,0,0.3) 0%, transparent 70%)",
    defaultConfig: {
      mainCircleSize: 210,
      mainCircleOpacity: 0.24,
      numCircles: 8,
    },
    configFields: [
      { key: "mainCircleSize", label: "Base Size", type: "range", min: 50, max: 400, step: 10, default: 210 },
      { key: "mainCircleOpacity", label: "Opacity", type: "range", min: 0.05, max: 1, step: 0.05, default: 0.24 },
      { key: "numCircles", label: "Count", type: "range", min: 3, max: 20, step: 1, default: 8 },
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
