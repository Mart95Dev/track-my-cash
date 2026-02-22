# STORY-056 — Skeleton screens (loading states)

**Sprint :** Production SaaS & Croissance (v8)
**Épique :** ux-polish
**Priorité :** P2
**Complexité :** XS (1 point)
**Statut :** pending
**Bloqué par :** —

---

## Description

Les pages principales (dashboard, transactions, comptes) chargent leurs données côté serveur via Server Components. Entre la navigation et l'affichage, l'écran est blanc ou vide — cela donne une impression de lenteur. Les fichiers `loading.tsx` de Next.js permettent d'afficher des squelettes animés pendant le streaming des données.

**Périmètre :** Dashboard, Transactions, Comptes uniquement (les pages les plus visitées).

---

## Acceptance Criteria

- **AC-1 :** `loading.tsx` créé pour le dashboard (`/[locale]/(app)/page.tsx`)
- **AC-2 :** `loading.tsx` créé pour la page transactions (`/[locale]/(app)/transactions/`)
- **AC-3 :** `loading.tsx` créé pour la page comptes (`/[locale]/(app)/comptes/`)
- **AC-4 :** Composant `SkeletonCard` réutilisable créé dans `src/components/ui/skeleton-card.tsx`
- **AC-5 :** Les skeletons utilisent le composant `Skeleton` de shadcn/ui (déjà disponible)
- **AC-6 :** La navigation n'est pas incluse dans les fichiers `loading.tsx` (elle est dans le layout parent)

---

## Fichiers à créer / modifier

| Fichier | Action |
|---------|--------|
| `src/app/[locale]/(app)/loading.tsx` | CRÉER — skeleton dashboard |
| `src/app/[locale]/(app)/transactions/loading.tsx` | CRÉER — skeleton liste transactions |
| `src/app/[locale]/(app)/comptes/loading.tsx` | CRÉER — skeleton liste comptes |
| `src/components/ui/skeleton-card.tsx` | CRÉER — composant SkeletonCard réutilisable |
| `tests/unit/components/skeleton-card.test.tsx` | CRÉER — tests unitaires |

---

## Tests unitaires (TU-x)

**Fichier :** `tests/unit/components/skeleton-card.test.tsx`

### Cas de test

| ID | Description | Résultat attendu |
|----|-------------|-----------------|
| TU-56-1 | `<SkeletonCard />` rend sans erreur (props par défaut) | Pas de throw |
| TU-56-2 | `<SkeletonCard lines={3} />` rend 3 lignes de skeleton | `queryAllByTestId("skeleton-line").length === 3` |
| TU-56-3 | `<SkeletonCard title />` rend une ligne de titre | `queryByTestId("skeleton-title")` présent |
| TU-56-4 | `loading.tsx` dashboard exporte un composant valide | Import + render sans erreur |

---

## Mapping AC → Tests

| AC | Tests couvrant |
|----|---------------|
| AC-1 | TU-56-4 |
| AC-2 | Rendering loading.tsx transactions |
| AC-3 | Rendering loading.tsx comptes |
| AC-4 | TU-56-1 + TU-56-2 + TU-56-3 |
| AC-5 | Usage de `Skeleton` vérifié à la revue |
| AC-6 | Structure des fichiers (revue) |

---

## Interface TypeScript

```typescript
// src/components/ui/skeleton-card.tsx

type SkeletonCardProps = {
  title?: boolean;   // affiche une ligne de titre plus large (défaut: true)
  lines?: number;    // nombre de lignes de contenu (défaut: 3)
  className?: string;
};

export function SkeletonCard({ title = true, lines = 3, className }: SkeletonCardProps): JSX.Element
```

---

## Notes d'implémentation

- `loading.tsx` est un Server Component (peut être async ou non)
- Utiliser `<Skeleton className="h-4 w-[250px]" />` de `@/components/ui/skeleton`
- Structure recommandée pour le dashboard loading :
  ```tsx
  // loading.tsx dashboard
  export default function DashboardLoading() {
    return (
      <div className="space-y-6">
        <SkeletonCard title lines={2} />  {/* Résumé mensuel */}
        <SkeletonCard lines={4} />        {/* Tableau transactions récentes */}
      </div>
    );
  }
  ```
- Le skeleton des transactions doit reproduire les colonnes : date, description, montant (3 colonnes)
- Pas de logique client — tout est statique dans ces fichiers
