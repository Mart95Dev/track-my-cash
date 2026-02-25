# STORY-096 — Email hebdo étendu — stats couple

**Sprint :** v13 — Activation & Rétention Couple
**Priorité :** P2 — SHOULD HAVE
**Complexité :** S
**Points :** 2
**Epic :** engagement
**Dépendances :** STORY-061 (email hebdo existant), STORY-087 (getSharedTransactionsForCouple)

---

## Description

Étendre le `WeeklySummaryData` et le template email hebdo (STORY-061) pour inclure une section conditionnelle "Cette semaine en couple" pour les abonnés Pro/Premium ayant un couple actif.

**Données couple ajoutées :**
```typescript
interface CoupleWeeklyData {
  sharedExpenses: number;       // total dépenses partagées — 7 derniers jours
  balance: number;              // diff actuelle (positif = partenaire doit)
  topSharedCategory: string;    // catégorie #1 commune de la semaine
  transactionCount: number;     // nb transactions partagées de la semaine
  partnerName: string;          // prénom/email du partenaire
}
```

**Section email :**
```
💑 Cette semaine en couple
─────────────────────────
X transactions partagées · Total Y€
Catégorie principale : Courses alimentaires
Balance : Marie vous doit 35€   [ou "Vous devez 35€ à Marie"]
```

---

## Critères d'acceptation

| # | Critère |
|---|---------|
| AC-1 | `coupleWeekly` calculé dans `computeWeeklySummary()` si couple actif + Pro/Premium |
| AC-2 | `coupleWeekly` absent si pas de couple |
| AC-3 | `coupleWeekly` absent si plan Gratuit |
| AC-4 | Section "Cette semaine en couple" rendue dans le template email si `coupleWeekly` défini |
| AC-5 | Section couple absente dans le rendu si `coupleWeekly` non défini |
| AC-6 | Balance affichée correctement : positif → "partenaire vous doit", négatif → "vous devez" |

---

## Cas de tests unitaires

### `getCoupleWeeklyStats(coupleId, since)` → `src/lib/couple-queries.ts`

| ID | Description | Résultat attendu |
|----|-------------|-----------------|
| TU-96-1 | 3 tx partagées depuis 7j → retourne total correct | `{ transactionCount: 3, sharedExpenses: X }` |
| TU-96-2 | Catégorie dominante identifiée | `{ topSharedCategory: "Courses" }` |
| TU-96-3 | Aucune tx partagée → `transactionCount: 0` | `sharedExpenses: 0` |

### `computeWeeklySummary()` enrichi → `src/lib/weekly-summary.ts`

| ID | Description | Résultat attendu |
|----|-------------|-----------------|
| TU-96-4 | User Pro + couple actif → `coupleWeekly` présent | Objet défini |
| TU-96-5 | User Gratuit + couple actif → `coupleWeekly` absent | `undefined` |
| TU-96-6 | User Pro + pas de couple → `coupleWeekly` absent | `undefined` |

### Template email couple → `src/components/emails/weekly-summary.tsx`

| ID | Description | Résultat attendu |
|----|-------------|-----------------|
| TU-96-7 | `coupleWeekly` défini → section "en couple" dans le rendu | Texte "couple" présent |
| TU-96-8 | `coupleWeekly` undefined → section absente | Texte "couple" absent |
| TU-96-9 | Balance positive → "partenaire vous doit" | Libellé correct |
| TU-96-10 | Balance négative → "vous devez" | Libellé correct |

---

## Mapping AC → Tests

| AC | Tests couvrants |
|----|----------------|
| AC-1 | TU-96-4 |
| AC-2 | TU-96-6 |
| AC-3 | TU-96-5 |
| AC-4 | TU-96-7 |
| AC-5 | TU-96-8 |
| AC-6 | TU-96-9, TU-96-10 |

---

## Données de test / fixtures

```typescript
const mockCoupleWeekly: CoupleWeeklyData = {
  sharedExpenses: 245.50,
  balance: 35,               // partenaire doit 35€
  topSharedCategory: "Courses alimentaires",
  transactionCount: 4,
  partnerName: "Marie",
};

const mockCoupleWeeklyNegative: CoupleWeeklyData = {
  ...mockCoupleWeekly,
  balance: -20,              // je dois 20€ à Marie
};
```

---

## Fichiers à créer / modifier

| Fichier | Action |
|---------|--------|
| `src/lib/couple-queries.ts` | Modifier — ajouter `getCoupleWeeklyStats(coupleId, since)` |
| `src/lib/weekly-summary.ts` | Modifier — enrichir `computeWeeklySummary()` |
| `src/components/emails/weekly-summary.tsx` | Modifier — section couple conditionnelle |
| `tests/unit/lib/weekly-summary-couple.test.ts` | Créer |
| `tests/unit/emails/weekly-email-couple.test.tsx` | Créer |
