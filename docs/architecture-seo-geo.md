# Architecture Technique — SEO & GEO (Generative Engine Optimization)

**Version :** 1.0
**Date :** 2026-03-10
**Auteur :** FORGE Architect Agent
**Statut :** VALIDÉ

---

## 1. Vue d'ensemble

```
┌─────────────────────────────────────────────────────────────────────────┐
│                     SEO / GEO LAYER                                     │
│                                                                         │
│  ┌──────────────────────┐   ┌──────────────────────┐                   │
│  │  Crawlers classiques │   │  Crawlers IA          │                   │
│  │  Googlebot           │   │  GPTBot (OpenAI)      │                   │
│  │  Bingbot             │   │  PerplexityBot        │                   │
│  │                      │   │  ClaudeBot            │                   │
│  │                      │   │  Google-Extended       │                   │
│  │                      │   │  ChatGPT-User         │                   │
│  └──────────┬───────────┘   └──────────┬────────────┘                   │
│             │                          │                                 │
│             ▼                          ▼                                 │
│  ┌──────────────────────────────────────────────────────────────────┐   │
│  │                     robots.txt                                    │   │
│  │  • Allow: / (toutes pages marketing)                             │   │
│  │  • Disallow: /*/dashboard, /*/comptes, etc. (app privée)        │   │
│  │  • Règles explicites par bot IA                                  │   │
│  │  • Sitemap: /sitemap.xml                                         │   │
│  └──────────────────────────────────────────────────────────────────┘   │
│             │                                                           │
│             ▼                                                           │
│  ┌──────────────────────────────────────────────────────────────────┐   │
│  │                     sitemap.xml                                   │   │
│  │  • 11 pages marketing × 5 locales = 55 URLs                     │   │
│  │  • Blog index + articles dynamiques                              │   │
│  │  • alternateRefs (hreflang) par entrée                           │   │
│  └──────────────────────────────────────────────────────────────────┘   │
│             │                                                           │
│             ▼                                                           │
│  ┌──────────────────────────────────────────────────────────────────┐   │
│  │              PAGES MARKETING (Server Components)                  │   │
│  │                                                                   │   │
│  │  Metadata Next.js (generateMetadata / export metadata)           │   │
│  │  ├── <title> + <meta description>                                │   │
│  │  ├── Open Graph (og:title, og:description, og:image, og:url)    │   │
│  │  ├── Twitter Cards (twitter:card, twitter:title, twitter:image)  │   │
│  │  ├── Canonical URL (alternates.canonical)                        │   │
│  │  └── Hreflang (alternates.languages)                             │   │
│  │                                                                   │   │
│  │  JSON-LD Schema (injected via <script type="application/ld+json">│   │
│  │  ├── Organization (toutes pages — marketing layout)              │   │
│  │  ├── WebSite + SearchAction (homepage)                           │   │
│  │  ├── SoftwareApplication (homepage)                              │   │
│  │  ├── FAQPage (tarifs, homepage)                                  │   │
│  │  ├── Article + Author (blog posts)                               │   │
│  │  └── BreadcrumbList (toutes pages sauf homepage)                 │   │
│  └──────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Objectifs

### 2.1 SEO traditionnel (Google, Bing)

- **Rich snippets** : FAQ, prix, étoiles via JSON-LD structuré
- **Indexation complète** : toutes les pages marketing indexées dans toutes les locales
- **Hreflang** : signaler les versions multilingues pour éviter le contenu dupliqué
- **Canonical** : une URL canonique par page pour concentrer le link juice
- **Performance** : Server Components = HTML statique, temps de chargement < 2s

### 2.2 GEO — Generative Engine Optimization (ChatGPT, Perplexity, Claude, Gemini, Copilot)

- **Citabilité** : contenu structuré en blocs autonomes extractibles par les LLMs
- **FAQ Schema** : les FAQ sont la source #1 de citations IA (+40% visibilité)
- **Statistiques sourcées** : données chiffrées avec contexte (12 000+ couples, 4,8/5, etc.)
- **Ton autoritaire + accessible** : combinaison Princeton GEO (+25% + +20%)
- **Accès crawlers IA** : robots.txt autorise explicitement tous les bots IA

---

## 3. Stack technique SEO/GEO

| Composant | Choix | Justification |
|-----------|-------|---------------|
| **Metadata** | Next.js `Metadata` API | Natif App Router, typé, SSR, gestion automatique des `<head>` tags |
| **JSON-LD** | `<script type="application/ld+json">` inline | Standard Schema.org, pas de dépendance externe |
| **Sitemap** | `src/app/sitemap.ts` (Next.js MetadataRoute) | Dynamique, inclut blog posts depuis DB |
| **Robots** | `src/app/robots.ts` (Next.js MetadataRoute) | Dynamique, règles par user-agent |
| **OG Images** | Images statiques dans `/public/og/` | Simple, rapide, pas de génération dynamique (à ajouter plus tard si besoin) |
| **Hreflang** | `alternates.languages` dans Metadata | Natif Next.js, injecte les `<link rel="alternate">` automatiquement |
| **Canonical** | `alternates.canonical` dans Metadata | Natif Next.js |

**Décision : pas de `next-seo` ni `next-sitemap`.**
Rationale : Next.js 16 Metadata API couvre 100% des besoins. Aucune dépendance externe n'est nécessaire.

---

## 4. Architecture des fichiers

### 4.1 Nouveaux fichiers

```
src/
├── lib/
│   └── seo/
│       ├── schemas.ts          ← Générateurs JSON-LD (Organization, WebSite, FAQ, etc.)
│       ├── metadata.ts         ← Helpers metadata partagés (canonical, alternates, OG)
│       └── constants.ts        ← Constantes SEO (baseUrl, siteName, social links)
│
public/
├── og/
│   ├── home.png               ← OG image homepage (1200×630)
│   ├── tarifs.png             ← OG image tarifs
│   ├── fonctionnalites.png    ← OG image fonctionnalités
│   ├── securite.png           ← OG image sécurité
│   ├── a-propos.png           ← OG image à propos
│   └── blog.png               ← OG image blog
```

### 4.2 Fichiers modifiés

```
src/app/
├── robots.ts                  ← MODIFIER : ajouter règles bots IA
├── sitemap.ts                 ← MODIFIER : ajouter toutes les pages marketing
├── layout.tsx                 ← MODIFIER : metadata enrichie globale
│
├── [locale]/
│   ├── (marketing)/
│   │   ├── layout.tsx         ← MODIFIER : injecter Organization JSON-LD
│   │   ├── page.tsx           ← MODIFIER : metadata + FAQ section + JSON-LD
│   │   ├── tarifs/page.tsx    ← MODIFIER : metadata + FAQPage JSON-LD
│   │   ├── fonctionnalites/page.tsx  ← MODIFIER : metadata enrichie
│   │   ├── securite/page.tsx  ← MODIFIER : metadata enrichie
│   │   ├── a-propos/page.tsx  ← MODIFIER : metadata enrichie
│   │   ├── blog/page.tsx      ← MODIFIER : metadata enrichie
│   │   ├── blog/[slug]/page.tsx ← MODIFIER : Article JSON-LD enrichi
│   │   ├── cgu/page.tsx       ← MODIFIER : metadata enrichie
│   │   ├── mentions-legales/page.tsx  ← MODIFIER : metadata enrichie
│   │   ├── politique-confidentialite/page.tsx ← MODIFIER : metadata enrichie
│   │   └── cookies/page.tsx   ← MODIFIER : metadata enrichie
```

---

## 5. JSON-LD Schemas — Spécifications

### 5.1 Organization (toutes pages marketing)

Injecté dans `(marketing)/layout.tsx` — présent sur CHAQUE page marketing.

```typescript
{
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "TrackMyCash",
  "url": "https://trackmycash.com",
  "logo": "https://trackmycash.com/icons/icon-512.png",
  "description": "Application de gestion financière pour couples. Suivez vos dépenses communes, équilibrez qui doit quoi et atteignez vos objectifs ensemble.",
  "foundingDate": "2025",
  "sameAs": [],  // À remplir quand les réseaux sociaux existent
  "contactPoint": {
    "@type": "ContactPoint",
    "email": "contact@trackmycash.com",
    "contactType": "customer service",
    "availableLanguage": ["French", "English", "Spanish", "Italian", "German"]
  }
}
```

### 5.2 WebSite (homepage uniquement)

```typescript
{
  "@context": "https://schema.org",
  "@type": "WebSite",
  "name": "TrackMyCash",
  "url": "https://trackmycash.com",
  "description": "Gérez vos finances de couple simplement et efficacement.",
  "inLanguage": ["fr", "en", "es", "it", "de"],
  "potentialAction": {
    "@type": "SearchAction",
    "target": "https://trackmycash.com/fr/blog?q={search_term_string}",
    "query-input": "required name=search_term_string"
  }
}
```

### 5.3 SoftwareApplication (homepage uniquement)

```typescript
{
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  "name": "TrackMyCash",
  "applicationCategory": "FinanceApplication",
  "operatingSystem": "Web, Android",
  "offers": [
    {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "EUR",
      "name": "Découverte"
    },
    {
      "@type": "Offer",
      "price": "4.90",
      "priceCurrency": "EUR",
      "name": "Couple Pro"
    },
    {
      "@type": "Offer",
      "price": "7.90",
      "priceCurrency": "EUR",
      "name": "Unlimited"
    }
  ],
  "aggregateRating": {
    "@type": "AggregateRating",
    "ratingValue": "4.8",
    "ratingCount": "12000",
    "bestRating": "5"
  }
}
```

### 5.4 FAQPage (tarifs + homepage)

```typescript
{
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "Question text",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Answer text"
      }
    }
    // ... N questions
  ]
}
```

**Page tarifs** : reprend les 4 questions existantes de `FAQ_ITEMS`.

**Homepage** : ajouter une section FAQ (5-7 questions) en bas de page avant le CTA final. Questions orientées GEO :
- "Qu'est-ce que TrackMyCash ?"
- "Comment gérer ses finances en couple ?"
- "Est-ce que TrackMyCash est gratuit ?"
- "Comment fonctionne la balance couple ?"
- "Mes données financières sont-elles sécurisées ?"
- "Quelles banques sont compatibles ?"
- "TrackMyCash est-il disponible sur mobile ?"

### 5.5 Article enrichi (blog posts)

```typescript
{
  "@context": "https://schema.org",
  "@type": "Article",
  "headline": post.title,
  "description": post.excerpt,
  "datePublished": post.publishedAt,
  "dateModified": post.updatedAt ?? post.publishedAt,
  "author": {
    "@type": "Organization",
    "name": "TrackMyCash",
    "url": "https://trackmycash.com"
  },
  "publisher": {
    "@type": "Organization",
    "name": "TrackMyCash",
    "url": "https://trackmycash.com",
    "logo": {
      "@type": "ImageObject",
      "url": "https://trackmycash.com/icons/icon-512.png"
    }
  },
  "mainEntityOfPage": {
    "@type": "WebPage",
    "@id": `${baseUrl}/fr/blog/${post.slug}`
  },
  "url": `${baseUrl}/fr/blog/${post.slug}`,
  "keywords": post.categories.map(c => c.name).join(", "),
  "inLanguage": "fr"
}
```

### 5.6 BreadcrumbList (toutes pages sauf homepage)

```typescript
{
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": [
    {
      "@type": "ListItem",
      "position": 1,
      "name": "Accueil",
      "item": "https://trackmycash.com/fr"
    },
    {
      "@type": "ListItem",
      "position": 2,
      "name": "Tarifs",  // Dynamique selon la page
      "item": "https://trackmycash.com/fr/tarifs"
    }
  ]
}
```

---

## 6. Metadata Next.js — Contrat par page

### 6.1 Template global (root layout)

```typescript
export const metadata: Metadata = {
  metadataBase: new URL("https://trackmycash.com"),
  title: {
    default: "TrackMyCash — Gestion financière de couple",
    template: "%s | TrackMyCash",
  },
  description: "Gérez vos finances de couple : dépenses communes, balance équitable, objectifs partagés. Gratuit, sécurisé, sans publicité.",
  robots: { index: true, follow: true },
  icons: {
    icon: "/icons/icon-192.png",
    apple: "/icons/icon-192.png",
  },
};
```

### 6.2 Pattern metadata par page marketing

Chaque page marketing DOIT inclure :

```typescript
export async function generateMetadata({ params }): Promise<Metadata> {
  const { locale } = await params;
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://trackmycash.com";
  const url = `${baseUrl}/${locale}/tarifs`; // Adapté par page

  return {
    title: "Tarifs — TrackMyCash",  // 50-60 chars
    description: "...",              // 150-160 chars
    alternates: {
      canonical: url,
      languages: {
        fr: `${baseUrl}/fr/tarifs`,
        en: `${baseUrl}/en/tarifs`,
        es: `${baseUrl}/es/tarifs`,
        it: `${baseUrl}/it/tarifs`,
        de: `${baseUrl}/de/tarifs`,
      },
    },
    openGraph: {
      title: "...",
      description: "...",
      url,
      type: "website",
      siteName: "TrackMyCash",
      images: [{ url: `${baseUrl}/og/tarifs.png`, width: 1200, height: 630, alt: "..." }],
    },
    twitter: {
      card: "summary_large_image",
      title: "...",
      description: "...",
      images: [`${baseUrl}/og/tarifs.png`],
    },
  };
}
```

**Décision : `generateMetadata` async plutôt que `export const metadata`.**
Rationale : Permet d'accéder à `params.locale` pour les canonical/alternates dynamiques. Les pages qui n'ont pas besoin de locale peuvent garder `export const metadata` si elles ajoutent les alternates manuellement.

### 6.3 Matrice metadata par page

| Page | Title (50-60c) | OG Image | JSON-LD | FAQ |
|------|-----------------|----------|---------|-----|
| Homepage | "TrackMyCash — Gestion financière de couple" | `/og/home.png` | Organization + WebSite + SoftwareApplication + FAQPage | 7 questions |
| Tarifs | "Tarifs — Plans gratuit, Pro et Premium" | `/og/tarifs.png` | BreadcrumbList + FAQPage | 4 questions (existantes) |
| Fonctionnalités | "Fonctionnalités — Balance couple, import, IA" | `/og/fonctionnalites.png` | BreadcrumbList | Non |
| Sécurité | "Sécurité — Protection de vos données" | `/og/securite.png` | BreadcrumbList | Non |
| À propos | "À propos — L'histoire de TrackMyCash" | `/og/a-propos.png` | BreadcrumbList | Non |
| Blog | "Blog — Finances en couple" | `/og/blog.png` | BreadcrumbList | Non |
| Blog [slug] | Dynamique (post.title) | Dynamique ou fallback | Article + BreadcrumbList | Non |
| CGU | "Conditions Générales d'Utilisation" | `/og/home.png` (fallback) | BreadcrumbList | Non |
| Mentions légales | "Mentions Légales" | `/og/home.png` (fallback) | BreadcrumbList | Non |
| Politique confidentialité | "Politique de Confidentialité" | `/og/home.png` (fallback) | BreadcrumbList | Non |
| Cookies | "Politique de Cookies" | `/og/home.png` (fallback) | BreadcrumbList | Non |

---

## 7. Sitemap — Couverture complète

### 7.1 Pages marketing (×5 locales)

```typescript
const MARKETING_PATHS = [
  "",                          // homepage
  "tarifs",
  "fonctionnalites",
  "securite",
  "a-propos",
  "cgu",
  "mentions-legales",
  "politique-confidentialite",
  "cookies",
  "connexion",
  "inscription",
] as const;
```

**Total pages statiques :** 11 × 5 locales = **55 URLs**
**Blog :** index + N articles (fr uniquement) = **~N+1 URLs**

### 7.2 alternateRefs dans le sitemap

Chaque entrée du sitemap inclut les alternates hreflang pour les 5 locales. C'est une bonne pratique pour les moteurs qui ne lisent pas les `<link rel="alternate">` dans le HTML.

### 7.3 Priorités

| Type | Priority | changeFrequency |
|------|----------|-----------------|
| Homepage | 1.0 | weekly |
| Tarifs, Fonctionnalités | 0.9 | monthly |
| Sécurité, À propos | 0.8 | monthly |
| Blog index | 0.7 | weekly |
| Blog articles | 0.6 | monthly |
| Auth (connexion, inscription) | 0.5 | monthly |
| Legal (CGU, mentions, confidentialité, cookies) | 0.3 | yearly |

---

## 8. Robots.txt — Bots IA

### 8.1 Règles actuelles (à conserver)

```
User-agent: *
Allow: /
Disallow: /*/dashboard
Disallow: /*/comptes
Disallow: /*/transactions
Disallow: /*/recurrents
Disallow: /*/previsions
Disallow: /*/conseiller
Disallow: /*/parametres
Disallow: /api/
```

### 8.2 Règles IA à ajouter

```
# Bots IA — autorisés sur pages marketing
User-agent: GPTBot
Allow: /

User-agent: ChatGPT-User
Allow: /

User-agent: PerplexityBot
Allow: /

User-agent: ClaudeBot
Allow: /

User-agent: anthropic-ai
Allow: /

User-agent: Google-Extended
Allow: /

User-agent: Bytespider
Disallow: /
```

**Décision : autoriser tous les bots IA majeurs, bloquer Bytespider (TikTok — scraping agressif, pas de valeur SEO/GEO).**

---

## 9. GEO — Contenu optimisé pour citations IA

### 9.1 Méthodes Princeton GEO appliquées

| Méthode | Boost | Application dans TrackMyCash |
|---------|-------|------------------------------|
| **Citer des sources** | +40% | Référencer Schema.org, RGPD, statistiques officielles |
| **Statistiques** | +37% | "12 000+ couples", "4,8/5", "18 formats bancaires", "< 2 min setup" |
| **Ton autoritaire** | +25% | Langage expert mais accessible sur les pages sécurité et fonctionnalités |
| **Accessibilité** | +20% | Paragraphes courts, listes, tableaux comparatifs |
| **FAQ structurées** | +40% (FAQ schema) | 7 questions homepage + 4 questions tarifs |
| **Fluency + Stats** | Maximum | Combinaison sur toutes les pages marketing |

### 9.2 Structure de contenu GEO

Chaque page marketing DOIT :
1. **Répondre directement** dans le premier paragraphe (answer-first)
2. **Utiliser des listes et tableaux** (extractibles par les LLMs)
3. **Inclure des chiffres précis** avec contexte
4. **Avoir des H2/H3 descriptifs** (pas de "En savoir plus" mais "Comment fonctionne la balance couple ?")
5. **Section FAQ** sur les pages à fort potentiel (homepage, tarifs)

### 9.3 Homepage FAQ — Questions GEO

Ces questions sont choisies pour matcher les requêtes que les utilisateurs posent aux moteurs IA :

1. **"Qu'est-ce que TrackMyCash ?"** → Définition concise + features clés
2. **"Comment gérer ses finances en couple ?"** → Processus en 3 étapes
3. **"Est-ce que TrackMyCash est gratuit ?"** → Plan gratuit + détails Pro/Premium
4. **"Comment fonctionne la balance couple ?"** → Explication du calcul automatique
5. **"Mes données financières sont-elles sécurisées ?"** → Chiffrement, pas d'accès bancaire, RGPD
6. **"Quelles banques sont compatibles avec TrackMyCash ?"** → 18 formats, liste partielle
7. **"TrackMyCash est-il disponible sur mobile ?"** → PWA + Android

---

## 10. OG Images — Stratégie

### 10.1 Phase 1 : Images statiques (ce sprint)

Créer 6 images PNG 1200×630 dans `/public/og/` :
- Fond `#F5F3FF` (violet clair cohérent avec le hero)
- Logo TrackMyCash + titre de la page
- Texte blanc sur fond primary `#4848e5` ou variante

**Outil de création :** Design manuel ou Figma. Pas de génération dynamique pour le moment.

**Fallback :** Les pages légales (CGU, mentions, etc.) réutilisent `/og/home.png`.

### 10.2 Phase 2 (futur) : OG dynamiques

Route `/api/og` avec `@vercel/og` (ImageResponse) pour les articles de blog.
Non inclus dans ce sprint — les blog posts utilisent `/og/blog.png` en fallback.

---

## 11. Helpers techniques

### 11.1 `src/lib/seo/constants.ts`

```typescript
export const SEO_CONFIG = {
  siteName: "TrackMyCash",
  baseUrl: process.env.NEXT_PUBLIC_APP_URL ?? "https://trackmycash.com",
  defaultOgImage: "/og/home.png",
  locales: ["fr", "en", "es", "it", "de"] as const,
  defaultLocale: "fr" as const,
  twitterHandle: undefined, // À ajouter quand le compte existe
} as const;
```

### 11.2 `src/lib/seo/schemas.ts`

Fonctions pures qui retournent des objets JSON-LD typés :

```typescript
export function organizationSchema(): object;
export function webSiteSchema(): object;
export function softwareApplicationSchema(): object;
export function faqPageSchema(items: { question: string; answer: string }[]): object;
export function articleSchema(post: BlogPost, baseUrl: string): object;
export function breadcrumbSchema(items: { name: string; url: string }[]): object;
```

### 11.3 `src/lib/seo/metadata.ts`

Helper pour générer les metadata avec canonical + alternates + OG :

```typescript
export function buildPageMetadata(options: {
  title: string;
  description: string;
  path: string;           // ex: "tarifs"
  locale: string;
  ogImage?: string;       // ex: "/og/tarifs.png"
}): Metadata;
```

**Ce helper centralise** la logique canonical + hreflang + OG + Twitter pour éviter la duplication dans chaque page.

---

## 12. Plan d'implémentation

### Phase A — Infrastructure SEO (fondations)

| # | Action | Fichier | Impact |
|---|--------|---------|--------|
| 1 | Créer `src/lib/seo/constants.ts` | Nouveau | Config centralisée |
| 2 | Créer `src/lib/seo/schemas.ts` | Nouveau | Générateurs JSON-LD |
| 3 | Créer `src/lib/seo/metadata.ts` | Nouveau | Helper metadata partagé |
| 4 | Enrichir `src/app/layout.tsx` | Modifier | metadataBase, title template, robots, icons |
| 5 | Enrichir `robots.ts` | Modifier | Règles bots IA |
| 6 | Enrichir `sitemap.ts` | Modifier | Toutes pages marketing × 5 locales |

### Phase B — JSON-LD & Metadata par page

| # | Action | Fichier | Impact |
|---|--------|---------|--------|
| 7 | Injecter Organization JSON-LD | `(marketing)/layout.tsx` | Présent sur toutes les pages marketing |
| 8 | Homepage : metadata + FAQ + JSON-LD | `(marketing)/page.tsx` | WebSite + SoftwareApp + FAQPage |
| 9 | Tarifs : metadata + FAQPage JSON-LD | `tarifs/page.tsx` | FAQPage schema |
| 10 | Fonctionnalités : metadata enrichie | `fonctionnalites/page.tsx` | Canonical + alternates + OG + Twitter |
| 11 | Sécurité : metadata enrichie | `securite/page.tsx` | Canonical + alternates + OG + Twitter |
| 12 | À propos : metadata enrichie | `a-propos/page.tsx` | Canonical + alternates + OG + Twitter |
| 13 | Blog index : metadata enrichie | `blog/page.tsx` | Canonical + OG + Twitter |
| 14 | Blog [slug] : Article JSON-LD enrichi | `blog/[slug]/page.tsx` | Publisher logo, dateModified, mainEntityOfPage |
| 15 | Pages légales : metadata | `cgu/`, `mentions-legales/`, etc. | Canonical + alternates |

### Phase C — Contenu GEO

| # | Action | Fichier | Impact |
|---|--------|---------|--------|
| 16 | Ajouter section FAQ homepage | `(marketing)/page.tsx` | 7 questions + FaqAccordion |
| 17 | Créer OG images placeholder | `/public/og/*.png` | 6 images statiques |

### Phase D — Tests

| # | Action | Fichier | Impact |
|---|--------|---------|--------|
| 18 | Tests schemas JSON-LD | `tests/unit/seo/schemas.test.ts` | Validation structure |
| 19 | Tests metadata helper | `tests/unit/seo/metadata.test.ts` | Vérification canonical + alternates |
| 20 | Tests sitemap couverture | `tests/unit/seo/sitemap.test.ts` | Mise à jour test existant |
| 21 | Tests robots bots IA | `tests/unit/seo/robots.test.ts` | Mise à jour test existant |

---

## 13. Métriques de succès

| Métrique | Baseline | Cible |
|----------|----------|-------|
| Pages dans sitemap | ~25 | 55+ (marketing) + N (blog) |
| Pages avec JSON-LD | 1 (blog slug) | 11+ (toutes marketing) |
| Pages avec OG image | 0 | 11 |
| Pages avec canonical + hreflang | 0 | 11 × 5 locales |
| Bots IA autorisés | 0 (implicite) | 5 (explicite) |
| FAQ avec schema | 0 | 2 (homepage + tarifs) |
| Score Rich Results Test | N/A | Pass sur homepage + tarifs + blog |

---

## 14. Trade-offs documentés

| Décision | Alternative rejetée | Raison |
|----------|---------------------|--------|
| Images OG statiques | `@vercel/og` dynamique | Complexité excessive pour le nombre de pages. Phase 2 pour le blog. |
| JSON-LD inline `<script>` | Package `next-seo` | Next.js 16 Metadata API est suffisante. Pas de dépendance externe. |
| FAQ sur homepage | Page FAQ dédiée | La homepage est la page avec le plus de trafic. La FAQ y est plus visible pour le GEO. |
| `generateMetadata` async | `export const metadata` statique | Besoin d'accéder à `params.locale` pour les alternates dynamiques. |
| Autoriser tous bots IA | Bloquer certains (ex: GPTBot) | L'objectif est la visibilité maximale sur tous les moteurs IA. |
| Pas de `next-sitemap` | `next-sitemap` package | Le `sitemap.ts` natif Next.js suffit et est plus léger. |
