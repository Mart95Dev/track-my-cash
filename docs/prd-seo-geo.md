# PRD — Sprint SEO & GEO (Generative Engine Optimization)

**Version :** 1.0
**Date :** 2026-03-10
**Auteur :** FORGE PM Agent
**Statut :** VALIDÉ
**Architecture :** `docs/architecture-seo-geo.md`

---

## 0. Agent Onboarding Protocol

1. Lire `docs/architecture-seo-geo.md` en entier avant de coder
2. Les schémas JSON-LD sont des **fonctions pures** dans `src/lib/seo/schemas.ts` — testables unitairement
3. Le helper `buildPageMetadata()` centralise la logique metadata — ne pas dupliquer dans chaque page
4. Les OG images sont des **placeholders statiques** — pas de génération dynamique dans ce sprint
5. Convention : `generateMetadata` async (pas `export const metadata`) dès qu'on accède à `params.locale`
6. Les FAQ items sont définis comme data constantes dans la page, pas de table DB

---

## 1. Vision & Objectif

### Problème

TrackMyCash a 11 pages marketing mais :
- **0 JSON-LD** sur les pages (sauf blog articles)
- **0 OG images** — partage social sans visuel
- **0 canonical/hreflang** — risque de contenu dupliqué avec 5 locales
- **Sitemap incomplet** — 7 pages marketing absentes
- **robots.txt** ne mentionne aucun bot IA — visibilité GEO non optimisée
- **0 FAQ schema** — opportunité GEO manquée (+40% citations IA)

### Objectif

Positionner TrackMyCash en **première page Google** sur les requêtes cibles et être **cité par les moteurs IA** (ChatGPT, Perplexity, Claude, Gemini) quand un utilisateur demande "comment gérer ses finances en couple" ou "application budget couple".

### Requêtes cibles

| Requête | Langue | Volume estimé | Difficulté |
|---------|--------|---------------|------------|
| "application budget couple" | FR | Moyen | Moyenne |
| "gérer ses finances en couple" | FR | Élevé | Moyenne |
| "partager les dépenses couple" | FR | Moyen | Faible |
| "couple finance app" | EN | Élevé | Élevée |
| "balance dépenses couple" | FR | Faible | Faible |
| "qui doit quoi couple" | FR | Moyen | Faible |

---

## 2. Personas

| Persona | Description | Requête type |
|---------|-------------|--------------|
| **Couple chercheur** | Couple 25-40 ans qui cherche une solution pour gérer l'argent à deux | "application budget couple gratuite" |
| **Utilisateur IA** | Personne qui demande à ChatGPT/Perplexity une recommandation | "quelle app pour gérer les finances en couple ?" |
| **Partageur social** | Utilisateur qui partage un lien TrackMyCash sur WhatsApp/Twitter/LinkedIn | Veut un beau preview card |
| **Moteur de recherche** | Googlebot, Bingbot — indexation classique | Sitemap + meta + structured data |
| **Moteur IA** | GPTBot, PerplexityBot, ClaudeBot | Contenu structuré, FAQ schema, statistiques |

---

## 3. Exigences fonctionnelles — User Stories

### STORY-158 : Infrastructure SEO — Modules utilitaires
**Priorité : Must Have (P0)**

> En tant que développeur, je veux des modules `src/lib/seo/` (constants, schemas, metadata) pour centraliser toute la logique SEO et éviter la duplication.

**Critères d'acceptation :**

- AC-1: `src/lib/seo/constants.ts` exporte `SEO_CONFIG` avec `siteName`, `baseUrl`, `defaultOgImage`, `locales`, `defaultLocale`
- AC-2: `src/lib/seo/schemas.ts` exporte 6 fonctions pures : `organizationSchema()`, `webSiteSchema()`, `softwareApplicationSchema()`, `faqPageSchema(items)`, `articleSchema(post)`, `breadcrumbSchema(items)`
- AC-3: Chaque fonction retourne un objet conforme Schema.org (champ `@context` et `@type` présents)
- AC-4: `src/lib/seo/metadata.ts` exporte `buildPageMetadata({ title, description, path, locale, ogImage? })` qui retourne un objet `Metadata` Next.js complet avec canonical, alternates (5 locales), OG, Twitter
- AC-5: Aucune dépendance externe ajoutée (pas de `next-seo`, etc.)

**Gherkin :**

