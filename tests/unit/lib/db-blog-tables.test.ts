import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { createClient, type Client } from "@libsql/client";
import {
  ensureBlogTables,
  seedBlogData,
  SEED_CATEGORIES,
  SEED_POSTS,
} from "@/lib/blog-db";

describe("Blog DB Tables (STORY-150)", () => {
  let client: Client;

  beforeEach(async () => {
    client = createClient({ url: "file::memory:" });
    await client.execute("PRAGMA foreign_keys = ON");
    await ensureBlogTables(client);
  });

  afterEach(() => {
    client.close();
  });

  // TU-150-1 : Les 4 tables existent après ensureBlogTables
  it("TU-150-1 — crée les 4 tables blog + newsletter", async () => {
    const tables = await client.execute(
      "SELECT name FROM sqlite_master WHERE type='table' AND name IN ('blog_posts', 'blog_categories', 'blog_post_categories', 'newsletter_subscribers') ORDER BY name"
    );

    const tableNames = tables.rows.map((t) => String(t.name));
    expect(tableNames).toContain("blog_posts");
    expect(tableNames).toContain("blog_categories");
    expect(tableNames).toContain("blog_post_categories");
    expect(tableNames).toContain("newsletter_subscribers");
  });

  // TU-150-1b : Les index existent
  it("TU-150-1b — crée les index sur slug, status, published_at, email", async () => {
    const indexes = await client.execute(
      "SELECT name FROM sqlite_master WHERE type='index' AND (name LIKE 'idx_blog%' OR name LIKE 'idx_newsletter%') ORDER BY name"
    );

    const indexNames = indexes.rows.map((i) => String(i.name));
    expect(indexNames).toContain("idx_blog_posts_slug");
    expect(indexNames).toContain("idx_blog_posts_status");
    expect(indexNames).toContain("idx_blog_posts_published_at");
    expect(indexNames).toContain("idx_newsletter_email");
    expect(indexNames).toContain("idx_newsletter_status");
  });

  // TU-150-2 : INSERT doublon slug → erreur UNIQUE
  it("TU-150-2 — refuse l'insertion d'un article avec slug doublon", async () => {
    await client.execute({
      sql: `INSERT INTO blog_posts (id, slug, title, content, excerpt)
            VALUES ('post-1', 'test-slug', 'Article 1', 'Contenu', 'Extrait')`,
      args: [],
    });

    await expect(
      client.execute({
        sql: `INSERT INTO blog_posts (id, slug, title, content, excerpt)
              VALUES ('post-2', 'test-slug', 'Article 2', 'Contenu 2', 'Extrait 2')`,
        args: [],
      })
    ).rejects.toThrow();
  });

  // TU-150-3 : INSERT doublon email newsletter → erreur UNIQUE
  it("TU-150-3 — refuse l'insertion d'un email newsletter doublon", async () => {
    await client.execute({
      sql: `INSERT INTO newsletter_subscribers (id, email) VALUES ('sub-1', 'test@example.com')`,
      args: [],
    });

    await expect(
      client.execute({
        sql: `INSERT INTO newsletter_subscribers (id, email) VALUES ('sub-2', 'test@example.com')`,
        args: [],
      })
    ).rejects.toThrow();
  });

  // TU-150-4 : DELETE blog_post → CASCADE supprime blog_post_categories
  it("TU-150-4 — ON DELETE CASCADE supprime les liaisons catégories", async () => {
    await client.execute({
      sql: `INSERT INTO blog_posts (id, slug, title, content, excerpt) VALUES ('post-1', 'test', 'Test', 'Content', 'Excerpt')`,
      args: [],
    });
    await client.execute({
      sql: `INSERT INTO blog_categories (id, name, slug) VALUES ('cat-1', 'Test Cat', 'test-cat')`,
      args: [],
    });
    await client.execute({
      sql: `INSERT INTO blog_post_categories (post_id, category_id) VALUES ('post-1', 'cat-1')`,
      args: [],
    });

    // Verify link exists
    const before = await client.execute({
      sql: "SELECT COUNT(*) as count FROM blog_post_categories WHERE post_id = 'post-1'",
      args: [],
    });
    expect(Number(before.rows[0].count)).toBe(1);

    // Delete post
    await client.execute({
      sql: "DELETE FROM blog_posts WHERE id = 'post-1'",
      args: [],
    });

    // Verify link is cascaded
    const after = await client.execute({
      sql: "SELECT COUNT(*) as count FROM blog_post_categories WHERE post_id = 'post-1'",
      args: [],
    });
    expect(Number(after.rows[0].count)).toBe(0);

    // Category still exists
    const catCount = await client.execute({
      sql: "SELECT COUNT(*) as count FROM blog_categories WHERE id = 'cat-1'",
      args: [],
    });
    expect(Number(catCount.rows[0].count)).toBe(1);
  });
});

