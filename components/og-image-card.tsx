import type { Prisma } from "@/lib/generated/prisma/client";
import { getBackgroundStyle } from "@/lib/utils/preview-background";

export type OgProfile = {
  displayName: string;
  username: string;
  bio: string | null;
  avatarUrl: string | null;
  bgType: string | null;
  bgColor: string | null;
  bgWallpaper: string | null;
  bgImage: string | null;
  displayNameStyle?: { color?: string } | null;
};

interface OgImageCardProps {
  profile: OgProfile;
  avatarBuffer: ArrayBuffer | null;
  bgImageBuffer: ArrayBuffer | null;
}

export function OgImageCard({ profile, avatarBuffer, bgImageBuffer }: OgImageCardProps) {
  const name = profile.displayName || `@${profile.username}`;
  const bio = profile.bio || `Check out ${name}'s profile on Dzenn`;

  const avatarDataUrl = avatarBuffer
    ? `data:image/png;base64,${Buffer.from(avatarBuffer).toString("base64")}`
    : null;

  const bgDataUrl = bgImageBuffer
    ? `data:image/png;base64,${Buffer.from(bgImageBuffer).toString("base64")}`
    : null;

  const bgStyle = bgDataUrl
    ? { backgroundImage: `url(${bgDataUrl})`, backgroundSize: "cover" as const, backgroundPosition: "center" as const }
    : getBackgroundStyle({ ...profile, bgType: profile.bgType || "color", bgColor: profile.bgColor || "#0a0a0a" });

  const nameColor = profile.displayNameStyle?.color || "#ffffff";

  return (
    <div
      style={{
        display: "flex",
        width: 1200,
        height: 630,
        ...bgStyle,
        color: "#ffffff",
        fontFamily: "Inter",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {bgDataUrl && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: "linear-gradient(to right, rgba(0,0,0,0.45) 0%, rgba(0,0,0,0.15) 100%)",
            pointerEvents: "none",
          }}
        />
      )}

      {!bgDataUrl && profile.bgColor && profile.bgColor !== "#0a0a0a" && (
        <div
          style={{
            position: "absolute",
            top: 0,
            right: 0,
            width: 400,
            height: 400,
            background: "radial-gradient(circle at 100% 0%, rgba(255,255,255,0.06), transparent 70%)",
            pointerEvents: "none",
          }}
        />
      )}

      <div
        style={{
          display: "flex",
          alignItems: "center",
          width: "100%",
          padding: "40px 60px",
          position: "relative",
          zIndex: 1,
        }}
      >
        {avatarDataUrl ? (
          <img
            src={avatarDataUrl}
            alt={name}
            width={140}
            height={140}
            style={{
              width: 140,
              height: 140,
              borderRadius: "50%",
              border: "4px solid rgba(255,255,255,0.15)",
              objectFit: "cover",
              flexShrink: 0,
            }}
          />
        ) : (
          <div
            style={{
              width: 140,
              height: 140,
              borderRadius: "50%",
              background: "rgba(255,255,255,0.08)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 48,
              fontWeight: 700,
              color: "rgba(255,255,255,0.3)",
              flexShrink: 0,
            }}
          >
            {name.charAt(0).toUpperCase()}
          </div>
        )}

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            marginLeft: 40,
            flex: 1,
            minWidth: 0,
          }}
        >
          <span
            style={{
              fontSize: 52,
              fontWeight: 700,
              lineHeight: 1.2,
              color: nameColor,
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {name}
          </span>
          <span
            style={{
              fontSize: 32,
              fontWeight: 400,
              color: nameColor,
              opacity: 0.5,
              marginTop: 8,
            }}
          >
            @{profile.username}
          </span>
          <span
            style={{
              fontSize: 28,
              fontWeight: 400,
              color: "rgba(255,255,255,0.6)",
              marginTop: 20,
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
              textOverflow: "ellipsis",
              lineHeight: 1.4,
            }}
          >
            {bio}
          </span>
        </div>
      </div>
    </div>
  );
}
