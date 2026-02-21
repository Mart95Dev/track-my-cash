import type { MetadataRoute } from "next";

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

  return entries;
}
