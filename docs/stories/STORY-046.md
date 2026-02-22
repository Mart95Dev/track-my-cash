# STORY-046 — Bilan annuel IA + export PDF (Pro/Premium)

**Sprint :** Sprint Compatibilité, IA & Analyse Avancée (v6)
**Priorité :** P3
**Complexité :** M (3 points)
**Bloquée par :** aucune (indépendant)
**Statut :** pending

---

## Description

Feature premium haute valeur : un bilan annuel IA qui analyse toute l'année écoulée, identifie les tendances de fond, compare aux années précédentes si disponibles et formule des recommandations personnalisées. Exportable en PDF (même style que le rapport mensuel STORY-036). C'est une feature vitrïne pour justifier l'upgrade Pro/Premium, particulièrement utile en début d'année (bilan N-1).

---

## Contexte technique

- Pattern PDF : `report-actions.ts` avec dynamic import `jspdf` + `jspdf-autotable` (STORY-036) — réutiliser
- AI guard : `canUseAI(userId)` → réservé Pro/Premium
- Source de données : requêtes SQL par mois sur l'année complète
- Logique pure : `computeAnnualReport()` testable sans mock DB

---

## Acceptance Criteria

**AC-1 :** Le bilan annuel est accessible depuis `/parametres` pour les plans Pro/Premium (bouton "Générer le bilan [ANNÉE]" sous le bouton rapport mensuel)

**AC-2 :** Le bilan inclut : top 5 catégories de dépenses de l'année, taux d'épargne annuel moyen, mois le plus dépensier et le plus économe

**AC-3 :** L'IA génère un commentaire personnalisé de 150-200 mots basé sur les données réelles (points forts, points faibles, 2-3 recommandations)

**AC-4 :** Le PDF est exporté et téléchargeable (format A4, style cohérent avec le rapport mensuel)

**AC-5 :** Si l'année n'a aucune donnée, affiche "Aucune transaction pour cette année"

**AC-6 :** Tests unitaires sur `computeAnnualReport()` — cas nominal (12 mois), cas partiel (6 mois), cas vide

---

## Spécifications techniques

### `src/lib/annual-report.ts` (nouveau — logique pure)

```typescript
import type { Client } from "@libsql/client";

export interface MonthlyData {
  month: string;   // "2025-01"
  income: number;
  expenses: number;
  net: number;
}

export interface AnnualReportData {
  year: number;
  accountId: number;
  totalIncome: number;
  totalExpenses: number;
  totalNet: number;
  annualSavingsRate: number;          // % d'épargne sur l'année
  monthlyData: MonthlyData[];         // 12 entrées max
  topExpenseCategories: {             // Top 5 catégories de dépenses
    category: string;
    total: number;
    percentage: number;               // % du total dépenses
  }[];
  bestMonth: { month: string; net: number } | null;   // Mois le plus économe
  worstMonth: { month: string; expenses: number } | null;  // Mois le plus dépensier
}

export async function computeAnnualReport(
  db: Client,
  accountId: number,
  year: number
): Promise<AnnualReportData> {
  // Requête mensuelle :
  const monthly = await db.execute({
    sql: `SELECT strftime('%Y-%m', date) as month,
                 SUM(CASE WHEN type='income' THEN amount ELSE 0 END) as income,
                 SUM(CASE WHEN type='expense' THEN amount ELSE 0 END) as expenses
          FROM transactions
          WHERE account_id = ? AND strftime('%Y', date) = ?
          GROUP BY month ORDER BY month`,
    args: [accountId, String(year)],
  });

  // Requête top catégories :
  const categories = await db.execute({
    sql: `SELECT category, SUM(amount) as total
          FROM transactions
          WHERE account_id = ? AND type = 'expense' AND strftime('%Y', date) = ?
          GROUP BY category ORDER BY total DESC LIMIT 5`,
    args: [accountId, String(year)],
  });

  // Calculer les agrégats et retourner AnnualReportData
}
```

### `src/app/actions/annual-report-actions.ts` (nouveau)

