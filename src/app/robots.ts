import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://trackmycash.com";

  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/"],
        disallow: [
          "/*/dashboard",
          "/*/comptes",
          "/*/transactions",
          "/*/recurrents",
          "/*/previsions",
          "/*/conseiller",
          "/*/parametres",
          "/api/",
        ],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
