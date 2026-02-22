# STORY-043 — Parsers N26 et Wise (marché EU)

**Sprint :** Sprint Compatibilité, IA & Analyse Avancée (v6)
**Priorité :** P2
**Complexité :** S (2 points)
**Bloquée par :** aucune (parallèle à STORY-039)
**Statut :** pending

---

## Description

L'app est internationalisée en 5 langues (FR, EN, ES, IT, DE) mais l'import est limité aux banques françaises et à Revolut. N26 (~10M clients EU, présent en France, Allemagne, Espagne, Italie) et Wise (~13M clients mondiaux, très utilisé pour les virements internationaux) sont les deux fintechs les plus répandues dans notre audience cible internationale.

---

## Contexte technique

- Même architecture `BankParser` que STORY-039
- Les deux parsers exportent des CSV avec séparateur `,` (format international)
- N26 exporte une seule colonne `Amount` (positif = income, négatif = expense)
- Wise exporte une colonne `Amount` avec devise dans une colonne séparée `Currency`
- Les deux utilisent le format de date ISO 8601 (YYYY-MM-DD) — aucune conversion nécessaire

---

## Formats cibles

### N26 CSV

```
Date,Payee,Account number,Transaction type,Payment reference,Category,Amount (EUR),Amount (Foreign Currency),Type Foreign Currency,Exchange Rate
2026-01-15,Employer GmbH,,Incoming Transfer,Salary January,,2500.00,,,
2026-01-18,REWE,,MasterCard,,,- 85.30,,,
2026-01-22,Netflix,,Direct Debit,,,- 15.99,,,
```

Signal de détection : header contient `"Payee"` ET `"Transaction type"` ET `"Amount (EUR)"`

### Wise CSV

```
TransferWise ID,Date,Amount,Currency,Description,Payment Reference,Running Balance,Exchange From,Exchange To,Exchange Rate,Payer Name,Payee Name,Payee Account Number,Merchant,Card Last Four Digits,Card Holder Full Name,Attachment,Note,Total fees,Total amount charged
12345,15-01-2026,2500.00,EUR,Salary transfer,,3200.00,,,,,,,,,,,,
67890,18-01-2026,-85.30,EUR,Amazon purchase,,3114.70,,,,,,,,,,,,
```

Signal de détection : header contient `"TransferWise ID"` ou `"TransferWise"` (insensible à la casse)

---

## Acceptance Criteria

**AC-1 :** Un fichier N26 CSV est détecté automatiquement via son header et importé sans intervention manuelle

**AC-2 :** Un fichier Wise CSV est détecté et les montants négatifs sont importés en `expense`, positifs en `income`

**AC-3 :** Pour Wise, la devise réelle (colonne `Currency`) est utilisée — pas toujours EUR

**AC-4 :** Les dates ISO (YYYY-MM-DD pour N26, DD-MM-YYYY pour Wise) sont correctement converties en format interne

**AC-5 :** Tests unitaires avec fixtures CSV pour N26 et Wise — tous verts

---

## Spécifications techniques

### `src/lib/parsers/n26.ts`

```typescript
import type { BankParser, ParseResult } from "./types";

export const n26Parser: BankParser = {
  name: "N26",

  canHandle(filename: string, content?: string): boolean {
    if (!filename.toLowerCase().endsWith(".csv")) return false;
    const header = content?.split("\n")[0] ?? "";
    return (
      header.includes("Payee") &&
      header.includes("Transaction type") &&
      header.includes("Amount")
    );
  },

  parse(content: string | null): ParseResult {
    // Séparateur ","
    // Colonne "Amount (EUR)" : négatif = expense, positif = income
    // Colonne "Date" : YYYY-MM-DD (déjà ISO — pas de conversion)
    // Colonne "Payee" : description
    // currency : "EUR" (fixe)
  }
};
```

### `src/lib/parsers/wise.ts`