```typescript
"use server";

import { computeAnnualReport } from "@/lib/annual-report";
import { getUserDb } from "@/lib/db";
import { getRequiredUserId } from "@/lib/auth-utils";
import { canUseAI } from "@/lib/subscription-utils";
import { getSetting } from "@/lib/queries";
import { generateText } from "ai";
import { createOpenAI } from "@ai-sdk/openai";

export async function generateAnnualReportAction(
  accountId: number,
  year: number
): Promise<{ pdfBase64: string; filename: string } | { error: string }> {
  const userId = await getRequiredUserId();

  const aiCheck = await canUseAI(userId);
  if (!aiCheck.allowed) {
    return { error: aiCheck.reason ?? "Fonctionnalité réservée aux plans Pro/Premium" };
  }

  const db = await getUserDb(userId);
  const reportData = await computeAnnualReport(db, accountId, year);

  if (reportData.monthlyData.length === 0) {
    return { error: `Aucune transaction pour l'année ${year}` };
  }

  // Générer le commentaire IA
  const apiKey = await getSetting(db, "openrouter_api_key");
  let aiComment = "";
  if (apiKey) {
    const openrouter = createOpenAI({ baseURL: "https://openrouter.ai/api/v1", apiKey });
    const summary = `Année ${year} :
- Revenus totaux : ${reportData.totalIncome.toFixed(0)}€
- Dépenses totales : ${reportData.totalExpenses.toFixed(0)}€
- Taux d'épargne : ${reportData.annualSavingsRate.toFixed(1)}%
- Top catégories : ${reportData.topExpenseCategories.map(c => `${c.category} ${c.total.toFixed(0)}€`).join(", ")}
- Meilleur mois : ${reportData.bestMonth?.month ?? "N/A"}
- Pire mois : ${reportData.worstMonth?.month ?? "N/A"}`;

    const { text } = await generateText({
      model: openrouter("openai/gpt-4o-mini"),
      system: `Tu es un conseiller financier. Rédige un bilan annuel personnalisé en 150-200 mots.
Identifie 2 points forts et 2 points à améliorer. Donne 2-3 recommandations concrètes pour l'année suivante.
Écris en français, sois direct et bienveillant.`,
      prompt: summary,
    });
    aiComment = text;
  }

  // Générer le PDF (dynamic import — pattern STORY-036)
  const { default: jsPDF } = await import("jspdf");
  // ... construction du PDF avec les données + commentaire IA
  // Retourner le PDF en base64

  return { pdfBase64: "...", filename: `bilan-${year}.pdf` };
}
```

### Interface utilisateur dans `/parametres`

```typescript
// Ajouter sous le bouton "Rapport PDF mensuel" (STORY-036)
// Sélecteur d'année : [2026 ▼] (années avec des données dans la DB)
// Bouton "Générer le bilan annuel" — loading state pendant la génération
// Guard : visible uniquement si canUseAI()
```

---

## Tests unitaires

**Fichier :** `tests/unit/lib/annual-report.test.ts`

**TU-1-1 :** `computeAnnualReport()` avec 12 mois de données → retourne `monthlyData.length = 12`, `totalIncome` correct, `topExpenseCategories.length <= 5`

**TU-1-2 :** `computeAnnualReport()` avec 0 transactions → `monthlyData = []`, `totalIncome = 0`

**TU-1-3 :** `computeAnnualReport()` avec 6 mois de données → `monthlyData.length = 6`, taux d'épargne calculé sur les mois disponibles

**TU-1-4 :** `computeAnnualReport()` — calcul `bestMonth` : mois avec le meilleur net (revenus - dépenses)

**TU-1-5 :** `computeAnnualReport()` — calcul `worstMonth` : mois avec les dépenses les plus élevées

**TU-1-6 :** `computeAnnualReport()` — `topExpenseCategories` trié par montant décroissant, pourcentages = 100% au total

> **Note :** Mocker `db.execute()` avec `vi.fn()` pour retourner les données de test — ne pas utiliser de vraie DB.

---

## Maquette du PDF (structure)

```
BILAN ANNUEL — [COMPTE] — [ANNÉE]
─────────────────────────────────────
RÉSUMÉ FINANCIER
  Revenus totaux      : 28 500€
  Dépenses totales    : 22 300€
  Épargne nette       : 6 200€
  Taux d'épargne      : 21,8%

TOP 5 CATÉGORIES DE DÉPENSES
  Logement      8 400€  (37,7%)
  Alimentation  3 600€  (16,1%)
  Transport     2 800€  (12,6%)
  Loisirs       2 100€  (9,4%)
  Abonnements   1 600€  (7,2%)

MOIS EXTRÊMES
  Meilleur mois : Juillet 2025 (+1 200€ net)
  Pire mois     : Décembre 2025 (−380€ net)

COMMENTAIRE IA
  [Texte généré par l'IA — 150-200 mots]

─────────────────────────────────────
Généré par track-my-cash — [date]
```

---

## Fichiers à créer/modifier

| Fichier | Action |
|---------|--------|
| `src/lib/annual-report.ts` | CRÉER — `computeAnnualReport()` logique pure |
| `src/app/actions/annual-report-actions.ts` | CRÉER — `generateAnnualReportAction()` |
| `src/app/[locale]/(app)/parametres/page.tsx` | MODIFIER — ajouter bouton bilan annuel (guard Pro/Premium) |
| `tests/unit/lib/annual-report.test.ts` | CRÉER — 6 tests |