```gherkin
Given le module schemas.ts est importé
When j'appelle organizationSchema()
Then le résultat contient "@context": "https://schema.org" ET "@type": "Organization" ET "name": "TrackMyCash"

Given le module metadata.ts est importé
When j'appelle buildPageMetadata({ title: "Tarifs", description: "...", path: "tarifs", locale: "fr" })
Then le résultat contient alternates.canonical == "https://trackmycash.com/fr/tarifs"
And alternates.languages a 5 entrées (fr, en, es, it, de)
And openGraph.siteName == "TrackMyCash"
And twitter.card == "summary_large_image"
```

**Tests :** 12 tests unitaires (2 par fonction schema + 2 pour metadata helper)

---

### STORY-159 : Robots.txt — Autoriser les bots IA
**Priorité : Must Have (P0)**

> En tant que moteur IA (GPTBot, PerplexityBot, ClaudeBot), je veux être explicitement autorisé dans robots.txt pour pouvoir crawler et citer les pages marketing de TrackMyCash.

**Critères d'acceptation :**

- AC-1: `robots.ts` déclare des règles explicites pour GPTBot, ChatGPT-User, PerplexityBot, ClaudeBot, anthropic-ai, Google-Extended avec `Allow: /`
- AC-2: Bytespider est bloqué (`Disallow: /`)
- AC-3: Les règles existantes (`*` → disallow pages app) sont conservées
- AC-4: La référence au sitemap est conservée

**Gherkin :**

```gherkin
Given le fichier robots.txt est généré
When un crawler GPTBot le lit
Then il voit "User-agent: GPTBot" avec "Allow: /"

Given le fichier robots.txt est généré
When Bytespider le lit
Then il voit "User-agent: Bytespider" avec "Disallow: /"

Given le fichier robots.txt est généré
Then les règles disallow pour /*/dashboard, /*/comptes, etc. sont présentes
And le champ Sitemap pointe vers /sitemap.xml
```

**Tests :** 5 tests (mise à jour du fichier existant `tests/unit/seo/robots.test.ts`)

---

### STORY-160 : Sitemap complet — Toutes pages × 5 locales
**Priorité : Must Have (P0)**

> En tant que moteur de recherche, je veux un sitemap.xml complet avec toutes les pages marketing dans les 5 locales pour indexer l'intégralité du site.

**Critères d'acceptation :**

- AC-1: Le sitemap inclut 11 chemins marketing (home, tarifs, fonctionnalites, securite, a-propos, cgu, mentions-legales, politique-confidentialite, cookies, connexion, inscription)
- AC-2: Chaque chemin est décliné dans les 5 locales (fr, en, es, it, de) = 55 URLs minimum
- AC-3: Les priorités sont différenciées : homepage 1.0, tarifs/fonctionnalités 0.9, sécurité/à propos 0.8, auth 0.5, légal 0.3
- AC-4: Le blog (index + articles) reste en fr uniquement
- AC-5: `changeFrequency` est adapté par type de page (weekly/monthly/yearly)

**Gherkin :**

```gherkin
Given le sitemap.xml est généré
Then il contient au moins 55 URLs de pages marketing
And chaque URL marketing existe dans les 5 variantes de locale

Given le sitemap.xml est généré
Then la homepage /fr a priority 1.0
And les pages légales ont priority 0.3
And les pages auth ont priority 0.5
```

**Tests :** 6 tests (mise à jour `tests/unit/seo/sitemap.test.ts`)

---

### STORY-161 : Root Layout — Metadata globale enrichie
**Priorité : Must Have (P0)**

> En tant que page de l'application, je veux hériter d'une metadata globale enrichie (metadataBase, title template, robots, icons) pour assurer une base SEO solide.

**Critères d'acceptation :**

- AC-1: `metadataBase` est défini avec `new URL("https://trackmycash.com")`
- AC-2: `title` utilise un template `{ default: "TrackMyCash — Gestion financière de couple", template: "%s | TrackMyCash" }`
- AC-3: `description` est optimisée SEO (150-160 chars, mots-clés cibles)
- AC-4: `robots` est `{ index: true, follow: true }`
- AC-5: `icons` pointe vers les icônes PWA existantes

**Gherkin :**

```gherkin
Given le root layout est rendu
Then le <title> par défaut est "TrackMyCash — Gestion financière de couple"
And une page enfant avec title "Tarifs" génère "Tarifs | TrackMyCash"
```

**Tests :** 2 tests unitaires

---

### STORY-162 : Marketing Layout — Organization JSON-LD
**Priorité : Must Have (P0)**

> En tant que moteur de recherche et moteur IA, je veux trouver un schema Organization sur chaque page marketing pour comprendre l'identité de TrackMyCash.

