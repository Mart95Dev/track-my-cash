import { describe, it, expect } from "vitest";
import {
  organizationSchema,
  webSiteSchema,
  softwareApplicationSchema,
  faqPageSchema,
  articleSchema,
  breadcrumbSchema,
} from "../../../src/lib/seo/schemas";

describe("SEO JSON-LD schemas", () => {
  it("TU-1: organizationSchema retourne @type Organization avec name TrackMyCash", () => {
    const schema = organizationSchema();
    expect(schema["@type"]).toBe("Organization");
    expect(schema.name).toBe("TrackMyCash");
  });

  it("TU-2: webSiteSchema retourne @type WebSite avec potentialAction SearchAction", () => {
    const schema = webSiteSchema();
    expect(schema["@type"]).toBe("WebSite");
    const action = schema.potentialAction as Record<string, unknown>;
    expect(action["@type"]).toBe("SearchAction");
  });

  it("TU-3: softwareApplicationSchema a 3 offers", () => {
    const schema = softwareApplicationSchema();
    const offers = schema.offers as Record<string, unknown>[];
    expect(offers).toHaveLength(3);
  });

  it("TU-4: faqPageSchema genere N questions (2 items)", () => {
    const schema = faqPageSchema([
      { question: "Q1?", answer: "A1" },
      { question: "Q2?", answer: "A2" },
    ]);
    const mainEntity = schema.mainEntity as Record<string, unknown>[];
    expect(mainEntity).toHaveLength(2);
    expect(mainEntity[0]["@type"]).toBe("Question");
    expect(mainEntity[1]["@type"]).toBe("Question");
  });

  it("TU-5: faqPageSchema([]) retourne mainEntity vide", () => {
    const schema = faqPageSchema([]);
    const mainEntity = schema.mainEntity as Record<string, unknown>[];
    expect(mainEntity).toHaveLength(0);
  });

  it("TU-6: articleSchema inclut publisher.logo.@type ImageObject", () => {
    const schema = articleSchema(
      {
        title: "Test Article",
        excerpt: "Un article de test",
        slug: "test-article",
        publishedAt: "2025-06-01",
        categories: [{ name: "Finance" }],
      },
      "https://trackmycash.com"
    );
    const publisher = schema.publisher as Record<string, unknown>;
    const logo = publisher.logo as Record<string, unknown>;
    expect(logo["@type"]).toBe("ImageObject");
  });

  it("TU-7: breadcrumbSchema genere les positions auto-incrementees", () => {
    const schema = breadcrumbSchema([
      { name: "Accueil", url: "https://trackmycash.com/fr" },
      { name: "Blog", url: "https://trackmycash.com/fr/blog" },
      { name: "Article", url: "https://trackmycash.com/fr/blog/test" },
    ]);
    const items = schema.itemListElement as Record<string, unknown>[];
    expect(items).toHaveLength(3);
    expect(items[0].position).toBe(1);
    expect(items[1].position).toBe(2);
    expect(items[2].position).toBe(3);
  });

  it("TU-8: Tous les schemas ont @context https://schema.org", () => {
    const schemas = [
      organizationSchema(),
      webSiteSchema(),
      softwareApplicationSchema(),
      faqPageSchema([]),
      articleSchema(
        {
          title: "T",
          excerpt: "E",
          slug: "s",
          publishedAt: null,
          categories: [],
        },
        "https://trackmycash.com"
      ),
      breadcrumbSchema([]),
    ];
    for (const schema of schemas) {
      expect(schema["@context"]).toBe("https://schema.org");
    }
  });
});
