"use client";

import { useState, useTransition } from "react";
import { Link } from "@/i18n/navigation";
import type { BlogPost, BlogCategory } from "@/lib/queries/blog";
import { subscribeNewsletterAction } from "@/app/actions/newsletter-actions";

type Props = {
  posts: BlogPost[];
  categories: BlogCategory[];
};

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export function BlogContent({ posts, categories }: Props) {
  const [activeCategorySlug, setActiveCategorySlug] = useState<string | null>(null);
  const [newsletterStatus, setNewsletterStatus] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [isPending, startTransition] = useTransition();

  const filtered = activeCategorySlug
    ? posts.filter((post) =>
        post.categories.some((c) => c.slug === activeCategorySlug)
      )
    : posts;

  const featured = filtered[0];
  const gridPosts = filtered.slice(1);

  return (
    <>
      {/* Category filters */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 -mt-6 mb-12">
        <div className="fade-up flex flex-wrap gap-2 justify-center">
          <button
            onClick={() => setActiveCategorySlug(null)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              activeCategorySlug === null
                ? "bg-primary text-white"
                : "bg-white text-text-muted border border-gray-200 hover:border-gray-300"
            }`}
          >
            Tous
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategorySlug(cat.slug)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                activeCategorySlug === cat.slug
                  ? "text-white"
                  : "bg-white text-text-muted border border-gray-200 hover:border-gray-300"
              }`}
              style={activeCategorySlug === cat.slug ? { backgroundColor: cat.color } : undefined}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </section>

      {/* Featured article */}
      {featured && (
        <section className="max-w-5xl mx-auto px-4 sm:px-6 mb-16">
          <div className="fade-up">
            <div className="bg-white rounded-2xl shadow-soft overflow-hidden flex">
              <div className="w-1 min-h-full bg-primary shrink-0" />
              <div className="p-8 sm:p-10 flex-1">
                <span className="inline-block text-xs font-semibold uppercase tracking-wider bg-amber-100 text-amber-800 px-3 py-1 rounded-full mb-4">
                  À la une
                </span>
                <h2 className="font-serif text-2xl sm:text-3xl font-bold text-text-main mb-3">
                  {featured.title}
                </h2>
                <p className="text-text-muted mb-4 leading-relaxed">
                  {featured.excerpt}
                </p>
                <div className="flex items-center gap-4 mb-6">
                  {featured.publishedAt && (
                    <span className="text-sm text-text-muted">
                      {formatDate(featured.publishedAt)}
                    </span>
                  )}
                  <span className="text-sm text-text-muted">
                    {featured.readingTime} min de lecture
                  </span>
                </div>
                <Link
                  href={
                    `/blog/${featured.slug}` as Parameters<
                      typeof Link
                    >[0]["href"]
                  }
                  className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
                >
                  Lire l&apos;article
                  <span className="material-symbols-outlined text-[16px]">
                    arrow_forward
                  </span>
                </Link>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Article grid */}
      {gridPosts.length > 0 && (
        <section className="max-w-5xl mx-auto px-4 sm:px-6 mb-16">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {gridPosts.map((post) => (
              <article
                key={post.slug}
                className="fade-up hover-lift bg-white border border-gray-100 rounded-2xl p-6 shadow-soft transition-shadow"
              >
                <div className="flex flex-wrap items-center gap-2 mb-3">
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

                <h3 className="font-serif text-lg font-semibold text-text-main mb-2">
                  {post.title}
                </h3>
                <p className="text-text-muted text-sm mb-4 leading-relaxed">
                  {post.excerpt}
                </p>

                <div className="flex items-center justify-between">
                  <span className="text-xs text-text-muted">
                    {post.publishedAt ? formatDate(post.publishedAt) : ""} · {post.readingTime} min de lecture
                  </span>
                  <Link
                    href={
                      `/blog/${post.slug}` as Parameters<
                        typeof Link
                      >[0]["href"]
                    }
                    className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
                  >
                    Lire
                    <span className="material-symbols-outlined text-[16px]">
                      arrow_forward
                    </span>
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </section>
      )}

      {/* Empty state */}
      {filtered.length === 0 && (
        <section className="max-w-5xl mx-auto px-4 sm:px-6 mb-16 text-center py-12">
          <p className="text-text-muted text-lg">
            Aucun article dans cette catégorie pour le moment.
          </p>
        </section>
      )}

      {/* Newsletter section */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 mb-16">
        <div className="fade-up bg-white rounded-2xl shadow-soft p-8 sm:p-10 text-center">
          <h3 className="font-serif text-2xl font-bold text-text-main mb-3">
            Recevez nos meilleurs conseils
          </h3>
          <p className="text-text-muted mb-6 max-w-lg mx-auto">
            Un email par semaine. Astuces budget, conseils couple, nouveautés
            produit. Zéro spam.
          </p>

          {newsletterStatus?.type === "success" ? (
            <p className="text-green-600 font-medium" data-testid="newsletter-success">
              {newsletterStatus.message}
            </p>
          ) : (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                const form = e.currentTarget;
                startTransition(async () => {
                  const result = await subscribeNewsletterAction(formData);
                  if (result.success) {
                    setNewsletterStatus({ type: "success", message: result.message ?? "Merci pour votre inscription !" });
                    form.reset();
                  } else {
                    setNewsletterStatus({ type: "error", message: result.error ?? "Une erreur est survenue." });
                  }
                });
              }}
              className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto"
            >
              {/* Honeypot — hidden from users, filled by bots */}
              <input
                type="text"
                name="website"
                autoComplete="off"
                tabIndex={-1}
                aria-hidden="true"
                className="absolute -left-[9999px] opacity-0 h-0 w-0"
              />

              <input
                type="email"
                name="email"
                required
                placeholder="votre@email.com"
                className="flex-1 px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
              />
              <button
                type="submit"
                disabled={isPending}
                className="px-6 py-3 bg-primary text-white text-sm font-medium rounded-xl hover:bg-primary/90 transition-colors disabled:opacity-60"
              >
                {isPending ? "Envoi..." : "S\u2019abonner"}
              </button>
            </form>
          )}

          {newsletterStatus?.type === "error" && (
            <p className="text-red-500 text-sm mt-3" data-testid="newsletter-error">
              {newsletterStatus.message}
            </p>
          )}
        </div>
      </section>
    </>
  );
}