**Critères d'acceptation :**

- AC-1: Le marketing layout injecte un `<script type="application/ld+json">` avec le schema Organization
- AC-2: Le schema inclut : name, url, logo, description, foundingDate, contactPoint
- AC-3: Le schema est validé par le Rich Results Test de Google
- AC-4: Le layout conserve ses composants existants (Navbar, Footer, CookieBanner)

**Gherkin :**

```gherkin
Given une page marketing est rendue (ex: /fr/tarifs)
Then le HTML contient un <script type="application/ld+json">
And le JSON parsé a "@type": "Organization"
And le JSON parsé a "name": "TrackMyCash"
And le JSON parsé a "logo" qui pointe vers une URL valide
```

**Tests :** 3 tests unitaires

---

### STORY-163 : Homepage — Metadata + FAQ + JSON-LD complet
**Priorité : Must Have (P0)**

> En tant que visiteur de la homepage, je veux une page optimisée SEO/GEO avec des schemas WebSite, SoftwareApplication et FAQPage pour maximiser la visibilité sur Google et les moteurs IA.

**Critères d'acceptation :**

- AC-1: `generateMetadata` async retourne title, description, canonical, alternates (5 locales), OG (avec image `/og/home.png`), Twitter card
- AC-2: La page injecte 3 scripts JSON-LD : WebSite, SoftwareApplication, FAQPage
- AC-3: Le schema SoftwareApplication inclut les 3 offres tarifaires (0€, 4,90€, 7,90€) et l'aggregateRating (4.8/5)
- AC-4: Une section FAQ visible est ajoutée avec 7 questions orientées GEO, utilisant le composant `FaqAccordion` existant
- AC-5: Le schema FAQPage correspond exactement aux 7 questions affichées
- AC-6: Les 7 questions couvrent : définition, méthode, gratuité, balance, sécurité, compatibilité, mobile
- AC-7: Les descriptions multi-langues existantes sont conservées

**Gherkin :**

```gherkin
Given la homepage /fr est rendue
Then le HTML contient 3 <script type="application/ld+json">
And l'un a "@type": "WebSite" avec potentialAction SearchAction
And l'un a "@type": "SoftwareApplication" avec 3 offers
And l'un a "@type": "FAQPage" avec 7 mainEntity

Given la homepage est rendue
Then une section FAQ visible contient 7 questions
And chaque question a une réponse textuelle non vide
And le composant FaqAccordion est utilisé
```

**Tests :** 10 tests (schemas + FAQ data + metadata)

---

### STORY-164 : Tarifs — FAQPage JSON-LD
**Priorité : Must Have (P0)**

> En tant que moteur de recherche, je veux un schema FAQPage sur la page tarifs pour afficher les Rich Snippets FAQ dans les résultats de recherche.

**Critères d'acceptation :**

- AC-1: `generateMetadata` async remplace `export const metadata` avec canonical, alternates, OG (image `/og/tarifs.png`), Twitter
- AC-2: Un script JSON-LD FAQPage est injecté avec les 4 questions existantes de `FAQ_ITEMS`
- AC-3: Un script JSON-LD BreadcrumbList est injecté (Accueil → Tarifs)
- AC-4: Le contenu existant de la page (PlanCards, comparatif, FaqAccordion) est inchangé

**Gherkin :**

```gherkin
Given la page /fr/tarifs est rendue
Then le HTML contient un FAQPage JSON-LD avec 4 questions
And le HTML contient un BreadcrumbList JSON-LD avec 2 items
And les PlanCards et le tableau comparatif sont toujours visibles
```

**Tests :** 5 tests

---

### STORY-165 : Pages marketing — Metadata enrichie (fonctionnalités, sécurité, à propos)
**Priorité : Should Have (P1)**

> En tant que page marketing, je veux une metadata complète (canonical, alternates, OG, Twitter, BreadcrumbList) pour être correctement indexée et partagée.

**Critères d'acceptation :**

- AC-1: Les pages fonctionnalités, sécurité et à propos utilisent `generateMetadata` async
- AC-2: Chaque page a un canonical, des alternates pour 5 locales, OG image dédiée, Twitter card
- AC-3: Chaque page injecte un BreadcrumbList JSON-LD (Accueil → Nom de page)
- AC-4: Le contenu existant est inchangé
- AC-5: Les titles sont optimisés (50-60 chars) avec mots-clés cibles

**Gherkin :**

