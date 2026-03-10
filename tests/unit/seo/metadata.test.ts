import { describe, it, expect } from "vitest";
import { buildPageMetadata } from "../../../src/lib/seo/metadata";

describe("SEO buildPageMetadata", () => {
  const meta = buildPageMetadata({
    title: "Tarifs",
    description: "Nos offres",
    path: "tarifs",
    locale: "fr",
  });

  it('TU-9: canonical correct pour path "tarifs", locale "fr"', () => {
    expect(meta.alternates?.canonical).toBe(
      "https://trackmycash.com/fr/tarifs"
    );
  });

  it("TU-10: alternates a 5 locales (fr, en, es, it, de)", () => {
    const langs = meta.alternates?.languages as Record<string, string>;
    expect(Object.keys(langs)).toHaveLength(5);
    expect(langs.fr).toBe("https://trackmycash.com/fr/tarifs");
    expect(langs.en).toBe("https://trackmycash.com/en/tarifs");
    expect(langs.es).toBe("https://trackmycash.com/es/tarifs");
    expect(langs.it).toBe("https://trackmycash.com/it/tarifs");
    expect(langs.de).toBe("https://trackmycash.com/de/tarifs");
  });

  it("TU-11: OG complet (siteName, images, url)", () => {
    const og = meta.openGraph;
    expect(og).toBeDefined();
    if (og) {
      expect("siteName" in og ? og.siteName : undefined).toBe("TrackMyCash");
      expect("images" in og ? og.images : undefined).toBeDefined();
      expect("url" in og ? og.url : undefined).toBe(
        "https://trackmycash.com/fr/tarifs"
      );
    }
  });

  it("TU-12: twitter card summary_large_image", () => {
    expect(meta.twitter).toBeDefined();
    if (meta.twitter) {
      expect("card" in meta.twitter ? meta.twitter.card : undefined).toBe(
        "summary_large_image"
      );
    }
  });
});
