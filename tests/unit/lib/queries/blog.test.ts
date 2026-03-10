import { describe, it, expect, beforeEach } from "vitest";
import { createClient, type Client } from "@libsql/client";
import {
  getPublishedPosts,
  getPublishedPostBySlug,
  getAllCategories,
  getPublishedSlugs,
} from "@/lib/queries/blog";

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

async function seedFixture() {
  // 5 categories
  await db.execute({ sql: "INSERT INTO blog_categories (id, name, slug, color) VALUES ('cat-1', 'Budget', 'budget', '#4F46E5')", args: [] });
  await db.execute({ sql: "INSERT INTO blog_categories (id, name, slug, color) VALUES ('cat-2', 'Couple', 'couple', '#EC4899')", args: [] });
  await db.execute({ sql: "INSERT INTO blog_categories (id, name, slug, color) VALUES ('cat-3', 'Épargne', 'epargne', '#10B981')", args: [] });
  await db.execute({ sql: "INSERT INTO blog_categories (id, name, slug, color) VALUES ('cat-4', 'IA', 'ia', '#F59E0B')", args: [] });
  await db.execute({ sql: "INSERT INTO blog_categories (id, name, slug, color) VALUES ('cat-5', 'Sécurité', 'securite', '#EF4444')", args: [] });

  // 5 articles: 3 published, 2 draft
  await db.execute({ sql: "INSERT INTO blog_posts (id, slug, title, excerpt, content, status, published_at, reading_time) VALUES ('pub-1', 'gerer-budget-couple', 'Comment gérer son budget en couple', 'Excerpt 1', 'Content 1', 'published', '2026-02-24T10:00:00.000Z', 5)", args: [] });
  await db.execute({ sql: "INSERT INTO blog_posts (id, slug, title, excerpt, content, status, published_at, reading_time) VALUES ('pub-2', 'partager-depenses', 'Partager ses dépenses', 'Excerpt 2', 'Content 2', 'published', '2026-02-17T10:00:00.000Z', 4)", args: [] });
  await db.execute({ sql: "INSERT INTO blog_posts (id, slug, title, excerpt, content, status, published_at, reading_time) VALUES ('pub-3', 'objectifs-epargne', '5 objectifs épargne', 'Excerpt 3', 'Content 3', 'published', '2026-02-10T10:00:00.000Z', 5)", args: [] });
  await db.execute({ sql: "INSERT INTO blog_posts (id, slug, title, excerpt, content, status, published_at) VALUES ('draft-1', 'brouillon-1', 'Brouillon 1', 'Draft excerpt', 'Draft content', 'draft', NULL)", args: [] });
  await db.execute({ sql: "INSERT INTO blog_posts (id, slug, title, excerpt, content, status, published_at) VALUES ('draft-2', 'brouillon-2', 'Brouillon 2', 'Draft excerpt 2', 'Draft content 2', 'draft', NULL)", args: [] });

  // Liaisons
  await db.execute({ sql: "INSERT INTO blog_post_categories (post_id, category_id) VALUES ('pub-1', 'cat-1')", args: [] });
  await db.execute({ sql: "INSERT INTO blog_post_categories (post_id, category_id) VALUES ('pub-1', 'cat-2')", args: [] });
  await db.execute({ sql: "INSERT INTO blog_post_categories (post_id, category_id) VALUES ('pub-2', 'cat-2')", args: [] });
  await db.execute({ sql: "INSERT INTO blog_post_categories (post_id, category_id) VALUES ('pub-3', 'cat-3')", args: [] });
  await db.execute({ sql: "INSERT INTO blog_post_categories (post_id, category_id) VALUES ('pub-3', 'cat-2')", args: [] });
}

// ── Tests ────────────────────────────────────────────────────────────────