```gherkin
Given la page /fr/fonctionnalites est rendue
Then la metadata contient alternates.canonical
And alternates.languages a 5 entrées
And openGraph.images[0] pointe vers /og/fonctionnalites.png
And le HTML contient un BreadcrumbList JSON-LD

Given la page /de/securite est rendue
Then alternates.canonical == "https://trackmycash.com/de/securite"
```

**Tests :** 6 tests (2 par page)

---

### STORY-166 : Pages légales + blog — Metadata enrichie
**Priorité : Should Have (P1)**

> En tant que page secondaire (CGU, mentions légales, confidentialité, cookies, blog index), je veux une metadata minimale mais correcte avec canonical et alternates.

**Critères d'acceptation :**

- AC-1: Les 4 pages légales et le blog index utilisent `generateMetadata` async
- AC-2: Chaque page a un canonical et des alternates (5 locales)
- AC-3: OG image = fallback `/og/home.png` pour les légales, `/og/blog.png` pour le blog
- AC-4: Chaque page injecte un BreadcrumbList JSON-LD
- AC-5: Les pages légales ont `robots: { index: true, follow: true }` (indexables mais basse priorité)

**Gherkin :**

```gherkin
Given la page /fr/cgu est rendue
Then la metadata a un canonical
And alternates.languages a 5 entrées
And openGraph.images[0] pointe vers /og/home.png

Given la page /fr/blog est rendue
Then openGraph.images[0] pointe vers /og/blog.png
And le HTML contient un BreadcrumbList JSON-LD avec "Blog"
```

**Tests :** 5 tests

---

### STORY-167 : Blog articles — Article JSON-LD enrichi
**Priorité : Should Have (P1)**

> En tant qu'article de blog, je veux un schema Article enrichi (publisher logo, dateModified, mainEntityOfPage) et un BreadcrumbList pour maximiser mes chances d'apparaître en Rich Snippet.

**Critères d'acceptation :**

- AC-1: Le schema Article inclut `publisher.logo` (ImageObject), `dateModified`, `mainEntityOfPage`, `inLanguage: "fr"`
- AC-2: Un BreadcrumbList JSON-LD est ajouté (Accueil → Blog → Titre article)
- AC-3: La metadata OG inclut `og:type: "article"`, `article:published_time`, `article:tag`
- AC-4: La metadata Twitter utilise `summary_large_image`
- AC-5: Le contenu existant (sanitized HTML, CTA, back link) est inchangé

**Gherkin :**

```gherkin
Given un article de blog est rendu
Then le schema Article contient "publisher" avec "logo" de type "ImageObject"
And le schema Article contient "mainEntityOfPage" avec "@type": "WebPage"
And le HTML contient un BreadcrumbList avec 3 items (Accueil, Blog, Titre)
```

**Tests :** 4 tests

---

### STORY-168 : OG Images — Placeholders statiques
**Priorité : Could Have (P2)**

> En tant que partageur social, je veux que le lien TrackMyCash affiche un beau preview avec une image de marque quand je le partage sur WhatsApp, Twitter ou LinkedIn.

**Critères d'acceptation :**

