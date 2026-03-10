import type { Client } from "@libsql/client";

// ── Types ────────────────────────────────────────────────────────────────

export type BlogPost = {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  coverImageUrl: string | null;
  readingTime: number;
  status: "draft" | "published";
  publishedAt: string | null;
  authorName: string;
  metaTitle: string | null;
  metaDescription: string | null;
  createdAt: string;
  updatedAt: string;
  categories: BlogCategory[];
};

export type BlogCategory = {
  id: string;
  name: string;
  slug: string;
  color: string;
};

// ── Helpers ──────────────────────────────────────────────────────────────

function toStr(val: unknown): string {
  return val != null ? String(val) : "";
}

function toNullStr(val: unknown): string | null {
  return val != null ? String(val) : null;
}

// ── Queries ──────────────────────────────────────────────────────────────

export async function getPublishedPosts(
  db: Client,
  options: { categorySlug?: string } = {}
): Promise<BlogPost[]> {
  const conditions: string[] = ["bp.status = 'published'"];
  const args: string[] = [];

  if (options.categorySlug) {
    conditions.push(
      "bp.id IN (SELECT bpc.post_id FROM blog_post_categories bpc JOIN blog_categories bc ON bpc.category_id = bc.id WHERE bc.slug = ?)"
    );
    args.push(options.categorySlug);
  }

  const where = `WHERE ${conditions.join(" AND ")}`;

  const result = await db.execute({
    sql: `
      SELECT bp.*,
        json_group_array(
          CASE WHEN bc.id IS NOT NULL
            THEN json_object('id', bc.id, 'name', bc.name, 'slug', bc.slug, 'color', bc.color)
            ELSE NULL
          END
        ) FILTER (WHERE bc.id IS NOT NULL) AS categories_json
      FROM blog_posts bp
      LEFT JOIN blog_post_categories bpc ON bp.id = bpc.post_id
      LEFT JOIN blog_categories bc ON bpc.category_id = bc.id
      ${where}
      GROUP BY bp.id
      ORDER BY bp.published_at DESC
    `,
    args,
  });

  return result.rows.map(mapRowToPost);
}

export async function getPublishedPostBySlug(
  db: Client,
  slug: string
): Promise<BlogPost | null> {
  const result = await db.execute({
    sql: `
      SELECT bp.*,
        json_group_array(
          CASE WHEN bc.id IS NOT NULL
            THEN json_object('id', bc.id, 'name', bc.name, 'slug', bc.slug, 'color', bc.color)
            ELSE NULL
          END
        ) FILTER (WHERE bc.id IS NOT NULL) AS categories_json
      FROM blog_posts bp
      LEFT JOIN blog_post_categories bpc ON bp.id = bpc.post_id
      LEFT JOIN blog_categories bc ON bpc.category_id = bc.id
      WHERE bp.slug = ? AND bp.status = 'published'
      GROUP BY bp.id
    `,
    args: [slug],
  });

  if (result.rows.length === 0) return null;
  return mapRowToPost(result.rows[0]);
}

export async function getAllCategories(db: Client): Promise<BlogCategory[]> {
  const result = await db.execute(
    "SELECT id, name, slug, color FROM blog_categories ORDER BY name"
  );
  return result.rows.map((row) => ({
    id: toStr(row.id),
    name: toStr(row.name),
    slug: toStr(row.slug),
    color: toStr(row.color),
  }));
}

export async function getPublishedSlugs(db: Client): Promise<string[]> {
  const result = await db.execute(
    "SELECT slug FROM blog_posts WHERE status = 'published' ORDER BY published_at DESC"
  );
  return result.rows.map((row) => toStr(row.slug));
}

// ── Row mapper ───────────────────────────────────────────────────────────

function mapRowToPost(row: Record<string, unknown>): BlogPost {
  let categories: BlogCategory[] = [];
  const catJson = row.categories_json;
  if (catJson && typeof catJson === "string") {
    try {
      const parsed = JSON.parse(catJson);
      if (Array.isArray(parsed)) {
        categories = parsed
          .filter((c: unknown): c is Record<string, unknown> => c != null)
          .map((c) => ({
            id: String(c.id),
            name: String(c.name),
            slug: String(c.slug),
            color: String(c.color),
          }));
      }
    } catch {
      // invalid json
    }
  }

  return {
    id: toStr(row.id),
    slug: toStr(row.slug),
    title: toStr(row.title),
    excerpt: toStr(row.excerpt),
    content: toStr(row.content),
    coverImageUrl: toNullStr(row.cover_image_url),
    readingTime: Number(row.reading_time ?? 5),
    status: toStr(row.status) as "draft" | "published",
    publishedAt: toNullStr(row.published_at),
    authorName: toStr(row.author_name),
    metaTitle: toNullStr(row.meta_title),
    metaDescription: toNullStr(row.meta_description),
    createdAt: toStr(row.created_at),
    updatedAt: toStr(row.updated_at),
    categories,
  };
}
