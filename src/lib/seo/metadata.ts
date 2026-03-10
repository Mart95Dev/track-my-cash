import type { Metadata } from "next";
import { SEO_CONFIG } from "./constants";

export function buildPageMetadata(options: {
  title: string;
  description: string;
  path: string;
  locale: string;
  ogImage?: string;
}): Metadata {
  const { title, description, path, locale, ogImage } = options;
  const { baseUrl, siteName, locales, defaultOgImage } = SEO_CONFIG;
  const url = path
    ? `${baseUrl}/${locale}/${path}`
    : `${baseUrl}/${locale}`;
  const image = ogImage ?? defaultOgImage;

  return {
    title,
    description,
    alternates: {
      canonical: url,
      languages: Object.fromEntries(
        locales.map((loc) => [
          loc,
          path ? `${baseUrl}/${loc}/${path}` : `${baseUrl}/${loc}`,
        ])
      ),
    },
    openGraph: {
      title,
      description,
      url,
      type: "website",
      siteName,
      images: [
        { url: `${baseUrl}${image}`, width: 1200, height: 630, alt: title },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [`${baseUrl}${image}`],
    },
  };
}
