import { Inter, Outfit, Open_Sans, Roboto, Poppins, Montserrat, Lato, Playfair_Display, DM_Sans, Space_Grotesk, Instrument_Serif, Space_Mono } from "next/font/google";

export const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-inter",
  display: "swap",
});

export const outfit = Outfit({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-outfit",
  display: "swap",
});

export const openSans = Open_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-open-sans",
  display: "swap",
});

export const roboto = Roboto({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  variable: "--font-roboto",
  display: "swap",
});

export const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-poppins",
  display: "swap",
});

export const montserrat = Montserrat({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-montserrat",
  display: "swap",
});

export const lato = Lato({
  subsets: ["latin"],
  weight: ["400", "700", "900"],
  variable: "--font-lato",
  display: "swap",
});

export const playfairDisplay = Playfair_Display({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-playfair-display",
  display: "swap",
});

export const dmSans = DM_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-dm-sans",
  display: "swap",
});

export const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-space-grotesk",
  display: "swap",
});

export const instrumentSerif = Instrument_Serif({
  subsets: ["latin"],
  weight: ["400"],
  variable: "--font-instrument-serif",
  display: "swap",
});

export const spaceMono = Space_Mono({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-space-mono",
  display: "swap",
});

export type FontEntry = {
  name: string;
  variable: string;
  cssVar: string;
  className: string;
  category: "sans" | "serif" | "mono" | "display";
};

export const FONT_CATALOG: FontEntry[] = [
  { name: "Inter", variable: inter.variable, cssVar: "--font-inter", className: inter.className, category: "sans" },
  { name: "Outfit", variable: outfit.variable, cssVar: "--font-outfit", className: outfit.className, category: "sans" },
  { name: "Open Sans", variable: openSans.variable, cssVar: "--font-open-sans", className: openSans.className, category: "sans" },
  { name: "Roboto", variable: roboto.variable, cssVar: "--font-roboto", className: roboto.className, category: "sans" },
  { name: "Poppins", variable: poppins.variable, cssVar: "--font-poppins", className: poppins.className, category: "sans" },
  { name: "Montserrat", variable: montserrat.variable, cssVar: "--font-montserrat", className: montserrat.className, category: "sans" },
  { name: "DM Sans", variable: dmSans.variable, cssVar: "--font-dm-sans", className: dmSans.className, category: "sans" },
  { name: "Space Grotesk", variable: spaceGrotesk.variable, cssVar: "--font-space-grotesk", className: spaceGrotesk.className, category: "sans" },
  { name: "Lato", variable: lato.variable, cssVar: "--font-lato", className: lato.className, category: "sans" },
  { name: "Playfair Display", variable: playfairDisplay.variable, cssVar: "--font-playfair-display", className: playfairDisplay.className, category: "serif" },
  { name: "Instrument Serif", variable: instrumentSerif.variable, cssVar: "--font-instrument-serif", className: instrumentSerif.className, category: "serif" },
  { name: "Space Mono", variable: spaceMono.variable, cssVar: "--font-space-mono", className: spaceMono.className, category: "mono" },
];

export const FONT_CATALOG_NAMES: Set<string> = new Set(FONT_CATALOG.map((f) => f.name));

/**
 * All CSS variable names for the catalog. Mount these on <body> or <html>
 * so the picker can render each font in its own typography.
 */
export const FONT_CATALOG_CLASSNAMES: string = FONT_CATALOG.map((f) => f.variable).join(" ");

/**
 * Map a font name to its CSS variable (e.g. "Inter" -> "--font-inter").
 * Returns undefined if not in the catalog.
 */
export function getFontVariable(name: string | undefined | null): string | undefined {
  if (!name) return undefined;
  return FONT_CATALOG.find((f) => f.name === name)?.cssVar;
}
