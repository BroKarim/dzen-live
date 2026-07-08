import { describe, it, expect, vi } from "vitest";

vi.mock("next/font/google", () => {
  const fonts: Record<string, { variable: string; className: string }> = {};
  return {
    Inter: () => fonts.Inter ?? (fonts.Inter = { variable: "__class_inter", className: "__class_inter_cn" }),
    Outfit: () => fonts.Outfit ?? (fonts.Outfit = { variable: "__class_outfit", className: "__class_outfit_cn" }),
    Open_Sans: () => fonts.Open_Sans ?? (fonts.Open_Sans = { variable: "__class_open_sans", className: "__class_open_sans_cn" }),
    Roboto: () => fonts.Roboto ?? (fonts.Roboto = { variable: "__class_roboto", className: "__class_roboto_cn" }),
    Poppins: () => fonts.Poppins ?? (fonts.Poppins = { variable: "__class_poppins", className: "__class_poppins_cn" }),
    Montserrat: () => fonts.Montserrat ?? (fonts.Montserrat = { variable: "__class_montserrat", className: "__class_montserrat_cn" }),
    DM_Sans: () => fonts.DM_Sans ?? (fonts.DM_Sans = { variable: "__class_dm_sans", className: "__class_dm_sans_cn" }),
    Space_Grotesk: () => fonts.Space_Grotesk ?? (fonts.Space_Grotesk = { variable: "__class_space_grotesk", className: "__class_space_grotesk_cn" }),
    Lato: () => fonts.Lato ?? (fonts.Lato = { variable: "__class_lato", className: "__class_lato_cn" }),
    Playfair_Display: () => fonts.Playfair_Display ?? (fonts.Playfair_Display = { variable: "__class_playfair", className: "__class_playfair_cn" }),
    Instrument_Serif: () => fonts.Instrument_Serif ?? (fonts.Instrument_Serif = { variable: "__class_instrument_serif", className: "__class_instrument_serif_cn" }),
    Space_Mono: () => fonts.Space_Mono ?? (fonts.Space_Mono = { variable: "__class_space_mono", className: "__class_space_mono_cn" }),
  };
});

import { getFontVariable, FONT_CATALOG, FONT_CATALOG_NAMES, FONT_CATALOG_CLASSNAMES } from "@/lib/font-catalog";

describe("getFontVariable", () => {
  it("returns CSS variable for Inter", () => {
    expect(getFontVariable("Inter")).toBe("--font-inter");
  });

  it("returns CSS variable for Outfit", () => {
    expect(getFontVariable("Outfit")).toBe("--font-outfit");
  });

  it("returns CSS variable for Space Mono", () => {
    expect(getFontVariable("Space Mono")).toBe("--font-space-mono");
  });

  it("returns undefined for null input", () => {
    expect(getFontVariable(null)).toBeUndefined();
  });

  it("returns undefined for undefined input", () => {
    expect(getFontVariable(undefined)).toBeUndefined();
  });

  it("returns undefined for unknown font name", () => {
    expect(getFontVariable("NotAFont")).toBeUndefined();
  });

  it("all catalog fonts have valid cssVar", () => {
    for (const font of FONT_CATALOG) {
      expect(FONT_CATALOG_NAMES.has(font.name)).toBe(true);
      expect(font.cssVar).toMatch(/^--font-/);
      expect(getFontVariable(font.name)).toBe(font.cssVar);
    }
  });
});

describe("FONT_CATALOG structure", () => {
  it("classnames string is non-empty", () => {
    expect(FONT_CATALOG_CLASSNAMES.length).toBeGreaterThan(0);
  });

  it("classnames uses variable (class hash), not cssVar", () => {
    for (const font of FONT_CATALOG) {
      expect(FONT_CATALOG_CLASSNAMES).toContain(font.variable);
    }
  });
});
