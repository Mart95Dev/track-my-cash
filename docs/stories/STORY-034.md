# STORY-034 — Catégorisation automatique des transactions par IA

**Sprint :** Sprint Objectifs & Intelligence
**Priorité :** P1
**Complexité :** M (3 points)
**Bloquée par :** —
**Statut :** pending

---

## Description

Lors de l'import de transactions bancaires, les catégories sont souvent vides ou mal attribuées. Cette story ajoute un bouton "Catégoriser automatiquement" qui envoie les transactions non catégorisées à l'IA (OpenAI via Vercel AI SDK) pour qu'elle suggère des catégories, puis applique les suggestions après confirmation de l'utilisateur.

---

## Contexte technique

- Stack IA existante : Vercel AI SDK + OpenAI (déjà configuré dans `/api/chat`)
- `SUPPORTED_CATEGORIES` définis dans le code (catégories fixes)
- Transactions non catégorisées : `category = ''` ou `category IS NULL`
- Freemium guard : feature réservée aux plans Pro/Premium (`canUseAI()`)
- `getUserDb()` depuis `@/lib/db`
- Auth via `getRequiredUserId()` de `@/lib/auth-utils`

---

## Architecture de la fonctionnalité

1. **Server Action** `autoCategorizeAction(transactionIds: number[])` :
   - Récupère les transactions depuis la DB
   - Construit un prompt JSON avec description + montant + devise
   - Appelle OpenAI (modèle `gpt-4o-mini`, structured output)
   - Retourne un tableau `{ id: number; category: string; subcategory?: string }[]`
   - N'applique PAS encore les changements (retourne des suggestions)

2. **Server Action** `applyCategorizationsAction(categorizations: { id: number; category: string; subcategory?: string }[])` :
   - Applique les catégorisations en DB (UPDATE transactions SET category, subcategory)
   - `revalidatePath("/transactions")`

3. **Client Component** `auto-categorize-button.tsx` :
   - Bouton "Catégoriser automatiquement" sur la page transactions
   - Step 1: appelle `autoCategorizeAction` → affiche dialog de confirmation avec les suggestions
   - Step 2: l'utilisateur valide ou modifie les suggestions
   - Step 3: appelle `applyCategorizationsAction` → toast succès

---

## Prompt IA

```typescript
const systemPrompt = `Tu es un assistant financier. Pour chaque transaction bancaire,
attribue une catégorie parmi : Alimentation, Transport, Logement, Santé, Loisirs,
Vêtements, Éducation, Épargne, Revenus, Banque, Abonnements, Autre.
Réponds UNIQUEMENT avec du JSON valide : [{"id": 1, "category": "...", "subcategory": "..."}]`;
```

---

## Acceptance Criteria

**AC-1 :** Le bouton "Catégoriser automatiquement" est visible sur la page transactions uniquement pour les plans Pro/Premium

**AC-2 :** Un clic sélectionne les transactions sans catégorie et les envoie à l'IA (max 50 par batch)

**AC-3 :** Un dialog de confirmation affiche les suggestions avant application

**AC-4 :** L'utilisateur peut décocher des suggestions individuelles

**AC-5 :** Après confirmation, les catégories sont appliquées en DB et la page se revalide

**AC-6 :** Si 0 transaction sans catégorie, un toast informatif s'affiche ("Toutes les transactions sont déjà catégorisées")

**AC-7 :** Les erreurs réseau/IA sont gérées avec un toast d'erreur (pas de crash)

---

## Spécifications techniques

### `src/app/actions/ai-categorize-actions.ts` — à créer

```typescript
export async function autoCategorizeAction(
  transactionIds: number[]
): Promise<{ id: number; category: string; subcategory?: string }[] | { error: string }>

export async function applyCategorizationsAction(
  categorizations: { id: number; category: string; subcategory?: string }[]
): Promise<{ success: true; count: number } | { error: string }>
```

### `src/components/auto-categorize-button.tsx` — à créer

```typescript
"use client";
// Button + Dialog Radix/shadcn
// État: idle | loading | confirming | applying
// Props: uncategorizedCount: number
```

---

## Tests unitaires à créer

**Fichier :** `tests/unit/actions/ai-categorize-actions.test.ts`

**TU-1-1 :** `applyCategorizationsAction` avec 2 catégorisations → retourne `{ success: true, count: 2 }`
**TU-1-2 :** `applyCategorizationsAction` avec tableau vide → retourne `{ error }` ou `{ success: true, count: 0 }`
**TU-1-3 :** `applyCategorizationsAction` appelle `revalidatePath("/transactions")`
**TU-1-4 :** `autoCategorizeAction` avec openai mock → retourne tableau de suggestions
**TU-1-5 :** `autoCategorizeAction` avec erreur IA → retourne `{ error: string }`

**Mocks requis :**
- `@/lib/auth-utils` : `getRequiredUserId`
- `@/lib/db` : `getUserDb`
- `@/lib/queries` : `getTransactionsByIds`, `updateTransaction`
- `next/cache` : `revalidatePath`
- `openai` ou `ai` (Vercel AI SDK) : mock generateText/generateObject

---

## Données de test

```typescript
const mockTransactions = [
  { id: 1, description: "CARREFOUR MARKET", amount: -45.20, category: "", currency: "EUR" },
  { id: 2, description: "SNCF BILLET", amount: -32.00, category: "", currency: "EUR" },
];
const mockSuggestions = [
  { id: 1, category: "Alimentation", subcategory: "Supermarché" },
  { id: 2, category: "Transport", subcategory: "Train" },
];
```

---

## Fichiers à créer/modifier

- `src/app/actions/ai-categorize-actions.ts` — créer
- `src/components/auto-categorize-button.tsx` — créer
- `src/app/[locale]/(app)/transactions/page.tsx` — ajouter bouton (conditionnel plan Pro/Premium)
- `src/lib/queries.ts` — ajouter `getUncategorizedTransactions(db, userId, limit)` et `batchUpdateCategories(db, categorizations)`
- `tests/unit/actions/ai-categorize-actions.test.ts` — créer (5 tests)