describe("Blog DB Edge Cases (STORY-150 — QA)", () => {
  let client: Client;

  beforeEach(async () => {
    client = createClient({ url: "file::memory:" });
    await client.execute("PRAGMA foreign_keys = ON");
    await ensureBlogTables(client);
  });

  afterEach(() => {
    client.close();
  });

  // QA-150-1 : ensureBlogTables est idempotent (2x sans erreur)
  it("QA-150-1 — ensureBlogTables peut être appelé 2 fois sans erreur", async () => {
    await expect(ensureBlogTables(client)).resolves.not.toThrow();
  });

  // QA-150-2 : CHECK constraint sur blog_posts.status
  it("QA-150-2 — refuse un status invalide sur blog_posts", async () => {
    await expect(
      client.execute({
        sql: `INSERT INTO blog_posts (id, slug, title, content, excerpt, status)
              VALUES ('p1', 'test', 'Test', 'c', 'e', 'archived')`,
        args: [],
      })
    ).rejects.toThrow();
  });

  // QA-150-3 : CHECK constraint sur newsletter_subscribers.status
  it("QA-150-3 — refuse un status invalide sur newsletter_subscribers", async () => {
    await expect(
      client.execute({
        sql: `INSERT INTO newsletter_subscribers (id, email, status) VALUES ('s1', 'a@b.com', 'deleted')`,
        args: [],
      })
    ).rejects.toThrow();
  });

  // QA-150-4 : CASCADE côté catégorie (delete category → supprime liaison)
  it("QA-150-4 — ON DELETE CASCADE côté catégorie supprime les liaisons", async () => {
    await client.execute({
      sql: `INSERT INTO blog_posts (id, slug, title, content, excerpt) VALUES ('p1', 'test', 'T', 'C', 'E')`,
      args: [],
    });
    await client.execute({
      sql: `INSERT INTO blog_categories (id, name, slug) VALUES ('c1', 'Cat', 'cat')`,
      args: [],
    });
    await client.execute({
      sql: `INSERT INTO blog_post_categories (post_id, category_id) VALUES ('p1', 'c1')`,
      args: [],
    });

    await client.execute({ sql: "DELETE FROM blog_categories WHERE id = 'c1'", args: [] });

    const links = await client.execute({
      sql: "SELECT COUNT(*) as count FROM blog_post_categories",
      args: [],
    });
    expect(Number(links.rows[0].count)).toBe(0);

    // Post still exists
    const posts = await client.execute({
      sql: "SELECT COUNT(*) as count FROM blog_posts WHERE id = 'p1'",
      args: [],
    });
    expect(Number(posts.rows[0].count)).toBe(1);
  });

  // QA-150-5 : Valeurs par défaut (status=draft, reading_time=5, author=TrackMyCash)
  it("QA-150-5 — valeurs par défaut correctes pour blog_posts", async () => {
    await client.execute({
      sql: `INSERT INTO blog_posts (id, slug, title, content, excerpt) VALUES ('p1', 'defaults', 'Test', 'Content', 'Excerpt')`,
      args: [],
    });

    const row = await client.execute({
      sql: "SELECT status, reading_time, author_name FROM blog_posts WHERE id = 'p1'",
      args: [],
    });
    expect(String(row.rows[0].status)).toBe("draft");
    expect(Number(row.rows[0].reading_time)).toBe(5);
    expect(String(row.rows[0].author_name)).toBe("TrackMyCash");
  });

  // QA-150-6 : UNIQUE sur blog_categories.name et blog_categories.slug
  it("QA-150-6 — refuse les doublons de nom et slug dans blog_categories", async () => {
    await client.execute({
      sql: `INSERT INTO blog_categories (id, name, slug) VALUES ('c1', 'Budget', 'budget')`,
      args: [],
    });

    await expect(
      client.execute({
        sql: `INSERT INTO blog_categories (id, name, slug) VALUES ('c2', 'Budget', 'budget2')`,
        args: [],
      })
    ).rejects.toThrow();

    await expect(
      client.execute({
        sql: `INSERT INTO blog_categories (id, name, slug) VALUES ('c3', 'Budget2', 'budget')`,
        args: [],
      })
    ).rejects.toThrow();
  });

  // QA-150-7 : newsletter valeurs par défaut (status=active, subscribed_at auto)
  it("QA-150-7 — valeurs par défaut correctes pour newsletter_subscribers", async () => {
    await client.execute({
      sql: `INSERT INTO newsletter_subscribers (id, email) VALUES ('s1', 'test@example.com')`,
      args: [],
    });

    const row = await client.execute({
      sql: "SELECT status, subscribed_at, unsubscribed_at FROM newsletter_subscribers WHERE id = 's1'",
      args: [],
    });
    expect(String(row.rows[0].status)).toBe("active");
    expect(row.rows[0].subscribed_at).not.toBeNull();
    expect(row.rows[0].unsubscribed_at).toBeNull();
  });
});

