# STORY-042 — Détection automatique des paiements récurrents

**Sprint :** Sprint Compatibilité, IA & Analyse Avancée (v6)
**Priorité :** P2
**Complexité :** M (3 points)
**Bloquée par :** aucune
**Statut :** pending

---

## Description

L'utilisateur doit créer ses récurrents manuellement alors que son historique de transactions contient des patterns répétitifs évidents (loyer, abonnements, factures). Cette story implémente un algorithme de détection automatique qui analyse l'historique et propose des suggestions de récurrents à valider.

---

## Contexte technique

- Table `recurring_payments` : `id, account_id, name, type, amount, frequency, next_date, end_date, category, subcategory`
- `createRecurringPaymentAction()` dans `recurring-actions.ts` — à réutiliser pour la création depuis suggestion
- `getTransactions(db, accountId)` dans `queries.ts` — source de données
- Page : `src/app/[locale]/(app)/recurrents/page.tsx` — à enrichir

---

## Algorithme de détection

```
Pour chaque groupe de transactions ayant une description similaire :
  - Normaliser : minuscules, retirer chiffres variables, retirer espaces multiples
  - Si ≥ 3 occurrences dans l'historique :
    - Calculer l'intervalle médian entre les dates
    - Si intervalle ≈ 30j (±5j) → fréquence "monthly"
    - Si intervalle ≈ 7j (±2j) → fréquence "weekly"
    - Si intervalle ≈ 90j (±10j) → fréquence "quarterly"
    - Si intervalle ≈ 365j (±30j) → fréquence "yearly"
    - Si montant stable (±10%) → suggestion fiable
  - Exclure si la description correspond déjà à un récurrent existant
```

---

## Acceptance Criteria

**AC-1 :** `detectRecurringPatterns()` identifie correctement les transactions avec intervalle mensuel stable (≥ 3 occurrences, intervalle 25-35j)

**AC-2 :** Les suggestions excluent les patterns déjà couverts par un récurrent existant (matching sur description normalisée)

**AC-3 :** L'interface dans `/recurrents` affiche les suggestions avec : nom détecté, montant moyen, fréquence, date suivante estimée

**AC-4 :** "Créer le récurrent" depuis une suggestion pré-remplit le formulaire de création avec les données détectées — l'utilisateur valide sans ressaisir

**AC-5 :** `detectRecurringPatterns()` est testé unitairement — cas nominal, pas de pattern, montants trop variables, fréquence non reconnue

---

## Spécifications techniques

### `src/lib/recurring-detector.ts` (nouveau — logique pure)

```typescript
export interface RecurringSuggestion {
  normalizedName: string;        // Description normalisée
  displayName: string;           // Meilleure description trouvée (la plus courte/claire)
  avgAmount: number;
  type: "expense" | "income";
  frequency: "weekly" | "monthly" | "quarterly" | "yearly";
  confidence: number;            // 0-1 (basé sur régularité des intervalles + stabilité montant)
  nextDate: string;              // YYYY-MM-DD — estimation basée sur dernière occurrence + fréquence
  occurrences: number;           // Nombre d'occurrences détectées
  category: string;              // Catégorie la plus fréquente dans le groupe
}

export interface RecurringDetectorInput {
  transactions: {
    id: number;
    description: string;
    amount: number;
    type: "income" | "expense";
    date: string; // YYYY-MM-DD
    category: string;
  }[];
  existingRecurrings: {
    name: string;
    amount: number;
    frequency: string;
  }[];
}

export function normalizeDescription(description: string): string {
  return description
    .toLowerCase()
    .replace(/\d{4,}/g, "")        // Supprimer numéros longs (références)
    .replace(/\s+/g, " ")
    .trim();
}

export function detectRecurringPatterns(input: RecurringDetectorInput): RecurringSuggestion[]
```

### `src/app/actions/recurring-actions.ts` (modification)

```typescript
export async function detectRecurringSuggestionsAction(
  accountId: number
): Promise<RecurringSuggestion[] | { error: string }> {
  const userId = await getRequiredUserId();
  const db = await getUserDb(userId);
  // Charger les 12 derniers mois de transactions
  // Charger les récurrents existants
  // Appeler detectRecurringPatterns()
  // Retourner les suggestions avec confidence >= 0.6
}
```

### `src/components/recurring-suggestions.tsx` (nouveau)

```typescript
"use client";
// Props: suggestions: RecurringSuggestion[], accountId: number
// Pour chaque suggestion : Card avec nom, montant, fréquence, prochain paiement
// Bouton "Créer" → ouvre le formulaire de récurrent pré-rempli
// Bouton "Ignorer" → retire la suggestion de la liste (state local, pas de persistance)
// Si suggestions vides → ne rien afficher
```

### Modification `src/app/[locale]/(app)/recurrents/page.tsx`

```typescript
// Server Component : charger les suggestions au chargement
const suggestions = await detectRecurringSuggestionsAction(accountId);
// Afficher <RecurringSuggestions suggestions={suggestions} accountId={accountId} />
// au-dessus de la liste des récurrents existants (avec bandeau "X paiements récurrents détectés")
```

---

## Tests unitaires

**Fichier :** `tests/unit/lib/recurring-detector.test.ts`

**TU-1-1 :** `detectRecurringPatterns()` avec 3 transactions "ORANGE TELECOM" à 30j d'intervalle → 1 suggestion fréquence "monthly"
**TU-1-2 :** `detectRecurringPatterns()` avec 2 occurrences seulement → 0 suggestions (seuil minimum 3)
**TU-1-3 :** `detectRecurringPatterns()` avec montants qui varient de plus de 10% → confidence < 0.5 → non retournée
**TU-1-4 :** `detectRecurringPatterns()` avec récurrent existant sur même description → suggestion exclue
**TU-1-5 :** `normalizeDescription("VIR LOYER 01/2026 DUPONT")` → `"vir loyer  dupont"` (chiffres longs supprimés)
**TU-1-6 :** `detectRecurringPatterns()` avec transactions hebdomadaires régulières → fréquence "weekly" détectée

---

## Données de test

```typescript
const transactions = [
  { id: 1, description: "ORANGE SA FRANCE", amount: 29.99, type: "expense", date: "2025-11-05", category: "Abonnements" },
  { id: 2, description: "ORANGE SA FRANCE", amount: 29.99, type: "expense", date: "2025-12-05", category: "Abonnements" },
  { id: 3, description: "ORANGE SA FRANCE", amount: 29.99, type: "expense", date: "2026-01-06", category: "Abonnements" }, // +1j = normal
];
// → suggestion: { displayName: "ORANGE SA FRANCE", avgAmount: 29.99, frequency: "monthly", confidence: 0.9 }
```

---

## Fichiers à créer/modifier

| Fichier | Action |
|---------|--------|
| `src/lib/recurring-detector.ts` | CRÉER — `detectRecurringPatterns()`, `normalizeDescription()` |
| `src/app/actions/recurring-actions.ts` | MODIFIER — ajouter `detectRecurringSuggestionsAction()` |
| `src/components/recurring-suggestions.tsx` | CRÉER |
| `src/app/[locale]/(app)/recurrents/page.tsx` | MODIFIER — intégrer les suggestions |
| `tests/unit/lib/recurring-detector.test.ts` | CRÉER — 6 tests |
