import type { Metadata } from "next";
import { BLOG_POSTS } from "@/data/blog-posts";
import { ScrollRevealSection } from "@/components/marketing/scroll-reveal";
import { BlogContent } from "./blog-content";

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
  void BLOG_POSTS;

  return (
    <ScrollRevealSection>
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
        <BlogContent />
      </div>
    </ScrollRevealSection>
  );
}
