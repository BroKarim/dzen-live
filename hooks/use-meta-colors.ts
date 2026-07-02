import * as React from "react";
import { useTheme } from "next-themes";

export const META_THEME_COLORS = {
  light: "#ffffff",
  dark: "#0a0a0a",
};

const setMetaColor = (color: string) => {
  document.querySelector('meta[name="theme-color"]')?.setAttribute("content", color);
};

export function useMetaColor() {
  const { resolvedTheme } = useTheme();

  const metaColor = resolvedTheme !== "dark" ? META_THEME_COLORS.light : META_THEME_COLORS.dark;

  return {
    metaColor,
    setMetaColor,
  };
}
