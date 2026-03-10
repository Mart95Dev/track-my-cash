import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Link } from "@/i18n/navigation";
import { getDb } from "@/lib/db";
import {
  getPublishedPostBySlug,
  getPublishedSlugs,
  getRelatedPosts,
  getAdjacentPosts,
} from "@/lib/queries/blog";
import { sanitizeBlogHtml } from "@/lib/blog-sanitize";
import { injectHeadingIds } from "@/lib/blog-html-utils";
import { articleSchema, breadcrumbSchema } from "@/lib/seo/schemas";
import { SEO_CONFIG } from "@/lib/seo/constants";
import { ReadingProgressBar } from "@/components/blog/reading-progress-bar";
import { ArticleBody } from "@/components/blog/article-body";

export async function generateStaticParams() {
  try {
    const db = getDb();
    const slugs = await getPublishedSlugs(db);
    return slugs.map((slug) => ({ slug }));
  } catch {
    // Tables may not exist yet at build time — return empty to skip static generation
    return [];
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const db = getDb();
  const post = await getPublishedPostBySlug(db, slug);

  if (!post) {
    return { title: "Article introuvable — TrackMyCash" };
  }

  const baseUrl = SEO_CONFIG.baseUrl;

  return {
    title: post.metaTitle ?? `${post.title} | TrackMyCash`,
    description: post.metaDescription ?? post.excerpt,
    openGraph: {
      title: post.metaTitle ?? `${post.title} | TrackMyCash`,
      description: post.metaDescription ?? post.excerpt,
      type: "article",
      publishedTime: post.publishedAt ?? undefined,
      modifiedTime: post.updatedAt ?? undefined,
      tags: post.categories.map((c) => c.name),
      url: `${baseUrl}/fr/blog/${post.slug}`,
      ...(post.coverImageUrl
        ? {
            images: [
              {
                url: post.coverImageUrl.startsWith("http")
                  ? post.coverImageUrl
                  : `${baseUrl}${post.coverImageUrl}`,
                width: 1200,
                height: 630,
                alt: post.title,
              },
            ],
          }
        : {}),
    },
    twitter: {
      card: "summary_large_image",
      title: post.metaTitle ?? `${post.title} | TrackMyCash`,
      description: post.metaDescription ?? post.excerpt,
    },
  };
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string; locale: string }>;
}) {
  const { slug } = await params;
  const db = getDb();
  const post = await getPublishedPostBySlug(db, slug);

  if (!post) {
    notFound();
  }

  const baseUrl = SEO_CONFIG.baseUrl;
  const articleUrl = `${baseUrl}/fr/blog/${post.slug}`;

  // Parallel data fetching: related posts + adjacent posts
  const [relatedPosts, adjacentPosts] = await Promise.all([
    getRelatedPosts(
      db,
      post.slug,
      post.categories.map((c) => c.id)
    ),
    post.publishedAt ? getAdjacentPosts(db, post.publishedAt) : { prev: null, next: null },
  ]);

  const jsonLd = articleSchema(
    {
      title: post.title,
      excerpt: post.excerpt,
      slug: post.slug,
      publishedAt: post.publishedAt,
      updatedAt: post.updatedAt ?? null,
      categories: post.categories,
      authorName: post.authorName,
      coverImageUrl: post.coverImageUrl,
    },
    baseUrl
  );

  // Sanitize + inject heading IDs for TOC anchors
  const sanitizedHtml = injectHeadingIds(sanitizeBlogHtml(post.content));

  return (
    <>
      <ReadingProgressBar />

      <article className="max-w-4xl mx-auto px-4 py-16">
        {/* JSON-LD */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(
              breadcrumbSchema([
                { name: "Accueil", url: `${baseUrl}/fr` },
                { name: "Blog", url: `${baseUrl}/fr/blog` },
                { name: post.title, url: articleUrl },
              ])
            ),
          }}
        />

        {/* Back link */}
        <div className="mb-6">
          <Link
            href="/blog"
            className="text-sm text-text-muted hover:text-primary flex items-center gap-1"
          >
            <span className="material-symbols-outlined text-[16px]">
              arrow_back
            </span>
            Retour au blog
          </Link>
        </div>

        {/* Header */}
        <header className="mb-8 max-w-2xl">
          <div className="flex items-center gap-2 mb-4">
            {post.categories.map((cat) => (
              <span
                key={cat.id}
                className="text-xs font-medium rounded-full px-2.5 py-0.5"
                style={{ backgroundColor: `${cat.color}15`, color: cat.color }}
              >
                {cat.name}
              </span>
            ))}
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl font-bold text-text-main mb-4 leading-tight">
            {post.title}
          </h1>

          {/* Author + date row */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-primary text-[20px]">
                person
              </span>
            </div>
            <div>
              <p className="text-sm font-medium text-text-main">
                {post.authorName}
              </p>
              <p className="text-text-muted text-xs">
                {post.publishedAt
                  ? new Date(post.publishedAt).toLocaleDateString("fr-FR", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })
                  : ""}
                {" · "}
                {post.readingTime} min de lecture
              </p>
            </div>
          </div>
        </header>

        {/* Cover image */}
        {post.coverImageUrl && (
          <div className="mb-10 -mx-4 sm:mx-0">
            <img
              src={post.coverImageUrl}
              alt={post.title}
              className="w-full rounded-none sm:rounded-2xl object-cover max-h-[480px]"
              loading="eager"
            />
          </div>
        )}

        {/* Article body with TOC sidebar, reactions, share */}
        <ArticleBody
          htmlContent={sanitizedHtml}
          slug={post.slug}
          url={articleUrl}
          title={post.title}
        />

        {/* Related articles */}
        {relatedPosts.length > 0 && (
          <section className="mt-16">
            <h2 className="font-serif text-2xl font-bold text-text-main mb-6">
              Articles similaires
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {relatedPosts.map((related) => (
                <Link
                  key={related.slug}
                  href={
                    `/blog/${related.slug}` as Parameters<
                      typeof Link
                    >[0]["href"]
                  }
                  className="group block bg-white border border-gray-100 rounded-2xl p-5 shadow-soft hover-lift transition-shadow"
                >
                  {related.coverImageUrl && (
                    <img
                      src={related.coverImageUrl}
                      alt={related.title}
                      className="w-full h-36 object-cover rounded-xl mb-4"
                      loading="lazy"
                    />
                  )}
                  <div className="flex flex-wrap gap-1.5 mb-2">
                    {related.categories.map((cat) => (
                      <span
                        key={cat.id}
                        className="text-[10px] font-medium rounded-full px-2 py-0.5"
                        style={{
                          backgroundColor: `${cat.color}15`,
                          color: cat.color,
                        }}
                      >
                        {cat.name}
                      </span>
                    ))}
                  </div>
                  <h3 className="font-serif text-base font-semibold text-text-main group-hover:text-primary transition-colors mb-1.5 line-clamp-2">
                    {related.title}
                  </h3>
                  <p className="text-text-muted text-sm line-clamp-2">
                    {related.excerpt}
                  </p>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Previous / Next navigation */}
        {(adjacentPosts.prev || adjacentPosts.next) && (
          <nav className="mt-12 flex items-stretch gap-4 border-t border-gray-100 pt-8">
            {adjacentPosts.prev ? (
              <Link
                href={
                  `/blog/${adjacentPosts.prev.slug}` as Parameters<
                    typeof Link
                  >[0]["href"]
                }
                className="flex-1 group flex items-start gap-2 p-4 rounded-xl hover:bg-gray-50 transition-colors"
              >
                <span className="material-symbols-outlined text-text-muted group-hover:text-primary text-[20px] mt-0.5 shrink-0">
                  arrow_back
                </span>
                <div>
                  <p className="text-xs text-text-muted mb-1">Précédent</p>
                  <p className="text-sm font-medium text-text-main group-hover:text-primary transition-colors line-clamp-2">
                    {adjacentPosts.prev.title}
                  </p>
                </div>
              </Link>
            ) : (
              <div className="flex-1" />
            )}
            {adjacentPosts.next ? (
              <Link
                href={
                  `/blog/${adjacentPosts.next.slug}` as Parameters<
                    typeof Link
                  >[0]["href"]
                }
                className="flex-1 group flex items-start gap-2 p-4 rounded-xl hover:bg-gray-50 transition-colors text-right"
              >
                <div className="flex-1">
                  <p className="text-xs text-text-muted mb-1">Suivant</p>
                  <p className="text-sm font-medium text-text-main group-hover:text-primary transition-colors line-clamp-2">
                    {adjacentPosts.next.title}
                  </p>
                </div>
                <span className="material-symbols-outlined text-text-muted group-hover:text-primary text-[20px] mt-0.5 shrink-0">
                  arrow_forward
                </span>
              </Link>
            ) : (
              <div className="flex-1" />
            )}
          </nav>
        )}

        {/* CTA */}
        <div className="mt-12 bg-primary/5 border border-primary/20 rounded-2xl p-6 text-center">
          <p className="font-bold text-text-main mb-2">
            Gérez votre budget en couple avec TrackMyCash
          </p>
          <p className="text-text-muted text-sm mb-4">
            Suivez vos dépenses communes, équilibrez qui doit quoi et atteignez
            vos objectifs ensemble.
          </p>
          <Link
            href="/inscription"
            className="inline-flex items-center gap-2 bg-primary text-white font-bold px-6 py-3 rounded-full text-sm hover:bg-primary/90 transition-colors"
          >
            Commencer gratuitement
          </Link>
        </div>
      </article>
    </>
  );
}
