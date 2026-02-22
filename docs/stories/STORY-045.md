# STORY-045 — Détection d'anomalies financières (push automatique post-import)

**Sprint :** Sprint Compatibilité, IA & Analyse Avancée (v6)
**Priorité :** P2
**Complexité :** M (3 points)
**Bloquée par :** aucune (recommandé après STORY-044 pour cohérence du module IA)
**Statut :** pending

---

## Description

L'utilisateur découvre ses dépenses inhabituelles trop tard — souvent en fin de mois lors de la revue. Un algorithme peut détecter automatiquement, **immédiatement après chaque import**, si une transaction dépasse significativement la moyenne historique de sa catégorie. Une notification in-app est alors générée, permettant à l'utilisateur d'agir rapidement.

Exemples de notifications générées :
- "Dépense inhabituelle : ÉLECTRICITÉ EDF — 189€ (2,3× votre moyenne Logement de 82€)"
- "Dépense élevée : AMAZON PRIME — 79€ (3,5× votre moyenne Abonnements de 22€)"

---

## Contexte technique

- `createNotification(db, { userId, title, body, type })` dans `notification-actions.ts` (STORY-037)
- `import-actions.ts` — `importFileAction()` et `importTransactionsAction()` — point d'injection
- Logique de détection : **sans IA** (algorithmique pur, gratuit, instantané) — l'IA n'est pas nécessaire pour une comparaison de moyennes

---

## Algorithme de détection

```typescript
// Pour chaque nouvelle transaction importée (type = "expense" uniquement) :
// 1. Récupérer la moyenne des montants de la même catégorie sur les 3 derniers mois
//    (en excluant les transactions du jour même — les nouvelles)
// 2. Si avg > 0 ET montant > avg × THRESHOLD (2.0) ET montant > MIN_AMOUNT (50€) :
//    → Anomalie détectée
// 3. Créer une notification in-app
```

**Paramètres :**
- `THRESHOLD = 2.0` (configurable par constante dans le fichier)
- `MIN_AMOUNT = 50.0` (évite le bruit sur les petites transactions)
- Ignorer les revenus (`type = "income"`)

---

## Acceptance Criteria

**AC-1 :** Après un import, une notification in-app apparaît pour chaque transaction dépassant 2× la moyenne historique de sa catégorie (et > 50€)

**AC-2 :** Les transactions de type `income` ne génèrent jamais d'anomalie

**AC-3 :** Les transactions dans des catégories sans historique (aucune transaction précédente) ne génèrent pas d'anomalie

**AC-4 :** La notification affiche clairement : description de la transaction, montant, catégorie, ratio vs historique

**AC-5 :** `detectAnomalies()` est testé unitairement : anomalie détectée, pas d'anomalie, montant trop faible, revenue ignoré, catégorie inconnue

---

## Spécifications techniques

### `src/lib/anomaly-detector.ts` (nouveau — logique pure)

```typescript
export interface Anomaly {
  transactionId: number;
  description: string;
  amount: number;
  category: string;
  historicalAvg: number;
  ratio: number;              // ex: 2.3 pour "2,3× la moyenne"
}

export interface AnomalyDetectorOptions {
  threshold?: number;         // Défaut: 2.0
  minAmount?: number;         // Défaut: 50.0
}

/**
 * Détecte les dépenses anormalement élevées par rapport à la moyenne historique.
 * Logique pure, sans effets de bord — testable sans mock.
 */
export function detectAnomalies(
  newTransactions: {
    id: number;
    description: string;
    amount: number;
    category: string;
    type: "income" | "expense";
  }[],
  avgByCategory: Record<string, number>,  // Moyenne des 3 derniers mois par catégorie
  options: AnomalyDetectorOptions = {}
): Anomaly[] {
  const { threshold = 2.0, minAmount = 50.0 } = options;

  return newTransactions
    .filter(tx => tx.type === "expense")        // Ignorer les revenus
    .filter(tx => tx.amount >= minAmount)        // Ignorer les petits montants
    .filter(tx => {
      const avg = avgByCategory[tx.category];
      if (!avg || avg === 0) return false;       // Pas de données historiques
      return tx.amount > avg * threshold;
    })
    .map(tx => {
      const avg = avgByCategory[tx.category]!;
      return {
        transactionId: tx.id,
        description: tx.description,
        amount: tx.amount,
        category: tx.category,
        historicalAvg: avg,
        ratio: Math.round((tx.amount / avg) * 10) / 10,  // 1 décimale
      };
    });
}
```

