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
    type: "number" | "string" | "range" | "boolean" | "select" | "color";
    min?: number;
    max?: number;
    step?: number;
    options?: { value: string; label: string }[];
    unit?: string;
    default: unknown;
  }[];
}

function None() {
  return null;
}

export const ANIMATED_BACKGROUNDS: Record<string, AnimatedBackgroundMeta> = {
  "none": {
    id: "none",
    label: "None",
    component: None,
    preview:
      "url(\"data:image/svg+xml,%3Csvg%20xmlns%3D'http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg'%20viewBox%3D'0%200%20100%20100'%3E%3Ccircle%20cx%3D'50'%20cy%3D'50'%20r%3D'40'%20fill%3D'none'%20stroke%3D'rgba(0%2C0%2C0%2C0.25)'%20stroke-width%3D'2'%20stroke-dasharray%3D'6%204'%2F%3E%3C%2Fsvg%3E\")",
    defaultConfig: {},
    configFields: [],
  },
  "retro-grid": {
    id: "retro-grid",
    label: "Retro Grid",
    component: RetroGrid,
    preview:
      "url(\"data:image/svg+xml,%3Csvg%20xmlns%3D'http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg'%20viewBox%3D'0%200%20100%20100'%3E%20%3Cdefs%3E%20%3ClinearGradient%20id%3D'fade'%20x1%3D'0'%20y1%3D'0'%20x2%3D'0'%20y2%3D'1'%3E%20%3Cstop%20offset%3D'0%25'%20stop-color%3D'transparent'%2F%3E%20%3Cstop%20offset%3D'30%25'%20stop-color%3D'rgba(0%2C0%2C0%2C0.03)'%2F%3E%20%3Cstop%20offset%3D'100%25'%20stop-color%3D'rgba(0%2C0%2C0%2C0.2)'%2F%3E%20%3C%2FlinearGradient%3E%20%3ClinearGradient%20id%3D'floor'%20x1%3D'0'%20y1%3D'0'%20x2%3D'0'%20y2%3D'1'%3E%20%3Cstop%20offset%3D'0%25'%20stop-color%3D'rgba(0%2C0%2C0%2C0.35)'%2F%3E%20%3Cstop%20offset%3D'100%25'%20stop-color%3D'rgba(0%2C0%2C0%2C0.08)'%2F%3E%20%3C%2FlinearGradient%3E%20%3C%2Fdefs%3E%20%3Cpolygon%20points%3D'50%2C15%20-30%2C100%20130%2C100'%20fill%3D'url(%23floor)'%20opacity%3D'0.15'%2F%3E%20%3Cg%20stroke%3D'rgba(0%2C0%2C0%2C0.25)'%20stroke-width%3D'0.6'%3E%20%3Cline%20x1%3D'50'%20y1%3D'15'%20x2%3D'-30'%20y2%3D'100'%20%2F%3E%20%3Cline%20x1%3D'50'%20y1%3D'15'%20x2%3D'0'%20y2%3D'100'%20%2F%3E%20%3Cline%20x1%3D'50'%20y1%3D'15'%20x2%3D'20'%20y2%3D'100'%20%2F%3E%20%3Cline%20x1%3D'50'%20y1%3D'15'%20x2%3D'35'%20y2%3D'100'%20%2F%3E%20%3Cline%20x1%3D'50'%20y1%3D'15'%20x2%3D'50'%20y2%3D'100'%20%2F%3E%20%3Cline%20x1%3D'50'%20y1%3D'15'%20x2%3D'65'%20y2%3D'100'%20%2F%3E%20%3Cline%20x1%3D'50'%20y1%3D'15'%20x2%3D'80'%20y2%3D'100'%20%2F%3E%20%3Cline%20x1%3D'50'%20y1%3D'15'%20x2%3D'100'%20y2%3D'100'%20%2F%3E%20%3Cline%20x1%3D'50'%20y1%3D'15'%20x2%3D'130'%20y2%3D'100'%20%2F%3E%20%3C%2Fg%3E%20%3Cg%20stroke%3D'rgba(0%2C0%2C0%2C0.22)'%20stroke-width%3D'0.5'%3E%20%3Cline%20x1%3D'-40'%20y1%3D'30'%20x2%3D'140'%20y2%3D'30'%20%2F%3E%20%3Cline%20x1%3D'-40'%20y1%3D'40'%20x2%3D'140'%20y2%3D'40'%20%2F%3E%20%3Cline%20x1%3D'-40'%20y1%3D'50'%20x2%3D'140'%20y2%3D'50'%20%2F%3E%20%3Cline%20x1%3D'-40'%20y1%3D'60'%20x2%3D'140'%20y2%3D'60'%20%2F%3E%20%3Cline%20x1%3D'-40'%20y1%3D'72'%20x2%3D'140'%20y2%3D'72'%20%2F%3E%20%3Cline%20x1%3D'-40'%20y1%3D'86'%20x2%3D'140'%20y2%3D'86'%20%2F%3E%20%3C%2Fg%3E%20%3Crect%20width%3D'100'%20height%3D'100'%20fill%3D'url(%23fade)'%2F%3E%20%3C%2Fsvg%3E\")",
    defaultConfig: {
      angle: 65,
      cellSize: 60,
      opacity: 0.5,
      lineColor: "#6b7280",
    },
    configFields: [
      { key: "angle", label: "Angle", type: "range", min: 1, max: 89, default: 65, unit: "°" },
      { key: "cellSize", label: "Cell Size", type: "range", min: 20, max: 200, step: 5, default: 60, unit: "px" },
      { key: "opacity", label: "Opacity", type: "range", min: 0.05, max: 1, step: 0.05, default: 0.5 },
      { key: "lineColor", label: "Line Color", type: "color", default: "#6b7280" },
    ],
  },
  "dot-pattern": {
    id: "dot-pattern",
    label: "Dot Pattern",
    component: DotPattern,
    preview:
      "url(\"data:image/svg+xml,%3Csvg%20xmlns%3D'http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg'%20viewBox%3D'0%200%20100%20100'%3E%20%3Cstyle%3E%20%40keyframes%20glow%20%7B%200%25%2C%20100%25%20%7B%20opacity%3A%200.25%3B%20transform%3A%20scale(0.8)%3B%20%7D%2050%25%20%7B%20opacity%3A%201%3B%20transform%3A%20scale(1.4)%3B%20%7D%20%7D%20.dot%20%7B%20animation%3A%20glow%202.5s%20ease-in-out%20infinite%3B%20%7D%20.d1%20%7B%20animation-delay%3A%200s%3B%20transform-origin%3A%2020px%2020px%3B%20%7D%20.d2%20%7B%20animation-delay%3A%200.5s%3B%20transform-origin%3A%2050px%2020px%3B%20%7D%20.d3%20%7B%20animation-delay%3A%201s%3B%20transform-origin%3A%2080px%2020px%3B%20%7D%20.d4%20%7B%20animation-delay%3A%201.5s%3B%20transform-origin%3A%2020px%2050px%3B%20%7D%20.d5%20%7B%20animation-delay%3A%200.2s%3B%20transform-origin%3A%2050px%2050px%3B%20%7D%20.d6%20%7B%20animation-delay%3A%200.7s%3B%20transform-origin%3A%2080px%2050px%3B%20%7D%20.d7%20%7B%20animation-delay%3A%201.2s%3B%20transform-origin%3A%2020px%2080px%3B%20%7D%20.d8%20%7B%20animation-delay%3A%201.7s%3B%20transform-origin%3A%2050px%2080px%3B%20%7D%20.d9%20%7B%20animation-delay%3A%200.4s%3B%20transform-origin%3A%2080px%2080px%3B%20%7D%20%3C%2Fstyle%3E%20%3Cg%20fill%3D'rgba(0%2C0%2C0%2C0.65)'%3E%20%3Ccircle%20cx%3D'20'%20cy%3D'20'%20r%3D'1.5'%20class%3D'dot%20d1'%20%2F%3E%20%3Ccircle%20cx%3D'50'%20cy%3D'20'%20r%3D'1.5'%20class%3D'dot%20d2'%20%2F%3E%20%3Ccircle%20cx%3D'80'%20cy%3D'20'%20r%3D'1.5'%20class%3D'dot%20d3'%20%2F%3E%20%3Ccircle%20cx%3D'20'%20cy%3D'50'%20r%3D'1.5'%20class%3D'dot%20d4'%20%2F%3E%20%3Ccircle%20cx%3D'50'%20cy%3D'50'%20r%3D'1.5'%20class%3D'dot%20d5'%20%2F%3E%20%3Ccircle%20cx%3D'80'%20cy%3D'50'%20r%3D'1.5'%20class%3D'dot%20d6'%20%2F%3E%20%3Ccircle%20cx%3D'20'%20cy%3D'80'%20r%3D'1.5'%20class%3D'dot%20d7'%20%2F%3E%20%3Ccircle%20cx%3D'50'%20cy%3D'80'%20r%3D'1.5'%20class%3D'dot%20d8'%20%2F%3E%20%3Ccircle%20cx%3D'80'%20cy%3D'80'%20r%3D'1.5'%20class%3D'dot%20d9'%20%2F%3E%20%3C%2Fg%3E%20%3C%2Fsvg%3E\")",
    defaultConfig: {
      width: 16,
      height: 16,
      glow: false,
    },
    configFields: [
      { key: "width", label: "Spacing X", type: "range", min: 8, max: 64, step: 2, default: 16, unit: "px" },
      { key: "height", label: "Spacing Y", type: "range", min: 8, max: 64, step: 2, default: 16, unit: "px" },
      { key: "glow", label: "Glow", type: "boolean", default: false },
    ],
  },
  "flickering-grid": {
    id: "flickering-grid",
    label: "Flickering Grid",
    component: FlickeringGrid,
    preview:
      "url(\"data:image/svg+xml,%3Csvg%20xmlns%3D'http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg'%20viewBox%3D'0%200%20100%20100'%3E%20%3Cstyle%3E%20%40keyframes%20flick%20%7B%200%25%2C%20100%25%20%7B%20opacity%3A%200.1%3B%20%7D%2045%25%2C%2055%25%20%7B%20opacity%3A%200.1%3B%20%7D%2050%25%20%7B%20opacity%3A%200.85%3B%20%7D%20%7D%20.sq%20%7B%20animation%3A%20flick%202s%20infinite%3B%20fill%3A%20rgba(0%2C0%2C0%2C0.65)%3B%20%7D%20.s1%20%7B%20animation-delay%3A%200.1s%3B%20animation-duration%3A%201.4s%3B%20%7D%20.s2%20%7B%20animation-delay%3A%200.5s%3B%20animation-duration%3A%201.8s%3B%20%7D%20.s3%20%7B%20animation-delay%3A%200.9s%3B%20animation-duration%3A%201.5s%3B%20%7D%20.s4%20%7B%20animation-delay%3A%201.3s%3B%20animation-duration%3A%202.2s%3B%20%7D%20%3C%2Fstyle%3E%20%3Cg%20opacity%3D'0.2'%20stroke%3D'black'%20stroke-width%3D'0.5'%3E%20%3Cline%20x1%3D'0'%20y1%3D'20'%20x2%3D'100'%20y2%3D'20'%20%2F%3E%20%3Cline%20x1%3D'0'%20y1%3D'40'%20x2%3D'100'%20y2%3D'40'%20%2F%3E%20%3Cline%20x1%3D'0'%20y1%3D'60'%20x2%3D'100'%20y2%3D'60'%20%2F%3E%20%3Cline%20x1%3D'0'%20y1%3D'80'%20x2%3D'100'%20y2%3D'80'%20%2F%3E%20%3Cline%20x1%3D'20'%20y1%3D'0'%20x2%3D'20'%20y2%3D'100'%20%2F%3E%20%3Cline%20x1%3D'40'%20y1%3D'0'%20x2%3D'40'%20y2%3D'100'%20%2F%3E%20%3Cline%20x1%3D'60'%20y1%3D'0'%20x2%3D'60'%20y2%3D'100'%20%2F%3E%20%3Cline%20x1%3D'80'%20y1%3D'0'%20x2%3D'80'%20y2%3D'100'%20%2F%3E%20%3C%2Fg%3E%20%3Crect%20x%3D'2'%20y%3D'2'%20width%3D'16'%20height%3D'16'%20class%3D'sq%20s1'%20%2F%3E%20%3Crect%20x%3D'42'%20y%3D'22'%20width%3D'16'%20height%3D'16'%20class%3D'sq%20s2'%20%2F%3E%20%3Crect%20x%3D'82'%20y%3D'42'%20width%3D'16'%20height%3D'16'%20class%3D'sq%20s3'%20%2F%3E%20%3Crect%20x%3D'22'%20y%3D'62'%20width%3D'16'%20height%3D'16'%20class%3D'sq%20s4'%20%2F%3E%20%3Crect%20x%3D'62'%20y%3D'82'%20width%3D'16'%20height%3D'16'%20class%3D'sq%20s1'%20%2F%3E%20%3Crect%20x%3D'82'%20y%3D'2'%20width%3D'16'%20height%3D'16'%20class%3D'sq%20s2'%20%2F%3E%20%3Crect%20x%3D'2'%20y%3D'82'%20width%3D'16'%20height%3D'16'%20class%3D'sq%20s3'%20%2F%3E%20%3C%2Fsvg%3E\")",
    defaultConfig: {
      squareSize: 4,
      gridGap: 6,
      flickerChance: 0.3,
      maxOpacity: 0.3,
    },
    configFields: [
      { key: "squareSize", label: "Square Size", type: "range", min: 2, max: 20, step: 1, default: 4, unit: "px" },
      { key: "gridGap", label: "Gap", type: "range", min: 2, max: 30, step: 1, default: 6, unit: "px" },
      { key: "flickerChance", label: "Flicker Rate", type: "range", min: 0.05, max: 1, step: 0.05, default: 0.3 },
      { key: "maxOpacity", label: "Max Opacity", type: "range", min: 0.05, max: 1, step: 0.05, default: 0.3 },
    ],
  },
  "striped": {
    id: "striped",
    label: "Stripes",
    component: StripedPattern,
    preview:
      "url(\"data:image/svg+xml,%3Csvg%20xmlns%3D'http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg'%20viewBox%3D'0%200%20100%20100'%3E%20%3Cstyle%3E%20%40keyframes%20move%20%7B%200%25%20%7B%20transform%3A%20translate(0%2C%200)%3B%20%7D%20100%25%20%7B%20transform%3A%20translate(-14.14px%2C%2014.14px)%3B%20%7D%20%7D%20.stripes%20%7B%20animation%3A%20move%201.2s%20linear%20infinite%3B%20%7D%20%3C%2Fstyle%3E%20%3Cg%20class%3D'stripes'%20stroke%3D'rgba(0%2C0%2C0%2C0.35)'%20stroke-width%3D'3'%3E%20%3Cline%20x1%3D'-50'%20y1%3D'0'%20x2%3D'50'%20y2%3D'100'%20%2F%3E%20%3Cline%20x1%3D'-20'%20y1%3D'0'%20x2%3D'80'%20y2%3D'100'%20%2F%3E%20%3Cline%20x1%3D'10'%20y1%3D'0'%20x2%3D'110'%20y2%3D'100'%20%2F%3E%20%3Cline%20x1%3D'40'%20y1%3D'0'%20x2%3D'140'%20y2%3D'100'%20%2F%3E%20%3Cline%20x1%3D'70'%20y1%3D'0'%20x2%3D'170'%20y2%3D'100'%20%2F%3E%20%3Cline%20x1%3D'100'%20y1%3D'0'%20x2%3D'200'%20y2%3D'100'%20%2F%3E%20%3Cline%20x1%3D'130'%20y1%3D'0'%20x2%3D'230'%20y2%3D'100'%20%2F%3E%20%3C%2Fg%3E%20%3C%2Fsvg%3E\")",
    defaultConfig: {
      direction: "left",
      width: 10,
      height: 10,
      lineColor: "#6b7280",
    },
    configFields: [
      { key: "direction", label: "Direction", type: "select", options: [{ value: "left", label: "Left" }, { value: "right", label: "Right" }], default: "left" },
      { key: "width", label: "Width", type: "range", min: 4, max: 40, step: 2, default: 10, unit: "px" },
      { key: "height", label: "Height", type: "range", min: 4, max: 40, step: 2, default: 10, unit: "px" },
      { key: "lineColor", label: "Line Color", type: "color", default: "#6b7280" },
    ],
  },
  "grid-pattern": {
    id: "grid-pattern",
    label: "Interactive Grid",
    component: InteractiveGridPattern,
    preview:
      "url(\"data:image/svg+xml,%3Csvg%20xmlns%3D'http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg'%20viewBox%3D'0%200%20100%20100'%3E%20%3Cstyle%3E%20%40keyframes%20pulse-grid%20%7B%200%25%2C%20100%25%20%7B%20opacity%3A%200.15%3B%20%7D%2050%25%20%7B%20opacity%3A%200.55%3B%20%7D%20%7D%20.grid%20%7B%20animation%3A%20pulse-grid%203s%20ease-in-out%20infinite%3B%20%7D%20%3C%2Fstyle%3E%20%3Cdefs%3E%20%3CradialGradient%20id%3D'sp'%20cx%3D'50%25'%20cy%3D'50%25'%20r%3D'50%25'%3E%20%3Cstop%20offset%3D'0%25'%20stop-color%3D'black'%20stop-opacity%3D'0.25'%2F%3E%20%3Cstop%20offset%3D'100%25'%20stop-color%3D'black'%20stop-opacity%3D'0'%2F%3E%20%3C%2FradialGradient%3E%20%3C%2Fdefs%3E%20%3Cg%20stroke%3D'rgba(0%2C0%2C0%2C0.35)'%20stroke-width%3D'0.5'%20class%3D'grid'%3E%20%3Cline%20x1%3D'0'%20y1%3D'20'%20x2%3D'100'%20y2%3D'20'%20%2F%3E%20%3Cline%20x1%3D'0'%20y1%3D'40'%20x2%3D'100'%20y2%3D'40'%20%2F%3E%20%3Cline%20x1%3D'0'%20y1%3D'60'%20x2%3D'100'%20y2%3D'60'%20%2F%3E%20%3Cline%20x1%3D'0'%20y1%3D'80'%20x2%3D'100'%20y2%3D'80'%20%2F%3E%20%3Cline%20x1%3D'20'%20y1%3D'0'%20x2%3D'20'%20y2%3D'100'%20%2F%3E%20%3Cline%20x1%3D'40'%20y1%3D'0'%20x2%3D'40'%20y2%3D'100'%20%2F%3E%20%3Cline%20x1%3D'60'%20y1%3D'0'%20x2%3D'60'%20y2%3D'100'%20%2F%3E%20%3Cline%20x1%3D'80'%20y1%3D'0'%20x2%3D'80'%20y2%3D'100'%20%2F%3E%20%3C%2Fg%3E%20%3Ccircle%20cx%3D'50'%20cy%3D'50'%20r%3D'35'%20fill%3D'url(%23sp)'%20%2F%3E%20%3C%2Fsvg%3E\")",
    defaultConfig: {
      width: 40,
      height: 40,
      lineColor: "#6b7280",
    },
    configFields: [
      { key: "width", label: "Cell Width", type: "range", min: 20, max: 100, step: 5, default: 40, unit: "px" },
      { key: "height", label: "Cell Height", type: "range", min: 20, max: 100, step: 5, default: 40, unit: "px" },
      { key: "lineColor", label: "Line Color", type: "color", default: "#6b7280" },
    ],
  },
  "hexagon": {
    id: "hexagon",
    label: "Hexagons",
    component: HexagonPattern,
    preview:
      "url(\"data:image/svg+xml,%3Csvg%20xmlns%3D'http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg'%20viewBox%3D'0%200%20100%20100'%3E%20%3Cdefs%3E%20%3ClinearGradient%20id%3D'hexGrad'%20x1%3D'0'%20y1%3D'0'%20x2%3D'0'%20y2%3D'1'%3E%20%3Cstop%20offset%3D'0%25'%20stop-color%3D'rgba(0%2C0%2C0%2C0.06)'%2F%3E%20%3Cstop%20offset%3D'100%25'%20stop-color%3D'rgba(0%2C0%2C0%2C0.18)'%2F%3E%20%3C%2FlinearGradient%3E%20%3C%2Fdefs%3E%20%3Cg%20fill%3D'none'%20stroke%3D'rgba(0%2C0%2C0%2C0.3)'%20stroke-width%3D'0.75'%3E%20%3Cpolygon%20points%3D'20%2C10%2035%2C10%2042.5%2C23%2035%2C36%2020%2C36%2012.5%2C23'%20%2F%3E%20%3Cpolygon%20points%3D'55%2C10%2070%2C10%2077.5%2C23%2070%2C36%2055%2C36%2047.5%2C23'%20%2F%3E%20%3Cpolygon%20points%3D'37.5%2C36%2052.5%2C36%2060%2C49%2052.5%2C62%2037.5%2C62%2030%2C49'%20fill%3D'url(%23hexGrad)'%2F%3E%20%3Cpolygon%20points%3D'2.5%2C36%2017.5%2C36%2025%2C49%2017.5%2C62%202.5%2C62%20-5%2C49'%20%2F%3E%20%3Cpolygon%20points%3D'72.5%2C36%2087.5%2C36%2095%2C49%2087.5%2C62%2072.5%2C62%2065%2C49'%20%2F%3E%20%3Cpolygon%20points%3D'20%2C62%2035%2C62%2042.5%2C75%2035%2C88%2020%2C88%2012.5%2C75'%20fill%3D'url(%23hexGrad)'%2F%3E%20%3Cpolygon%20points%3D'55%2C62%2070%2C62%2077.5%2C75%2070%2C88%2055%2C88%2047.5%2C75'%20%2F%3E%20%3C%2Fg%3E%20%3C%2Fsvg%3E\")",
    defaultConfig: {
      radius: 40,
      gap: 0,
      direction: "horizontal",
      lineColor: "#6b7280",
    },
    configFields: [
      { key: "radius", label: "Radius", type: "range", min: 20, max: 80, step: 5, default: 40, unit: "px" },
      { key: "gap", label: "Gap", type: "range", min: 0, max: 20, step: 1, default: 0, unit: "px" },
      { key: "direction", label: "Direction", type: "select", options: [{ value: "horizontal", label: "Horizontal" }, { value: "vertical", label: "Vertical" }], default: "horizontal" },
      { key: "lineColor", label: "Line Color", type: "color", default: "#6b7280" },
    ],
  },
  "ripple": {
    id: "ripple",
    label: "Ripple",
    component: Ripple,
    preview:
      "url(\"data:image/svg+xml,%3Csvg%20xmlns%3D'http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg'%20viewBox%3D'0%200%20100%20100'%3E%20%3Cdefs%3E%20%3CradialGradient%20id%3D'center'%20cx%3D'50%25'%20cy%3D'50%25'%20r%3D'50%25'%3E%20%3Cstop%20offset%3D'0%25'%20stop-color%3D'rgba(0%2C0%2C0%2C0.3)'%2F%3E%20%3Cstop%20offset%3D'40%25'%20stop-color%3D'rgba(0%2C0%2C0%2C0.15)'%2F%3E%20%3Cstop%20offset%3D'100%25'%20stop-color%3D'transparent'%2F%3E%20%3C%2FradialGradient%3E%20%3C%2Fdefs%3E%20%3Cg%20fill%3D'none'%20stroke%3D'rgba(0%2C0%2C0%2C0.3)'%20stroke-width%3D'1.2'%3E%20%3Ccircle%20cx%3D'50'%20cy%3D'50'%20r%3D'6'%20stroke-opacity%3D'0.7'%2F%3E%20%3Ccircle%20cx%3D'50'%20cy%3D'50'%20r%3D'16'%20stroke-opacity%3D'0.55'%2F%3E%20%3Ccircle%20cx%3D'50'%20cy%3D'50'%20r%3D'26'%20stroke-opacity%3D'0.4'%2F%3E%20%3Ccircle%20cx%3D'50'%20cy%3D'50'%20r%3D'36'%20stroke-opacity%3D'0.28'%2F%3E%20%3Ccircle%20cx%3D'50'%20cy%3D'50'%20r%3D'46'%20stroke-opacity%3D'0.18'%2F%3E%20%3C%2Fg%3E%20%3Ccircle%20cx%3D'50'%20cy%3D'50'%20r%3D'30'%20fill%3D'url(%23center)'%2F%3E%20%3C%2Fsvg%3E\")",
    defaultConfig: {
      mainCircleSize: 210,
      mainCircleOpacity: 0.24,
      numCircles: 8,
      rippleColor: "#6b7280",
    },
    configFields: [
      { key: "mainCircleSize", label: "Base Size", type: "range", min: 50, max: 400, step: 10, default: 210, unit: "px" },
      { key: "mainCircleOpacity", label: "Opacity", type: "range", min: 0.05, max: 1, step: 0.05, default: 0.24 },
      { key: "numCircles", label: "Count", type: "range", min: 3, max: 20, step: 1, default: 8 },
      { key: "rippleColor", label: "Color", type: "color", default: "#6b7280" },
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
