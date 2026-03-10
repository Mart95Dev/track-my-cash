import { describe, it, expect, vi, beforeEach } from "vitest";

const { mockPosts } = vi.hoisted(() => ({
  mockPosts: [
    { slug: "gerer-budget-couple", publishedAt: "2026-02-24T10:00:00.000Z" },
    { slug: "partager-depenses-equitablement", publishedAt: "2026-02-17T10:00:00.000Z" },
    { slug: "objectifs-epargne-couple", publishedAt: "2026-02-10T10:00:00.000Z" },
  ],
}));

vi.mock("@/lib/db", () => ({
  getDb: vi.fn(() => ({})),
}));

vi.mock("@/lib/queries/blog", () => ({
  getPublishedPosts: vi.fn().mockResolvedValue(mockPosts),
}));

import sitemap, { LOCALES, MARKETING_PATHS } from "@/app/sitemap";

const MARKETING_COUNT = LOCALES.length * MARKETING_PATHS.length;
const BLOG_INDEX_COUNT = 1;
const TOTAL_EXPECTED = MARKETING_COUNT + BLOG_INDEX_COUNT + mockPosts.length;

describe("sitemap.xml", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it(`TU-1 : contient >= 55 URLs marketing (${MARKETING_COUNT} marketing + ${BLOG_INDEX_COUNT} blog index + ${mockPosts.length} articles = ${TOTAL_EXPECTED})`, async () => {
    const result = await sitemap();
    expect(result.length).toBe(TOTAL_EXPECTED);
    expect(MARKETING_COUNT).toBeGreaterThanOrEqual(55);
  });

  it("TU-2 : chaque chemin marketing existe en 5 locales", async () => {
    const result = await sitemap();
    for (const { path } of MARKETING_PATHS) {
      const matchingUrls = result.filter((entry) => {
        if (path === "") {
          // Homepage: URL ends with /<locale> (no trailing path)
          return LOCALES.some(
            (locale) =>
              entry.url.endsWith(`/${locale}`) ||
              entry.url.endsWith(`/${locale}/`)
          );
        }
        return entry.url.includes(`/${path}`);
      });
      expect(matchingUrls.length).toBeGreaterThanOrEqual(
        LOCALES.length
      );
    }
  });

  it("TU-3 : la homepage a priority 1.0", async () => {
    const result = await sitemap();
    const homepages = result.filter((entry) =>
      LOCALES.some((locale) => entry.url.endsWith(`/${locale}`))
    );
    expect(homepages.length).toBe(LOCALES.length);
    for (const hp of homepages) {
      expect(hp.priority).toBe(1.0);
    }
  });

  it("TU-4 : les pages legales ont priority 0.3", async () => {
    const legalPaths = ["cgu", "mentions-legales", "politique-confidentialite", "cookies"];
    const result = await sitemap();
    for (const legalPath of legalPaths) {
      const legalEntries = result.filter((entry) =>
        entry.url.includes(`/${legalPath}`)
      );
      expect(legalEntries.length).toBe(LOCALES.length);
      for (const entry of legalEntries) {
        expect(entry.priority).toBe(0.3);
      }
    }
  });

  it("TU-5 : le blog est en fr uniquement", async () => {
    const result = await sitemap();
    const blogEntries = result.filter((entry) => entry.url.includes("/blog"));
    // All blog URLs must contain /fr/blog
    for (const entry of blogEntries) {
      expect(entry.url).toContain("/fr/blog");
    }
    // Should have blog index + articles
    expect(blogEntries.length).toBe(1 + mockPosts.length);
  });

  it("TU-6 : changeFrequency est correct par type de page", async () => {
    const result = await sitemap();

    // Homepage = weekly
    const homepages = result.filter((entry) =>
      LOCALES.some((locale) => entry.url.endsWith(`/${locale}`))
    );
    for (const hp of homepages) {
      expect(hp.changeFrequency).toBe("weekly");
    }

    // Legal pages = yearly
    const legalPaths = ["cgu", "mentions-legales", "politique-confidentialite", "cookies"];
    for (const legalPath of legalPaths) {
      const legalEntries = result.filter((entry) =>
        entry.url.includes(`/${legalPath}`)
      );
      for (const entry of legalEntries) {
        expect(entry.changeFrequency).toBe("yearly");
      }
    }

    // Tarifs, fonctionnalites = monthly
    for (const p of ["tarifs", "fonctionnalites"]) {
      const entries = result.filter((entry) => entry.url.includes(`/${p}`));
      for (const entry of entries) {
        expect(entry.changeFrequency).toBe("monthly");
      }
    }
  });

  it("aucune URL d'app (parametres, transactions, dashboard)", async () => {
    const result = await sitemap();
    const hasAppUrl = result.some(
      (entry) =>
        entry.url.includes("parametres") ||
        entry.url.includes("transactions") ||
        entry.url.includes("dashboard") ||
        entry.url.includes("comptes")
    );
    expect(hasAppUrl).toBe(false);
  });

  it("chaque entree a un lastmod", async () => {
    const result = await sitemap();
    result.forEach((entry) => {
      expect(entry.lastModified).toBeDefined();
    });
  });
});
