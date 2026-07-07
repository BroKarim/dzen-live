/**
 * JSON-LD structured data builders for SEO rich snippets.
 * @see https://schema.org
 */

interface PersonInput {
  name: string;
  url: string;
  description?: string | null;
  image?: string | null;
  sameAs?: string[];
}

export function buildProfilePageSchema(input: PersonInput) {
  const mainEntity: Record<string, unknown> = {
    "@type": "Person",
    name: input.name,
    url: input.url,
  };

  if (input.description) mainEntity.description = input.description;
  if (input.image) mainEntity.image = input.image;
  if (input.sameAs && input.sameAs.length > 0) mainEntity.sameAs = input.sameAs;

  return {
    "@context": "https://schema.org",
    "@type": "ProfilePage",
    mainEntity,
  };
}

interface WebSiteInput {
  name: string;
  url: string;
}

export function buildWebSiteSchema(input: WebSiteInput) {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: input.name,
    url: input.url,
  };
}

interface OrganizationInput {
  name: string;
  url: string;
  logo?: string;
}

export function buildOrganizationSchema(input: OrganizationInput) {
  const schema: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: input.name,
    url: input.url,
  };
  if (input.logo) schema.logo = input.logo;
  return schema;
}

/**
 * Serialize JSON-LD safely for embedding inside <script> tags.
 * Escapes `<` (and `<!--`) to prevent breaking out of the script element.
 */
export function serializeJsonLd(data: unknown): string {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}