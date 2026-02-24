# STORY-084 — Features bullets sur les cards /tarifs et landing page

**Sprint :** Conversion & Monétisation (v11)
**Épique :** marketing-ui
**Priorité :** P3 — NICE TO HAVE
**Complexité :** XS (1 point)
**Statut :** pending
**Bloqué par :** aucune

---

## Description

Afficher les features incluses directement dans les cards des plans sur la page `/tarifs` et la section pricing de la landing page (`/`). Actuellement les cards montrent uniquement le nom du plan et son prix — les features ne sont visibles que dans le tableau comparatif en dessous, que la plupart des utilisateurs ne scrollent pas jusqu'à.

Chaque card plan doit afficher ses bullets de features (issues de `PLANS[planId].features`) avec une icône check verte, rendant la valeur de chaque plan immédiatement lisible.

En parallèle, enrichir l'array `features[]` dans `stripe-plans.ts` pour des descriptions plus percutantes (5 items par plan).

---

## Acceptance Criteria

- **AC-1 :** Chaque card plan sur `/tarifs` affiche ≥ 3 bullets de features avec icône check
- **AC-2 :** Chaque bullet utilise l'icône `check` Material Symbols en `text-success`
- **AC-3 :** Les cards de la landing page (section pricing) affichent également les features
- **AC-4 :** Le plan Pro reste visuellement mis en avant (bordure primary)
- **AC-5 :** Les features de `stripe-plans.ts` sont enrichies à 5 items par plan
- **AC-6 :** Les tests existants sur `/tarifs` passent (non-regression)
- **AC-7 :** `npm run build` et `npm run lint` passent

---

## Fichiers à modifier

| Fichier | Action | Détail |
|---------|--------|--------|
| `src/lib/stripe-plans.ts` | MODIFIER | Enrichir `features[]` à 5 items par plan |
| `src/app/[locale]/(marketing)/tarifs/page.tsx` | MODIFIER | Ajouter bullets dans les cards plans |
| `src/app/[locale]/(marketing)/page.tsx` | MODIFIER | Ajouter bullets dans la section pricing |

---

## Features enrichies

```ts
// src/lib/stripe-plans.ts — features enrichies
free: {
  features: [
    "2 comptes bancaires",
    "Import CSV uniquement",
    "Transactions illimitées",
    "Budgets & objectifs",
    "Résumé mensuel basique",
  ],
},
pro: {
  features: [
    "5 comptes bancaires",
    "Import PDF, Excel & CSV",
    "Conseiller IA (10 req/mois)",
    "Multi-devises",
    "Export CSV & rapports mensuels",
  ],
},
premium: {
  features: [
    "Comptes illimités",
    "Conseiller IA illimité & prioritaire",
    "Export PDF rapport mensuel",
    "Rapport annuel IA",
    "Support prioritaire",
  ],
},
```

---

## Composant bullets (réutilisable)

```tsx
// Pattern à inliner dans les cards — pas de composant séparé (usage unique)
<ul className="flex flex-col gap-2 mt-4">
  {plan.features.map((feature) => (
    <li key={feature} className="flex items-center gap-2 text-sm text-text-main">
      <span
        className="material-symbols-outlined text-success text-[16px] shrink-0"
        style={{ fontVariationSettings: "'FILL' 1" }}
      >
        check
      </span>
      {feature}
    </li>
  ))}
</ul>
```

---

## Tests unitaires

**Fichier :** `tests/unit/pages/tarifs-features.test.tsx`

| ID | Description | Résultat attendu |
|----|-------------|-----------------|
| TU-84-1 | Page `/tarifs` contient ≥ 9 features au total (3 plans × 3 min) | `getAllByRole("listitem").length >= 9` |
| TU-84-2 | Features du plan Free ≠ features du plan Pro | Arrays différents |
| TU-84-3 | `PLANS.free.features.length >= 3` | Assertion sur la longueur |
| TU-84-4 | `PLANS.pro.features.length >= 4` | Assertion sur la longueur |
| TU-84-5 | `PLANS.premium.features.length >= 4` | Assertion sur la longueur |
| TU-84-6 | La page `/tarifs` rend sans erreur | `render()` sans throw |

---

## Mapping AC → Tests

| AC | Tests couvrant |
|----|---------------|
| AC-1 | TU-84-1 |
| AC-2 | Test manuel (icône) + TU-84-6 (rendu OK) |
| AC-3 | Test manuel landing page |
| AC-4 | TU-84-6 (non-regression design) |
| AC-5 | TU-84-3, TU-84-4, TU-84-5 |
| AC-6 | Tests existants + TU-84-6 |
| AC-7 | `npm run build && npm run lint` |

---

## Notes d'implémentation

1. **Localisation dans `/tarifs`** : les cards plans sont dans le JSX de `tarifs/page.tsx` — chercher la boucle sur `Object.values(PLANS)` ou les 3 cards explicites et ajouter la liste sous le prix
2. **Localisation dans la landing** : chercher la section `{/* Pricing */}` dans `page.tsx` et ajouter les bullets dans chaque card plan
3. **`stripe-plans.ts` est importé côté server** : la modification des features est un changement pur de données — aucun risque de regression côté logique métier
4. **Pas de composant dédié** : les bullets sont inlinées (usage dans seulement 2 endroits — pas d'abstraction prématurée)
5. **Tests de non-regression** : vérifier que les tests existants sur `/tarifs` (`tests/unit/pages/tarifs*.test.tsx` s'ils existent) passent encore
