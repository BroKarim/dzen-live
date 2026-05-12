import React from "react";
import { TexturedCard } from "@/components/texture-card";
import type { CardTexture } from "@/lib/generated/prisma/client";

interface PreviewLinksProps {
  profile: {
    links: any[];
    cardTexture: CardTexture;
  };
  renderLink?: (link: any, children: React.ReactNode) => React.ReactNode;
}

interface LinkItemProps {
  link: any;
  cardTexture: CardTexture;
  renderLink?: (link: any, children: React.ReactNode) => React.ReactNode;
}

function LinkItem({ link, cardTexture, renderLink }: LinkItemProps) {
  const card = (
    <TexturedCard
      key={link.id}
      title={link.title}
      url={link.url}
      description={link.description ?? undefined}
      icon={link.icon ?? undefined}
      imageUrl={link.mediaType === "image" ? (link.mediaUrl ?? undefined) : undefined}
      videoUrl={link.mediaType === "video" ? (link.mediaUrl ?? undefined) : undefined}
      isStripeEnabled={!!link.paymentProvider}
      backgroundColor="bg-[#222]"
      titleColor={cardTexture === "glassy" ? "text-white" : "text-[var(--accent)]"}
      texture={cardTexture}
    />
  );

  if (renderLink) {
    return <>{renderLink(link, card)}</>;
  }

  return card;
}

export function PreviewLinks({ profile, renderLink }: PreviewLinksProps) {
  const { links, cardTexture } = profile;

  // Sort links by position for correct display order
  const sortedLinks = links ? links.toSorted((a, b) => (a.position ?? 0) - (b.position ?? 0)) : [];

  return (
    <div className="w-full space-y-4">
      {sortedLinks.length > 0 ? (
        sortedLinks.map((link) => <LinkItem key={link.id} link={link} cardTexture={cardTexture} renderLink={renderLink} />)
      ) : (
        <TexturedCard title="ADD YOUR FIRST LINK" backgroundColor="" titleColor={cardTexture === "glassy" ? "text-white" : "text-[var(--accent)]"} texture={cardTexture} />
      )}
    </div>
  );
}
