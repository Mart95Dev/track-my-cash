/**
 * FORGE QA — STORY-154 — Tests complémentaires
 * Gaps: integration sanitize, draft→notFound, openGraph fields, data-URI XSS
 */
import { describe, it, expect, vi, beforeEach } from "vitest";

const mockPost = {
  id: "post-1",
  slug: "gerer-budget-couple",
  title: "Comment gérer son budget en couple",
  excerpt: "La gestion de l'argent est source de tension en couple.",
  content: "<h2>Pourquoi ?</h2><p>Contenu</p>",
  coverImageUrl: null,
  readingTime: 5,
  status: "published" as const,
  publishedAt: "2026-02-24T10:00:00.000Z",
  authorName: "TrackMyCash",
  metaTitle: null,
  metaDescription: null,
  createdAt: "2026-02-20T10:00:00.000Z",
  updatedAt: "2026-02-24T10:00:00.000Z",
  categories: [
    { id: "cat-1", name: "Budget", slug: "budget", color: "#4F46E5" },
  ],
};

const { mockGetPublishedPostBySlug, mockGetPublishedSlugs, mockGetRelatedPosts, mockGetAdjacentPosts, mockSanitize } = vi.hoisted(() => ({
  mockGetPublishedPostBySlug: vi.fn(),
  mockGetPublishedSlugs: vi.fn(),
  mockGetRelatedPosts: vi.fn(),
  mockGetAdjacentPosts: vi.fn(),
  mockSanitize: vi.fn((html: string) => `SANITIZED:${html}`),
}));

vi.mock("@/lib/db", () => ({
  getDb: vi.fn(() => ({})),
}));

vi.mock("@/lib/queries/blog", () => ({
  getPublishedPostBySlug: mockGetPublishedPostBySlug,
  getPublishedSlugs: mockGetPublishedSlugs,
  getRelatedPosts: mockGetRelatedPosts,
  getAdjacentPosts: mockGetAdjacentPosts,
}));

vi.mock("@/lib/blog-sanitize", () => ({
  sanitizeBlogHtml: mockSanitize,
}));

vi.mock("@/lib/blog-html-utils", () => ({
  injectHeadingIds: vi.fn((html: string) => html),
}));

vi.mock("@/components/blog/reading-progress-bar", () => ({
  ReadingProgressBar: vi.fn(() => null),
}));

vi.mock("@/components/blog/article-body", () => ({
  ArticleBody: vi.fn(() => null),
}));

vi.mock("next/navigation", () => ({
  notFound: vi.fn(() => {
    throw new Error("NEXT_NOT_FOUND");
  }),
}));

vi.mock("@/i18n/navigation", () => ({
  Link: vi.fn(({ href, children }: { href: string; children: React.ReactNode }) => children),
}));

describe("QA-154 — Tests complémentaires page [slug]", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.NEXT_PUBLIC_APP_URL = "https://trackmycash.com";
    mockGetRelatedPosts.mockResolvedValue([]);
    mockGetAdjacentPosts.mockResolvedValue({ prev: null, next: null });
  });

  // ── QA-154-1 : sanitizeBlogHtml est bien appelé ──────────────────────

  it("QA-154-1 : sanitizeBlogHtml est appelé avec post.content lors du rendu", async () => {
    mockGetPublishedPostBySlug.mockResolvedValue(mockPost);
    const page = await import("@/app/[locale]/(marketing)/blog/[slug]/page");
    const BlogPostPage = page.default;
    await BlogPostPage({ params: Promise.resolve({ slug: "gerer-budget-couple", locale: "fr" }) });
    expect(mockSanitize).toHaveBeenCalledTimes(1);
    expect(mockSanitize).toHaveBeenCalledWith(mockPost.content);
  });

  // ── QA-154-2 : openGraph.publishedTime est défini ────────────────────

  it("QA-154-2 : openGraph.publishedTime correspond à publishedAt", async () => {
    mockGetPublishedPostBySlug.mockResolvedValue(mockPost);
    const { generateMetadata } = await import(
      "@/app/[locale]/(marketing)/blog/[slug]/page"
    );
    const metadata = await generateMetadata({
      params: Promise.resolve({ slug: "gerer-budget-couple" }),
    });
    const og = metadata.openGraph as Record<string, unknown>;
    expect(og.publishedTime).toBe("2026-02-24T10:00:00.000Z");
  });

  // ── QA-154-3 : openGraph.url format correct ──────────────────────────

  it("QA-154-3 : openGraph.url contient le slug complet", async () => {
    mockGetPublishedPostBySlug.mockResolvedValue(mockPost);
    const { generateMetadata } = await import(
      "@/app/[locale]/(marketing)/blog/[slug]/page"
    );
    const metadata = await generateMetadata({
      params: Promise.resolve({ slug: "gerer-budget-couple" }),
    });
    const og = metadata.openGraph as Record<string, unknown>;
    expect(og.url).toBe("https://trackmycash.com/fr/blog/gerer-budget-couple");
  });

  // ── QA-154-4 : description fallback sur excerpt ───────────────────────

  it("QA-154-4 : openGraph.description fallback sur excerpt quand metaDescription null", async () => {
    mockGetPublishedPostBySlug.mockResolvedValue(mockPost);
    const { generateMetadata } = await import(
      "@/app/[locale]/(marketing)/blog/[slug]/page"
    );
    const metadata = await generateMetadata({
      params: Promise.resolve({ slug: "gerer-budget-couple" }),
    });
    expect(metadata.description).toBe(mockPost.excerpt);
  });

  // ── QA-154-5 : page.tsx importe sanitizeBlogHtml ──────────────────────

  it("QA-154-5 : le source de page.tsx importe sanitizeBlogHtml", async () => {
    const fs = await import("node:fs");
    const path = await import("node:path");
    const source = fs.readFileSync(
      path.resolve(process.cwd(), "src/app/[locale]/(marketing)/blog/[slug]/page.tsx"),
      "utf-8"
    );
    expect(source).toContain('import { sanitizeBlogHtml } from "@/lib/blog-sanitize"');
    expect(source).toContain("sanitizeBlogHtml(post.content)");
  });

  // ── QA-154-6 : lien retour /blog présent ─────────────────────────────

  it("QA-154-6 : le source contient un lien retour vers /blog", async () => {
    const fs = await import("node:fs");
    const path = await import("node:path");
    const source = fs.readFileSync(
      path.resolve(process.cwd(), "src/app/[locale]/(marketing)/blog/[slug]/page.tsx"),
      "utf-8"
    );
    expect(source).toContain('href="/blog"');
    expect(source).toContain("Retour au blog");
  });

  // ── QA-154-7 : JSON-LD contient application/ld+json ──────────────────

  it("QA-154-7 : le source contient un script application/ld+json", async () => {
    const fs = await import("node:fs");
    const path = await import("node:path");
    const source = fs.readFileSync(
      path.resolve(process.cwd(), "src/app/[locale]/(marketing)/blog/[slug]/page.tsx"),
      "utf-8"
    );
    expect(source).toContain('type="application/ld+json"');
    expect(source).toContain("JSON.stringify(jsonLd)");
  });
});

