import { z } from "zod";
import { TextStyleSchema, TextStyleInputSchema } from "@/lib/text-style";

export const SocialLinkSchema = z.object({
  platform: z.string().min(1, "Platform is required"),
  url: z.string().url("Invalid URL"),
  position: z.number().int().min(0).optional(),
});

export const LinkSchema = z.object({
  title: z.string().min(1, "Title is required").max(100, "Title must be less than 100 characters"),
  url: z.string().min(1, "URL is required").url("Please enter a valid URL (e.g., https://example.com)"),
  description: z.string().max(500, "Description must be less than 500 characters").optional().nullable(),
  mediaUrl: z.string().url("Invalid media URL").optional().nullable(),
  position: z.number().int().min(0).optional(),
  isActive: z.boolean().default(true),
  titleStyle: TextStyleInputSchema.optional().nullable(),
});

export type SocialLinkInput = z.infer<typeof SocialLinkSchema>;
export type LinkInput = z.infer<typeof LinkSchema>;
export { TextStyleSchema };
export type { TextStyle } from "@/lib/text-style";
