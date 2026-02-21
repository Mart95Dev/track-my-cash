# STORY-011 — SEO meta tags + robots.txt + sitemap.xml

**Epic :** Landing Page Marketing
**Priorité :** P0
**Complexité :** S
**Statut :** pending
**Bloquée par :** STORY-010 (page d'accueil doit exister avant d'être référencée)

---

## User Story

En tant que moteur de recherche (Google, Bing),
je veux trouver des balises SEO correctes et un sitemap complet,
afin d'indexer les pages publiques de TrackMyCash et les afficher dans les résultats.

---

## Contexte technique

- Next.js App Router : `generateMetadata()` pour les balises meta, `sitemap.ts` pour le sitemap
- Locales disponibles : `fr`, `en`, `es`, `it`, `de` (depuis `i18n/routing.ts` ou équivalent)
- Pages publiques : `/` (landing), `/tarifs`, `/connexion`, `/inscription`
- Pages privées (`/[locale]/(app)/`) : ne doivent PAS être indexées
- next-intl : les URLs canoniques sont `/fr/`, `/en/`, etc.

---

## Acceptance Criteria

- [ ] AC-1 : La landing page a `<title>TrackMyCash — Gérez vos finances personnelles</title>` (adapté selon locale)
- [ ] AC-2 : `<meta name="description">` présent et non vide sur landing + tarifs
- [ ] AC-3 : Balises Open Graph : `og:title`, `og:description`, `og:url`, `og:type`
- [ ] AC-4 : `GET /robots.txt` retourne un fichier qui autorise `/` et bloque `/[locale]/(app)/`
- [ ] AC-5 : `GET /sitemap.xml` liste les URLs de toutes les pages publiques dans les 5 locales
- [ ] AC-6 : Le sitemap inclut `<lastmod>` avec la date du build
- [ ] AC-7 : Les pages `(app)` ont `noindex, nofollow` via le layout app ou `generateMetadata`

---

## Fichiers à créer / modifier

| Fichier | Action |
|---------|--------|
| `src/app/[locale]/(marketing)/page.tsx` | Modifier — ajouter `generateMetadata()` |
| `src/app/[locale]/(marketing)/tarifs/page.tsx` | Modifier — ajouter `generateMetadata()` |
| `src/app/robots.ts` | Créer — génère `/robots.txt` |
| `src/app/sitemap.ts` | Créer — génère `/sitemap.xml` |
| `src/app/[locale]/(app)/layout.tsx` | Modifier — ajouter `noindex` dans metadata |

---

## Tests unitaires

### TU-1 : robots.txt — règles de crawling
**Fichier :** `tests/unit/seo/robots.test.ts`

```
TU-1-1 : La fonction generateRobots() retourne un objet avec rules
TU-1-2 : User-agent: * est présent
TU-1-3 : Allow: / est présent
TU-1-4 : Disallow: /*/parametres est présent (pages app)
TU-1-5 : Sitemap URL est référencé
```

### TU-2 : sitemap.xml — entrées
**Fichier :** `tests/unit/seo/sitemap.test.ts`

```
TU-2-1 : Le sitemap contient 5 × N_pages entrées (5 locales)
TU-2-2 : L'URL `/fr/` est présente
TU-2-3 : L'URL `/en/tarifs` est présente
TU-2-4 : Aucune URL de type /[locale]/parametres ou /[locale]/transactions
TU-2-5 : Chaque entrée a un `lastmod`
```

---

## Fixtures / données de test

```typescript
// Pages publiques attendues dans le sitemap
const PUBLIC_PATHS = ["", "tarifs", "connexion", "inscription"];
const LOCALES = ["fr", "en", "es", "it", "de"];
// Total attendu : 4 × 5 = 20 entrées
```

---

## Estimation

**Points :** 2
**Durée estimée :** 1-2h
