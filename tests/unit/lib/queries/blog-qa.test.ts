/**
 * FORGE QA — STORY-153 — Tests complementaires
 * Gaps: mapRowToPost edge cases, field mapping, AC-153-5 file deletion
 */
import { describe, it, expect, beforeEach } from "vitest";
import { createClient, type Client } from "@libsql/client";
import {
  getPublishedPosts,
  getPublishedPostBySlug,
  getAllCategories,
  getPublishedSlugs,
} from "@/lib/queries/blog";
import { existsSync } from "node:fs";
import { resolve } from "node:path";

// ── In-memory DB ────────────────────────────────────────────────────────

let db: Client;

async function setupDb() {
  db = createClient({ url: "file::memory:" });
  await db.execute("PRAGMA foreign_keys = ON");

  await db.executeMultiple(`
    CREATE TABLE IF NOT EXISTS blog_posts (
      id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
      slug TEXT NOT NULL UNIQUE,
      title TEXT NOT NULL,
      excerpt TEXT NOT NULL DEFAULT '',
      content TEXT NOT NULL DEFAULT '',
      cover_image_url TEXT,
      reading_time INTEGER NOT NULL DEFAULT 5,
      status TEXT NOT NULL DEFAULT 'draft' CHECK(status IN ('draft', 'published')),
      published_at TEXT,
      author_name TEXT NOT NULL DEFAULT 'TrackMyCash',
      meta_title TEXT,
      meta_description TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
    CREATE TABLE IF NOT EXISTS blog_categories (
      id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
      name TEXT NOT NULL UNIQUE,
      slug TEXT NOT NULL UNIQUE,
      color TEXT NOT NULL DEFAULT '#4F46E5'
    );
    CREATE TABLE IF NOT EXISTS blog_post_categories (
      post_id TEXT NOT NULL REFERENCES blog_posts(id) ON DELETE CASCADE,
      category_id TEXT NOT NULL REFERENCES blog_categories(id) ON DELETE CASCADE,
      PRIMARY KEY (post_id, category_id)
    );
  `);
}

// ── QA-153 : Edge cases mapRowToPost ────────────────────────────────────

describe("QA-153 — mapRowToPost edge cases", () => {
  beforeEach(async () => {
    await setupDb();
  });

  it("QA-153-1 : article publié sans catégorie retourne categories = []", async () => {
    await db.execute({
      sql: "INSERT INTO blog_posts (id, slug, title, excerpt, content, status, published_at) VALUES ('no-cat', 'no-category', 'Sans catégorie', 'Excerpt', 'Content', 'published', '2026-03-01T10:00:00.000Z')",
      args: [],
    });
    const posts = await getPublishedPosts(db);
    expect(posts).toHaveLength(1);
    expect(posts[0].categories).toEqual([]);
  });

  it("QA-153-2 : getPublishedPostBySlug retourne metaTitle et metaDescription", async () => {
    await db.execute({
      sql: "INSERT INTO blog_posts (id, slug, title, excerpt, content, status, published_at, meta_title, meta_description) VALUES ('meta-post', 'article-seo', 'Titre SEO', 'Excerpt', 'Content', 'published', '2026-03-01T10:00:00.000Z', 'Meta Title Custom', 'Meta Description Custom')",
      args: [],
    });
    const post = await getPublishedPostBySlug(db, "article-seo");
    expect(post).not.toBeNull();
    expect(post!.metaTitle).toBe("Meta Title Custom");
    expect(post!.metaDescription).toBe("Meta Description Custom");
  });

  it("QA-153-3 : readingTime est correctement mappé", async () => {
    await db.execute({
      sql: "INSERT INTO blog_posts (id, slug, title, status, published_at, reading_time) VALUES ('rt-post', 'reading-time-test', 'RT Test', 'published', '2026-03-01T10:00:00.000Z', 12)",
      args: [],
    });
    const post = await getPublishedPostBySlug(db, "reading-time-test");
    expect(post!.readingTime).toBe(12);
  });

  it("QA-153-4 : coverImageUrl null quand non défini", async () => {
    await db.execute({
      sql: "INSERT INTO blog_posts (id, slug, title, status, published_at) VALUES ('no-cover', 'no-cover-test', 'No Cover', 'published', '2026-03-01T10:00:00.000Z')",
      args: [],
    });
    const post = await getPublishedPostBySlug(db, "no-cover-test");
    expect(post!.coverImageUrl).toBeNull();
  });

  it("QA-153-5 : article avec plusieurs catégories retourne toutes les catégories", async () => {
    await db.execute({ sql: "INSERT INTO blog_categories (id, name, slug, color) VALUES ('c1', 'Cat A', 'cat-a', '#111')", args: [] });
    await db.execute({ sql: "INSERT INTO blog_categories (id, name, slug, color) VALUES ('c2', 'Cat B', 'cat-b', '#222')", args: [] });
    await db.execute({ sql: "INSERT INTO blog_categories (id, name, slug, color) VALUES ('c3', 'Cat C', 'cat-c', '#333')", args: [] });
    await db.execute({
      sql: "INSERT INTO blog_posts (id, slug, title, status, published_at) VALUES ('multi-cat', 'multi-cat-test', 'Multi Cat', 'published', '2026-03-01T10:00:00.000Z')",
      args: [],
    });
    await db.execute({ sql: "INSERT INTO blog_post_categories (post_id, category_id) VALUES ('multi-cat', 'c1')", args: [] });
    await db.execute({ sql: "INSERT INTO blog_post_categories (post_id, category_id) VALUES ('multi-cat', 'c2')", args: [] });
    await db.execute({ sql: "INSERT INTO blog_post_categories (post_id, category_id) VALUES ('multi-cat', 'c3')", args: [] });

    const post = await getPublishedPostBySlug(db, "multi-cat-test");
    expect(post!.categories).toHaveLength(3);
    expect(post!.categories.map((c) => c.slug).sort()).toEqual(["cat-a", "cat-b", "cat-c"]);
  });
});

