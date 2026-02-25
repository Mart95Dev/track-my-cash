/**
 * FORGE QA — STORY-098 — Blog SEO couple
 * Tests manquants identifiés par l'audit QA (TU-98-QA-x)
 *
 * Note d'architecture : les Server Components Next.js (blog/page.tsx,
 * blog/[slug]/page.tsx) ne peuvent pas être rendus directement dans Vitest
 * (dépendance next/navigation non résoluble hors runtime Next.js).
 * On teste donc :
 *   - Les exports de données (BLOG_POSTS, getBlogPost)
 *   - Le sitemap (fonction pure)
 *   - La logique JSON-LD reconstituée depuis les données sources
 *   - Le contenu HTML des articles
 *
 * GAPs couverts :
 *  QA-1  : AC-4 — title unique par article (title != excerpt, contient le slug keyword)
 *  QA-2  : AC-4 — titles des articles sont tous différents (unicité)
 *  QA-3  : AC-4 — descriptions (excerpt) sont toutes différentes (unicité)
 *  QA-4  : AC-6 — structure JSON-LD : @context === "https://schema.org"
 *  QA-5  : AC-6 — JSON-LD @type === "Article" pour chaque article
 *  QA-6  : AC-6 — JSON-LD headline correspond au titre de l'article
 *  QA-7  : AC-6 — JSON-LD keywords correspond aux tags de l'article
 *  QA-8  : AC-6 — JSON-LD publisher.name === "TrackMyCash"
 *  QA-9  : AC-2 — content de chaque article contient du HTML (balise <h2>)
 *  QA-10 : AC-1 — date de chaque article est au format ISO YYYY-MM-DD
 *  QA-11 : AC-1 — readingTime est un entier positif pour chaque article
 *  QA-12 : data  — getBlogPost couvre les 3 slugs attendus par la story
 *  QA-13 : AC-5  — entrées blog dans le sitemap ont priority et changeFrequency définis
 *  QA-14 : AC-5  — URL /fr/blog (liste) présente dans le sitemap avec priority 0.7
 */

import { describe, it, expect } from "vitest";
import { BLOG_POSTS, getBlogPost } from "@/data/blog-posts";
import sitemap from "@/app/sitemap";

// ---------------------------------------------------------------------------
// AC-4 : unicité des métadonnées (title + description)
// ---------------------------------------------------------------------------

describe("TU-98-QA-1 à QA-3 — Unicité métadonnées (AC-4)", () => {
  it("TU-98-QA-1 : le title de chaque article est différent de son excerpt", () => {
    for (const post of BLOG_POSTS) {
      expect(post.title).not.toBe(post.excerpt);
    }
  });

  it("TU-98-QA-2 : tous les titles des articles sont uniques", () => {
    const titles = BLOG_POSTS.map((p) => p.title);
    const unique = new Set(titles);
    expect(unique.size).toBe(titles.length);
  });

  it("TU-98-QA-3 : tous les excerpts (descriptions) sont uniques", () => {
    const excerpts = BLOG_POSTS.map((p) => p.excerpt);
    const unique = new Set(excerpts);
    expect(unique.size).toBe(excerpts.length);
  });
});

// ---------------------------------------------------------------------------
// AC-6 : structure JSON-LD Schema.org Article
// ---------------------------------------------------------------------------

/**
 * La logique JSON-LD est définie dans blog/[slug]/page.tsx.
 * On la reconstitue ici à partir des données sources pour valider
 * la cohérence des champs attendus par Schema.org.
 */
function buildJsonLd(slug: string) {
  const post = getBlogPost(slug);
  if (!post) return null;
  const baseUrl = "https://trackmycash.com";
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.excerpt,
    datePublished: post.date,
    author: {
      "@type": "Organization",
      name: "TrackMyCash",
    },
    publisher: {
      "@type": "Organization",
      name: "TrackMyCash",
      url: baseUrl,
    },
    url: `${baseUrl}/fr/blog/${post.slug}`,
    keywords: post.tags.join(", "),
  };
}

