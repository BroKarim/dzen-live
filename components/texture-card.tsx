"use client";
import React, { useState } from "react";
import Image from "next/image";
import { m, AnimatePresence, LazyMotion, domAnimation } from "framer-motion";
import { ExternalLink } from "lucide-react";
import { GlassEffect } from "./control-panel/glass-effect";
import type { CardTexture } from "@/lib/generated/prisma/client";
import { styleTargetId, type StyleTarget, type TextStyle } from "@/lib/text-style";
import { getFontVariable } from "@/lib/font-catalog";

type Mode = "editor" | "public";

interface LinkItem {
  id: string;
  title: string;
  url: string;
  description?: string;
  imageUrl?: string;
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
  description,
  url,
  imageUrl,
  backgroundColor = "bg-zinc-800",
  texture = "base",
  className = "",
  mode = "public",
  titleStyle,
  onStyleTargetClick,
  onBeforeNavigate,
}: TexturedCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const hasExtraContent = !!(description || imageUrl);
  const isEditor = mode === "editor";
  const titleColorClass = texture === "glassy" ? "text-white" : "text-[var(--accent)]";

  const handleWrapperClick = (e: React.MouseEvent<HTMLElement>) => {
    if (isEditor) {
      e.stopPropagation();
      return;
    }
    if (hasExtraContent) {
      setIsExpanded(!isExpanded);
    } else {
      window.open(url, "_blank");
    }
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
      {imageUrl ? (
        <>
          <div className="flex flex-1 items-center justify-end px-6 py-4 z-10">
            <div className="flex items-center gap-3">
              <h2
                {...(id ? { "data-style-target": styleTargetId({ type: "link", id, field: "title" }) } : {})}
                onClick={handleTitleClick}
                style={titleStyleObj}
                className={`${titleColorClass} text-lg font-semibold tracking-tighter line-clamp-2 text-right leading-snug ${isEditor ? "cursor-pointer rounded transition-all duration-150 hover:outline hover:outline-1 hover:outline-dashed hover:outline-white/40 hover:outline-offset-2" : ""}`}
              >
                {title}
              </h2>
            </div>
          </div>
          <div className={`relative w-20 shrink-0 overflow-hidden rounded-r-md transition-opacity duration-300 ${isExpanded ? "opacity-0 pointer-events-none" : "opacity-100"}`}>
            <Image src={imageUrl} fill className="object-cover shadow-sm" alt={title || ""} sizes="80px" />
          </div>
        </>
      ) : (
        <div className="flex w-full items-center justify-center px-6 py-4 z-10">
          <div className="flex items-center gap-3">
            <h2
              {...(id ? { "data-style-target": styleTargetId({ type: "link", id, field: "title" }) } : {})}
              onClick={handleTitleClick}
              style={titleStyleObj}
              className={`${titleColorClass} text-lg font-semibold tracking-tighter line-clamp-2 text-center leading-snug max-w-[200px] ${isEditor ? "cursor-pointer rounded transition-all duration-150 hover:outline hover:outline-1 hover:outline-dashed hover:outline-white/40 hover:outline-offset-2" : ""}`}
            >
              {title}
            </h2>
          </div>
        </div>
      )}
    </div>
  );

  const CardBody = (
    <m.div
      initial={{ height: 0, opacity: 0 }}
      animate={{
        height: "auto",
        opacity: 1,
        transition: {
          height: { duration: 0.3, ease: "easeInOut" },
          opacity: { duration: 0.2, delay: 0.1 },
        },
      }}
      exit={{
        height: 0,
        opacity: 0,
        transition: {
          height: { duration: 0.3, ease: "easeInOut" },
          opacity: { duration: 0.15 },
        },
      }}
    >
      <m.div initial={{ y: -10 }} animate={{ y: 0 }} exit={{ y: -10 }} transition={{ duration: 0.2, delay: 0.1 }} className="px-6 pb-6">
        <div className="flex flex-col gap-4  pt-4">
          {description && (
            <m.p initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="text-sm text-white/80 leading-relaxed">
              {description}
            </m.p>
          )}
          {imageUrl && (
            <m.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.2 }} className="aspect-video w-full overflow-hidden rounded-xl bg-black/20 relative">
              <Image src={imageUrl} fill sizes="(max-width: 768px) 100vw, 50vw" className="object-cover" alt={title || ""} />
            </m.div>
          )}
          <m.a
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            href={url}
            target="_blank"
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-white py-2 text-sm font-bold text-black transition-transform hover:scale-[1.02]"
            onClick={handleNavClick}
          >
            Visit Link <ExternalLink className="size-3" />
          </m.a>
        </div>
      </m.div>
    </m.div>
  );

  const WrapperProps = {
    onClick: handleWrapperClick,
    className: `group relative w-full ${isEditor ? "" : "cursor-pointer"} overflow-hidden rounded-md transition-all duration-300 ${!isExpanded && !isEditor && "hover:scale-[1.02] active:scale-[0.98]"} ${className} ${texture !== "glassy" ? backgroundColor : ""} ${
      texture === "base" ? "shadow-dzenn border-none" : ""
    }`,
  };

  const Content = (
    <LazyMotion features={domAnimation}>
      <div className="absolute inset-0 opacity-10 rounded-md pointer-events-none" />
      {CardHeader}
      <AnimatePresence>{isExpanded && CardBody}</AnimatePresence>
      <div className="absolute left-0 right-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-white/30 to-transparent pointer-events-none" />
    </LazyMotion>
  );

  return texture === "glassy" ? <GlassEffect {...WrapperProps}>{Content}</GlassEffect> : <div {...WrapperProps}>{Content}</div>;
}
