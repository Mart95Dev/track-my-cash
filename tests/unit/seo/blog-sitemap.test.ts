import { describe, it, expect } from "vitest";
import sitemap from "@/app/sitemap";
import { BLOG_POSTS } from "@/data/blog-posts";

describe("Sitemap blog (STORY-098)", () => {
  it("TU-98-6 : sitemap contient au moins une URL /blog (liste)", () => {
    const entries = sitemap();
    const hasBlogList = entries.some(
      (e) => e.url.includes("/blog") && !e.url.match(/\/blog\/.+/)
    );
    expect(hasBlogList).toBe(true);
  });

  it("TU-98-7 : sitemap contient une URL /blog/{slug} pour chaque article", () => {
    const entries = sitemap();
    const urls = entries.map((e) => e.url);
    for (const post of BLOG_POSTS) {
      const found = urls.some((u) => u.includes(`/blog/${post.slug}`));
      expect(found, `URL /blog/${post.slug} manquante dans le sitemap`).toBe(true);
    }
  });

  it("TU-98-8 : BLOG_POSTS expose titre et extrait pour chaque article", () => {
    expect(BLOG_POSTS.length).toBeGreaterThanOrEqual(3);
    for (const post of BLOG_POSTS) {
      expect(post.title).toBeTruthy();
      expect(post.excerpt).toBeTruthy();
    }
  });

  it("TU-98-9 : chaque article a un slug valide (lowercase + tirets)", () => {
    for (const post of BLOG_POSTS) {
      expect(post.slug).toMatch(/^[a-z0-9-]+$/);
    }
  });
});