```typescript
export const wiseParser: BankParser = {
  name: "Wise",

  canHandle(filename: string, content?: string): boolean {
    if (!filename.toLowerCase().endsWith(".csv")) return false;
    const header = content?.split("\n")[0] ?? "";
    return (
      header.toLowerCase().includes("transferwise") ||
      (header.includes("TransferWise ID") || header.startsWith("TransferWise"))
    );
  },

  parse(content: string | null): ParseResult {
    // Séparateur ","
    // Colonne "Amount" : négatif = expense, positif = income
    // Colonne "Currency" : devise réelle (EUR, USD, GBP...)
    // Colonne "Date" : DD-MM-YYYY → convertir en YYYY-MM-DD
    // Colonne "Description" : libellé
    // Si multiple devises dans le fichier → prendre la devise majoritaire
    // ou retourner la devise de chaque transaction (currency per transaction)
  }
};
```

### Mise à jour `src/lib/parsers/registry.ts`

```typescript
import { n26Parser } from "./n26";
import { wiseParser } from "./wise";

const parsers: BankParser[] = [
  mcbPdfParser, revolutParser, mcbCsvParser, creditAgricoleParser,
  caisseEpargneParser, societeGeneraleParser, bnpParser,
  n26Parser,   // ← nouveau
  wiseParser,  // ← nouveau
  banquePopulaireParser, genericCsvParser,
];
```

---

## Tests unitaires

**Fichier :** `tests/unit/lib/parsers/n26.test.ts`
**Fichier :** `tests/unit/lib/parsers/wise.test.ts`

**TU-1-1 :** `n26Parser.canHandle("n26-export.csv", N26_FIXTURE)` → `true`
**TU-1-2 :** `n26Parser.canHandle("releve-sg.csv", SG_FIXTURE)` → `false` (pas le bon header)
**TU-1-3 :** `n26Parser.parse(N26_FIXTURE)` → 3 transactions, montants corrects, types income/expense
**TU-1-4 :** `n26Parser.parse()` — montant "- 85.30" avec espace → `expense` de 85.30

**TU-2-1 :** `wiseParser.canHandle("wise-statement.csv", WISE_FIXTURE)` → `true`
**TU-2-2 :** `wiseParser.parse(WISE_FIXTURE)` → date "15-01-2026" convertie en "2026-01-15"
**TU-2-3 :** `wiseParser.parse()` — colonne Currency "USD" → devise retournée "USD"

---

## Fixtures de test

```typescript
const N26_FIXTURE = `Date,Payee,Account number,Transaction type,Payment reference,Category,Amount (EUR),Amount (Foreign Currency),Type Foreign Currency,Exchange Rate
2026-01-15,Employer GmbH,,Incoming Transfer,Salary,,2500.00,,,
2026-01-18,REWE Berlin,,MasterCard,,,- 85.30,,,
2026-01-22,Netflix,,Direct Debit,,,- 15.99,,,`;

const WISE_FIXTURE = `TransferWise ID,Date,Amount,Currency,Description,Payment Reference,Running Balance
12345,15-01-2026,2500.00,EUR,Salary transfer,,3200.00
67890,18-01-2026,-85.30,EUR,Amazon purchase,,3114.70
11111,22-01-2026,-15.99,EUR,Netflix subscription,,3098.71`;
```

---

## Fichiers à créer/modifier

| Fichier | Action |
|---------|--------|
| `src/lib/parsers/n26.ts` | CRÉER |
| `src/lib/parsers/wise.ts` | CRÉER |
| `src/lib/parsers/registry.ts` | MODIFIER — ajouter n26Parser + wiseParser |
| `src/lib/parsers/index.ts` | MODIFIER — ajouter 2 exports |
| `tests/unit/lib/parsers/n26.test.ts` | CRÉER — 4 tests |
| `tests/unit/lib/parsers/wise.test.ts` | CRÉER — 3 tests |