describe("getPublishedPosts (TU-153-1, TU-153-2, TU-153-3, TU-153-4, TU-153-7)", () => {
  beforeEach(async () => {
    await setupDb();
    await seedFixture();
  });

  it("TU-153-1 — retourne uniquement les articles publiés", async () => {
    const posts = await getPublishedPosts(db);
    expect(posts).toHaveLength(3);
    expect(posts.every((p) => p.status === "published")).toBe(true);
  });

  it("TU-153-2 — filtre par categorySlug retourne uniquement les articles de cette catégorie", async () => {
    const posts = await getPublishedPosts(db, { categorySlug: "epargne" });
    expect(posts).toHaveLength(1);
    expect(posts[0].slug).toBe("objectifs-epargne");
  });

  it("TU-153-2b — filtre par categorySlug 'couple' retourne les 3 articles liés", async () => {
    const posts = await getPublishedPosts(db, { categorySlug: "couple" });
    expect(posts).toHaveLength(3);
  });

  it("TU-153-3 — retourne les articles triés par published_at DESC", async () => {
    const posts = await getPublishedPosts(db);
    expect(posts[0].slug).toBe("gerer-budget-couple");
    expect(posts[1].slug).toBe("partager-depenses");
    expect(posts[2].slug).toBe("objectifs-epargne");
  });

  it("TU-153-4 — joint les catégories via json_group_array", async () => {
    const posts = await getPublishedPosts(db);
    const pub1 = posts.find((p) => p.id === "pub-1");
    expect(pub1).toBeDefined();
    expect(pub1!.categories).toHaveLength(2);
    expect(pub1!.categories.map((c) => c.slug)).toEqual(
      expect.arrayContaining(["budget", "couple"])
    );
  });

  it("TU-153-7 — sans articles publiés retourne tableau vide", async () => {
    await db.execute({ sql: "UPDATE blog_posts SET status = 'draft'", args: [] });
    const posts = await getPublishedPosts(db);
    expect(posts).toHaveLength(0);
  });

  it("filtre par catégorie inexistante retourne tableau vide", async () => {
    const posts = await getPublishedPosts(db, { categorySlug: "nonexistent" });
    expect(posts).toHaveLength(0);
  });
});

describe("getPublishedPostBySlug", () => {
  beforeEach(async () => {
    await setupDb();
    await seedFixture();
  });

  it("retourne l'article publié avec ses catégories", async () => {
    const post = await getPublishedPostBySlug(db, "gerer-budget-couple");
    expect(post).not.toBeNull();
    expect(post!.title).toBe("Comment gérer son budget en couple");
    expect(post!.categories).toHaveLength(2);
  });

  it("retourne null pour un brouillon", async () => {
    const post = await getPublishedPostBySlug(db, "brouillon-1");
    expect(post).toBeNull();
  });

  it("retourne null pour un slug inexistant", async () => {
    const post = await getPublishedPostBySlug(db, "nonexistent");
    expect(post).toBeNull();
  });
});

describe("getAllCategories (TU-153-5)", () => {
  beforeEach(async () => {
    await setupDb();
    await seedFixture();
  });

  it("TU-153-5 — retourne toutes les catégories triées par nom", async () => {
    const cats = await getAllCategories(db);
    expect(cats).toHaveLength(5);
    expect(cats[0].name).toBe("Budget");
    expect(cats[1].name).toBe("Couple");
    expect(cats[4].name).toBe("Épargne");
  });

  it("retourne les bons champs", async () => {
    const cats = await getAllCategories(db);
    const budget = cats[0];
    expect(budget.id).toBe("cat-1");
    expect(budget.slug).toBe("budget");
    expect(budget.color).toBe("#4F46E5");
  });
});

describe("getPublishedSlugs (TU-153-6)", () => {
  beforeEach(async () => {
    await setupDb();
    await seedFixture();
  });

  it("TU-153-6 — retourne un tableau de strings (slugs publiés)", async () => {
    const slugs = await getPublishedSlugs(db);
    expect(slugs).toHaveLength(3);
    expect(slugs).toEqual([
      "gerer-budget-couple",
      "partager-depenses",
      "objectifs-epargne",
    ]);
  });

  it("exclut les brouillons", async () => {
    const slugs = await getPublishedSlugs(db);
    expect(slugs).not.toContain("brouillon-1");
    expect(slugs).not.toContain("brouillon-2");
  });
});
