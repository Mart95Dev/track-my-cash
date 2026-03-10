import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Link } from "@/i18n/navigation";
import { getDb } from "@/lib/db";
import { getPublishedPostBySlug, getPublishedSlugs } from "@/lib/queries/blog";
import { sanitizeBlogHtml } from "@/lib/blog-sanitize";
import { articleSchema, breadcrumbSchema } from "@/lib/seo/schemas";
import { SEO_CONFIG } from "@/lib/seo/constants";

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
      tags: post.categories.map((c) => c.name),
      url: `${baseUrl}/fr/blog/${post.slug}`,
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

  const jsonLd = articleSchema(
    {
      title: post.title,
      excerpt: post.excerpt,
      slug: post.slug,
      publishedAt: post.publishedAt,
      updatedAt: post.updatedAt ?? null,
      categories: post.categories,
    },
    baseUrl
  );

  return (
    <article className="max-w-2xl mx-auto px-4 py-16">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(breadcrumbSchema([
            { name: "Accueil", url: `${baseUrl}/fr` },
            { name: "Blog", url: `${baseUrl}/fr/blog` },
            { name: post.title, url: `${baseUrl}/fr/blog/${post.slug}` },
          ])),
        }}
      />

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

      <header className="mb-8">
        <div className="flex items-center gap-2 mb-4">
          {post.categories.map((cat) => (
            <span
              key={cat.id}
              className="text-xs font-medium rounded-full px-2 py-0.5"
              style={{ backgroundColor: `${cat.color}15`, color: cat.color }}
            >
              {cat.name}
            </span>
          ))}
        </div>
        <h1 className="text-3xl font-bold text-text-main mb-3">{post.title}</h1>
        <p className="text-text-muted text-sm">
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
      </header>

      <div
        className="prose prose-slate max-w-none text-text-main"
        dangerouslySetInnerHTML={{ __html: sanitizeBlogHtml(post.content) }}
      />

      {/* CTA en bas de chaque article */}
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
  );
}
