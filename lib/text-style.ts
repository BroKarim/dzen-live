import { z } from "zod";

export const TextStyleSchema = z
  .object({
    color: z.string().optional(),
    fontFamily: z.string().optional(),
  })
  .strict();

export const TextStyleInputSchema = TextStyleSchema.transform((v) => {
  if (!v) return null;
  const has = (v.color !== undefined && v.color !== "") || (v.fontFamily !== undefined && v.fontFamily !== "");
  return has ? v : null;
});

export type TextStyle = z.infer<typeof TextStyleSchema>;

export type StyleTarget =
  | { type: "profile"; field: "displayName" | "bio" }
  | { type: "link"; id: string; field: "title" };

export const EMPTY_STYLE: TextStyle = {};

export function resolveStyle(style: TextStyle | null | undefined): React.CSSProperties {
  const out: React.CSSProperties = {};
  if (style?.color) out.color = style.color;
  if (style?.fontFamily) out.fontFamily = `"${style.fontFamily}", var(--font-sans)`;
  return out;
}

export function isStyleEmpty(style: TextStyle | null | undefined): boolean {
  if (!style) return true;
  return !style.color && !style.fontFamily;
}

export function normalizeStyle(style: TextStyle | null | undefined): TextStyle | null {
  if (!style) return null;
  const out: TextStyle = {};
  if (style.color) out.color = style.color;
  if (style.fontFamily) out.fontFamily = style.fontFamily;
  return Object.keys(out).length === 0 ? null : out;
}

export const styleTargetId = (target: StyleTarget): string => {
  if (target.type === "profile") return `profile.${target.field}`;
  return `link.${target.id}.${target.field}`;
};

export const parseStyleTarget = (id: string): StyleTarget | null => {
  if (id === "profile.displayName") return { type: "profile", field: "displayName" };
  if (id === "profile.bio") return { type: "profile", field: "bio" };
  const linkMatch = id.match(/^link\.(.+)\.title$/);
  if (linkMatch) return { type: "link", id: linkMatch[1], field: "title" };
  return null;
};

export function applyStyleToProfile<P extends { displayNameStyle?: unknown; bioStyle?: unknown; links?: Array<{ id: string; titleStyle?: unknown }> }>(profile: P, target: StyleTarget, style: TextStyle | null): P {
  const normalized = normalizeStyle(style);
  if (target.type === "profile") {
    if (target.field === "displayName") {
      return { ...profile, displayNameStyle: normalized };
    }
    return { ...profile, bioStyle: normalized };
  }
  if (!profile.links) return profile;
  return {
    ...profile,
    links: profile.links.map((l) => (l.id === target.id ? { ...l, titleStyle: normalized } : l)),
  };
}

export function getStyleFromProfile(profile: { displayNameStyle?: unknown; bioStyle?: unknown; links?: Array<{ id: string; titleStyle?: unknown }> }, target: StyleTarget): TextStyle | null {
  const parse = (raw: unknown): TextStyle | null => {
    if (!raw || typeof raw !== "object" || Array.isArray(raw)) return null;
    const s = raw as Record<string, unknown>;
    const out: TextStyle = {};
    if (typeof s.color === "string") out.color = s.color;
    if (typeof s.fontFamily === "string") out.fontFamily = s.fontFamily;
    return Object.keys(out).length === 0 ? null : out;
  };
  if (target.type === "profile") {
    if (target.field === "displayName") return parse(profile.displayNameStyle);
    return parse(profile.bioStyle);
  }
  const link = profile.links?.find((l) => l.id === target.id);
  return parse(link?.titleStyle);
}

export function loadStyleFonts(profile: { displayNameStyle?: unknown; bioStyle?: unknown; links?: Array<{ titleStyle?: unknown }> }): () => void {
  if (typeof document === "undefined") return () => {};
  const families = new Set<string>();
  const fontOf = (raw: unknown): string | undefined => {
    if (!raw || typeof raw !== "object" || Array.isArray(raw)) return undefined;
    const s = raw as Record<string, unknown>;
    return typeof s.fontFamily === "string" ? s.fontFamily : undefined;
  };
  const fn1 = fontOf(profile.displayNameStyle);
  const fn2 = fontOf(profile.bioStyle);
  if (fn1) families.add(fn1);
  if (fn2) families.add(fn2);
  profile.links?.forEach((l) => {
    const fn = fontOf(l.titleStyle);
    if (fn) families.add(fn);
  });

  const injected: HTMLLinkElement[] = [];
  families.forEach((family) => {
    const fontId = `style-font-${family.toLowerCase().replace(/ /g, "-")}`;
    if (document.getElementById(fontId)) return;
    const link = document.createElement("link");
    link.id = fontId;
    link.rel = "stylesheet";
    link.href = `https://fonts.googleapis.com/css2?family=${family.replace(/ /g, "+")}:wght@400;500;600;700&display=swap`;
    document.head.appendChild(link);
    injected.push(link);
  });

  return () => {
    injected.forEach((l) => l.remove());
  };
}
