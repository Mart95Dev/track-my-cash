# STORY-167 — Blog articles — Article JSON-LD enrichi

**Epic :** SEO/GEO
**Priorité :** P1 (Should Have)
**Complexité :** S (3 pts)
**Blocked By :** STORY-158

## Description

Enrichir le schema Article existant sur les articles de blog avec publisher logo, dateModified, mainEntityOfPage, inLanguage. Ajouter un BreadcrumbList JSON-LD (Accueil → Blog → Titre). Ajouter Twitter card dans la metadata.

## Fichiers à modifier

- `src/app/[locale]/(marketing)/blog/[slug]/page.tsx`
- `tests/unit/seo/blog-article-seo.test.ts` (nouveau)

## Critères d'acceptation

- **AC-1:** Schema Article inclut `publisher.logo` (ImageObject), `dateModified`, `mainEntityOfPage`, `inLanguage: "fr"`
- **AC-2:** BreadcrumbList JSON-LD ajouté (Accueil → Blog → Titre article)
- **AC-3:** Metadata OG inclut `og:type: "article"`, `article:published_time`, `article:tag`
- **AC-4:** Twitter card `summary_large_image` ajoutée
- **AC-5:** Contenu existant inchangé (sanitized HTML, CTA, back link)
- **AC-6:** Le schema utilise `articleSchema()` de `src/lib/seo/schemas.ts`

## Spécifications de tests

### Tests unitaires — `tests/unit/seo/blog-article-seo.test.ts`

| ID | Test | Assertion |
|----|------|-----------|
| TU-1 | articleSchema inclut publisher logo | `publisher.logo.@type === "ImageObject"` |
| TU-2 | articleSchema inclut mainEntityOfPage | `mainEntityOfPage.@type === "WebPage"` |
| TU-3 | articleSchema inclut inLanguage | `inLanguage === "fr"` |
| TU-4 | BreadcrumbList a 3 items | Accueil, Blog, titre de l'article |
