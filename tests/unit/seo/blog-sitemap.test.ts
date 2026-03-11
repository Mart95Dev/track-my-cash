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
  ensureSchema: vi.fn(),
}));

vi.mock("@/lib/queries/blog", () => ({
  getPublishedPosts: vi.fn().mockResolvedValue(mockPosts),
}));

import sitemap from "@/app/sitemap";

describe("Sitemap blog (STORY-098 → STORY-153)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("TU-98-6 : sitemap contient au moins une URL /blog (liste)", async () => {
    const entries = await sitemap();
    const hasBlogList = entries.some(
      (e) => e.url.includes("/blog") && !e.url.match(/\/blog\/.+/)
    );
    expect(hasBlogList).toBe(true);
  });

  it("TU-98-7 : sitemap contient une URL /blog/{slug} pour chaque article publié", async () => {
    const entries = await sitemap();
    const urls = entries.map((e) => e.url);
    for (const post of mockPosts) {
      const found = urls.some((u) => u.includes(`/blog/${post.slug}`));
      expect(found, `URL /blog/${post.slug} manquante dans le sitemap`).toBe(true);
    }
  });

  it("TU-98-9 : chaque slug seed est valide (lowercase + tirets)", () => {
    for (const post of mockPosts) {
      expect(post.slug).toMatch(/^[a-z0-9-]+$/);
    }
  });

  it("TU-98-QA-13 : les entrées /blog/{slug} ont priority et changeFrequency définis", async () => {
    const entries = await sitemap();
    const blogSlugEntries = entries.filter((e) => e.url.match(/\/blog\/.+/));
    expect(blogSlugEntries.length).toBe(mockPosts.length);
    for (const entry of blogSlugEntries) {
      expect(entry.priority).toBeDefined();
      expect(entry.changeFrequency).toBeDefined();
    }
  });

  it("TU-98-QA-14 : URL /fr/blog présente avec priority 0.7", async () => {
    const entries = await sitemap();
    const blogList = entries.find((e) => e.url.endsWith("/fr/blog"));
    expect(blogList).toBeDefined();
    expect(blogList!.priority).toBe(0.7);
  });
});
