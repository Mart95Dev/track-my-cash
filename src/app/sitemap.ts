import type { MetadataRoute } from "next";
import { BLOG_POSTS } from "@/data/blog-posts";

const LOCALES = ["fr", "en", "es", "it", "de"] as const;
const PUBLIC_PATHS = ["", "tarifs", "connexion", "inscription"] as const;

export default function sitemap(): MetadataRoute.Sitemap {
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

  // AC-5 STORY-098 : URLs blog (fr uniquement — contenu en français)
  entries.push({
    url: `${baseUrl}/fr/blog`,
    lastModified,
    changeFrequency: "weekly",
    priority: 0.7,
  });

  for (const post of BLOG_POSTS) {
    entries.push({
      url: `${baseUrl}/fr/blog/${post.slug}`,
      lastModified: new Date(post.date),
      changeFrequency: "monthly",
      priority: 0.6,
    });
  }

  return entries;
}
