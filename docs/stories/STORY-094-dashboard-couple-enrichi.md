# STORY-094 — Dashboard /couple enrichi

**Sprint :** v13 — Activation & Rétention Couple
**Priorité :** P1 — MUST HAVE
**Complexité :** M
**Points :** 3
**Epic :** couple-activation
**Dépendances :** STORY-087 (getSharedTransactionsForCouple), STORY-090 (getCoupleSharedGoals)

---

## Description

Transformer la page `/couple` d'une simple gestion de membres (code invite + partenaire) en un vrai dashboard couple avec métriques financières, timeline et objectifs communs.

**Sections :**
1. **En-tête** — Nom du couple (si défini) + membres (avatars initiales) + date joined
2. **Balance du mois** — `CoupleBalanceCard` existante + flèche directionnelle
3. **Dépenses communes du mois** — Total + variation vs mois précédent (↑/↓ %)
4. **Top 3 catégories communes** — Pills avec montant (ex: "Courses 342€")
5. **10 dernières transactions partagées** — Liste compacte (date, description, montant, payeur)
6. **Objectifs communs** — Progress bars (si ≥ 1 objectif couple)
7. **Code invite** — Section repliable `<details>` en bas de page

---

## Critères d'acceptation

| # | Critère |
|---|---------|
| AC-1 | Page affiche la balance couple du mois courant (CoupleBalanceCard) |
| AC-2 | Total dépenses communes + variation % vs mois précédent visible |
| AC-3 | Top 3 catégories communes du mois affichées avec montant |
| AC-4 | Liste des 10 dernières transactions partagées (date, description, montant, payeur) |
| AC-5 | Section objectifs communs visible si ≥ 1 objectif couple actif |
| AC-6 | Section code invite accessible (repliée par défaut) |
| AC-7 | Si pas de couple actif → affiche `CoupleCreateForm`/`CoupleJoinForm` (comportement actuel préservé) |

---

## Cas de tests unitaires

### `getCoupleMonthStats(coupleId, month)` → `src/lib/couple-queries.ts`

| ID | Description | Résultat attendu |
|----|-------------|-----------------|
| TU-94-1 | Mois avec 5 tx partagées → total correct | `{ totalExpenses: X, transactionCount: 5 }` |
| TU-94-2 | Calcul variation vs mois N-1 — hausse | `{ variation: +12.5 }` (%) |
| TU-94-3 | Calcul variation vs mois N-1 — sans données N-1 | `{ variation: null }` |
| TU-94-4 | Top 3 catégories triées par montant DESC | Tableau `[{ category, total }]` length 3 |
| TU-94-5 | Aucune transaction partagée → total 0, topCategories [] | Valeurs nulles/vides |

### `CoupleStatsCard` component → `src/components/couple-stats-card.tsx`

| ID | Description | Résultat attendu |
|----|-------------|-----------------|
| TU-94-6 | Rend le total formaté en euros | "342,00 €" visible |
| TU-94-7 | Variation positive → flèche verte ↑ | Classe `text-success` |
| TU-94-8 | Variation négative → flèche rouge ↓ | Classe `text-danger` |
| TU-94-9 | Variation null → aucune flèche | Pas d'élément variation |

### `CoupleCategoriesPills` component → `src/components/couple-categories-pills.tsx`

| ID | Description | Résultat attendu |
|----|-------------|-----------------|
| TU-94-10 | Rend 3 pills avec nom catégorie + montant | 3 éléments dans le DOM |
| TU-94-11 | Liste vide → composant non affiché | `null` ou fragment vide |

---

## Mapping AC → Tests

| AC | Tests couvrants |
|----|----------------|
| AC-1 | TU-94-1 (intégration CoupleBalanceCard existante) |
| AC-2 | TU-94-2, TU-94-3, TU-94-6, TU-94-7, TU-94-8, TU-94-9 |
| AC-3 | TU-94-4, TU-94-10, TU-94-11 |
| AC-4 | TU-94-1 (transactions dans la query) |
| AC-5 | Réutilise `getCoupleSharedGoals` (STORY-090, déjà testé) |
| AC-6 | Vérification structurelle (pas de test dédié — markup `<details>`) |
| AC-7 | TU-94-5 (comportement no-couple préservé) |

---

## Données de test / fixtures

```typescript
const coupleId = "couple-abc";
const month = "2026-02";
const prevMonth = "2026-01";

// transactions partagées mockées
const sharedTx = [
  { amount: -120, category: "Courses", paid_by: "user-1", date: "2026-02-10" },
  { amount: -80,  category: "Courses", paid_by: "user-2", date: "2026-02-12" },
  { amount: -200, category: "Loyer",   paid_by: "user-1", date: "2026-02-01" },
  { amount: -45,  category: "Sorties", paid_by: "user-2", date: "2026-02-18" },
];
```

---

## Fichiers à créer / modifier

| Fichier | Action |
|---------|--------|
| `src/app/[locale]/(app)/couple/page.tsx` | Modifier — refonte complète en dashboard |
| `src/components/couple-stats-card.tsx` | Créer — total dépenses + variation |
| `src/components/couple-categories-pills.tsx` | Créer — top 3 catégories communes |
| `src/lib/couple-queries.ts` | Modifier — ajouter `getCoupleMonthStats()` |
| `tests/unit/lib/couple-month-stats.test.ts` | Créer |
| `tests/unit/components/couple-stats-card.test.tsx` | Créer |
| `tests/unit/components/couple-categories-pills.test.tsx` | Créer |
