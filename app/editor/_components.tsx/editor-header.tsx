"use client";

import { Save, RotateCcw, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { DomainView } from "@/components/domain-view";
import { ProfileEditorData } from "@/server/user/profile/payloads";
import { useEditorStore } from "@/lib/stores/editor-store";
import { useTransition } from "react";
import { saveAllProfileChanges } from "@/server/user/profile/actions";
import { createLink, updateLink, deleteLink, reorderLinks, createSocialLink, updateSocialLink, deleteSocialLink } from "@/server/user/links/actions";
import { toast } from "sonner";

interface EditorHeaderProps {
  profile: ProfileEditorData;
}

export default function EditorHeader({ profile }: EditorHeaderProps) {
  const baseUrl = (process.env.NEXT_PUBLIC_APP_URL || "dzenn.live").replace(/https?:\/\//, "");
  const username = profile.username || "user";
  const fullUrl = `${baseUrl}/${username}`;

  const { isDirty, markAsSaved, originalProfile, draftProfile, discardChanges } = useEditorStore();
  const [isPending, startTransition] = useTransition();

  const handleDiscard = () => {
    discardChanges();
    toast.info("Changes discarded");
  };

  const handleSave = async () => {
    if (!draftProfile || !isDirty) return;

    startTransition(async () => {
      const toastId = toast.loading("Saving changes...");

      try {
        // === 1. Profile (single DB round-trip) ===
        const profileChanged =
          draftProfile.displayName !== originalProfile?.displayName ||
          draftProfile.bio !== originalProfile?.bio ||
          draftProfile.avatarUrl !== originalProfile?.avatarUrl ||
          draftProfile.layout !== originalProfile?.layout ||
          draftProfile.bgType !== originalProfile?.bgType ||
          draftProfile.bgColor !== originalProfile?.bgColor ||
          draftProfile.bgGradientFrom !== originalProfile?.bgGradientFrom ||
          draftProfile.bgGradientTo !== originalProfile?.bgGradientTo ||
          draftProfile.bgWallpaper !== originalProfile?.bgWallpaper ||
          draftProfile.bgImage !== originalProfile?.bgImage ||
          draftProfile.cardTexture !== originalProfile?.cardTexture ||
          JSON.stringify(draftProfile.bgEffects) !== JSON.stringify(originalProfile?.bgEffects) ||
          JSON.stringify(draftProfile.bgPattern) !== JSON.stringify(originalProfile?.bgPattern) ||
          JSON.stringify(draftProfile.displayNameStyle) !== JSON.stringify(originalProfile?.displayNameStyle) ||
          JSON.stringify(draftProfile.bioStyle) !== JSON.stringify(originalProfile?.bioStyle);

        if (profileChanged) {
          const res = await saveAllProfileChanges({
            displayName: draftProfile.displayName,
            bio: draftProfile.bio,
            avatarUrl: draftProfile.avatarUrl,
            layout: draftProfile.layout as any,
            bgType: draftProfile.bgType as any,
            bgColor: draftProfile.bgColor,
            bgGradientFrom: draftProfile.bgGradientFrom,
            bgGradientTo: draftProfile.bgGradientTo,
            bgWallpaper: draftProfile.bgWallpaper,
            bgImage: draftProfile.bgImage,
            bgEffects: draftProfile.bgEffects as any,
            bgPattern: draftProfile.bgPattern as any,
            cardTexture: draftProfile.cardTexture as any,
            displayNameStyle: draftProfile.displayNameStyle as any,
            bioStyle: draftProfile.bioStyle as any,
          });
          if (!res.success) {
            toast.error(`Failed to save profile: ${res.error}`, { id: toastId });
            return;
          }
        }

        // === 2. Links ===
        const originalLinks = originalProfile?.links || [];
        // Work on a mutable copy so we can swap temp-IDs with real IDs inline
        const resolvedLinks = [...(draftProfile.links || [])];

        // Deletions first (all independent)
        const toDelete = originalLinks.filter((l) => !new Set(resolvedLinks.map((l) => l.id)).has(l.id));
        const deleteResults = await Promise.all(toDelete.map((link) => deleteLink(link.id)));
        for (const res of deleteResults) {
          if (!res.success) {
            toast.error(`Failed to delete link: ${res.error}`, { id: toastId });
            return;
          }
        }

        // Updates, then Creations (capture real IDs for temp links)
        const originalLinksMap = new Map(originalLinks.map((l) => [l.id, l]));
        const linkCreateOps: { index: number; data: any }[] = [];
        const linkUpdateOps: { id: string; data: any }[] = [];

        for (let i = 0; i < resolvedLinks.length; i++) {
          const draftLink = resolvedLinks[i];
          if (String(draftLink.id).startsWith("temp-")) {
            const { id: _tempId, ...linkData } = draftLink;
            linkCreateOps.push({ index: i, data: linkData as any });
          } else {
            const originalLink = originalLinksMap.get(draftLink.id);
            if (originalLink && JSON.stringify(draftLink) !== JSON.stringify(originalLink)) {
              const { id, ...linkData } = draftLink;
              linkUpdateOps.push({ id, data: linkData as any });
            }
          }
        }

        const linkCreateResults = await Promise.all(linkCreateOps.map((op) => createLink(op.data)));
        for (let i = 0; i < linkCreateResults.length; i++) {
          const res = linkCreateResults[i];
          if (!res.success) {
            toast.error(`Failed to create link: ${res.error}`, { id: toastId });
            return;
          }
          resolvedLinks[linkCreateOps[i].index] = res.data;
        }

        const linkUpdateResults = await Promise.all(linkUpdateOps.map((op) => updateLink(op.id, op.data)));
        for (const res of linkUpdateResults) {
          if (!res.success) {
            toast.error(`Failed to update link: ${res.error}`, { id: toastId });
            return;
          }
        }

        // Reorder using the resolved (real) IDs
        const originalOrder = originalLinks.map((l) => l.id).join(",");
        const resolvedOrder = resolvedLinks.map((l) => l.id).join(",");
        if (originalOrder !== resolvedOrder) {
          const res = await reorderLinks(resolvedLinks.map((l) => l.id));
          if (!res.success) {
            toast.error(`Failed to reorder links: ${res.error}`, { id: toastId });
            return;
          }
        }

        // === 3. Socials ===
        const originalSocials = originalProfile?.socials || [];
        const resolvedSocials = [...(draftProfile.socials || [])];

        const resolvedSocialIds = new Set(resolvedSocials.map((s) => s.id));
        const socialDeleteOps: ReturnType<typeof deleteSocialLink>[] = [];
        for (const s of originalSocials) {
          if (!resolvedSocialIds.has(s.id)) {
            socialDeleteOps.push(deleteSocialLink(s.id));
          }
        }
        const socialDeleteResults = await Promise.all(socialDeleteOps);
        for (const res of socialDeleteResults) {
          if (!res.success) {
            toast.error(`Failed to delete social: ${res.error}`, { id: toastId });
            return;
          }
        }

        const originalSocialsMap = new Map(originalSocials.map((s) => [s.id, s]));
        const socialCreateOps: { index: number; data: any }[] = [];
        const socialUpdateOps: { id: string; data: any }[] = [];

        for (let i = 0; i < resolvedSocials.length; i++) {
          const draftSocial = resolvedSocials[i];
          if (String(draftSocial.id).startsWith("temp-")) {
            const { id: _tempId, ...socialData } = draftSocial;
            socialCreateOps.push({ index: i, data: socialData as any });
          } else {
            const originalSocial = originalSocialsMap.get(draftSocial.id);
            if (originalSocial && JSON.stringify(draftSocial) !== JSON.stringify(originalSocial)) {
              const { id, ...socialData } = draftSocial;
              socialUpdateOps.push({ id, data: socialData as any });
            }
          }
        }

        const socialCreateResults = await Promise.all(socialCreateOps.map((op) => createSocialLink(op.data)));
        for (let i = 0; i < socialCreateResults.length; i++) {
          const res = socialCreateResults[i];
          if (!res.success) {
            toast.error(`Failed to create social: ${res.error}`, { id: toastId });
            return;
          }
          resolvedSocials[socialCreateOps[i].index] = res.data;
        }

        const socialUpdateResults = await Promise.all(socialUpdateOps.map((op) => updateSocialLink(op.id, op.data)));
        for (const res of socialUpdateResults) {
          if (!res.success) {
            toast.error(`Failed to update social: ${res.error}`, { id: toastId });
            return;
          }
        }

        // === Commit: update store with resolved real IDs, then mark as saved ===
        // This replaces all temp-IDs with real DB IDs in the store so isDirty
        // correctly becomes false — no page reload needed.
        const { updateDraft } = useEditorStore.getState();
        updateDraft({ ...draftProfile, links: resolvedLinks, socials: resolvedSocials });
        markAsSaved();
        toast.success("All changes saved", { id: toastId });
      } catch (error: any) {
        console.error("Save error:", error);
        toast.error("Failed to save: " + (error?.message || "Unknown error"), { id: toastId });
      }
    });
  };

  return (
    <header className="bg-background/95 sticky top-0 z-50 px-4 md:px-6 py-3 border-b">
      <div className="flex items-center justify-between gap-2">
        {/* Left: Logo + DomainView */}
        <div className="flex items-center gap-3 min-w-0">
          <Link href="/" className="size-9 md:w-10 md:h-10 flex items-center justify-center rounded-full bg-[#222] border-none text-white font-bold text-sm transition-all hover:scale-105 active:scale-95 shrink-0 shadow-dzenn">
            Dz
          </Link>
          {/* DomainView hidden on mobile */}
          <div className="hidden sm:block min-w-0">
            <DomainView
              placeholder={fullUrl}
              value={fullUrl}
              buttonCopy={{
                idle: "Copy",
                success: "Copied!",
              }}
            />
          </div>
        </div>

        {/* Right: Save & Discard Buttons */}
        <div className="flex items-center gap-2 shrink-0">
          {isDirty && (
            <div className="flex items-center gap-1.5">
              {/* "Unsaved" label hidden on very small screens */}
              <span className="hidden sm:inline text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">Unsaved</span>
              {/* Discard: icon-only on mobile, with text on sm+ */}
              <Button onClick={handleDiscard} disabled={isPending} size="sm" variant="ghost" className="h-8 gap-1.5 text-xs hover:bg-destructive/10 hover:text-destructive transition-colors px-2">
                <RotateCcw className="size-3.5" />
                <span className="hidden sm:inline">Discard</span>
              </Button>
            </div>
          )}

          <Button onClick={handleSave} disabled={!isDirty || isPending} size="sm" variant={isDirty ? "default" : "outline"} className="h-9 gap-2 shadow-sm relative overflow-hidden px-3">
            {isPending ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
            {/* "Save Changes" text hidden on very small screens */}
            <span className="hidden xs:inline font-semibold text-xs lowercase">{isPending ? "Saving..." : "Save Changes"}</span>
            {isDirty && !isPending && (
              <span className="absolute right-0 top-0 flex size-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary-foreground opacity-75"></span>
                <span className="relative inline-flex rounded-full size-2 bg-primary-foreground"></span>
              </span>
            )}
          </Button>
        </div>
      </div>
    </header>
  );
}
