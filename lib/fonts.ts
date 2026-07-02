export { instrumentSerif, FONT_CATALOG, FONT_CATALOG_NAMES, getFontVariable } from "./font-catalog";
export const GOOGLE_FONTS_BASE_URL = "https://fonts.googleapis.com/css2";

/**
 * Builds a Google Fonts CSS URL for a given family and optional weights
 */
export function buildFontCssUrl(family: string, weights: number[] = [400, 500, 600, 700]): string {
  const encodedFamily = family.replace(/ /g, "+");
  const weightsParam = weights.join(";");
  return `${GOOGLE_FONTS_BASE_URL}?family=${encodedFamily}:wght@${weightsParam}&display=swap`;
}

/**
 * Simple font loader helper for client-side
 */
export function loadFont(family: string): void {
  if (typeof document === "undefined") return;

  const fontId = `font-${family.toLowerCase().replace(/ /g, "-")}`;
  if (document.getElementById(fontId)) return;

  const link = document.createElement("link");
  link.id = fontId;
  link.rel = "stylesheet";
  link.href = buildFontCssUrl(family);
  document.head.appendChild(link);
}