// ── QA-153 : AC-153-5 — Fichier statique supprimé ───────────────────────

describe("QA-153 — AC-153-5 : blog-posts.ts supprimé", () => {
  it("QA-153-6 : src/data/blog-posts.ts n'existe plus", () => {
    const filePath = resolve(process.cwd(), "src/data/blog-posts.ts");
    expect(existsSync(filePath)).toBe(false);
  });
});

// ── QA-153 : getAllCategories — base vide ────────────────────────────────

describe("QA-153 — getAllCategories edge cases", () => {
  beforeEach(async () => {
    await setupDb();
  });

  it("QA-153-7 : getAllCategories sur base vide retourne []", async () => {
    const cats = await getAllCategories(db);
    expect(cats).toEqual([]);
  });
});

// ── QA-153 : getPublishedSlugs — ordre garanti ──────────────────────────

describe("QA-153 — getPublishedSlugs ordering", () => {
  beforeEach(async () => {
    await setupDb();
  });

  it("QA-153-8 : retourne les slugs dans l'ordre published_at DESC", async () => {
    await db.execute({ sql: "INSERT INTO blog_posts (id, slug, title, status, published_at) VALUES ('old', 'old-post', 'Old', 'published', '2026-01-01T10:00:00.000Z')", args: [] });
    await db.execute({ sql: "INSERT INTO blog_posts (id, slug, title, status, published_at) VALUES ('new', 'new-post', 'New', 'published', '2026-03-01T10:00:00.000Z')", args: [] });
    await db.execute({ sql: "INSERT INTO blog_posts (id, slug, title, status, published_at) VALUES ('mid', 'mid-post', 'Mid', 'published', '2026-02-01T10:00:00.000Z')", args: [] });

    const slugs = await getPublishedSlugs(db);
    expect(slugs).toEqual(["new-post", "mid-post", "old-post"]);
  });

  it("QA-153-9 : getPublishedSlugs sur base vide retourne []", async () => {
    const slugs = await getPublishedSlugs(db);
    expect(slugs).toEqual([]);
  });
});

// ── QA-153 : AC-153-1 — Filtrage strict status ─────────────────────────

describe("QA-153 — AC-153-1 : filtrage strict published", () => {
  beforeEach(async () => {
    await setupDb();
  });

  it("QA-153-10 : un article draft puis publié apparaît après changement de status", async () => {
    await db.execute({
      sql: "INSERT INTO blog_posts (id, slug, title, status) VALUES ('toggle', 'toggle-post', 'Toggle', 'draft')",
      args: [],
    });
    let posts = await getPublishedPosts(db);
    expect(posts).toHaveLength(0);

    await db.execute({
      sql: "UPDATE blog_posts SET status = 'published', published_at = '2026-03-01T10:00:00.000Z' WHERE id = 'toggle'",
      args: [],
    });
    posts = await getPublishedPosts(db);
    expect(posts).toHaveLength(1);
    expect(posts[0].slug).toBe("toggle-post");
  });
});
