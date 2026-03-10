import { describe, it, expect, vi } from "vitest";

// Mock dependencies that are imported by the page module
vi.mock("@/i18n/navigation", () => ({
  Link: vi.fn(),
}));

vi.mock("@/components/subscribe-button", () => ({
  SubscribeButton: vi.fn(),
}));

vi.mock("@/lib/auth-utils", () => ({
  getSession: vi.fn().mockResolvedValue(null),
}));

vi.mock("@/lib/subscription-utils", () => ({
  getUserPlanId: vi.fn().mockResolvedValue("free"),
}));

vi.mock("@/components/pricing-toggle", () => ({
  PricingToggle: vi.fn(),
}));

vi.mock("@/components/marketing/scroll-reveal", () => ({
  ScrollRevealSection: vi.fn(),
}));

vi.mock("@/app/[locale]/(marketing)/tarifs/faq-accordion", () => ({
  FaqAccordion: vi.fn(),
}));

import {
  FAQ_ITEMS,
  COMPARISON_FEATURES,
} from "@/app/[locale]/(marketing)/tarifs/page";
import { faqPageSchema, breadcrumbSchema } from "@/lib/seo/schemas";
import { SEO_CONFIG } from "@/lib/seo/constants";

describe("Tarifs SEO — JSON-LD & metadata", () => {
  it("TU-1: faqPageSchema(FAQ_ITEMS) has 4 mainEntity", () => {
    const schema = faqPageSchema(FAQ_ITEMS);
    const mainEntity = schema.mainEntity as Record<string, unknown>[];
    expect(mainEntity).toHaveLength(4);
  });

  it("TU-2: FAQ questions match FAQ_ITEMS", () => {
    const schema = faqPageSchema(FAQ_ITEMS);
    const mainEntity = schema.mainEntity as { name: string }[];
    FAQ_ITEMS.forEach((item, i) => {
      expect(mainEntity[i].name).toBe(item.question);
    });
  });

  it("TU-3: breadcrumbSchema has 2 items", () => {
    const baseUrl = SEO_CONFIG.baseUrl;
    const schema = breadcrumbSchema([
      { name: "Accueil", url: `${baseUrl}/fr` },
      { name: "Tarifs", url: `${baseUrl}/fr/tarifs` },
    ]);
    const items = schema.itemListElement as Record<string, unknown>[];
    expect(items).toHaveLength(2);
  });

  it("TU-4: Breadcrumb starts with Accueil", () => {
    const baseUrl = SEO_CONFIG.baseUrl;
    const schema = breadcrumbSchema([
      { name: "Accueil", url: `${baseUrl}/fr` },
      { name: "Tarifs", url: `${baseUrl}/fr/tarifs` },
    ]);
    const items = schema.itemListElement as { name: string }[];
    expect(items[0].name).toBe("Accueil");
  });

  it("TU-5: COMPARISON_FEATURES is exported and accessible", () => {
    expect(COMPARISON_FEATURES).toBeDefined();
    expect(Array.isArray(COMPARISON_FEATURES)).toBe(true);
    expect(COMPARISON_FEATURES.length).toBeGreaterThan(0);
  });
});
