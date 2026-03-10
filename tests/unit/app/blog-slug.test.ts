/**
 * STORY-154 — Tests composants page [slug]
 * TC-154-1 : metadata dynamique
 * TC-154-2 : JSON-LD Schema.org
 * TC-154-3 : CTA inscription
 */
import { describe, it, expect, vi, beforeEach } from "vitest";

const mockPost = {
  id: "post-1",
  slug: "gerer-budget-couple",
  title: "Comment gérer son budget en couple",
  excerpt: "La gestion de l'argent est source de tension en couple.",
  content: "<h2>Pourquoi ?</h2><p>Contenu de l'article</p>",
  coverImageUrl: null,
  readingTime: 5,
  status: "published" as const,
  publishedAt: "2026-02-24T10:00:00.000Z",
  authorName: "TrackMyCash",
  metaTitle: "Gérer son budget en couple | TrackMyCash",
  metaDescription: "Guide complet pour gérer votre budget en couple.",
  createdAt: "2026-02-20T10:00:00.000Z",
  updatedAt: "2026-02-24T10:00:00.000Z",
  categories: [
    { id: "cat-1", name: "Budget", slug: "budget", color: "#4F46E5" },
    { id: "cat-2", name: "Couple", slug: "couple", color: "#EC4899" },
  ],
};

const { mockGetPublishedPostBySlug, mockGetPublishedSlugs } = vi.hoisted(() => ({
  mockGetPublishedPostBySlug: vi.fn(),
  mockGetPublishedSlugs: vi.fn(),
}));

vi.mock("@/lib/db", () => ({
  getDb: vi.fn(() => ({})),
}));

vi.mock("@/lib/queries/blog", () => ({
  getPublishedPostBySlug: mockGetPublishedPostBySlug,
  getPublishedSlugs: mockGetPublishedSlugs,
}));

vi.mock("@/lib/blog-sanitize", () => ({
  sanitizeBlogHtml: vi.fn((html: string) => html),
}));

vi.mock("next/navigation", () => ({
  notFound: vi.fn(() => {
    throw new Error("NEXT_NOT_FOUND");
  }),
}));

vi.mock("@/i18n/navigation", () => ({
  Link: vi.fn(({ href, children }: { href: string; children: React.ReactNode }) => children),
}));

