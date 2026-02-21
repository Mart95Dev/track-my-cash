# STORY-021 — Empty states avec guidance contextuelle

**Epic :** UX & Stabilité
**Priorité :** P1
**Complexité :** S
**Statut :** pending
**Bloquée par :** STORY-020

## User Story

En tant que nouvel utilisateur dont le compte est vide, je veux voir des messages d'aide contextuels à la place des listes vides, afin de savoir exactement quelle action effectuer ensuite.

## Contexte technique

Les pages sont des Server Components qui passent les données directement aux composants. Un empty state se détecte quand le tableau de données est vide (ex: `accounts.length === 0`).

Composant réutilisable à créer :
```tsx
<EmptyState
  icon={<PlusCircle />}
  title="Aucun compte bancaire"
  description="Commencez par créer votre premier compte pour suivre vos finances."
  action={{ label: "Créer un compte", href: "/comptes" }}
/>
```

## Pages concernées et CTA

| Page | Condition vide | Icône | CTA |
|------|----------------|-------|-----|
| Dashboard (aucun compte) | `accounts.length === 0` | `LayoutDashboard` | "Créer mon premier compte" → `/comptes` |
| `/comptes` (aucun compte) | `accounts.length === 0` | `Landmark` | "Ajouter un compte" (ouvre le dialog) |
| `/transactions` (aucune transaction) | `transactions.length === 0` | `ArrowDownUp` | "Importer un relevé" → dialog import |
| `/recurrents` (aucun récurrent) | `recurrents.length === 0` | `RefreshCw` | "Ajouter un paiement récurrent" (ouvre le dialog) |
| `/previsions` (aucun récurrent) | `recurrents.length === 0` | `TrendingUp` | "Configurer vos récurrents" → `/recurrents` |

## Fichiers à créer / modifier

- `src/components/ui/empty-state.tsx` — Composant réutilisable
- `src/app/[locale]/(app)/dashboard/page.tsx` — Ajouter empty state si `data.accounts.length === 0`
- `src/app/[locale]/(app)/comptes/page.tsx` — Ajouter empty state
- `src/app/[locale]/(app)/transactions/page.tsx` — Ajouter empty state
- `src/app/[locale]/(app)/recurrents/page.tsx` — Ajouter empty state
- `src/app/[locale]/(app)/previsions/page.tsx` — Ajouter empty state

## Acceptance Criteria

- AC-1 : Un composant `EmptyState` réutilisable existe dans `src/components/ui/`
- AC-2 : Le dashboard affiche l'empty state si aucun compte (pas de liste vide)
- AC-3 : Chaque empty state a : icône Lucide + titre + description + bouton/lien CTA
- AC-4 : Les textes passent par les traductions (`useTranslations` / `getTranslations`)
- AC-5 : Le composant est responsive (centré, mobile-first)
- AC-6 : Pas de dépendances supplémentaires (Lucide déjà installé, shadcn/ui disponible)

## Tests à créer

`tests/unit/components/empty-state.test.tsx` (4 tests) :
- TU-1-1 : Affiche le titre passé en prop
- TU-1-2 : Affiche le bouton CTA avec le bon label
- TU-1-3 : Le CTA est un lien (`<a>` ou `<Link>`) si `href` fourni
- TU-1-4 : La description est affichée

## Estimation : 3 points / 2h
