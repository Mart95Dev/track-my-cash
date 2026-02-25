# STORY-097 — Export PDF rapport mensuel (Pro/Premium)

**Sprint :** v13 — Activation & Rétention Couple
**Priorité :** P3 — COULD HAVE
**Complexité :** M
**Points :** 3
**Epic :** valeur-percue
**Dépendances :** aucune (API route indépendante)

---

## Description

Implémenter l'export PDF mensuel présent dans `COMPARISON_FEATURES` (`"Export PDF mensuel", pro: true, premium: true`) mais non encore développé. Rapport individuel (+ section couple si applicable) téléchargeable depuis `/parametres`.

**Bibliothèque :** `jsPDF` + `jspdf-autotable` — légères, compatibles Edge runtime, pas de dépendance système.

**Contenu du rapport (A4 portrait) :**
1. **En-tête** : Logo TMC (texte) + "Rapport mensuel — {Mois YYYY}" + date de génération
2. **Résumé** : Revenus / Dépenses / Solde net (3 colonnes)
3. **Top 5 catégories de dépenses** : Tableau (catégorie · montant · % du total)
4. **Transactions du mois** : Tableau paginé (date · description · catégorie · montant)
5. **Section couple** (si couple actif) : Dépenses communes + balance + top catégories communes

**Route :** `GET /api/reports/monthly?month=YYYY-MM&accountId=xxx`
**Gate :** plan Pro ou Premium (retourne 403 si Gratuit)

---

## Critères d'acceptation

| # | Critère |
|---|---------|
| AC-1 | `GET /api/reports/monthly?month=2026-01` retourne `Content-Type: application/pdf` |
| AC-2 | PDF contient revenus, dépenses et solde net du mois |
| AC-3 | PDF contient le top 5 des catégories de dépenses |
| AC-4 | Route retourne 403 si plan Gratuit |
| AC-5 | Route retourne 400 si paramètre `month` manquant ou format invalide |
| AC-6 | Bouton "Télécharger PDF" visible dans `/parametres` pour Pro/Premium |
| AC-7 | Bouton absent (ou grisé avec upgrade modal) pour plan Gratuit |
| AC-8 | Section couple incluse dans le PDF si couple actif |

---

## Cas de tests unitaires

### `generateMonthlyReport(data)` → `src/lib/pdf-report.ts`

| ID | Description | Résultat attendu |
|----|-------------|-----------------|
| TU-97-1 | Appel avec données valides → retourne `Uint8Array` non vide | `buffer.length > 0` |
| TU-97-2 | Buffer commence par `%PDF` (signature PDF) | `buffer.slice(0,4)` = `%PDF` |
| TU-97-3 | Données couple définies → rapport contient section couple | Pas d'erreur, buffer non null |
| TU-97-4 | Données couple undefined → rapport sans section couple | Pas d'erreur |

### `validateMonthParam(month)` → `src/lib/pdf-report.ts`

| ID | Description | Résultat attendu |
|----|-------------|-----------------|
| TU-97-5 | `"2026-01"` → valide | `true` |
| TU-97-6 | `"2026-1"` → invalide | `false` |
| TU-97-7 | `""` → invalide | `false` |
| TU-97-8 | `"2026-13"` → invalide (mois > 12) | `false` |

### Route `GET /api/reports/monthly` → `src/app/api/reports/monthly/route.ts`

| ID | Description | Résultat attendu |
|----|-------------|-----------------|
| TU-97-9 | Plan Gratuit → retourne 403 | `response.status === 403` |
| TU-97-10 | `month` manquant → retourne 400 | `response.status === 400` |

### `ExportPdfButton` → `src/components/export-pdf-button.tsx`

| ID | Description | Résultat attendu |
|----|-------------|-----------------|
| TU-97-11 | Plan Pro → bouton affiché et activé | Élément bouton présent |
| TU-97-12 | Plan Gratuit → bouton absent ou désactivé | Pas de lien actif |

---

## Mapping AC → Tests

| AC | Tests couvrants |
|----|----------------|
| AC-1 | TU-97-1, TU-97-2 |
| AC-2 | TU-97-1 (contenu implicite) |
| AC-3 | TU-97-1 (contenu implicite) |
| AC-4 | TU-97-9 |
| AC-5 | TU-97-10 |
| AC-6 | TU-97-11 |
| AC-7 | TU-97-12 |
| AC-8 | TU-97-3 |

---

## Données de test / fixtures

```typescript
const reportData = {
  month: "2026-02",
  accounts: [{ name: "Compte Courant", balance: 1250 }],
  revenues: 3200,
  expenses: 1950,
  net: 1250,
  topCategories: [
    { category: "Courses", amount: 450, pct: 23 },
    { category: "Loyer", amount: 800, pct: 41 },
    { category: "Transports", amount: 120, pct: 6 },
    { category: "Restaurants", amount: 180, pct: 9 },
    { category: "Santé", amount: 90, pct: 5 },
  ],
  transactions: [/* ... */],
  coupleData: {
    sharedExpenses: 345,
    balance: 25,
    partnerName: "Marie",
    topSharedCategory: "Courses",
  },
};
```

---

## Fichiers à créer / modifier

| Fichier | Action |
|---------|--------|
| `src/app/api/reports/monthly/route.ts` | Créer — génération PDF via jsPDF |
| `src/lib/pdf-report.ts` | Créer — `generateMonthlyReport()` + `validateMonthParam()` |
| `src/components/export-pdf-button.tsx` | Créer — bouton téléchargement avec gate |
| `src/app/[locale]/(app)/parametres/page.tsx` | Modifier — section "Export PDF" |
| `tests/unit/lib/pdf-report.test.ts` | Créer |
| `tests/unit/components/export-pdf-button.test.tsx` | Créer |

## Note d'installation

```bash
npm install jspdf jspdf-autotable
```
