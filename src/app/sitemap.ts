import type { MetadataRoute } from "next";
import { ensureSchema, getDb } from "@/lib/db";
import { getPublishedPosts } from "@/lib/queries/blog";

export const LOCALES = ["fr", "en", "es", "it", "de"] as const;

type ChangeFrequency = "weekly" | "monthly" | "yearly";

interface PathConfig {
  path: string;
  priority: number;
  changeFrequency: ChangeFrequency;
}

export const MARKETING_PATHS: PathConfig[] = [
  // Homepage
  { path: "", priority: 1.0, changeFrequency: "weekly" },
  // Features & pricing
  { path: "tarifs", priority: 0.9, changeFrequency: "monthly" },
  { path: "fonctionnalites", priority: 0.9, changeFrequency: "monthly" },
  // Trust pages
  { path: "securite", priority: 0.8, changeFrequency: "monthly" },
  { path: "a-propos", priority: 0.8, changeFrequency: "monthly" },
  // Auth pages
  { path: "connexion", priority: 0.5, changeFrequency: "monthly" },
  { path: "inscription", priority: 0.5, changeFrequency: "monthly" },
  // Legal pages
  { path: "cgu", priority: 0.3, changeFrequency: "yearly" },
  { path: "mentions-legales", priority: 0.3, changeFrequency: "yearly" },
  { path: "politique-confidentialite", priority: 0.3, changeFrequency: "yearly" },
  { path: "cookies", priority: 0.3, changeFrequency: "yearly" },
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://koupli.com";
  const lastModified = new Date();

  const entries: MetadataRoute.Sitemap = [];

  // Marketing pages × locales
  for (const locale of LOCALES) {
    for (const { path, priority, changeFrequency } of MARKETING_PATHS) {
      const url = path
        ? `${baseUrl}/${locale}/${path}`
        : `${baseUrl}/${locale}`;
      entries.push({ url, lastModified, changeFrequency, priority });
    }
  }

  // Blog URLs (fr uniquement — contenu en français)
  entries.push({
    url: `${baseUrl}/fr/blog`,
    lastModified,
    changeFrequency: "weekly",
    priority: 0.7,
  });

  await ensureSchema();
  const db = getDb();
  const posts = await getPublishedPosts(db);

  for (const post of posts) {
    entries.push({
      url: `${baseUrl}/fr/blog/${post.slug}`,
      lastModified: post.publishedAt ? new Date(post.publishedAt) : lastModified,
      changeFrequency: "monthly",
      priority: 0.6,
    });
  }

  return entries;
}
