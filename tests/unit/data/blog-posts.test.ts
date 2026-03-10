import { describe, it, expect } from "vitest";
import { SEED_POSTS, SEED_CATEGORIES } from "@/lib/blog-db";

describe("Blog seed data (STORY-098 → STORY-153)", () => {
  it("TU-98-1 : au moins 3 articles seed définis", () => {
    expect(SEED_POSTS.length).toBeGreaterThanOrEqual(3);
  });

  it("TU-98-2 : chaque post seed a slug, title, excerpt et content", () => {
    for (const post of SEED_POSTS) {
      expect(post.slug, `slug manquant sur ${post.title}`).toBeTruthy();
      expect(post.title, `title manquant sur slug ${post.slug}`).toBeTruthy();
      expect(post.excerpt, `excerpt manquant sur slug ${post.slug}`).toBeTruthy();
      expect(post.content, `content manquant sur slug ${post.slug}`).toBeTruthy();
    }
  });

  it("TU-98-3 : slugs uniques dans le tableau", () => {
    const slugs = SEED_POSTS.map((p) => p.slug);
    const unique = new Set(slugs);
    expect(unique.size).toBe(slugs.length);
  });

  it("au moins 5 catégories seed définies", () => {
    expect(SEED_CATEGORIES.length).toBeGreaterThanOrEqual(5);
  });

  it("chaque catégorie a name, slug et color", () => {
    for (const cat of SEED_CATEGORIES) {
      expect(cat.name).toBeTruthy();
      expect(cat.slug).toBeTruthy();
      expect(cat.color).toBeTruthy();
    }
  });
});
