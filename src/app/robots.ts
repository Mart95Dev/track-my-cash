import type { MetadataRoute } from "next";

const APP_DISALLOW = [
  "/*/dashboard",
  "/*/comptes",
  "/*/transactions",
  "/*/recurrents",
  "/*/previsions",
  "/*/conseiller",
  "/*/parametres",
  "/api/",
];

const ALLOWED_AI_BOTS = [
  "GPTBot",
  "ChatGPT-User",
  "PerplexityBot",
  "ClaudeBot",
  "anthropic-ai",
  "Google-Extended",
];

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://trackmycash.com";

  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/"],
        disallow: APP_DISALLOW,
      },
      ...ALLOWED_AI_BOTS.map((bot) => ({
        userAgent: bot,
        allow: ["/"],
        disallow: APP_DISALLOW,
      })),
      {
        userAgent: "Bytespider",
        disallow: ["/"],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