- AC-1: 6 images PNG sont présentes dans `/public/og/` : home.png, tarifs.png, fonctionnalites.png, securite.png, a-propos.png, blog.png
- AC-2: Chaque image fait 1200×630 pixels
- AC-3: Les images utilisent les couleurs de la marque (primary #4848e5, background #F5F3FF)
- AC-4: Chaque image inclut le nom "TrackMyCash" et le titre de la page

**Gherkin :**

```gherkin
Given les images OG sont déployées
When un lien TrackMyCash est partagé sur WhatsApp/Twitter
Then un preview card s'affiche avec l'image OG correspondante
And l'image fait 1200×630 pixels
```

**Tests :** 1 test (vérification existence des fichiers)

---

## 4. Exigences non-fonctionnelles (NFRs)

| # | Catégorie | Exigence | Métrique |
|---|-----------|----------|----------|
| NFR-1 | **Performance** | Les pages marketing se chargent en < 2s (LCP) | Lighthouse score > 90 |
| NFR-2 | **Validité** | Tous les schemas JSON-LD passent le Google Rich Results Test | 0 erreurs, 0 warnings |
| NFR-3 | **Couverture** | 100% des pages marketing ont canonical + alternates | 11/11 pages |
| NFR-4 | **Couverture** | 100% des pages marketing ont OG + Twitter meta | 11/11 pages |
| NFR-5 | **Compatibilité** | Les schemas sont valides sur schema.org/validator | Validation pass |
| NFR-6 | **Maintenance** | Les titles font 50-60 chars, les descriptions 150-160 chars | Respect des limites |
| NFR-7 | **Non-régression** | Les tests existants (1789 baseline) continuent de passer | 0 échec |
| NFR-8 | **Zéro dépendance** | Aucun package npm ajouté pour le SEO | package.json inchangé |
| NFR-9 | **Accessibilité bots** | 5 bots IA majeurs explicitement autorisés dans robots.txt | GPTBot, PerplexityBot, ClaudeBot, ChatGPT-User, Google-Extended |
| NFR-10 | **Sitemap** | Toutes les URLs marketing × 5 locales dans le sitemap | ≥ 55 URLs |

---

## 5. Hors périmètre (Won't Have)

| Item | Raison |
|------|--------|
| OG images dynamiques (`@vercel/og`) | Phase 2 — quand le blog aura plus de contenu |
| Google Search Console configuration | Tâche ops, pas de code |
| Bing Webmaster Tools configuration | Tâche ops |
| Google Analytics / GA4 setup | Sprint dédié analytics |
| Suivi trafic IA (referrer tracking) | Sprint dédié analytics |
| Contenu traduit des pages marketing | Sprint i18n dédié — les pages sont en français avec URLs localisées |
| Page FAQ dédiée (`/faq`) | La FAQ est intégrée dans homepage et tarifs pour le GEO |
| Schema Review (étoiles) | Pas assez de vrais avis utilisateurs pour le moment |
| `next-seo` ou `next-sitemap` packages | Next.js 16 Metadata API suffit |
| Blog multilingue | Le blog reste en FR uniquement |

---

## 6. Métriques de succès

| Métrique | Baseline actuelle | Cible post-sprint |
|----------|-------------------|-------------------|
| Pages dans sitemap | ~25 | 55+ marketing + N blog |
| Pages avec JSON-LD | 1 (blog slug) | 13+ (toutes marketing + blog) |
| Pages avec OG image | 0 | 11 |
| Pages avec canonical + hreflang | 0 | 55 (11 pages × 5 locales) |
| Bots IA autorisés (explicite) | 0 | 5 |
| FAQ avec schema markup | 0 | 2 (homepage + tarifs, 11 questions total) |
| Rich Results Test | N/A | Pass homepage + tarifs + blog |
| Tests ajoutés | 0 | ~55 tests SEO |

---

## 7. Ordre d'implémentation recommandé

```
Phase A — Fondations (STORY-158, 159, 160, 161)
   ↓
Phase B — Pages principales (STORY-162, 163, 164)
   ↓
Phase C — Pages secondaires (STORY-165, 166, 167)
   ↓
Phase D — Assets (STORY-168)
```

**Stories parallélisables :**
- STORY-158 + STORY-159 + STORY-160 + STORY-161 (Phase A — aucune dépendance mutuelle)
- STORY-165 + STORY-166 + STORY-167 (Phase C — pages indépendantes, dépendent de STORY-158)

**Dépendances :**
- STORY-162 dépend de STORY-158 (utilise `organizationSchema()`)
- STORY-163 dépend de STORY-158 (utilise `buildPageMetadata()`, `webSiteSchema()`, `faqPageSchema()`)
- STORY-164 dépend de STORY-158 (utilise `buildPageMetadata()`, `faqPageSchema()`, `breadcrumbSchema()`)
- STORY-168 n'a aucune dépendance code (assets statiques)

---

## 8. Résumé des stories

| Story | Titre | Priorité | Points | Phase |
|-------|-------|----------|--------|-------|
| STORY-158 | Infrastructure SEO — Modules utilitaires | P0 Must | 5 | A |
| STORY-159 | Robots.txt — Bots IA | P0 Must | 2 | A |
| STORY-160 | Sitemap complet × 5 locales | P0 Must | 3 | A |
| STORY-161 | Root Layout — Metadata globale | P0 Must | 2 | A |
| STORY-162 | Marketing Layout — Organization JSON-LD | P0 Must | 3 | B |
| STORY-163 | Homepage — Metadata + FAQ + JSON-LD | P0 Must | 8 | B |
| STORY-164 | Tarifs — FAQPage JSON-LD | P0 Must | 3 | B |
| STORY-165 | Pages marketing — Metadata enrichie | P1 Should | 5 | C |
| STORY-166 | Pages légales + blog — Metadata | P1 Should | 3 | C |
| STORY-167 | Blog articles — Article JSON-LD enrichi | P1 Should | 3 | C |
| STORY-168 | OG Images — Placeholders statiques | P2 Could | 2 | D |
| | **TOTAL** | | **39 pts** | |
