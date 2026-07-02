import React from "react";
import { TexturedCard } from "@/components/texture-card";
import type { CardTexture } from "@/lib/generated/prisma/client";
import { styleTargetId, type StyleTarget, type TextStyle } from "@/lib/text-style";

type Mode = "editor" | "public";

interface PreviewLinksProps {
  profile: {
    links: any[];
    cardTexture: CardTexture;
  };
  mode?: Mode;
  onStyleTargetClick?: (target: StyleTarget) => void;
  renderLink?: (link: any, children: React.ReactNode) => React.ReactNode;
}

function LinkItem({ link, cardTexture, mode, onStyleTargetClick, renderLink }: { link: any; cardTexture: CardTexture; mode: Mode; onStyleTargetClick?: (target: StyleTarget) => void; renderLink?: (link: any, children: React.ReactNode) => React.ReactNode }) {
  const card = (
    <TexturedCard
      key={link.id}
      id={link.id}
      title={link.title}
      url={link.url}
      description={link.description ?? undefined}
      imageUrl={link.mediaUrl ?? undefined}
      backgroundColor="bg-[#222]"
      texture={cardTexture}
      mode={mode}
      titleStyle={link.titleStyle as TextStyle | null | undefined}
      onStyleTargetClick={onStyleTargetClick}
    />
  );

  if (renderLink) {
    return <>{renderLink(link, card)}</>;
  }

  return card;
}

export function PreviewLinks({ profile, mode = "public", onStyleTargetClick, renderLink }: PreviewLinksProps) {
  const { links, cardTexture } = profile;

  const sortedLinks = links ? links.toSorted((a, b) => (a.position ?? 0) - (b.position ?? 0)) : [];

  return (
    <div className="w-full space-y-4">
      {sortedLinks.length > 0 ? (
        sortedLinks.map((link) => <LinkItem key={link.id} link={link} cardTexture={cardTexture} mode={mode} onStyleTargetClick={onStyleTargetClick} renderLink={renderLink} />)
      ) : (
        <TexturedCard title="ADD YOUR FIRST LINK" backgroundColor="" texture={cardTexture} mode={mode} />
      )}
    </div>
  );
}
