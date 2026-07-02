"use client";

import * as React from "react";
import { useRef } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";

interface DockProps {
  className?: string;
  children: React.ReactNode;
  maxAdditionalSize?: number;
  iconSize?: number;
}

// ... (imports remain the same)
import { CardTexture } from "@/lib/generated/prisma/client";

interface DockIconProps {
  className?: string;
  src?: string;
  href: string;
  label: string;
  handleIconHover?: (e: React.MouseEvent<HTMLLIElement>) => void;
  children?: React.ReactNode;
  iconSize?: number;
  texture?: CardTexture;
}

type ScaleValueParams = [number, number];

const scaleValue = function (value: number, from: ScaleValueParams, to: ScaleValueParams): number {
  const scale = (to[1] - to[0]) / (from[1] - from[0]);
  const capped = Math.min(from[1], Math.max(from[0], value)) - from[0];
  return Math.floor(capped * scale + to[0]);
};

export function DockIcon({ className, src, href, label, handleIconHover, children, iconSize, texture }: DockIconProps) {
  const isGlassy = texture === "glassy";

  return (
    <>
      <style>{`
        .dock-icon:hover + .dock-icon {
          width: calc(var(--icon-size) * 1.33 + var(--dock-offset-right, 0px)) !important;
          height: calc(var(--icon-size) * 1.33 + var(--dock-offset-right, 0px)) !important;
          margin-top: calc(var(--icon-size) * -0.33 + var(--dock-offset-right, 0) * -1) !important;
        }
        .dock-icon:hover + .dock-icon + .dock-icon {
          width: calc(var(--icon-size) * 1.17 + var(--dock-offset-right, 0px)) !important;
          height: calc(var(--icon-size) * 1.17 + var(--dock-offset-right, 0px)) !important;
          margin-top: calc(var(--icon-size) * -0.17 + var(--dock-offset-right, 0) * -1) !important;
        }
        .dock-icon:has(+ .dock-icon:hover) {
          width: calc(var(--icon-size) * 1.33 + var(--dock-offset-left, 0px)) !important;
          height: calc(var(--icon-size) * 1.33 + var(--dock-offset-left, 0px)) !important;
          margin-top: calc(var(--icon-size) * -0.33 + var(--dock-offset-left, 0) * -1) !important;
        }
        .dock-icon:has(+ .dock-icon + .dock-icon:hover) {
          width: calc(var(--icon-size) * 1.17 + var(--dock-offset-left, 0px)) !important;
          height: calc(var(--icon-size) * 1.17 + var(--dock-offset-left, 0px)) !important;
          margin-top: calc(var(--icon-size) * -0.17 + var(--dock-offset-left, 0) * -1) !important;
        }
      `}</style>
      <li
        style={
          {
            transition: "all cubic-bezier(0.25, 1, 0.5, 1) 150ms",
            "--icon-size": `${iconSize}px`,
          } as React.CSSProperties
        }
        onMouseMove={handleIconHover}
        className={cn(
          "dock-icon group/li flex h-(--icon-size) w-(--icon-size) cursor-pointer items-center justify-center px-[calc(var(--icon-size)*0.075)] hover:-mt-[calc(var(--icon-size)/2)] hover:h-[calc(var(--icon-size)*1.5)] hover:w-[calc(var(--icon-size)*1.5)] [&_img]:object-contain",
          className,
        )}
      >
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className={cn(
            "group/a relative flex items-center justify-center aspect-square w-full rounded-[10px] p-1.5 transition-all duration-300",
            isGlassy
              ? "bg-white/10 border border-white/20 text-white backdrop-blur-md shadow-[0_4px_6px_-1px_rgba(0,0,0,0.1),0_2px_4px_-1px_rgba(0,0,0,0.06)] hover:bg-white/20"
              : "border border-gray-100 bg-linear-to-t from-neutral-100 to-white shadow-[rgba(0,0,0,0.05)_0px_1px_0px_inset] after:absolute after:inset-0 after:rounded-[inherit] after:shadow-md after:shadow-zinc-800/10 dark:border-zinc-900 dark:from-zinc-900 dark:to-zinc-800 dark:shadow-[rgba(255,255,255,0.3)_0px_1px_0px_inset]",
          )}
          style={
            !isGlassy
              ? {
                  backgroundColor: "var(--accent)",
                  borderColor: "var(--card-border, var(--border))",
                  color: "var(--primary)",
                }
              : {}
          }
        >
          <span className="absolute top-[-40px] left-1/2 -translate-x-1/2 rounded-md border border-gray-100 bg-linear-to-t from-neutral-100 to-white p-1 px-2 text-[10px] font-medium whitespace-nowrap text-black opacity-0 transition-opacity duration-200 group-hover/li:opacity-100 dark:border-zinc-800 dark:from-zinc-900 dark:to-zinc-800 dark:text-white pointer-events-none">
            {label}
          </span>
          {src ? <Image src={src} alt={label} fill sizes="48px" className="rounded-[inherit] object-contain" /> : children}
        </a>
      </li>
    </>
  );
}

export function Dock({ className, children, maxAdditionalSize = 5, iconSize = 40, texture }: DockProps & { texture?: CardTexture }) {
  const dockRef = useRef<HTMLDivElement | null>(null);

  const handleIconHover = React.useCallback(
    (e: React.MouseEvent<HTMLLIElement>) => {
      if (!dockRef.current) return;
      const mousePos = e.clientX;
      const iconPosLeft = e.currentTarget.getBoundingClientRect().left;
      const iconWidth = e.currentTarget.getBoundingClientRect().width;

      const cursorDistance = (mousePos - iconPosLeft) / iconWidth;
      const offsetPixels = scaleValue(cursorDistance, [0, 1], [maxAdditionalSize * -1, maxAdditionalSize]);

      dockRef.current.style.setProperty("--dock-offset-left", `${offsetPixels * -1}px`);

      dockRef.current.style.setProperty("--dock-offset-right", `${offsetPixels}px`);
    },
    [maxAdditionalSize],
  );

  return (
    <div className="flex justify-center w-full">
      <nav ref={dockRef} aria-label="Main Dock" className="pointer-events-auto ">
        <ul
          className={cn(
            "flex items-center rounded-2xl p-1 backdrop-blur-md",
            !texture || texture !== "glassy" ? "border border-gray-100 bg-linear-to-t from-neutral-50 to-white dark:border-zinc-900 dark:from-zinc-950 dark:to-zinc-900 shadow-xl" : "",
            className,
          )}
          style={
            !texture || texture !== "glassy"
              ? {
                  backgroundColor: "var(--card)",
                  borderColor: "var(--card-border, var(--border))",
                }
              : {}
          }
        >
          {React.Children.map(children, (child) => (React.isValidElement<DockIconProps>(child) ? React.cloneElement(child, { handleIconHover, iconSize, texture }) : child))}
        </ul>
      </nav>
    </div>
  );
}
