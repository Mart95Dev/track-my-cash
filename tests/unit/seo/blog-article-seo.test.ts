import { describe, it, expect } from "vitest";
import { articleSchema, breadcrumbSchema } from "../../../src/lib/seo/schemas";
import { SEO_CONFIG } from "../../../src/lib/seo/constants";

const baseUrl = SEO_CONFIG.baseUrl;

const mockPost = {
  title: "Gérer son budget en couple",
  excerpt: "Conseils pratiques pour...",
  slug: "gerer-budget-couple",
  publishedAt: "2026-01-15",
  updatedAt: null,
  categories: [{ name: "Budget" }],
};

describe("Blog Article SEO — STORY-167", () => {
  it("TU-1: articleSchema inclut publisher logo", () => {
    const schema = articleSchema(mockPost, baseUrl);
    const publisher = schema.publisher as Record<string, unknown>;
    const logo = publisher.logo as Record<string, unknown>;
    expect(logo["@type"]).toBe("ImageObject");
  });

  it("TU-2: articleSchema inclut mainEntityOfPage", () => {
    const schema = articleSchema(mockPost, baseUrl);
    const mainEntity = schema.mainEntityOfPage as Record<string, unknown>;
    expect(mainEntity["@type"]).toBe("WebPage");
  });

  it("TU-3: articleSchema inclut inLanguage", () => {
    const schema = articleSchema(mockPost, baseUrl);
    expect(schema.inLanguage).toBe("fr");
  });

  it("TU-4: BreadcrumbList a 3 items (Accueil → Blog → titre)", () => {
    const schema = breadcrumbSchema([
      { name: "Accueil", url: `${baseUrl}/fr` },
      { name: "Blog", url: `${baseUrl}/fr/blog` },
      { name: mockPost.title, url: `${baseUrl}/fr/blog/${mockPost.slug}` },
    ]);
    const items = schema.itemListElement as Record<string, unknown>[];
    expect(items).toHaveLength(3);
    expect(items[0].name).toBe("Accueil");
    expect(items[1].name).toBe("Blog");
    expect(items[2].name).toBe(mockPost.title);
  });
});
