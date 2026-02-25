# STORY-099 — Catégories prédéfinies couple

**Sprint :** v13 — Activation & Rétention Couple
**Priorité :** P3 — COULD HAVE
**Complexité :** XS
**Points :** 1
**Epic :** couple-ux
**Dépendances :** STORY-087 (TransactionCoupleToggle)

---

## Description

Quand une transaction est marquée `is_couple_shared = 1` et que sa catégorie est vide ou générique (`""` / `"Autre"`), afficher des pills de suggestion de catégories spécifiques aux dépenses communes. Non-intrusif : aucun affichage si catégorie déjà définie.

**Catégories couple prédéfinies :**
`Loyer / charges`, `Courses alimentaires`, `Restaurants & sorties`, `Voyages`, `Factures communes`, `Loisirs communs`, `Santé commune`, `Éducation`

**Comportement :**
1. Toggle couple activé (`is_couple_shared = 1`)
2. Si catégorie `""` ou `"Autre"` → afficher 4 pills en ligne (les 4 premières)
3. Bouton "Voir plus" → affiche les 8 complètes
4. Clic pill → `updateTransactionCategoryAction(txId, category)` (action existante ou nouvelle)
5. Catégorie mise à jour → pills disparaissent

---

## Critères d'acceptation

| # | Critère |
|---|---------|
| AC-1 | `COUPLE_CATEGORIES` contient ≥ 6 catégories |
| AC-2 | Pills affichées quand toggle couple activé ET catégorie vide/générique |
| AC-3 | Pills non affichées si catégorie déjà définie |
| AC-4 | Pills non affichées si toggle couple désactivé |
| AC-5 | Clic pill met à jour la catégorie de la transaction |

---

## Cas de tests unitaires

### `COUPLE_CATEGORIES` → `src/lib/couple-categories.ts`

| ID | Description | Résultat attendu |
|----|-------------|-----------------|
| TU-99-1 | `COUPLE_CATEGORIES.length >= 6` | `true` |
| TU-99-2 | Chaque catégorie est une string non vide | Toutes définies |

### `isCategoryEmpty(category)` → `src/lib/couple-categories.ts`

| ID | Description | Résultat attendu |
|----|-------------|-----------------|
| TU-99-3 | `isCategoryEmpty("")` → `true` | `true` |
| TU-99-4 | `isCategoryEmpty("Autre")` → `true` | `true` |
| TU-99-5 | `isCategoryEmpty("Courses")` → `false` | `false` |
| TU-99-6 | `isCategoryEmpty(undefined)` → `true` | `true` |

### `TransactionCoupleToggle` avec pills → `src/components/transaction-couple-toggle.tsx`

| ID | Description | Résultat attendu |
|----|-------------|-----------------|
| TU-99-7 | Toggle activé + catégorie vide → pills visibles | Pills rendues |
| TU-99-8 | Toggle activé + catégorie "Courses" → pills absentes | Aucune pill |
| TU-99-9 | Toggle désactivé + catégorie vide → pills absentes | Aucune pill |
| TU-99-10 | Clic sur pill → callback appelé avec catégorie | Handler invoqué |

---

## Mapping AC → Tests

| AC | Tests couvrants |
|----|----------------|
| AC-1 | TU-99-1 |
| AC-2 | TU-99-7 |
| AC-3 | TU-99-8 |
| AC-4 | TU-99-9 |
| AC-5 | TU-99-10 |

---

## Données de test / fixtures

```typescript
import { COUPLE_CATEGORIES } from "@/lib/couple-categories";

const mockTx = {
  id: "tx-1",
  category: "",          // vide → pills affichées
  is_couple_shared: 1,
};

const mockTxCategorized = {
  id: "tx-2",
  category: "Courses alimentaires",
  is_couple_shared: 1,
};
```

---

## Fichiers à créer / modifier

| Fichier | Action |
|---------|--------|
| `src/lib/couple-categories.ts` | Créer — `COUPLE_CATEGORIES` + `isCategoryEmpty()` |
| `src/components/transaction-couple-toggle.tsx` | Modifier — affichage pills conditionnel |
| `tests/unit/lib/couple-categories.test.ts` | Créer |
| `tests/unit/components/transaction-couple-toggle-pills.test.tsx` | Créer |
