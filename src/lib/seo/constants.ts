export const SEO_CONFIG = {
  siteName: "TrackMyCash",
  baseUrl: process.env.NEXT_PUBLIC_APP_URL ?? "https://trackmycash.com",
  defaultOgImage: "/og/home.png",
  locales: ["fr", "en", "es", "it", "de"] as const,
  defaultLocale: "fr" as const,
  twitterHandle: undefined as string | undefined,
} as const;
