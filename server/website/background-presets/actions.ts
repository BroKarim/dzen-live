"use server";

import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import type { BackgroundPreset } from "./schema";

/**
 * Get all background presets from database
 * Returns empty array if no presets found
 */
export async function getBackgroundPresets(): Promise<BackgroundPreset[]> {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) return [];
  try {
    const presets = await db.backgroundPreset.findMany({
      orderBy: {
        createdAt: "desc",
      },
    });

    const CLOUDFRONT_BASE = "https://d1uuiykksp6inc.cloudfront.net/wallappers";
    return presets.map((preset) => ({
      ...preset,
      url: preset.url.startsWith("http") ? preset.url : `${CLOUDFRONT_BASE}/${preset.url}`,
    }));
  } catch (error) {
    console.error("Failed to fetch background presets:", error);
    return [];
  }
}

/**
 * Get background presets by category
 */
export async function getBackgroundPresetsByCategory(category: string): Promise<BackgroundPreset[]> {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) return [];
  try {
    const presets = await db.backgroundPreset.findMany({
      where: {
        category,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    const CLOUDFRONT_BASE = "https://d1uuiykksp6inc.cloudfront.net/wallappers";
    return presets.map((preset) => ({
      ...preset,
      url: preset.url.startsWith("http") ? preset.url : `${CLOUDFRONT_BASE}/${preset.url}`,
    }));
  } catch (error) {
    console.error("Failed to fetch background presets by category:", error);
    return [];
  }
}
