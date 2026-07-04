import { getBackgroundStyle, getFilterStyle, shouldScaleForBlur } from "@/lib/utils/preview-background";
import { getAnimatedBackgroundComponent } from "@/lib/animated-backgrounds";
import type { BackgroundEffects } from "@/lib/utils/preview-background";

interface PreviewBackgroundProps {
  profile: {
    bgType: string;
    bgColor: string;
    bgWallpaper: string | null;
    bgImage: string | null;
    bgEffects: any;
    bgPattern: any;
  };
}

export function PreviewBackground({ profile }: PreviewBackgroundProps) {
  const bgEffects = profile.bgEffects as BackgroundEffects | null;
  const bgPattern = profile.bgPattern as Record<string, unknown> | null;

  const backgroundStyle = getBackgroundStyle(profile);
  const filterStyle = getFilterStyle(bgEffects);
  const shouldScale = shouldScaleForBlur(bgEffects?.blur);
  const noiseOpacity = (bgEffects?.noise ?? 0) / 100;

  const animatedId = bgPattern?.animatedId as string | undefined;
  const AnimatedComponent = animatedId ? getAnimatedBackgroundComponent(animatedId) : null;
  const animatedConfig = (bgPattern?.animatedConfig as Record<string, unknown>) || {};

  return (
    <>
      <div
        className="absolute inset-0"
        style={{
          ...backgroundStyle,
          transition: "background-color 0.5s ease, background-image 0.5s ease",
        }}
      />

      {AnimatedComponent && (
        <AnimatedComponent className="absolute inset-0" {...animatedConfig} />
      )}

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
