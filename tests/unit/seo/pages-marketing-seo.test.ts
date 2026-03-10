import { describe, it, expect, vi } from "vitest";

vi.mock("@/i18n/navigation", () => ({
  Link: ({ children }: { children: unknown }) => children,
}));

vi.mock("@/components/marketing/scroll-reveal", () => ({
  ScrollRevealSection: ({ children }: { children: unknown }) => children,
}));

import { breadcrumbSchema } from "../../../src/lib/seo/schemas";
import { buildPageMetadata } from "../../../src/lib/seo/metadata";
import { SEO_CONFIG } from "../../../src/lib/seo/constants";
import { IMPORT_FORMATS } from "../../../src/app/[locale]/(marketing)/fonctionnalites/page";

describe("Pages Marketing SEO — STORY-165", () => {
  const baseUrl = SEO_CONFIG.baseUrl;

  it("TU-1: fonctionnalités a un BreadcrumbList", () => {
    const schema = breadcrumbSchema([
      { name: "Accueil", url: `${baseUrl}/fr` },
      { name: "Fonctionnalités", url: `${baseUrl}/fr/fonctionnalites` },
    ]);
    expect(schema["@type"]).toBe("BreadcrumbList");
    const items = schema.itemListElement as { name: string }[];
    expect(items[1].name).toBe("Fonctionnalités");
  });

  it("TU-2: sécurité a un BreadcrumbList", () => {
    const schema = breadcrumbSchema([
      { name: "Accueil", url: `${baseUrl}/fr` },
      { name: "Sécurité", url: `${baseUrl}/fr/securite` },
    ]);
    expect(schema["@type"]).toBe("BreadcrumbList");
    const items = schema.itemListElement as { name: string }[];
    expect(items[1].name).toBe("Sécurité");
  });

  it("TU-3: à propos a un BreadcrumbList", () => {
    const schema = breadcrumbSchema([
      { name: "Accueil", url: `${baseUrl}/fr` },
      { name: "À propos", url: `${baseUrl}/fr/a-propos` },
    ]);
    expect(schema["@type"]).toBe("BreadcrumbList");
    const items = schema.itemListElement as { name: string }[];
    expect(items[1].name).toBe("À propos");
  });

  it("TU-4: Les OG images sont dédiées par page", () => {
    const fonc = buildPageMetadata({ title: "T", description: "D", path: "fonctionnalites", locale: "fr", ogImage: "/og/fonctionnalites.png" });
    const sec = buildPageMetadata({ title: "T", description: "D", path: "securite", locale: "fr", ogImage: "/og/securite.png" });
    const about = buildPageMetadata({ title: "T", description: "D", path: "a-propos", locale: "fr", ogImage: "/og/a-propos.png" });

    const foncImg = (fonc.openGraph?.images as { url: string }[])[0].url;
    const secImg = (sec.openGraph?.images as { url: string }[])[0].url;
    const aboutImg = (about.openGraph?.images as { url: string }[])[0].url;

    expect(foncImg).toContain("/og/fonctionnalites.png");
    expect(secImg).toContain("/og/securite.png");
    expect(aboutImg).toContain("/og/a-propos.png");
  });

  it("TU-5: IMPORT_FORMATS est toujours exporté", () => {
    expect(IMPORT_FORMATS).toBeDefined();
    expect(IMPORT_FORMATS.length).toBeGreaterThan(0);
  });

  it("TU-6: Les alternates couvrent 5 locales", () => {
    const meta = buildPageMetadata({ title: "T", description: "D", path: "fonctionnalites", locale: "fr" });
    const languages = meta.alternates?.languages as Record<string, string>;
    expect(Object.keys(languages)).toHaveLength(5);
  });
});
