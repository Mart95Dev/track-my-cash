import type { Metadata } from "next";
import { getDb } from "@/lib/db";
import { getPublishedPosts, getAllCategories } from "@/lib/queries/blog";
import { ScrollRevealSection } from "@/components/marketing/scroll-reveal";
import { BlogContent } from "./blog-content";
import { buildPageMetadata } from "@/lib/seo/metadata";
import { breadcrumbSchema } from "@/lib/seo/schemas";
import { SEO_CONFIG } from "@/lib/seo/constants";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  return buildPageMetadata({
    title: "Blog — Gérer ses finances en couple | Koupli",
    description:
      "Conseils pratiques pour gérer votre budget en couple, partager vos dépenses équitablement et atteindre vos objectifs d'épargne ensemble.",
    path: "blog",
    locale,
    ogImage: "/og/blog.png",
  });
}

export default async function BlogPage() {
  const db = getDb();
  const [posts, categories] = await Promise.all([
    getPublishedPosts(db),
    getAllCategories(db),
  ]);

  return (
    <ScrollRevealSection>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            breadcrumbSchema([
              { name: "Accueil", url: `${SEO_CONFIG.baseUrl}/fr` },
              {
                name: "Blog",
                url: `${SEO_CONFIG.baseUrl}/fr/blog`,
              },
            ])
          ),
        }}
      />
      {/* Hero */}
      <section className="bg-[#F5F3FF] py-16 pb-20 text-center">
        <div className="fade-up max-w-3xl mx-auto px-4 sm:px-6">
          <h1 className="font-serif text-4xl sm:text-5xl font-bold text-text-main mb-4">
            Le Blog
          </h1>
          <p className="text-text-muted text-lg leading-relaxed max-w-2xl mx-auto">
            Conseils pratiques, retours d&apos;expérience et astuces pour gérer
            vos finances en couple — simplement et sereinement.
          </p>
        </div>
      </section>

      {/* Client-side interactive content */}
      <div className="pt-10">
        <BlogContent posts={posts} categories={categories} />
      </div>
    </ScrollRevealSection>
  );
}
