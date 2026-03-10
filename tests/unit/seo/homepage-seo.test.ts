import { describe, it, expect } from "vitest";
import {
  HOME_FAQ_ITEMS,
  DESCRIPTIONS,
} from "../../../src/app/[locale]/(marketing)/homepage-data";
import {
  webSiteSchema,
  softwareApplicationSchema,
  faqPageSchema,
} from "../../../src/lib/seo/schemas";
import { buildPageMetadata } from "../../../src/lib/seo/metadata";

describe("Homepage SEO — STORY-163", () => {
  it("TU-1: HOME_FAQ_ITEMS contient 7 questions", () => {
    expect(HOME_FAQ_ITEMS).toHaveLength(7);
  });

  it("TU-2: Chaque FAQ item a question et answer non vides", () => {
    for (const item of HOME_FAQ_ITEMS) {
      expect(item.question.length).toBeGreaterThan(0);
      expect(item.answer.length).toBeGreaterThan(0);
    }
  });

  it("TU-3: webSiteSchema a SearchAction", () => {
    const schema = webSiteSchema();
    const action = schema.potentialAction as Record<string, unknown>;
    expect(action["@type"]).toBe("SearchAction");
  });

  it("TU-4: softwareApplicationSchema a 3 offers", () => {
    const schema = softwareApplicationSchema();
    const offers = schema.offers as Record<string, unknown>[];
    expect(offers).toHaveLength(3);
  });

  it("TU-5: softwareApplicationSchema a aggregateRating 4.8", () => {
    const schema = softwareApplicationSchema();
    const rating = schema.aggregateRating as Record<string, unknown>;
    expect(rating.ratingValue).toBe("4.8");
  });

  it("TU-6: faqPageSchema(HOME_FAQ_ITEMS) a 7 mainEntity", () => {
    const schema = faqPageSchema(HOME_FAQ_ITEMS);
    const mainEntity = schema.mainEntity as Record<string, unknown>[];
    expect(mainEntity).toHaveLength(7);
  });

  it("TU-7: FAQ questions correspondent au schema", () => {
    const schema = faqPageSchema(HOME_FAQ_ITEMS);
    const mainEntity = schema.mainEntity as Record<string, unknown>[];
    for (let i = 0; i < HOME_FAQ_ITEMS.length; i++) {
      expect(mainEntity[i].name).toBe(HOME_FAQ_ITEMS[i].question);
    }
  });

  it("TU-8: DESCRIPTIONS multi-lang preservees (fr, en, es, it, de)", () => {
    const expected = ["fr", "en", "es", "it", "de"];
    for (const locale of expected) {
      expect(DESCRIPTIONS[locale]).toBeDefined();
      expect(DESCRIPTIONS[locale].length).toBeGreaterThan(0);
    }
  });

  it("TU-9: buildPageMetadata retourne alternates avec 5 locales", () => {
    const meta = buildPageMetadata({
      title: "Test",
      description: "Desc",
      path: "",
      locale: "fr",
      ogImage: "/og/home.png",
    });
    const languages = meta.alternates?.languages as Record<string, string>;
    expect(Object.keys(languages)).toHaveLength(5);
    expect(languages).toHaveProperty("fr");
    expect(languages).toHaveProperty("en");
    expect(languages).toHaveProperty("es");
    expect(languages).toHaveProperty("it");
    expect(languages).toHaveProperty("de");
  });

  it("TU-10: buildPageMetadata retourne OG image avec /og/home.png", () => {
    const meta = buildPageMetadata({
      title: "Test",
      description: "Desc",
      path: "",
      locale: "fr",
      ogImage: "/og/home.png",
    });
    const images = meta.openGraph?.images as { url: string }[];
    expect(images[0].url).toContain("/og/home.png");
  });
});
