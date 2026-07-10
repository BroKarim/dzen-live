import type { ProfileEditorData } from "@/server/user/profile/payloads";
import type { CardTexture, BackgroundType, ProfileLayout } from "@/lib/generated/prisma/client";

/**
 * Bump when draft shape breaks compatibility with older localStorage drafts.
 * On mismatch, stale drafts are discarded and re-inited from the server.
 */
export const EDITOR_DRAFT_VERSION = 2;

/** Minimum version we still try to migrate (below this → discard). */
export const EDITOR_DRAFT_MIN_VERSION = 1;

const CARD_TEXTURES = new Set<string>(["base", "glassy"]);

function asString(v: unknown): string | null {
  return typeof v === "string" ? v : null;
}

function asNullableString(v: unknown): string | null {
  if (v === null || v === undefined) return null;
  return typeof v === "string" ? v : null;
}

function asNumber(v: unknown, fallback: number): number {
  return typeof v === "number" && Number.isFinite(v) ? v : fallback;
}

function asBoolean(v: unknown, fallback: boolean): boolean {
  return typeof v === "boolean" ? v : fallback;
}

function asJsonRecord(v: unknown): Record<string, unknown> | null {
  if (v === null || v === undefined) return null;
  if (typeof v !== "object" || Array.isArray(v)) return null;
  return v as Record<string, unknown>;
}

function normalizeTitleStyle(raw: unknown): { color?: string; fontFamily?: string } | null {
  const obj = asJsonRecord(raw);
  if (!obj) return null;
  const out: { color?: string; fontFamily?: string } = {};
  if (typeof obj.color === "string" && obj.color) out.color = obj.color;
  if (typeof obj.fontFamily === "string" && obj.fontFamily) out.fontFamily = obj.fontFamily;
  return Object.keys(out).length === 0 ? null : out;
}

function normalizeLink(raw: unknown, index: number): ProfileEditorData["links"][number] | null {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return null;
  const l = raw as Record<string, unknown>;
  const id = asString(l.id);
  const title = asString(l.title);
  const url = asString(l.url);
  if (!id || title === null || url === null) return null;

  return {
    id,
    title,
    url,
    position: asNumber(l.position, index),
    isActive: asBoolean(l.isActive, true),
    buttonColor: asNullableString(l.buttonColor),
    buttonTextColor: asNullableString(l.buttonTextColor),
    titleStyle: normalizeTitleStyle(l.titleStyle),
    // deliberately drop: description, mediaUrl, icon, mediaType, payment*, etc.
  };
}

function normalizeSocial(raw: unknown): ProfileEditorData["socials"][number] | null {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return null;
  const s = raw as Record<string, unknown>;
  const id = asString(s.id);
  const platform = asString(s.platform);
  const url = asString(s.url);
  if (!id || !platform || !url) return null;
  return { id, platform, url };
}

/**
 * Normalize a raw draft (from localStorage / client) into the current
 * ProfileEditorData shape. Returns null if the draft is unusable.
 *
 * Strips obsolete fields (description, mediaUrl, theme, …) so schema
 * evolution does not brick autosave for existing accounts.
 */
export function normalizeEditorDraft(raw: unknown): ProfileEditorData | null {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return null;
  const p = raw as Record<string, unknown>;

  const id = asString(p.id);
  const userId = asString(p.userId);
  const username = asString(p.username);
  if (!id || !userId || !username) return null;

  const linksRaw = Array.isArray(p.links) ? p.links : [];
  const socialsRaw = Array.isArray(p.socials) ? p.socials : [];

  const links = linksRaw
    .map((l, i) => normalizeLink(l, i))
    .filter((l): l is ProfileEditorData["links"][number] => l !== null);

  const socials = socialsRaw
    .map(normalizeSocial)
    .filter((s): s is ProfileEditorData["socials"][number] => s !== null);

  const cardTextureRaw = asString(p.cardTexture) ?? "base";
  const cardTexture = (CARD_TEXTURES.has(cardTextureRaw) ? cardTextureRaw : "base") as CardTexture;

  return {
    id,
    userId,
    username,
    displayName: asNullableString(p.displayName),
    bio: asNullableString(p.bio),
    avatarUrl: asNullableString(p.avatarUrl),
    layout: (asNullableString(p.layout) ?? "center") as ProfileLayout,
    displayNameStyle: normalizeTitleStyle(p.displayNameStyle),
    bioStyle: normalizeTitleStyle(p.bioStyle),
    bgType: (asNullableString(p.bgType) ?? "color") as BackgroundType,
    bgColor: asNullableString(p.bgColor) ?? "#1a1a1a",
    bgWallpaper: asNullableString(p.bgWallpaper),
    bgImage: asNullableString(p.bgImage),
    blurAmount: asNumber(p.blurAmount, 0),
    padding: asNumber(p.padding, 16),
    cardTexture,
    bgEffects: asJsonRecord(p.bgEffects) as ProfileEditorData["bgEffects"],
    bgPattern: asJsonRecord(p.bgPattern) as ProfileEditorData["bgPattern"],
    isPublished: asBoolean(p.isPublished, false),
    links,
    socials,
  };
}