describe("Blog Seed Data (STORY-150)", () => {
  let client: Client;

  beforeEach(async () => {
    client = createClient({ url: "file::memory:" });
    await client.execute("PRAGMA foreign_keys = ON");
    await ensureBlogTables(client);
  });

  afterEach(() => {
    client.close();
  });

  // TU-150-5 : Seed insère 5 catégories et 3 articles
  it("TU-150-5 — seed insère 5 catégories et 3 articles publiés avec liaisons", async () => {
    await seedBlogData(client);

    // Check categories
    const categories = await client.execute({
      sql: "SELECT name, slug, color FROM blog_categories ORDER BY name",
      args: [],
    });
    expect(categories.rows).toHaveLength(SEED_CATEGORIES.length);
    expect(categories.rows.map((r) => String(r.name))).toEqual(
      expect.arrayContaining(["Budget", "Couple", "Épargne", "IA", "Sécurité"])
    );

    // Check posts
    const posts = await client.execute({
      sql: "SELECT slug, title, status, published_at FROM blog_posts ORDER BY published_at DESC",
      args: [],
    });
    expect(posts.rows).toHaveLength(SEED_POSTS.length);
    expect(posts.rows.every((r) => String(r.status) === "published")).toBe(true);
    expect(posts.rows.every((r) => r.published_at !== null)).toBe(true);

    // Check post-category links
    const links = await client.execute({
      sql: "SELECT COUNT(*) as count FROM blog_post_categories",
      args: [],
    });
    // gerer-budget-couple: 2 cats, partager-depenses: 1 cat, objectifs-epargne: 2 cats = 5
    expect(Number(links.rows[0].count)).toBe(5);
  });

  // TU-150-5b : Seed est idempotent
  it("TU-150-5b — seed est idempotent (pas de doublon à la 2e exécution)", async () => {
    await seedBlogData(client);
    await seedBlogData(client); // 2e exécution

    const categories = await client.execute({
      sql: "SELECT COUNT(*) as count FROM blog_categories",
      args: [],
    });
    expect(Number(categories.rows[0].count)).toBe(5);

    const posts = await client.execute({
      sql: "SELECT COUNT(*) as count FROM blog_posts",
      args: [],
    });
    expect(Number(posts.rows[0].count)).toBe(3);
  });

  // TU-150-5c : Les catégories ont les bonnes couleurs
  it("TU-150-5c — les catégories seed ont les couleurs correctes", async () => {
    await seedBlogData(client);

    for (const cat of SEED_CATEGORIES) {
      const result = await client.execute({
        sql: "SELECT color FROM blog_categories WHERE slug = ?",
        args: [cat.slug],
      });
      expect(result.rows).toHaveLength(1);
      expect(String(result.rows[0].color)).toBe(cat.color);
    }
  });

  // TU-150-5d : Les articles ont les bons reading_time
  it("TU-150-5d — les articles seed ont le bon temps de lecture", async () => {
    await seedBlogData(client);

    for (const post of SEED_POSTS) {
      const result = await client.execute({
        sql: "SELECT reading_time FROM blog_posts WHERE slug = ?",
        args: [post.slug],
      });
      expect(result.rows).toHaveLength(1);
      expect(Number(result.rows[0].reading_time)).toBe(post.readingTime);
    }
  });
});
