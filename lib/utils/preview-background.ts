import type { CSSProperties } from "react";

interface BackgroundStyleConfig {
  bgType: string;
  bgColor: string;
  bgWallpaper: string | null;
  bgImage: string | null;
}

export interface BackgroundEffects {
  blur?: number;
  brightness?: number;
  saturation?: number;
  contrast?: number;
  noise?: number;
}

/**
 * Generates background style based on type
 * Memoized to avoid recreating objects on every render
 */
export function getBackgroundStyle(config: BackgroundStyleConfig): CSSProperties {
  switch (config.bgType) {
    case "animated":
      return { backgroundColor: config.bgColor };
    case "wallpaper": {
      const url = config.bgWallpaper;
      const finalUrl = url?.includes("cloudfront-base") ? url : url?.startsWith("http") ? url : `https://d1uuiykksp6inc.cloudfront.net/wallappers/${url}`;

      return {
        backgroundImage: `url(${finalUrl})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      };
    }
    case "image":
      return {
        backgroundImage: `url(${config.bgImage})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      };
    default:
      return { backgroundColor: config.bgColor };
  }
}

/**
 * Generates filter string from effects
 * Only includes filters that are actually active
 */
export function getFilterStyle(effects: BackgroundEffects | null | undefined): string {
  if (!effects) return "none";

  const filters: string[] = [];

  if (effects.blur && effects.blur > 0) {
    filters.push(`blur(${effects.blur}px)`);
  }
  if (effects.brightness && effects.brightness !== 100) {
    filters.push(`brightness(${effects.brightness}%)`);
  }
  if (effects.saturation && effects.saturation !== 100) {
    filters.push(`saturate(${effects.saturation}%)`);
  }
  if (effects.contrast && effects.contrast !== 100) {
    filters.push(`contrast(${effects.contrast}%)`);
  }

  return filters.length > 0 ? filters.join(" ") : "none";
}

/**
 * Determines if blur scale compensation is needed
 */
export function shouldScaleForBlur(blur: number | undefined): boolean {
  return (blur ?? 0) > 0;
}
