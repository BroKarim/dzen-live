import { ImageResponse } from "next/og";
import { db } from "@/lib/db";
import { publicProfilePayload } from "@/server/website/profile/payloads";
import { OgImageCard } from "@/components/og-image-card";
import type { OgProfile } from "@/components/og-image-card";

async function fetchImageAsBuffer(url: string): Promise<ArrayBuffer | null> {
  try {
    const res = await fetch(url);
    if (!res.ok) return null;
    return await res.arrayBuffer();
  } catch {
    return null;
  }
}

async function fetchFontBuffer(): Promise<ArrayBuffer | null> {
  try {
    const apiUrl = `https://fonts.googleapis.com/css2?family=Inter:wght@400;700&display=swap`;
    const cssRes = await fetch(apiUrl, {
      headers: { "User-Agent": "Mozilla/5.0" },
    });
    const css = await cssRes.text();
    const urlMatch = css.match(/url\(([^)]+)\)/);
    if (!urlMatch) return null;

    const fontUrl = urlMatch[1];
    const fontRes = await fetch(fontUrl);
    if (!fontRes.ok) return null;
    return await fontRes.arrayBuffer();
  } catch {
    return null;
  }
}

function resolveBackgroundUrl(profile: { bgType: string; bgWallpaper: string | null; bgImage: string | null }): string | null {
  if (profile.bgType === "wallpaper" && profile.bgWallpaper) {
    const url = profile.bgWallpaper;
    if (url.includes("cloudfront-base")) return url;
    if (url.startsWith("http")) return url;
    return `https://d1uuiykksp6inc.cloudfront.net/wallappers/${url}`;
  }
  if (profile.bgType === "image" && profile.bgImage) {
    return profile.bgImage;
  }
  return null;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const username = searchParams.get("username");

  if (!username) {
    return new Response("Missing username", { status: 400 });
  }

  const profile = await db.profile.findUnique({
    where: { username },
    select: publicProfilePayload,
  });

  if (!profile || !profile.isPublished) {
    return new Response("Not found", { status: 404 });
  }

  const ogProfile: OgProfile = {
    displayName: profile.displayName || profile.username,
    username: profile.username,
    bio: profile.bio,
    avatarUrl: profile.avatarUrl,
    bgType: profile.bgType,
    bgColor: profile.bgColor,
    bgWallpaper: profile.bgWallpaper,
    bgImage: profile.bgImage,
    displayNameStyle: profile.displayNameStyle as { color?: string } | null | undefined,
  };

  const bgUrl = resolveBackgroundUrl(profile);

  const [avatarBuffer, bgImageBuffer, fontBuffer] = await Promise.all([
    ogProfile.avatarUrl ? fetchImageAsBuffer(ogProfile.avatarUrl) : Promise.resolve(null),
    bgUrl ? fetchImageAsBuffer(bgUrl) : Promise.resolve(null),
    fetchFontBuffer(),
  ]);

  if (!fontBuffer) {
    return new Response("Font not available", { status: 500 });
  }

  return new ImageResponse(
    <OgImageCard profile={ogProfile} avatarBuffer={avatarBuffer} bgImageBuffer={bgImageBuffer} />,
    {
      width: 1200,
      height: 630,
      fonts: [
        {
          name: "Inter",
          data: fontBuffer,
          weight: 400,
          style: "normal",
        },
        {
          name: "Inter",
          data: fontBuffer,
          weight: 700,
          style: "normal",
        },
      ],
    },
  );
}
