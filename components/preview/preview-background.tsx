import { PatternRenderer } from "./pattern-renderer";
import { getBackgroundStyle, getFilterStyle, shouldScaleForBlur } from "@/lib/utils/preview-background";
import { getAnimatedBackgroundComponent } from "@/lib/animated-backgrounds";
import type { BackgroundEffects } from "@/lib/utils/preview-background";

interface PreviewBackgroundProps {
  profile: {
    bgType: string;
    bgColor: string;
    bgAnimated: string | null;
    bgAnimatedConfig: any;
    bgWallpaper: string | null;
    bgImage: string | null;
    bgEffects: any;
    bgPattern: any;
  };
}

export function PreviewBackground({ profile }: PreviewBackgroundProps) {
  const bgEffects = profile.bgEffects as BackgroundEffects | null;
  const bgPattern = (profile.bgPattern as any) || { type: "none", color: "#ffffff", opacity: 10, thickness: 1, scale: 20 };

  const backgroundStyle = getBackgroundStyle(profile);

  const filterStyle = getFilterStyle(bgEffects);

  const shouldScale = shouldScaleForBlur(bgEffects?.blur);

  const noiseOpacity = (bgEffects?.noise ?? 0) / 100;

  const AnimatedComponent =
    profile.bgType === "animated" && profile.bgAnimated
      ? getAnimatedBackgroundComponent(profile.bgAnimated)
      : null;
  const animatedConfig = (profile.bgAnimatedConfig as Record<string, unknown>) || {};

  return (
    <>
      {/* Background Layer - Only transition background properties, NOT filters */}
      <div
        className="absolute inset-0"
        style={{
          ...backgroundStyle,
          transition: "background-color 0.5s ease, background-image 0.5s ease",
        }}
      />

      {/* Animated Background Layer */}
      {AnimatedComponent && (
        <AnimatedComponent className="absolute inset-0" {...animatedConfig} />
      )}

      {/* Effects Layer - Separated to avoid repainting background on filter changes */}
      {filterStyle !== "none" && (
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backdropFilter: filterStyle,
            WebkitBackdropFilter: filterStyle,
            transform: shouldScale ? "scale(1.1)" : "scale(1)",
            transition: "backdrop-filter 0.3s ease, transform 0.3s ease",
          }}
        />
      )}

      {/* Pattern Layer */}
      <PatternRenderer type={bgPattern.type} color={bgPattern.color} opacity={bgPattern.opacity} thickness={bgPattern.thickness} scale={bgPattern.scale} />

      {/* Noise Overlay */}
      {noiseOpacity > 0 && (
        <div
          className="absolute inset-0 pointer-events-none mix-blend-overlay"
          style={{
            opacity: noiseOpacity,
            backgroundImage: `url('https://grainy-gradients.vercel.app/noise.svg')`,
            filter: "contrast(150%) brightness(100%)",
          }}
        />
      )}
    </>
  );
}
