# STORY-023 — Skeleton screens (loading states)

**Epic :** UX & Stabilité
**Priorité :** P2
**Complexité :** S
**Statut :** pending
**Bloquée par :** STORY-022

## User Story

En tant qu'utilisateur naviguant entre les pages, je veux voir un squelette animé pendant le chargement, afin de percevoir une interface réactive plutôt qu'un écran blanc.

## Contexte technique

Next.js App Router supporte `loading.tsx` en convention de fichier. Ce fichier est automatiquement rendu comme Suspense boundary pendant le streaming du Server Component parent.

Le composant `Skeleton` de shadcn/ui est déjà disponible (`src/components/ui/skeleton.tsx`).

## Fichiers à créer

- `src/app/[locale]/(app)/dashboard/loading.tsx`
- `src/app/[locale]/(app)/transactions/loading.tsx`
- `src/app/[locale]/(app)/comptes/loading.tsx`
- `src/components/ui/skeleton-card.tsx` — Composant de carte skeleton réutilisable

## Structure des skeletons

**Dashboard :** 3 cards métriques + 1 card graphique + 1 card balances
**Transactions :** Header filtre + 10 lignes skeleton (date + description + montant)
**Comptes :** 3 cards de compte skeleton

## Acceptance Criteria

- AC-1 : Naviguer vers `/dashboard` affiche un skeleton avant le contenu
- AC-2 : Naviguer vers `/transactions` affiche un skeleton avant le contenu
- AC-3 : Naviguer vers `/comptes` affiche un skeleton avant le contenu
- AC-4 : Le composant `Skeleton` de shadcn/ui est utilisé (classe `animate-pulse`)
- AC-5 : Les skeletons reproduisent fidèlement la structure visuelle des pages
- AC-6 : Pas de flash de contenu vide entre le skeleton et le contenu réel

## Tests à créer

`tests/unit/components/skeleton-card.test.tsx` (3 tests) :
- TU-1-1 : `SkeletonCard` rend sans erreur
- TU-1-2 : La classe `animate-pulse` est présente
- TU-1-3 : Le nombre de lignes skeleton est configurable via prop `lines`

## Estimation : 3 points / 2h
