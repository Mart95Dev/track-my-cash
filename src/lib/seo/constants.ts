export const SEO_CONFIG = {
  siteName: "Koupli",
  baseUrl: process.env.NEXT_PUBLIC_APP_URL ?? "https://koupli.com",
  defaultOgImage: "/og/home.png",
  locales: ["fr", "en", "es", "it", "de"] as const,
  defaultLocale: "fr" as const,
  twitterHandle: undefined as string | undefined,
} as const;
