# STORY-020 — Pages d'erreur (404, 500, error.tsx)

**Epic :** UX & Stabilité
**Priorité :** P0
**Complexité :** S
**Statut :** pending
**Bloquée par :** STORY-019

## User Story

En tant que visiteur qui accède à une URL invalide ou subit une erreur serveur, je veux voir une page d'erreur claire et professionnelle, afin de comprendre ce qui s'est passé et pouvoir naviguer vers une page fonctionnelle.

## Contexte technique

Next.js App Router gère les erreurs via des fichiers de convention :
- `not-found.tsx` — Rendu quand `notFound()` est appelé ou URL introuvable
- `error.tsx` — Boundary d'erreur React pour les erreurs runtime (`"use client"` obligatoire)
- `loading.tsx` — Squelette de chargement (STORY-023)

Les fichiers `[locale]/not-found.tsx` héritent du layout du segment parent. Pour le groupe `(app)`, le layout inclut la sidebar — pas idéal pour une 404. Placer `not-found.tsx` au niveau `[locale]/` pour un layout minimal.

## Fichiers à créer

- `src/app/[locale]/not-found.tsx` — Page 404 localisée
- `src/app/[locale]/error.tsx` — Boundary d'erreur (`"use client"`)
- `src/app/not-found.tsx` — Fallback global (hors locale, pour les URLs `/api/...` invalides)

## Acceptance Criteria

- AC-1 : Naviguer vers `/fr/page-inexistante` affiche la page 404 personnalisée
- AC-2 : La page 404 contient : titre H1, description, lien "Retour à l'accueil" (`/`), lien "Tableau de bord"
- AC-3 : `error.tsx` implémente l'interface `{ error: Error & { digest?: string }, reset: () => void }`
- AC-4 : Le bouton "Réessayer" appelle `reset()` pour tenter de récupérer l'erreur
- AC-5 : Les pages n'utilisent pas la sidebar de l'application (layout minimal)
- AC-6 : Les textes utilisent `useTranslations("errors")` (nouvelles clés à ajouter dans `messages/fr.json`, `messages/en.json`)
- AC-7 : La page 404 globale (`/app/not-found.tsx`) existe comme fallback minimal

## Tests à créer

`tests/unit/seo/errors.test.ts` (3 tests) :
- TU-1-1 : `not-found` est un Server Component avec un `<h1>` (test SSR via import)
- TU-1-2 : La page 404 est accessible sans authentification
- TU-1-3 : `error.tsx` exporte un composant `"use client"` avec les props `error` et `reset`

## Clés i18n à ajouter

```json
"errors": {
  "notFound": {
    "title": "Page introuvable",
    "description": "Cette page n'existe pas ou a été déplacée.",
    "backHome": "Retour à l'accueil",
    "dashboard": "Tableau de bord"
  },
  "serverError": {
    "title": "Une erreur est survenue",
    "description": "Quelque chose s'est mal passé. Veuillez réessayer.",
    "retry": "Réessayer"
  }
}
```

## Estimation : 2 points / 1-2h
