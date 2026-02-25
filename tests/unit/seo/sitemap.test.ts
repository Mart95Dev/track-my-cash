import { describe, it, expect } from "vitest";
import sitemap from "@/app/sitemap";
import { BLOG_POSTS } from "@/data/blog-posts";

const LOCALES = ["fr", "en", "es", "it", "de"];
const PUBLIC_PATHS = ["", "tarifs", "connexion", "inscription"];
// 20 entrées locales + 1 /blog + N articles blog
const TOTAL_EXPECTED = LOCALES.length * PUBLIC_PATHS.length + 1 + BLOG_POSTS.length;

describe("sitemap.xml", () => {
  it(`TU-2-1 : contient ${TOTAL_EXPECTED} entrées (locales + blog)`, () => {
    const result = sitemap();
    expect(result.length).toBe(TOTAL_EXPECTED);
  });

  it("TU-2-2 : l'URL /fr/ est présente", () => {
    const result = sitemap();
    const hasRoot = result.some((entry) => entry.url.includes("/fr") && !entry.url.includes("/fr/"));
    const hasFr = result.some((entry) => entry.url.endsWith("/fr") || entry.url.endsWith("/fr/"));
    expect(hasRoot || hasFr).toBe(true);
  });

  it("TU-2-3 : l'URL /en/tarifs est présente", () => {
    const result = sitemap();
    const hasEnTarifs = result.some((entry) => entry.url.includes("/en/tarifs"));
    expect(hasEnTarifs).toBe(true);
  });

  it("TU-2-4 : aucune URL d'app (parametres, transactions, dashboard)", () => {
    const result = sitemap();
    const hasAppUrl = result.some(
      (entry) =>
        entry.url.includes("parametres") ||
        entry.url.includes("transactions") ||
        entry.url.includes("dashboard") ||
        entry.url.includes("comptes")
    );
    expect(hasAppUrl).toBe(false);
  });

  it("TU-2-5 : chaque entrée a un lastmod", () => {
    const result = sitemap();
    result.forEach((entry) => {
      expect(entry.lastModified).toBeDefined();
    });
  });
});