### `src/app/actions/anomaly-actions.ts` (nouveau)

```typescript
"use server";

import { detectAnomalies } from "@/lib/anomaly-detector";
import { createNotification } from "@/lib/queries"; // ou notification-actions
import { getUserDb } from "@/lib/db";
import { getRequiredUserId } from "@/lib/auth-utils";

export async function detectAndNotifyAnomaliesAction(
  accountId: number,
  newTransactionIds: number[]
): Promise<void> {
  if (newTransactionIds.length === 0) return;

  const userId = await getRequiredUserId();
  const db = await getUserDb(userId);

  // Calculer la moyenne des 3 derniers mois par catégorie (excluant les transactions d'aujourd'hui)
  const today = new Date().toISOString().split("T")[0];
  const threeMonthsAgo = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];

  const avgResult = await db.execute({
    sql: `SELECT category, AVG(amount) as avg_amount
          FROM transactions
          WHERE account_id = ? AND type = 'expense'
            AND date >= ? AND date < ?
          GROUP BY category`,
    args: [accountId, threeMonthsAgo, today],
  });

  const avgByCategory: Record<string, number> = {};
  for (const row of avgResult.rows) {
    avgByCategory[String(row.category)] = Number(row.avg_amount);
  }

  // Charger les nouvelles transactions
  const txResult = await db.execute({
    sql: `SELECT id, description, amount, category, type
          FROM transactions WHERE id IN (${newTransactionIds.map(() => "?").join(",")})`,
    args: newTransactionIds,
  });

  const newTransactions = txResult.rows.map(r => ({
    id: Number(r.id),
    description: String(r.description),
    amount: Number(r.amount),
    category: String(r.category ?? "Autre"),
    type: String(r.type) as "income" | "expense",
  }));

  // Détecter les anomalies
  const anomalies = detectAnomalies(newTransactions, avgByCategory);

  // Créer une notification par anomalie
  for (const anomaly of anomalies) {
    await createNotification(db, {
      type: "anomaly",
      title: `Dépense inhabituelle — ${anomaly.category}`,
      body: `${anomaly.description} : ${anomaly.amount.toFixed(2)}€ (${anomaly.ratio}× votre moyenne de ${anomaly.historicalAvg.toFixed(0)}€)`,
    });
  }
}
```

### Modification `src/app/actions/import-actions.ts`

```typescript
// Après bulkInsertTransactions() et revalidatePath() :
if (newTransactionIds.length > 0) {
  // Fire-and-forget — ne pas bloquer la réponse de l'import
  void detectAndNotifyAnomaliesAction(accountId, newTransactionIds).catch(() => {
    // Silencieux — la détection d'anomalies ne doit pas casser l'import
  });
}
```

---

## Tests unitaires

**Fichier :** `tests/unit/lib/anomaly-detector.test.ts`

**TU-1-1 :** `detectAnomalies([{id:1, amount:250, category:"Loisirs", type:"expense"}], {"Loisirs": 80})` → 1 anomalie (ratio 3.1)

**TU-1-2 :** `detectAnomalies([{id:1, amount:100, category:"Loisirs", type:"expense"}], {"Loisirs": 80})` → 0 anomalie (100 < 80×2 = 160)

**TU-1-3 :** `detectAnomalies([{id:1, amount:300, category:"Abonnements", type:"income"}], {"Abonnements": 50})` → 0 anomalie (type income ignoré)

**TU-1-4 :** `detectAnomalies([{id:1, amount:30, category:"Loisirs", type:"expense"}], {"Loisirs": 10})` → 0 anomalie (montant < minAmount 50€)

**TU-1-5 :** `detectAnomalies([{id:1, amount:250, category:"Nouvelle", type:"expense"}], {})` → 0 anomalie (pas d'historique pour cette catégorie)

**TU-1-6 :** `detectAnomalies()` avec threshold custom `{ threshold: 1.5 }` → seuil respecté

---

## Fichiers à créer/modifier

| Fichier | Action |
|---------|--------|
| `src/lib/anomaly-detector.ts` | CRÉER — `detectAnomalies()` logique pure |
| `src/app/actions/anomaly-actions.ts` | CRÉER — `detectAndNotifyAnomaliesAction()` |
| `src/app/actions/import-actions.ts` | MODIFIER — appel fire-and-forget après import |
| `tests/unit/lib/anomaly-detector.test.ts` | CRÉER — 6 tests |
