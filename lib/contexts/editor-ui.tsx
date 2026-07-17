"use client";

import { createContext, use, useState, type ReactNode } from "react";
import type { StyleTarget } from "@/lib/text-style";

export interface PopoverAnchor {
  target: StyleTarget;
  x: number;
  y: number;
}

interface EditorUIContextValue {
  viewMode: "mobile" | "desktop";
  setViewMode: (mode: "mobile" | "desktop") => void;
  stylePopover: PopoverAnchor | null;
  openStylePopover: (anchor: PopoverAnchor) => void;
  closeStylePopover: () => void;
  currentPanel: string | null;
  setCurrentPanel: (panel: string | null) => void;
  isDragging: boolean;
  setIsDragging: (dragging: boolean) => void;
}

const EditorUIContext = createContext<EditorUIContextValue | null>(null);

export function EditorUIProvider({ children }: { children: ReactNode }) {
  const [viewMode, setViewMode] = useState<"mobile" | "desktop">("mobile");
  const [stylePopover, setStylePopover] = useState<PopoverAnchor | null>(null);
  const [currentPanel, setCurrentPanel] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const openStylePopover = (anchor: PopoverAnchor) => {
    setStylePopover(anchor);
  };

  const closeStylePopover = () => {
    setStylePopover(null);
  };

  return (
    <EditorUIContext.Provider
      value={{
        viewMode,
        setViewMode,
        stylePopover,
        openStylePopover,
        closeStylePopover,
        currentPanel,
        setCurrentPanel,
        isDragging,
        setIsDragging,
      }}
    >
      {children}
    </EditorUIContext.Provider>
  );
}

export function useEditorUIContext() {
  const ctx = use(EditorUIContext);
  if (!ctx) {
    throw new Error("useEditorUIContext must be used within EditorUIProvider");
  }
  return ctx;
}
