"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { ChevronDown, Type } from "lucide-react";
import { useEditorStore } from "@/lib/stores/editor-store";
import { useEditorUIContext } from "@/lib/contexts/editor-ui";
import { getStyleFromProfile, styleTargetId, type StyleTarget, type TextStyle } from "@/lib/text-style";
import { ColorPicker } from "./color-picker";
import { FontPicker } from "./font-picker";
import { cn } from "@/lib/utils";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

const FIELD_LABEL: Record<string, string> = {
  displayName: "Display Name",
  bio: "Bio",
  title: "Link Title",
};

type Placement = "top" | "bottom";

export function TextStylePopover() {
  const { stylePopover, closeStylePopover } = useEditorUIContext();
  const draftProfile = useEditorStore((s) => s.draftProfile);
  const setElementStyle = useEditorStore((s) => s.setElementStyle);

  const popoverRef = useRef<HTMLDivElement>(null);
  const [showFonts, setShowFonts] = useState(false);
  const [showColors, setShowColors] = useState(false);
  const [placement, setPlacement] = useState<Placement>("bottom");
  const styleTargetKey = stylePopover?.target
    ? `${stylePopover.target.type}:${"id" in stylePopover.target ? stylePopover.target.id : ""}:${stylePopover.target.field}`
    : null;

  useEffect(() => {
    if (!stylePopover) return;
    const onDocClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (popoverRef.current?.contains(target)) return;
      if (target.closest("[data-style-target]")) return;
      if (target.closest("[data-radix-popper-content-wrapper]")) return;
      closeStylePopover();
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeStylePopover();
    };
    document.addEventListener("mousedown", onDocClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDocClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [stylePopover, closeStylePopover]);

  if (!stylePopover || !draftProfile) return null;
  if (typeof document === "undefined") return null;

  const rawStyle = getStyleFromProfile(draftProfile, stylePopover.target);
  const currentStyle: TextStyle | null = rawStyle && typeof rawStyle === "object" && !Array.isArray(rawStyle) ? (rawStyle as TextStyle) : null;

  const target: StyleTarget = stylePopover.target;
  const fieldLabel = FIELD_LABEL[target.field] ?? target.field;
  const contextLabel = target.type === "link" ? draftProfile.links?.find((l) => l.id === target.id)?.title?.slice(0, 24) : undefined;

  const targetId = styleTargetId(stylePopover.target);
  const targetEl = document.querySelector(`[data-style-target="${targetId}"]`) as HTMLElement | null;

  const updateColor = (color: string | undefined) => {
    const next: TextStyle = { ...(currentStyle ?? {}), color };
    if (color === undefined) delete next.color;
    setElementStyle(target, next);
  };

  const updateFont = (fontFamily: string | undefined) => {
    const next: TextStyle = { ...(currentStyle ?? {}), fontFamily };
    if (fontFamily === undefined) delete next.fontFamily;
    setElementStyle(target, next);
  };

  return createPortal(
    <div key={styleTargetKey} ref={popoverRef} onClick={(e) => e.stopPropagation()}>
      <StylePopoverInner
        stylePopover={stylePopover}
        targetEl={targetEl}
        placement={placement}
        onPlacementChange={setPlacement}
      >
        <div className="w-64 rounded-xl border border-white/10 bg-zinc-950/95 backdrop-blur-xl shadow-2xl shadow-black/50 p-3 space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-medium text-muted-foreground truncate pr-2">
              {fieldLabel}
              {contextLabel ? <span className="text-muted-foreground/50"> · {contextLabel}</span> : null}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <Popover open={showFonts} onOpenChange={setShowFonts}>
              <PopoverTrigger asChild>
                <button
                  type="button"
                  onClick={() => setShowColors(false)}
                  className={cn("flex flex-1 items-center gap-1.5 h-8 px-2.5 text-xs rounded-md bg-white/5 hover:bg-white/10 border border-white/10 transition-colors", showFonts && "border-white/20 bg-white/10")}
                >
                  <Type className="size-3.5 text-muted-foreground shrink-0" />
                  <span className="truncate text-left">{currentStyle?.fontFamily || "Default"}</span>
                  <ChevronDown className={cn("size-3 text-muted-foreground shrink-0 ml-auto transition-transform", showFonts && "rotate-180")} />
                </button>
              </PopoverTrigger>
              <PopoverContent side="bottom" align="start" sideOffset={12} className="w-64 rounded-xl border border-white/10 bg-zinc-950/95 backdrop-blur-xl shadow-2xl p-3 text-white z-[10000]">
                <FontPicker value={currentStyle?.fontFamily} onChange={updateFont} />
              </PopoverContent>
            </Popover>

            <Popover open={showColors} onOpenChange={setShowColors}>
              <PopoverTrigger asChild>
                <button
                  type="button"
                  onClick={() => setShowFonts(false)}
                  className={cn("size-8 shrink-0 rounded-full border-2 transition-colors", showColors ? "border-white/40" : "border-white/20 hover:border-white/40")}
                  style={{ backgroundColor: currentStyle?.color || "#ffffff" }}
                  title={currentStyle?.color || "Default color"}
                  aria-label={currentStyle?.color || "Default color"}
                />
              </PopoverTrigger>
              <PopoverContent side="bottom" align="end" sideOffset={12} className="w-64 rounded-xl border border-white/10 bg-zinc-950/95 backdrop-blur-xl shadow-2xl p-3 text-white z-[10000]">
                <ColorPicker value={currentStyle?.color} onChange={updateColor} />
              </PopoverContent>
            </Popover>
          </div>
        </div>
      </StylePopoverInner>
    </div>,
    document.body,
  );
}

function StylePopoverInner({
  stylePopover,
  targetEl,
  placement,
  onPlacementChange,
  children,
}: {
  stylePopover: { x: number; y: number };
  targetEl: HTMLElement | null;
  placement: Placement;
  onPlacementChange: (p: Placement) => void;
  children: React.ReactNode;
}) {
  const innerRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    if (!innerRef.current || !targetEl) return;
    const popover = innerRef.current;
    const targetRect = targetEl.getBoundingClientRect();

    const measure = () => {
      const h = popover.offsetHeight || 200;
      const spaceBelow = window.innerHeight - targetRect.bottom - 16;
      const spaceAbove = targetRect.top - 16;

      if (placement === "bottom" && spaceBelow < h && spaceAbove >= h) {
        onPlacementChange("top");
      } else if (placement === "top" && spaceAbove < h && spaceBelow >= h) {
        onPlacementChange("bottom");
      }
    };

    measure();

    const ro = new ResizeObserver(measure);
    ro.observe(popover);
    return () => ro.disconnect();
  }, [stylePopover, targetEl, placement, onPlacementChange]);

  if (!targetEl) return null;

  const targetRect = targetEl.getBoundingClientRect();

  const posStyle: React.CSSProperties = {
    position: "fixed",
    left: targetRect.left + targetRect.width / 2,
    zIndex: 9999,
  };

  if (placement === "bottom") {
    posStyle.top = targetRect.bottom + 8;
  } else {
    posStyle.bottom = window.innerHeight - targetRect.top + 8;
  }
  posStyle.transform = "translate(-50%, 0)";

  return (
    <div ref={innerRef} style={posStyle}>
      {children}
    </div>
  );
}
