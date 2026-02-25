import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Link } from "@/i18n/navigation";
import { BLOG_POSTS, getBlogPost } from "@/data/blog-posts";

export function generateStaticParams() {
  return BLOG_POSTS.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = getBlogPost(slug);

  if (!post) {
    return { title: "Article introuvable — TrackMyCash" };
  }

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://trackmycash.com";

  return {
    title: `${post.title} | TrackMyCash`,
    description: post.excerpt,
    openGraph: {
      title: `${post.title} | TrackMyCash`,
      description: post.excerpt,
      type: "article",
      publishedTime: post.date,
      tags: post.tags,
      url: `${baseUrl}/fr/blog/${post.slug}`,
    },
  };
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string; locale: string }>;
}) {
  const { slug } = await params;
  const post = getBlogPost(slug);

  if (!post) {
    notFound();
  }

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://trackmycash.com";

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.excerpt,
    datePublished: post.date,
    author: {
      "@type": "Organization",
      name: "TrackMyCash",
    },
    publisher: {
      "@type": "Organization",
      name: "TrackMyCash",
      url: baseUrl,
    },
    url: `${baseUrl}/fr/blog/${post.slug}`,
    keywords: post.tags.join(", "),
  };

  return (
    <article className="max-w-2xl mx-auto px-4 py-16">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
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
          {post.tags.map((tag) => (
            <span
              key={tag}
              className="text-xs font-medium text-primary bg-indigo-50 rounded-full px-2 py-0.5"
            >
              {tag}
            </span>
          ))}
        </div>
        <h1 className="text-3xl font-bold text-text-main mb-3">{post.title}</h1>
        <p className="text-text-muted text-sm">
          {new Date(post.date).toLocaleDateString("fr-FR", {
            day: "numeric",
            month: "long",
            year: "numeric",
          })}
          {" · "}
          {post.readingTime} min de lecture
        </p>
      </header>

      <div
        className="prose prose-slate max-w-none text-text-main"
        dangerouslySetInnerHTML={{ __html: post.content }}
      />

      {/* AC-7 : CTA en bas de chaque article */}
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
