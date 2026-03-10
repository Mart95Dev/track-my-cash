"use client";

import { useState } from "react";
import { Link } from "@/i18n/navigation";
import { BLOG_POSTS, type BlogPost } from "@/data/blog-posts";

const CATEGORIES = ["Tous", "Budget", "Couple", "Épargne", "IA", "Sécurité"];

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function matchesCategory(post: BlogPost, category: string): boolean {
  if (category === "Tous") return true;
  return post.tags.some(
    (tag) => tag.toLowerCase() === category.toLowerCase()
  );
}

export function BlogContent() {
  const [activeCategory, setActiveCategory] = useState("Tous");

  const filtered = BLOG_POSTS.filter((post) =>
    matchesCategory(post, activeCategory)
  );

  const featured = filtered[0];
  const gridPosts = filtered.slice(1);

  return (
    <>
      {/* Category filters */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 -mt-6 mb-12">
        <div className="fade-up flex flex-wrap gap-2 justify-center">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                activeCategory === cat
                  ? "bg-primary text-white"
                  : "bg-white text-text-muted border border-gray-200 hover:border-gray-300"
              }`}
            >
              {cat}
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
                  <span className="text-sm text-text-muted">
                    {formatDate(featured.date)}
                  </span>
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
                  {post.tags.map((tag) => (
                    <span
                      key={tag}
                      className="text-xs font-medium text-primary bg-indigo-50 rounded-full px-2.5 py-0.5"
                    >
                      {tag}
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
                    {formatDate(post.date)} · {post.readingTime} min de lecture
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
          <form
            onSubmit={(e) => e.preventDefault()}
            className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto"
          >
            <input
              type="email"
              placeholder="votre@email.com"
              className="flex-1 px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
            />
            <button
              type="submit"
              className="px-6 py-3 bg-primary text-white text-sm font-medium rounded-xl hover:bg-primary/90 transition-colors"
            >
              S&apos;abonner
            </button>
          </form>
        </div>
      </section>
    </>
  );
}
