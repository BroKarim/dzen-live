import { z } from "zod";
import { TextStyleInputSchema } from "@/lib/text-style";
import { LinkSchema, SocialLinkSchema } from "@/server/user/links/schema";

const BgEffectsSchema = z.record(z.string(), z.number());

const BgPatternSchema = z.object({
  animatedId: z.string(),
  animatedConfig: z.record(z.string(), z.unknown()),
});

const LinkWithIdSchema = LinkSchema.extend({ id: z.string().optional() });
const SocialLinkWithIdSchema = SocialLinkSchema.extend({ id: z.string().optional() });

export const SaveProfileSchema = z
  .object({
    displayName: z.string().max(100).nullable().optional(),
    bio: z.string().max(160).nullable().optional(),
    avatarUrl: z.string().url().nullable().optional(),
    layout: z.string().nullable().optional(),
    displayNameStyle: TextStyleInputSchema.nullable().optional(),
    bioStyle: TextStyleInputSchema.nullable().optional(),
    bgType: z.string().nullable().optional(),
    bgColor: z.string().nullable().optional(),
    bgWallpaper: z.string().nullable().optional(),
    bgImage: z.string().url().nullable().optional(),
    bgEffects: BgEffectsSchema.nullable().optional(),
    bgPattern: BgPatternSchema.nullable().optional(),
    cardTexture: z.string().nullable().optional(),
    links: z.array(LinkWithIdSchema).default([]),
    socials: z.array(SocialLinkWithIdSchema).default([]),
  })
  .passthrough();

export type SaveProfileInput = z.infer<typeof SaveProfileSchema>;
