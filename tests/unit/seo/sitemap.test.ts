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

import sitemap from "@/app/sitemap";

const LOCALES = ["fr", "en", "es", "it", "de"];
const PUBLIC_PATHS = ["", "tarifs", "connexion", "inscription"];
const TOTAL_EXPECTED = LOCALES.length * PUBLIC_PATHS.length + 1 + mockPosts.length;

describe("sitemap.xml", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it(`TU-2-1 : contient ${TOTAL_EXPECTED} entrées (locales + blog)`, async () => {
    const result = await sitemap();
    expect(result.length).toBe(TOTAL_EXPECTED);
  });

  it("TU-2-2 : l'URL /fr est présente", async () => {
    const result = await sitemap();
    const hasFr = result.some((entry) => entry.url.endsWith("/fr"));
    expect(hasFr).toBe(true);
  });

  it("TU-2-3 : l'URL /en/tarifs est présente", async () => {
    const result = await sitemap();
    const hasEnTarifs = result.some((entry) => entry.url.includes("/en/tarifs"));
    expect(hasEnTarifs).toBe(true);
  });

  it("TU-2-4 : aucune URL d'app (parametres, transactions, dashboard)", async () => {
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

  it("TU-2-5 : chaque entrée a un lastmod", async () => {
    const result = await sitemap();
    result.forEach((entry) => {
      expect(entry.lastModified).toBeDefined();
    });
  });
});
