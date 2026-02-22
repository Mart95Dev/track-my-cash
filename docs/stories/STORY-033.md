# STORY-033 — Objectifs d'épargne (Savings Goals)

**Sprint :** Sprint Objectifs & Intelligence
**Priorité :** P1
**Complexité :** M (3 points)
**Bloquée par :** —
**Statut :** pending

---

## Description

L'application n'offre aucun moyen de définir des objectifs financiers. Les utilisateurs qui veulent épargner pour un projet (voyage, voiture, fonds d'urgence) n'ont aucun outil pour suivre leur progression. Cette story ajoute un système complet d'objectifs d'épargne avec visualisation de la progression sur le dashboard.

---

## Contexte technique

- Nouvelle table `goals` dans le schéma libsql (Turso)
- Nouvelles fonctions dans `src/lib/queries.ts`
- Nouvelles server actions dans `src/app/actions/goals-actions.ts`
- Nouveau composant dashboard `src/components/savings-goals-widget.tsx`
- Nouvelle page `/objectifs` dans `(app)/`
- Auth via `getRequiredUserId()` de `@/lib/auth-utils`
- Devise de référence : EUR (convertir via `getAllRates()` si nécessaire)

---

## Schéma DB

```sql
CREATE TABLE IF NOT EXISTS goals (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id TEXT NOT NULL,
  name TEXT NOT NULL,
  target_amount REAL NOT NULL,
  current_amount REAL NOT NULL DEFAULT 0,
  currency TEXT NOT NULL DEFAULT 'EUR',
  deadline TEXT,              -- ISO date optionnelle
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
```

Ajouter la migration dans `src/lib/db.ts` (dans `initSchema()`).

---

## Acceptance Criteria

**AC-1 :** L'utilisateur peut créer un objectif avec nom, montant cible, montant actuel, devise et date limite (optionnelle)

**AC-2 :** L'utilisateur peut modifier un objectif existant (tous les champs)

**AC-3 :** L'utilisateur peut supprimer un objectif

**AC-4 :** Le dashboard affiche un widget "Objectifs" avec barre de progression pour chaque objectif (pourcentage = current/target × 100)

**AC-5 :** La barre de progression est verte si ≥ 100%, orange si ≥ 50%, rouge si < 50%

**AC-6 :** La page `/objectifs` liste tous les objectifs avec formulaire d'ajout

**AC-7 :** `revalidatePath("/dashboard")` et `revalidatePath("/objectifs")` sont appelés après chaque mutation

---

## Spécifications techniques

### `src/lib/queries.ts` — nouvelles fonctions

```typescript
export interface Goal {
  id: number;
  user_id: string;
  name: string;
  target_amount: number;
  current_amount: number;
  currency: string;
  deadline: string | null;
  created_at: string;
}

export async function getGoals(db: Client, userId: string): Promise<Goal[]>
export async function createGoal(db: Client, userId: string, data: Omit<Goal, "id" | "user_id" | "created_at">): Promise<Goal>
export async function updateGoal(db: Client, id: number, userId: string, data: Partial<Omit<Goal, "id" | "user_id" | "created_at">>): Promise<void>
export async function deleteGoal(db: Client, id: number, userId: string): Promise<void>
```

### `src/app/actions/goals-actions.ts`

```typescript
export async function createGoalAction(name: string, targetAmount: number, currentAmount: number, currency: string, deadline?: string): Promise<{ success: true } | { error: string }>
export async function updateGoalAction(id: number, data: Partial<...>): Promise<{ success: true } | { error: string }>
export async function deleteGoalAction(id: number): Promise<{ success: true } | { error: string }>
```

### `src/components/savings-goals-widget.tsx`

- Server Component (reçoit `goals: Goal[]` en props)
- Affiche chaque objectif : nom, montant actuel / montant cible, barre de progression colorée, date limite si définie

### `src/app/[locale]/(app)/objectifs/page.tsx`

- Server Component
- Appelle `getGoals(db, userId)` directement
- Inclut un formulaire (client component) pour créer/modifier les objectifs

---

## Tests unitaires à créer

**Fichier :** `tests/unit/actions/goals-actions.test.ts`

**TU-1-1 :** `createGoalAction` avec données valides → retourne `{ success: true }`
**TU-1-2 :** `createGoalAction` avec `targetAmount = 0` → retourne `{ error }`
**TU-1-3 :** `createGoalAction` sans nom → retourne `{ error }`
**TU-1-4 :** `deleteGoalAction` → retourne `{ success: true }`
**TU-1-5 :** `updateGoalAction` avec `currentAmount > targetAmount` → accepté (objectif dépassé possible)

**Mocks requis :**
- `@/lib/auth-utils` : `getRequiredUserId` → `"user-test"`
- `@/lib/db` : `getUserDb` → `{}`
- `@/lib/queries` : `createGoal`, `updateGoal`, `deleteGoal`, `getGoals`
- `next/cache` : `revalidatePath`

---

## Données de test

```typescript
const mockGoal: Goal = {
  id: 1,
  user_id: "user-test",
  name: "Voyage Japon",
  target_amount: 3000,
  current_amount: 1200,
  currency: "EUR",
  deadline: "2026-12-31",
  created_at: "2026-01-01T00:00:00",
};
```

---

## Fichiers à créer/modifier

- `src/lib/db.ts` — ajouter migration `goals` dans `initSchema()`
- `src/lib/queries.ts` — ajouter `Goal` interface + 4 fonctions
- `src/app/actions/goals-actions.ts` — créer (3 actions)
- `src/components/savings-goals-widget.tsx` — créer
- `src/components/goal-form.tsx` — créer (formulaire client)
- `src/app/[locale]/(app)/objectifs/page.tsx` — créer
- `src/app/[locale]/(app)/dashboard/page.tsx` — ajouter `<SavingsGoalsWidget />`
- `src/app/[locale]/(app)/layout.tsx` — ajouter lien "Objectifs" dans la sidebar
- `tests/unit/actions/goals-actions.test.ts` — créer (5 tests)
