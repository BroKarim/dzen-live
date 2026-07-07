import { describe, expect, it } from "vitest";
import {
  buildProfilePageSchema,
  buildWebSiteSchema,
  buildOrganizationSchema,
  serializeJsonLd,
} from "@/lib/seo/json-ld";

describe("buildProfilePageSchema", () => {
  it("wraps a Person as the mainEntity and omits empty fields", () => {
    const schema = buildProfilePageSchema({ name: "Jane", url: "https://dzenn.live/jane" });
    expect(schema).toEqual({
      "@context": "https://schema.org",
      "@type": "ProfilePage",
      mainEntity: { "@type": "Person", name: "Jane", url: "https://dzenn.live/jane" },
    });
  });

  it("includes description, image and sameAs when present", () => {
    const schema = buildProfilePageSchema({
      name: "Jane",
      url: "https://dzenn.live/jane",
      description: "Photographer",
      image: "https://x/a.png",
      sameAs: ["https://instagram.com/jane"],
    });
    expect(schema.mainEntity).toMatchObject({
      description: "Photographer",
      image: "https://x/a.png",
      sameAs: ["https://instagram.com/jane"],
    });
  });
});

describe("buildWebSiteSchema", () => {
  it("builds a WebSite", () => {
    expect(buildWebSiteSchema({ name: "Dzenn", url: "https://dzenn.live" })).toEqual({
      "@context": "https://schema.org",
      "@type": "WebSite",
      name: "Dzenn",
      url: "https://dzenn.live",
    });
  });
});

describe("buildOrganizationSchema", () => {
  it("builds an Organization with logo", () => {
    expect(
      buildOrganizationSchema({
        name: "Dzenn",
        url: "https://dzenn.live",
        logo: "https://dzenn.live/og.png",
      }),
    ).toEqual({
      "@context": "https://schema.org",
      "@type": "Organization",
      name: "Dzenn",
      url: "https://dzenn.live",
      logo: "https://dzenn.live/og.png",
    });
  });

  it("omits logo when not provided", () => {
    const schema = buildOrganizationSchema({ name: "Dzenn", url: "https://dzenn.live" });
    expect("logo" in schema).toBe(false);
  });
});

describe("serializeJsonLd", () => {
  it("escapes < to prevent breaking out of the script tag", () => {
    expect(serializeJsonLd({ a: "</script><b>" })).toBe('{"a":"\\u003c/script>\\u003cb>"}');
  });
});