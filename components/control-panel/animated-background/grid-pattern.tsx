"use client";

import React, { useId } from "react";

import { cn } from "@/lib/utils";

/**
 * InteractiveGridPattern is a component that renders a grid pattern background.
 *
 * @param width - The width of each grid cell.
 * @param height - The height of each grid cell.
 * @param className - The class name of the grid.
 */
interface InteractiveGridPatternProps extends React.SVGProps<SVGSVGElement> {
  width?: number;
  height?: number;
  lineColor?: string;
  className?: string;
}

/**
 * The InteractiveGridPattern component.
 *
 * @see InteractiveGridPatternProps for the props interface.
 * @returns A React component.
 */
export function InteractiveGridPattern({ width = 40, height = 40, lineColor = "gray", className, ...props }: InteractiveGridPatternProps) {
  const id = useId();

  return (
    <svg aria-hidden="true" className={cn("pointer-events-none absolute inset-0 h-full w-full", className)} style={{ color: lineColor }} {...props}>
      <defs>
        <pattern id={id} width={width} height={height} patternUnits="userSpaceOnUse">
          <path d={`M ${width} 0 L 0 0 0 ${height}`} fill="none" stroke="currentColor" strokeWidth="0.5" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill={`url(#${id})`} />
    </svg>
  );
}
