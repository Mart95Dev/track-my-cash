import type { MetadataRoute } from "next";
import { getDb } from "@/lib/db";
import { getPublishedPosts } from "@/lib/queries/blog";

const LOCALES = ["fr", "en", "es", "it", "de"] as const;
const PUBLIC_PATHS = ["", "tarifs", "connexion", "inscription"] as const;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://trackmycash.com";
  const lastModified = new Date();

  const entries: MetadataRoute.Sitemap = [];

  for (const locale of LOCALES) {
    for (const path of PUBLIC_PATHS) {
      const url = path
        ? `${baseUrl}/${locale}/${path}`
        : `${baseUrl}/${locale}`;
      entries.push({
        url,
        lastModified,
        changeFrequency: path === "" ? "weekly" : "monthly",
        priority: path === "" ? 1.0 : 0.8,
      });
    }
  }

  // Blog URLs (fr uniquement — contenu en français)
  entries.push({
    url: `${baseUrl}/fr/blog`,
    lastModified,
    changeFrequency: "weekly",
    priority: 0.7,
  });

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
