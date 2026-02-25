import type { Metadata } from "next";
import { Link } from "@/i18n/navigation";
import { BLOG_POSTS } from "@/data/blog-posts";

export const metadata: Metadata = {
  title: "Blog — Gérer ses finances en couple | TrackMyCash",
  description:
    "Conseils pratiques pour gérer votre budget en couple, partager vos dépenses équitablement et atteindre vos objectifs d'épargne ensemble.",
  openGraph: {
    title: "Blog — Gérer ses finances en couple | TrackMyCash",
    description:
      "Conseils pratiques pour gérer votre budget en couple, partager vos dépenses équitablement et atteindre vos objectifs d'épargne ensemble.",
    type: "website",
  },
};

export default function BlogPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-16">
      <h1 className="text-3xl font-bold text-text-main mb-2">Blog</h1>
      <p className="text-text-muted mb-10">
        Conseils pour gérer vos finances en couple, simplement et sereinement.
      </p>

      <div className="flex flex-col gap-8">
        {BLOG_POSTS.map((post) => (
          <article
            key={post.slug}
            className="bg-white border border-gray-100 rounded-2xl p-6 shadow-soft"
          >
            <div className="flex items-center gap-2 mb-3">
              {post.tags.map((tag) => (
                <span
                  key={tag}
                  className="text-xs font-medium text-primary bg-indigo-50 rounded-full px-2 py-0.5"
                >
                  {tag}
                </span>
              ))}
              <span className="text-xs text-text-muted ml-auto">
                {new Date(post.date).toLocaleDateString("fr-FR", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
                {" · "}
                {post.readingTime} min de lecture
              </span>
            </div>

            <h2 className="text-xl font-bold text-text-main mb-2">
              {post.title}
            </h2>
            <p className="text-text-muted text-sm mb-4">{post.excerpt}</p>

            <Link
              href={`/blog/${post.slug}` as Parameters<typeof Link>[0]["href"]}
              className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
            >
              Lire l&apos;article
              <span className="material-symbols-outlined text-[16px]">
                arrow_forward
              </span>
            </Link>
          </article>
        ))}
      </div>
    </div>
  );
}