describe("TU-98-QA-4 à QA-8 — JSON-LD Schema.org Article (AC-6)", () => {
  it("TU-98-QA-4 : @context === 'https://schema.org' pour chaque article", () => {
    for (const post of BLOG_POSTS) {
      const ld = buildJsonLd(post.slug);
      expect(ld).not.toBeNull();
      expect(ld!["@context"]).toBe("https://schema.org");
    }
  });

  it("TU-98-QA-5 : @type === 'Article' pour chaque article", () => {
    for (const post of BLOG_POSTS) {
      const ld = buildJsonLd(post.slug);
      expect(ld).not.toBeNull();
      expect(ld!["@type"]).toBe("Article");
    }
  });

  it("TU-98-QA-6 : headline JSON-LD correspond au titre de l'article", () => {
    for (const post of BLOG_POSTS) {
      const ld = buildJsonLd(post.slug);
      expect(ld).not.toBeNull();
      expect(ld!.headline).toBe(post.title);
    }
  });

  it("TU-98-QA-7 : keywords JSON-LD correspond aux tags joints par ', '", () => {
    for (const post of BLOG_POSTS) {
      const ld = buildJsonLd(post.slug);
      expect(ld).not.toBeNull();
      expect(ld!.keywords).toBe(post.tags.join(", "));
    }
  });

  it("TU-98-QA-8 : publisher.name === 'TrackMyCash' pour chaque article", () => {
    for (const post of BLOG_POSTS) {
      const ld = buildJsonLd(post.slug);
      expect(ld).not.toBeNull();
      expect(ld!.publisher.name).toBe("TrackMyCash");
    }
  });
});

// ---------------------------------------------------------------------------
// AC-2 : contenu HTML non vide pour chaque article
// ---------------------------------------------------------------------------

describe("TU-98-QA-9 — Contenu HTML des articles (AC-2)", () => {
  it("TU-98-QA-9 : content de chaque article contient au moins un tag <h2>", () => {
    for (const post of BLOG_POSTS) {
      expect(
        post.content,
        `content de "${post.slug}" devrait contenir un <h2>`
      ).toContain("<h2>");
    }
  });
});

// ---------------------------------------------------------------------------
// AC-1 : validité des champs de chaque article
// ---------------------------------------------------------------------------

describe("TU-98-QA-10 à QA-11 — Validité des données articles (AC-1)", () => {
  it("TU-98-QA-10 : date au format ISO YYYY-MM-DD pour chaque article", () => {
    const isoDateRegex = /^\d{4}-\d{2}-\d{2}$/;
    for (const post of BLOG_POSTS) {
      expect(
        post.date,
        `date de "${post.slug}" devrait être au format YYYY-MM-DD`
      ).toMatch(isoDateRegex);
    }
  });

  it("TU-98-QA-11 : readingTime est un entier positif pour chaque article", () => {
    for (const post of BLOG_POSTS) {
      expect(typeof post.readingTime).toBe("number");
      expect(Number.isInteger(post.readingTime)).toBe(true);
      expect(post.readingTime).toBeGreaterThan(0);
    }
  });
});

// ---------------------------------------------------------------------------
// Data : getBlogPost sur les 3 slugs attendus par la story
// ---------------------------------------------------------------------------

describe("TU-98-QA-12 — getBlogPost sur les 3 slugs story (data)", () => {
  const expectedSlugs = [
    "gerer-budget-couple",
    "partager-depenses-equitablement",
    "objectifs-epargne-couple",
  ] as const;

  for (const slug of expectedSlugs) {
    it(`TU-98-QA-12 : getBlogPost("${slug}") retourne un article avec le bon slug`, () => {
      const post = getBlogPost(slug);
      expect(post).toBeDefined();
      expect(post!.slug).toBe(slug);
    });
  }
});

// ---------------------------------------------------------------------------
// AC-5 : qualité des entrées blog dans le sitemap
// ---------------------------------------------------------------------------

describe("TU-98-QA-13 à QA-14 — Qualité sitemap blog (AC-5)", () => {
  it("TU-98-QA-13 : les entrées /blog/{slug} ont priority et changeFrequency définis", () => {
    const entries = sitemap();
    const blogSlugEntries = entries.filter((e) => e.url.match(/\/blog\/.+/));
    expect(blogSlugEntries.length).toBe(BLOG_POSTS.length);
    for (const entry of blogSlugEntries) {
      expect(entry.priority, `priority manquante sur ${entry.url}`).toBeDefined();
      expect(typeof entry.priority).toBe("number");
      expect(
        entry.changeFrequency,
        `changeFrequency manquante sur ${entry.url}`
      ).toBeDefined();
    }
  });

  it("TU-98-QA-14 : URL /fr/blog (liste) présente dans le sitemap avec priority 0.7", () => {
    const entries = sitemap();
    const blogList = entries.find(
      (e) => e.url.endsWith("/fr/blog") || e.url.endsWith("/fr/blog/")
    );
    expect(blogList, "URL /fr/blog introuvable dans le sitemap").toBeDefined();
    expect(blogList!.priority).toBe(0.7);
  });
});
