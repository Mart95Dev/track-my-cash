/**
 * Tests enrichissements blog article template
 * - injectHeadingIds
 * - getRelatedPosts / getAdjacentPosts queries
 * - articleSchema enrichi (author, speakable, keywords)
 * - blog-sanitize (div, callout classes, heading ids)
 */
import { describe, it, expect } from "vitest";
import { injectHeadingIds } from "@/lib/blog-html-utils";
import { articleSchema } from "@/lib/seo/schemas";

// ── injectHeadingIds ──────────────────────────────────────────────────

describe("injectHeadingIds", () => {
  it("injecte un id slug dans les h2", () => {
    const html = "<h2>Pourquoi gérer son budget ?</h2>";
    const result = injectHeadingIds(html);
    expect(result).toContain('id="pourquoi-gerer-son-budget"');
  });

  it("injecte un id slug dans les h3", () => {
    const html = "<h3>Étape 1 : créer un compte</h3>";
    const result = injectHeadingIds(html);
    expect(result).toContain('id="etape-1-creer-un-compte"');
  });

  it("ne touche pas un heading avec id existant", () => {
    const html = '<h2 id="custom-id">Titre</h2>';
    const result = injectHeadingIds(html);
    expect(result).toContain('id="custom-id"');
    expect(result).not.toContain('id="titre"');
  });

  it("gère plusieurs headings dans le même HTML", () => {
    const html = "<h2>Premier</h2><p>texte</p><h3>Second</h3>";
    const result = injectHeadingIds(html);
    expect(result).toContain('id="premier"');
    expect(result).toContain('id="second"');
  });

  it("ne modifie pas les h1 ni les h4", () => {
    const html = "<h1>Grand titre</h1><h4>Petit titre</h4>";
    const result = injectHeadingIds(html);
    expect(result).not.toContain("id=");
  });

  it("retourne une string vide pour une entrée vide", () => {
    expect(injectHeadingIds("")).toBe("");
  });
});

// ── articleSchema enrichi ─────────────────────────────────────────────

describe("articleSchema enrichi", () => {
  const basePost = {
    title: "Gérer son budget en couple",
    excerpt: "Guide complet.",
    slug: "gerer-budget-couple",
    publishedAt: "2026-02-24T10:00:00.000Z",
    updatedAt: "2026-02-25T10:00:00.000Z",
    categories: [{ name: "Budget" }, { name: "Couple" }],
  };

  it("inclut author en tant que Person avec name et url", () => {
    const schema = articleSchema(
      { ...basePost, authorName: "Martial" },
      "https://koupli.com"
    );
    const author = schema.author as Record<string, unknown>;
    expect(author["@type"]).toBe("Person");
    expect(author.name).toBe("Martial");
    expect(author.url).toBe("https://koupli.com/fr/a-propos");
  });

  it("utilise Koupli comme author par défaut", () => {
    const schema = articleSchema(basePost, "https://koupli.com");
    const author = schema.author as Record<string, unknown>;
    expect(author.name).toBe("Koupli");
  });

  it("inclut keywords des catégories", () => {
    const schema = articleSchema(basePost, "https://koupli.com");
    expect(schema.keywords).toBe("Budget, Couple");
  });

  it("inclut speakable specification", () => {
    const schema = articleSchema(basePost, "https://koupli.com");
    const speakable = schema.speakable as Record<string, unknown>;
    expect(speakable["@type"]).toBe("SpeakableSpecification");
    expect(speakable.cssSelector).toEqual(["article h1", "article header p"]);
  });

  it("inclut image quand coverImageUrl est fourni", () => {
    const schema = articleSchema(
      { ...basePost, coverImageUrl: "/images/cover.jpg" },
      "https://koupli.com"
    );
    const image = schema.image as Record<string, unknown>;
    expect(image["@type"]).toBe("ImageObject");
    expect(image.url).toBe("https://koupli.com/images/cover.jpg");
  });

  it("inclut image absolue quand URL complète fournie", () => {
    const schema = articleSchema(
      { ...basePost, coverImageUrl: "https://cdn.example.com/img.jpg" },
      "https://koupli.com"
    );
    const image = schema.image as Record<string, unknown>;
    expect(image.url).toBe("https://cdn.example.com/img.jpg");
  });

  it("n'inclut pas image quand coverImageUrl est null", () => {
    const schema = articleSchema(basePost, "https://koupli.com");
    expect(schema.image).toBeUndefined();
  });
});
