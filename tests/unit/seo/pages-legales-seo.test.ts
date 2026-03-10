import { describe, it, expect } from "vitest";
import { breadcrumbSchema } from "../../../src/lib/seo/schemas";
import { buildPageMetadata } from "../../../src/lib/seo/metadata";
import { SEO_CONFIG } from "../../../src/lib/seo/constants";

describe("Pages Légales + Blog SEO — STORY-166", () => {
  const baseUrl = SEO_CONFIG.baseUrl;

  it("TU-1: CGU a un BreadcrumbList", () => {
    const schema = breadcrumbSchema([
      { name: "Accueil", url: `${baseUrl}/fr` },
      { name: "Conditions Générales", url: `${baseUrl}/fr/cgu` },
    ]);
    expect(schema["@type"]).toBe("BreadcrumbList");
    const items = schema.itemListElement as { name: string }[];
    expect(items[1].name).toBe("Conditions Générales");
  });

  it("TU-2: Blog a un BreadcrumbList avec 'Blog'", () => {
    const schema = breadcrumbSchema([
      { name: "Accueil", url: `${baseUrl}/fr` },
      { name: "Blog", url: `${baseUrl}/fr/blog` },
    ]);
    const items = schema.itemListElement as { name: string }[];
    expect(items[1].name).toBe("Blog");
  });

  it("TU-3: Les pages légales ont OG fallback /og/home.png", () => {
    const meta = buildPageMetadata({
      title: "CGU",
      description: "D",
      path: "cgu",
      locale: "fr",
    });
    const images = meta.openGraph?.images as { url: string }[];
    expect(images[0].url).toContain("/og/home.png");
  });

  it("TU-4: Le blog a OG /og/blog.png", () => {
    const meta = buildPageMetadata({
      title: "Blog",
      description: "D",
      path: "blog",
      locale: "fr",
      ogImage: "/og/blog.png",
    });
    const images = meta.openGraph?.images as { url: string }[];
    expect(images[0].url).toContain("/og/blog.png");
  });

  it("TU-5: Les alternates couvrent 5 locales", () => {
    const meta = buildPageMetadata({
      title: "T",
      description: "D",
      path: "cgu",
      locale: "fr",
    });
    const languages = meta.alternates?.languages as Record<string, string>;
    expect(Object.keys(languages)).toHaveLength(5);
  });
});
