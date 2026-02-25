import { describe, it, expect } from "vitest";
import { BLOG_POSTS, getBlogPost } from "@/data/blog-posts";

describe("BLOG_POSTS data (STORY-098)", () => {
  it("TU-98-1 : au moins 3 articles définis", () => {
    expect(BLOG_POSTS.length).toBeGreaterThanOrEqual(3);
  });

  it("TU-98-2 : chaque post a slug, title, date, excerpt et content", () => {
    for (const post of BLOG_POSTS) {
      expect(post.slug, `slug manquant sur ${post.title}`).toBeTruthy();
      expect(post.title, `title manquant sur slug ${post.slug}`).toBeTruthy();
      expect(post.date, `date manquante sur slug ${post.slug}`).toBeTruthy();
      expect(post.excerpt, `excerpt manquant sur slug ${post.slug}`).toBeTruthy();
      expect(post.content, `content manquant sur slug ${post.slug}`).toBeTruthy();
    }
  });

  it("TU-98-3 : slugs uniques dans le tableau", () => {
    const slugs = BLOG_POSTS.map((p) => p.slug);
    const unique = new Set(slugs);
    expect(unique.size).toBe(slugs.length);
  });

  it("TU-98-4 : getBlogPost slug inexistant → undefined", () => {
    expect(getBlogPost("slug-inexistant")).toBeUndefined();
  });

  it("TU-98-5 : getBlogPost('gerer-budget-couple') → bon article", () => {
    const post = getBlogPost("gerer-budget-couple");
    expect(post).toBeDefined();
    expect(post?.title.toLowerCase()).toContain("budget");
  });
});
