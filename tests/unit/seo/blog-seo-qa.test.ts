/**
 * FORGE QA — STORY-098 → STORY-153 — Blog SEO
 * Adapté pour les données seed dynamiques (SEED_POSTS depuis blog-db.ts)
 */

import { describe, it, expect } from "vitest";
import { SEED_POSTS } from "@/lib/blog-db";

// ---------------------------------------------------------------------------
// AC-4 : unicité des métadonnées (title + description)
// ---------------------------------------------------------------------------

describe("TU-98-QA-1 à QA-3 — Unicité métadonnées (AC-4)", () => {
  it("TU-98-QA-1 : le title de chaque article est différent de son excerpt", () => {
    for (const post of SEED_POSTS) {
      expect(post.title).not.toBe(post.excerpt);
    }
  });

  it("TU-98-QA-2 : tous les titles des articles sont uniques", () => {
    const titles = SEED_POSTS.map((p) => p.title);
    const unique = new Set(titles);
    expect(unique.size).toBe(titles.length);
  });

  it("TU-98-QA-3 : tous les excerpts (descriptions) sont uniques", () => {
    const excerpts = SEED_POSTS.map((p) => p.excerpt);
    const unique = new Set(excerpts);
    expect(unique.size).toBe(excerpts.length);
  });
});

// ---------------------------------------------------------------------------
// AC-6 : structure JSON-LD Schema.org Article
// ---------------------------------------------------------------------------

function buildJsonLd(post: (typeof SEED_POSTS)[number]) {
  const baseUrl = "https://trackmycash.com";
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.excerpt,
    datePublished: post.publishedAt,
    author: { "@type": "Organization", name: "TrackMyCash" },
    publisher: { "@type": "Organization", name: "TrackMyCash", url: baseUrl },
    url: `${baseUrl}/fr/blog/${post.slug}`,
    keywords: post.categories.join(", "),
  };
}

describe("TU-98-QA-4 à QA-8 — JSON-LD Schema.org Article (AC-6)", () => {
  it("TU-98-QA-4 : @context === 'https://schema.org' pour chaque article", () => {
    for (const post of SEED_POSTS) {
      const ld = buildJsonLd(post);
      expect(ld["@context"]).toBe("https://schema.org");
    }
  });

  it("TU-98-QA-5 : @type === 'Article' pour chaque article", () => {
    for (const post of SEED_POSTS) {
      const ld = buildJsonLd(post);
      expect(ld["@type"]).toBe("Article");
    }
  });

  it("TU-98-QA-6 : headline JSON-LD correspond au titre de l'article", () => {
    for (const post of SEED_POSTS) {
      const ld = buildJsonLd(post);
      expect(ld.headline).toBe(post.title);
    }
  });

  it("TU-98-QA-8 : publisher.name === 'TrackMyCash' pour chaque article", () => {
    for (const post of SEED_POSTS) {
      const ld = buildJsonLd(post);
      expect(ld.publisher.name).toBe("TrackMyCash");
    }
  });
});

// ---------------------------------------------------------------------------
// AC-2 : contenu HTML non vide pour chaque article
// ---------------------------------------------------------------------------

describe("TU-98-QA-9 — Contenu HTML des articles (AC-2)", () => {
  it("TU-98-QA-9 : content de chaque article contient au moins un tag <h2>", () => {
    for (const post of SEED_POSTS) {
      expect(post.content, `content de "${post.slug}" devrait contenir un <h2>`).toContain("<h2>");
    }
  });
});

// ---------------------------------------------------------------------------
// AC-1 : validité des champs de chaque article
// ---------------------------------------------------------------------------

describe("TU-98-QA-10 à QA-11 — Validité des données articles (AC-1)", () => {
  it("TU-98-QA-10 : publishedAt est au format ISO pour chaque article", () => {
    for (const post of SEED_POSTS) {
      expect(post.publishedAt).toBeTruthy();
      expect(new Date(post.publishedAt).toISOString()).toBeTruthy();
    }
  });

  it("TU-98-QA-11 : readingTime est un entier positif pour chaque article", () => {
    for (const post of SEED_POSTS) {
      expect(typeof post.readingTime).toBe("number");
      expect(Number.isInteger(post.readingTime)).toBe(true);
      expect(post.readingTime).toBeGreaterThan(0);
    }
  });
});

// ---------------------------------------------------------------------------
// Data : slugs attendus dans les seed
// ---------------------------------------------------------------------------

describe("TU-98-QA-12 — Slugs seed couvrent les 3 articles story", () => {
  const expectedSlugs = [
    "gerer-budget-couple",
    "partager-depenses-equitablement",
    "objectifs-epargne-couple",
  ] as const;

  for (const slug of expectedSlugs) {
    it(`TU-98-QA-12 : SEED_POSTS contient le slug "${slug}"`, () => {
      const post = SEED_POSTS.find((p) => p.slug === slug);
      expect(post).toBeDefined();
    });
  }
});
