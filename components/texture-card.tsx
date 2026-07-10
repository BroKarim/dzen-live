"use client";
import React from "react";
import { GlassEffect } from "./control-panel/glass-effect";
import type { CardTexture } from "@/lib/generated/prisma/client";
import { styleTargetId, type StyleTarget, type TextStyle } from "@/lib/text-style";
import { getFontVariable } from "@/lib/font-catalog";

type Mode = "editor" | "public";

interface LinkItem {
  id: string;
  title: string;
  url: string;
  backgroundColor?: string;
  titleStyle?: TextStyle | null;
}

interface TexturedCardProps extends Partial<LinkItem> {
  texture?: CardTexture;
  className?: string;
  mode?: Mode;
  onStyleTargetClick?: (target: StyleTarget) => void;
  onBeforeNavigate?: () => void;
}

export function TexturedCard({
  id,
  title,
  url,
  backgroundColor = "bg-zinc-800",
  texture = "base",
  className = "",
  mode = "public",
  titleStyle,
  onStyleTargetClick,
  onBeforeNavigate,
}: TexturedCardProps) {
  const isEditor = mode === "editor";
  const titleColorClass = texture === "glassy" ? "text-black" : "text-white";

  const handleWrapperClick = (e: React.MouseEvent<HTMLElement>) => {
    if (isEditor) {
      e.stopPropagation();
      return;
    }
    window.open(url, "_blank");
  };

  const handleTitleClick = (e: React.MouseEvent<HTMLElement>) => {
    if (!isEditor || !id) return;
    e.stopPropagation();
    onStyleTargetClick?.({ type: "link", id, field: "title" });
  };

  const handleNavClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onBeforeNavigate?.();
  };

  const titleFontVar = titleStyle?.fontFamily ? getFontVariable(titleStyle.fontFamily) : undefined;
  const titleFontFamily = titleStyle?.fontFamily
    ? titleFontVar
      ? `var(${titleFontVar}), var(--font-geist-sans)`
      : `"${titleStyle.fontFamily}", var(--font-sans)`
    : undefined;

  const titleStyleObj: React.CSSProperties = {
    ...(titleStyle?.color ? { color: titleStyle.color } : {}),
    ...(titleFontFamily ? { fontFamily: titleFontFamily } : {}),
  };

  const CardHeader = (
    <div className="relative flex w-full min-h-16">
      <div className="flex w-full items-center justify-center px-6 py-4 z-10">
        <div className="flex items-center gap-3">
          <h2
            {...(id ? { "data-style-target": styleTargetId({ type: "link", id, field: "title" }) } : {})}
            {...(isEditor && id ? { onClick: handleTitleClick, onKeyDown: (e: React.KeyboardEvent) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleTitleClick(e as any); } }, tabIndex: 0, role: "button" as const } : {})}
            style={titleStyleObj}
            className={`${titleColorClass} text-lg font-semibold tracking-tighter line-clamp-2 text-center leading-snug max-w-[200px] ${isEditor ? "cursor-pointer rounded transition-all duration-150 hover:outline hover:outline-1 hover:outline-dashed hover:outline-white/40 hover:outline-offset-2" : ""}`}
          >
            {title}
          </h2>
        </div>
      </div>
    </div>
  );

  const WrapperProps = {
    onClick: handleWrapperClick,
    className: `group relative w-full ${isEditor ? "" : "cursor-pointer"} overflow-hidden rounded-md transition-all duration-300 ${!isEditor ? "hover:scale-[1.02] active:scale-[0.98]" : ""} ${className} ${texture !== "glassy" ? backgroundColor : ""} ${
      texture === "base" ? "shadow-dzenn border-none" : ""
    }`,
  };

  const Content = (
    <>
      <div className="absolute inset-0 opacity-10 rounded-md pointer-events-none" />
      {CardHeader}
      <div className="absolute left-0 right-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-white/30 to-transparent pointer-events-none" />
    </>
  );

  return texture === "glassy" ? <GlassEffect {...WrapperProps}>{Content}</GlassEffect> : <div {...WrapperProps}>{Content}</div>;
}