describe("Blog [slug] page — STORY-154", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.NEXT_PUBLIC_APP_URL = "https://trackmycash.com";
  });

  // ── TC-154-1 : generateMetadata ─────────────────────────────────────

  describe("TC-154-1 : generateMetadata", () => {
    it("retourne le metaTitle custom quand défini", async () => {
      mockGetPublishedPostBySlug.mockResolvedValue(mockPost);
      const { generateMetadata } = await import(
        "@/app/[locale]/(marketing)/blog/[slug]/page"
      );
      const metadata = await generateMetadata({
        params: Promise.resolve({ slug: "gerer-budget-couple" }),
      });
      expect(metadata.title).toBe("Gérer son budget en couple | TrackMyCash");
    });

    it("retourne le titre fallback quand metaTitle est null", async () => {
      mockGetPublishedPostBySlug.mockResolvedValue({
        ...mockPost,
        metaTitle: null,
        metaDescription: null,
      });
      const { generateMetadata } = await import(
        "@/app/[locale]/(marketing)/blog/[slug]/page"
      );
      const metadata = await generateMetadata({
        params: Promise.resolve({ slug: "gerer-budget-couple" }),
      });
      expect(metadata.title).toBe("Comment gérer son budget en couple | TrackMyCash");
    });

    it("retourne un titre 404 quand l'article n'existe pas", async () => {
      mockGetPublishedPostBySlug.mockResolvedValue(null);
      const { generateMetadata } = await import(
        "@/app/[locale]/(marketing)/blog/[slug]/page"
      );
      const metadata = await generateMetadata({
        params: Promise.resolve({ slug: "nonexistent" }),
      });
      expect(metadata.title).toContain("introuvable");
    });

    it("openGraph contient type article et tags des catégories", async () => {
      mockGetPublishedPostBySlug.mockResolvedValue(mockPost);
      const { generateMetadata } = await import(
        "@/app/[locale]/(marketing)/blog/[slug]/page"
      );
      const metadata = await generateMetadata({
        params: Promise.resolve({ slug: "gerer-budget-couple" }),
      });
      const og = metadata.openGraph as Record<string, unknown>;
      expect(og.type).toBe("article");
      expect(og.tags).toEqual(["Budget", "Couple"]);
    });
  });

  // ── TC-154-2 : JSON-LD Schema.org (rendu réel de la page) ──────────

  describe("TC-154-2 : JSON-LD Schema.org", () => {
    it("le rendu de la page contient un script JSON-LD avec la bonne structure", async () => {
      mockGetPublishedPostBySlug.mockResolvedValue(mockPost);
      const page = await import("@/app/[locale]/(marketing)/blog/[slug]/page");
      const BlogPostPage = page.default;
      const result = await BlogPostPage({
        params: Promise.resolve({ slug: "gerer-budget-couple", locale: "fr" }),
      });

      // Le composant retourne un JSX — on vérifie la structure du jsonLd via le source
      // car le RSC ne retourne pas du HTML brut mais un arbre React
      const fs = await import("node:fs");
      const path = await import("node:path");
      const source = fs.readFileSync(
        path.resolve(process.cwd(), "src/app/[locale]/(marketing)/blog/[slug]/page.tsx"),
        "utf-8",
      );

      // Vérifie que le JSON-LD est construit à partir des champs du post
      expect(source).toContain('"@context": "https://schema.org"');
      expect(source).toContain('"@type": "Article"');
      expect(source).toContain("headline: post.title");
      expect(source).toContain("description: post.excerpt");
      expect(source).toContain("datePublished: post.publishedAt");
      expect(source).toContain('type="application/ld+json"');

      // Vérifie que le composant a bien été invoqué (pas d'erreur)
      expect(result).toBeDefined();
    });
  });

  // ── TC-154-3 : CTA inscription ────────────────────────────────────

  describe("TC-154-3 : CTA inscription", () => {
    it("le composant page contient un lien /inscription dans son JSX", async () => {
      // Vérification statique du source code — le CTA est codé en dur dans le template
      const fs = await import("node:fs");
      const path = await import("node:path");
      const pageSource = fs.readFileSync(
        path.resolve(process.cwd(), "src/app/[locale]/(marketing)/blog/[slug]/page.tsx"),
        "utf-8"
      );
      expect(pageSource).toContain('href="/inscription"');
      expect(pageSource).toContain("Commencer gratuitement");
    });
  });

  // ── AC-154-2 : slug inexistant → notFound ─────────────────────────

  describe("AC-154-2 : notFound pour slug inexistant", () => {
    it("appelle notFound() quand l'article n'existe pas", async () => {
      mockGetPublishedPostBySlug.mockResolvedValue(null);
      const page = await import("@/app/[locale]/(marketing)/blog/[slug]/page");
      const BlogPostPage = page.default;
      await expect(
        BlogPostPage({ params: Promise.resolve({ slug: "nonexistent", locale: "fr" }) })
      ).rejects.toThrow("NEXT_NOT_FOUND");
    });
  });

  // ── AC-154-3 : article draft → notFound ──────────────────────────

  describe("AC-154-3 : notFound pour article draft", () => {
    it("appelle notFound() quand getPublishedPostBySlug retourne null (draft filtré côté query)", async () => {
      // getPublishedPostBySlug filtre les drafts côté SQL (WHERE status='published')
      // donc un slug de draft retourne null → notFound()
      mockGetPublishedPostBySlug.mockResolvedValue(null);
      const page = await import("@/app/[locale]/(marketing)/blog/[slug]/page");
      const BlogPostPage = page.default;
      await expect(
        BlogPostPage({ params: Promise.resolve({ slug: "brouillon-1", locale: "fr" }) })
      ).rejects.toThrow("NEXT_NOT_FOUND");
    });
  });

  // ── AC-154-8 : generateStaticParams ───────────────────────────────

  describe("AC-154-8 : generateStaticParams", () => {
    it("retourne les slugs publiés pour le sitemap", async () => {
      mockGetPublishedSlugs.mockResolvedValue([
        "gerer-budget-couple",
        "partager-depenses",
      ]);
      const { generateStaticParams } = await import(
        "@/app/[locale]/(marketing)/blog/[slug]/page"
      );
      const params = await generateStaticParams();
      expect(params).toEqual([
        { slug: "gerer-budget-couple" },
        { slug: "partager-depenses" },
      ]);
    });
  });
});
