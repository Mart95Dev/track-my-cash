import { SEO_CONFIG } from "./constants";

type JsonLd = Record<string, unknown>;

export function organizationSchema(): JsonLd {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: SEO_CONFIG.siteName,
    url: SEO_CONFIG.baseUrl,
    logo: `${SEO_CONFIG.baseUrl}/logo.png`,
    description:
      "Koupli — Application de gestion de comptes bancaires personnels et en couple.",
    foundingDate: "2025",
    contactPoint: {
      "@type": "ContactPoint",
      email: "contact@koupli.com",
      contactType: "customer service",
      availableLanguage: ["fr", "en", "es", "it", "de"],
    },
  };
}

export function webSiteSchema(): JsonLd {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SEO_CONFIG.siteName,
    url: SEO_CONFIG.baseUrl,
    description:
      "Gérez vos finances personnelles et en couple avec Koupli.",
    inLanguage: ["fr", "en", "es", "it", "de"],
    potentialAction: {
      "@type": "SearchAction",
      target: `${SEO_CONFIG.baseUrl}/fr/blog?q={search_term_string}`,
      "query-input": "required name=search_term_string",
    },
  };
}

export function softwareApplicationSchema(): JsonLd {
  return {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: SEO_CONFIG.siteName,
    applicationCategory: "FinanceApplication",
    operatingSystem: "Web, Android",
    offers: [
      {
        "@type": "Offer",
        name: "Découverte",
        price: "0",
        priceCurrency: "EUR",
      },
      {
        "@type": "Offer",
        name: "Couple Pro",
        price: "5.90",
        priceCurrency: "EUR",
      },
      {
        "@type": "Offer",
        name: "Unlimited",
        price: "8.90",
        priceCurrency: "EUR",
      },
    ],
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: "4.8",
      bestRating: "5",
      ratingCount: "12000",
    },
  };
}

export function faqPageSchema(
  items: { question: string; answer: string }[]
): JsonLd {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    })),
  };
}

export function articleSchema(
  post: {
    title: string;
    excerpt: string;
    slug: string;
    publishedAt: string | null;
    updatedAt?: string | null;
    categories: { name: string }[];
    authorName?: string;
    coverImageUrl?: string | null;
  },
  baseUrl: string
): JsonLd {
  const schema: JsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.excerpt,
    datePublished: post.publishedAt ?? undefined,
    dateModified: post.updatedAt ?? post.publishedAt ?? undefined,
    author: {
      "@type": "Person",
      name: post.authorName ?? "Koupli",
      url: `${baseUrl}/fr/a-propos`,
    },
    publisher: {
      "@type": "Organization",
      name: SEO_CONFIG.siteName,
      logo: {
        "@type": "ImageObject",
        url: `${baseUrl}/logo.png`,
      },
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `${baseUrl}/fr/blog/${post.slug}`,
    },
    inLanguage: "fr",
    keywords: post.categories.map((c) => c.name).join(", "),
    speakable: {
      "@type": "SpeakableSpecification",
      cssSelector: ["article h1", "article header p"],
    },
  };

  if (post.coverImageUrl) {
    schema.image = {
      "@type": "ImageObject",
      url: post.coverImageUrl.startsWith("http")
        ? post.coverImageUrl
        : `${baseUrl}${post.coverImageUrl}`,
    };
  }

  return schema;
}

export function breadcrumbSchema(
  items: { name: string; url: string }[]
): JsonLd {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
}
