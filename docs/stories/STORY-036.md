# STORY-036 — Export rapport PDF mensuel

**Sprint :** Sprint Objectifs & Intelligence
**Priorité :** P2
**Complexité :** M (3 points)
**Bloquée par :** STORY-033
**Statut :** pending

---

## Description

Les utilisateurs Pro/Premium doivent pouvoir télécharger un rapport financier mensuel en PDF, plus complet que l'email récapitulatif (STORY-026). Le rapport inclut le résumé du mois, la répartition par catégorie, les 10 principales transactions et la progression des objectifs d'épargne (STORY-033).

---

## Contexte technique

- Utiliser `jspdf` + `jspdf-autotable` (léger, compatible Node.js/Edge) **ou** `@react-pdf/renderer` (React)
- Préférer `jspdf` + `jspdf-autotable` car il fonctionne en Server Action sans render React
- Freemium guard : feature réservée aux plans Pro/Premium
- Données sources : `getMonthlySummary()`, `getExpensesByBroadCategory()`, `getTransactions()`, `getGoals()`
- Le PDF est généré côté serveur et retourné comme Buffer (base64) au client pour download

---

## Architecture

1. **Server Action** `generateMonthlyReportAction(month: string)` :
   - Récupère toutes les données du mois (summary, categories, top transactions, goals)
   - Génère le PDF avec jspdf
   - Retourne `{ pdfBase64: string }` ou `{ error: string }`

2. **Client Component** `monthly-report-button.tsx` :
   - Bouton "Télécharger rapport PDF" dans `/parametres` (section Données)
   - Sélecteur de mois (default = mois précédent)
   - `onClick` → appelle action → crée Blob → déclenche download via `<a>` click

---

## Contenu du PDF (structure)

```
┌─────────────────────────────────────────┐
│  track-my-cash — Rapport Financier      │
│  Janvier 2026                           │
├─────────────────────────────────────────┤
│  RÉSUMÉ DU MOIS                         │
│  Revenus : 2 500 €                      │
│  Dépenses : 1 850 €                     │
│  Balance : +650 €                       │
│  Taux d'épargne : 26%                   │
├─────────────────────────────────────────┤
│  RÉPARTITION PAR CATÉGORIE              │
│  [tableau: Catégorie | Montant | %]     │
├─────────────────────────────────────────┤
│  TOP 10 TRANSACTIONS                    │
│  [tableau: Date | Description | Montant]│
├─────────────────────────────────────────┤
│  OBJECTIFS D'ÉPARGNE                    │
│  [tableau: Objectif | Progression | %] │
└─────────────────────────────────────────┘
```

---

## Acceptance Criteria

**AC-1 :** Le bouton "Télécharger rapport PDF" est visible dans `/parametres` pour les plans Pro/Premium uniquement

**AC-2 :** Le PDF généré contient au minimum : résumé mensuel, répartition par catégorie, top 10 transactions

**AC-3 :** Si des objectifs d'épargne existent (STORY-033), ils sont inclus dans le PDF

**AC-4 :** Le nom du fichier téléchargé est `rapport-<YYYY-MM>.pdf` (ex: `rapport-2026-01.pdf`)

**AC-5 :** Le PDF contient un header avec "track-my-cash" et le mois concerné

**AC-6 :** Les montants sont formatés en euros (ou devise principale) avec 2 décimales

**AC-7 :** Si aucune donnée pour le mois sélectionné, retourne `{ error: "Aucune donnée pour ce mois" }`

---

## Spécifications techniques

### `src/app/actions/report-actions.ts` — à créer

```typescript
export async function generateMonthlyReportAction(
  month: string // format YYYY-MM
): Promise<{ pdfBase64: string; filename: string } | { error: string }>
```

### `src/components/monthly-report-button.tsx` — à créer

```typescript
"use client";
// Sélecteur de mois (input type="month") + bouton "Télécharger PDF"
// States: idle | loading | error
// On success: crée Blob, URL.createObjectURL, déclenche download
```

---

## Tests unitaires à créer

**Fichier :** `tests/unit/actions/report-actions.test.ts`

**TU-1-1 :** `generateMonthlyReportAction` avec données valides → retourne `{ pdfBase64: string }`
**TU-1-2 :** `generateMonthlyReportAction` retourne un `pdfBase64` non vide (longueur > 100)
**TU-1-3 :** `generateMonthlyReportAction` inclut le mois dans le `filename`
**TU-1-4 :** `generateMonthlyReportAction` sans données pour le mois → retourne `{ error }`
**TU-1-5 :** Plan Free → retourne `{ error: "feature réservée aux plans Pro/Premium" }`

**Mocks requis :**
- `@/lib/auth-utils` : `getRequiredUserId`, `getRequiredSession`
- `@/lib/db` : `getUserDb`
- `@/lib/queries` : `getMonthlySummary`, `getExpensesByBroadCategory`, `getTransactions`, `getGoals`
- `@/lib/subscription-utils` : `canUseAI` ou guard plan
- `jspdf` : mock minimal

---

## Dépendances à installer

```bash
npm install jspdf jspdf-autotable
```

---

## Fichiers à créer/modifier

- `src/app/actions/report-actions.ts` — créer
- `src/components/monthly-report-button.tsx` — créer
- `src/app/[locale]/(app)/parametres/page.tsx` — ajouter `<MonthlyReportButton />`
- `tests/unit/actions/report-actions.test.ts` — créer (5 tests)
