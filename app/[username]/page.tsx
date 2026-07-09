import { getPublicProfile } from "@/server/website/profile";
import type { Metadata } from "next";
import { ProfileView } from "./profile-view";
import { notFound } from "next/navigation";
import { buildProfilePageSchema, serializeJsonLd } from "@/lib/seo/json-ld";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ username: string }>;
};

// Metadata generation
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { username } = await params;
  const profile = await getPublicProfile(username);

  if (!profile || !profile.isPublished) {
    return {
      title: `@${username} · Dzenn`,
      description: `Visit ${username}'s profile on Dzenn`,
    };
  }

  const displayName = profile.displayName || `@${username}`;
  const bio = profile.bio || `Visit ${displayName}'s profile on Dzenn`;
  const ogImageUrl = `/api/og?username=${encodeURIComponent(username)}`;

  return {
    title: `${displayName} (@${username}) · Dzenn`,
    description: bio,
    alternates: {
      canonical: `/${username}`,
    },
    openGraph: {
      title: `${displayName} (@${username})`,
      description: bio,
      url: `/${username}`,
      siteName: "Dzenn",
      images: [
        {
          url: ogImageUrl,
          width: 1200,
          height: 630,
          alt: `${displayName} on Dzenn`,
        },
      ],
      locale: "en_US",
      type: "profile",
    },
    twitter: {
      card: "summary_large_image",
      title: `${displayName} (@${username})`,
      description: bio,
      images: [ogImageUrl],
    },
  };
}

/**
 * Public profile page
 * Uses simple server-side rendering with data fetching
 */
export default async function PublicProfilePage({ params }: Props) {
  const { username } = await params;

  // Fetch user profile
  const profile = await getPublicProfile(username);

  // Handle not found
  if (!profile || !profile.isPublished) {
    notFound();
  }

  const displayName = profile.displayName || `@${username}`;
  const bio = profile.bio || null;
  const avatarUrl = profile.avatarUrl || null;
  const sameAs = profile.socials.flatMap((s) => s.url ? [s.url] : []);

  const jsonLd = buildProfilePageSchema({
    name: displayName,
    url: `/${username}`,
    description: bio,
    image: avatarUrl,
    sameAs,
  });

  // Render profile
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializeJsonLd(jsonLd) }}
      />
      <ProfileView user={profile} />
    </>
  );
}
