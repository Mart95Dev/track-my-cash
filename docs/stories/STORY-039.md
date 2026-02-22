# STORY-039 — Parsers BNP Paribas, Société Générale, Caisse d'Épargne

**Sprint :** Sprint Compatibilité, IA & Analyse Avancée (v6)
**Priorité :** P1
**Complexité :** M (3 points)
**Bloquée par :** aucune
**Statut :** pending

---

## Description

Seules 5 banques sont actuellement supportées à l'import (Banque Populaire, Crédit Agricole, MCB CSV, MCB PDF, Revolut). BNP Paribas (~13M clients), Société Générale (~9M) et Caisse d'Épargne (~8M) représentent ~30M de clients français non couverts — la majorité du marché cible.

L'architecture `BankParser` (interface `canHandle()` + `parse()`) est déjà en place dans `src/lib/parsers/`. Il suffit d'implémenter 3 nouveaux parsers et de les enregistrer dans `registry.ts`.

---

## Contexte technique

- Interface : `src/lib/parsers/types.ts` — `BankParser` avec `name`, `canHandle()`, `parse()`
- Registre : `src/lib/parsers/registry.ts` — ajouter les nouveaux parsers dans le tableau `parsers[]`
- Index : `src/lib/parsers/index.ts` — ajouter les exports
- Helpers réutilisables : `src/lib/parsers/utils.ts` — `fixMojibake()`, `parseAmount()`, `parseFRAmount()`, `parseDateFR()`

---

## Formats cibles

| Banque | Séparateur | Date | Encodage | Signal de détection |
|--------|-----------|------|----------|---------------------|
| BNP Paribas | `;` | DD/MM/YYYY | UTF-8 | `"Référence";"Libellé simplifié";"Montant"` ou `Date;*;Montant en euros` |
| Société Générale | `;` | DD/MM/YYYY | UTF-8 | `Date;Libellé;Référence;Débit euros;Crédit euros` |
| Caisse d'Épargne | `;` | DD/MM/YYYY | ISO-8859-1 | `Numéro;Date opération;Libellé;Débit;Crédit` |

---

## Acceptance Criteria

**AC-1 :** Un fichier BNP Paribas CSV est détecté automatiquement via `canHandle()` et importé sans intervention manuelle

**AC-2 :** Un fichier Société Générale CSV est détecté et importé — colonnes `Débit euros`/`Crédit euros` correctement mappées en type `expense`/`income`

**AC-3 :** Un fichier Caisse d'Épargne CSV (encodage ISO-8859-1) est détecté et les accents sont corrects (via `fixMojibake()`)

**AC-4 :** Les doublons d'import (`import_hash` basé sur date+description+montant) fonctionnent sur les 3 nouveaux parsers

**AC-5 :** Tests unitaires avec fixtures CSV miniatures pour chaque parser — tous verts

---

## Spécifications techniques

### `src/lib/parsers/bnp-paribas.ts`

```typescript
import type { BankParser, ParseResult } from "./types";
import { parseFRAmount, parseDateFR } from "./utils";

export const bnpParser: BankParser = {
  name: "BNP Paribas",

  canHandle(filename: string, content?: string): boolean {
    if (!filename.toLowerCase().endsWith(".csv")) return false;
    if (!content) return false;
    // Détecter par l'en-tête caractéristique
    const header = content.split("\n")[0] ?? "";
    return (
      header.includes("Libellé simplifié") ||
      header.includes("Montant en euros") ||
      (header.includes("Date") && header.includes("Montant") && header.startsWith('"'))
    );
  },

  parse(content: string | null): ParseResult {
    // Parser les lignes CSV avec séparateur ";"
    // Colonnes: Date | Libellé simplifié | Référence | Montant en euros | ...
    // Montant négatif = expense, positif = income
  }
};
```

### `src/lib/parsers/societe-generale.ts`

```typescript
export const societeGeneraleParser: BankParser = {
  name: "Société Générale",

  canHandle(filename, content): boolean {
    if (!filename.toLowerCase().endsWith(".csv")) return false;
    const header = content?.split("\n")[0] ?? "";
    return (
      header.includes("Débit euros") ||
      header.includes("Crédit euros") ||
      (header.includes("Date") && header.includes("Référence") && header.includes("Libellé"))
    );
  },

  parse(content): ParseResult {
    // Colonnes: Date | Libellé | Référence | Débit euros | Crédit euros
    // Si Débit > 0 → expense ; si Crédit > 0 → income
  }
};
```

### `src/lib/parsers/caisse-epargne.ts`

```typescript
export const caisseEpargneParser: BankParser = {
  name: "Caisse d'Épargne",

  canHandle(filename, content): boolean {
    if (!filename.toLowerCase().endsWith(".csv")) return false;
    const fixed = fixMojibake(content ?? ""); // Fix ISO-8859-1
    const header = fixed.split("\n")[0] ?? "";
    return (
      header.includes("Numéro") && header.includes("Date opération") ||
      (header.includes("Libellé") && header.includes("Débit") && header.includes("Crédit") && header.startsWith("Numéro"))
    );
  },

  parse(content): ParseResult {
    // Appliquer fixMojibake() en premier
    // Colonnes: Numéro | Date opération | Libellé | Débit | Crédit
  }
};
```

### Mise à jour `src/lib/parsers/registry.ts`

```typescript
import { bnpParser } from "./bnp-paribas";
import { societeGeneraleParser } from "./societe-generale";
import { caisseEpargneParser } from "./caisse-epargne";
// ... imports existants

const parsers: BankParser[] = [
  mcbPdfParser,
  revolutParser,
  mcbCsvParser,
  creditAgricoleParser,
  caisseEpargneParser,   // ← nouveau
  societeGeneraleParser, // ← nouveau
  bnpParser,             // ← nouveau
  banquePopulaireParser, // Fallback BP
];
```

### Mise à jour `src/lib/parsers/index.ts`

```typescript
export { bnpParser } from "./bnp-paribas";
export { societeGeneraleParser } from "./societe-generale";
export { caisseEpargneParser } from "./caisse-epargne";
```

---

## Tests unitaires

**Fichier :** `tests/unit/lib/parsers/bnp.test.ts`
**Fichier :** `tests/unit/lib/parsers/societe-generale.test.ts`
**Fichier :** `tests/unit/lib/parsers/caisse-epargne.test.ts`

**TU-1-1 :** `bnpParser.canHandle("export.csv", BNP_FIXTURE_HEADER)` → `true`
**TU-1-2 :** `bnpParser.canHandle("export.xlsx", BNP_FIXTURE_HEADER)` → `false` (mauvaise extension)
**TU-1-3 :** `bnpParser.parse(BNP_FIXTURE_CSV)` → 3 transactions avec date, description, amount, type corrects
**TU-1-4 :** `bnpParser.parse()` — transaction à montant négatif → `type: "expense"`
**TU-2-1 :** `societeGeneraleParser.canHandle("releve-sg.csv", SG_FIXTURE)` → `true`
**TU-2-2 :** `societeGeneraleParser.parse(SG_FIXTURE_CSV)` — colonne Débit → `expense`, Crédit → `income`
**TU-3-1 :** `caisseEpargneParser.canHandle("CE.csv", CE_FIXTURE_ISO)` → `true`
**TU-3-2 :** `caisseEpargneParser.parse(CE_FIXTURE_ISO)` → accents correctement décodés (ISO-8859-1)

---

## Fixtures de test

```typescript
// BNP Paribas
const BNP_FIXTURE = `Date;Libellé simplifié;Référence;Montant en euros;Devise
15/01/2026;VIR SALAIRE;12345;2500.00;EUR
18/01/2026;CARREFOUR MARKET;67890;-85.30;EUR
22/01/2026;NETFLIX;11111;-15.99;EUR`;

// Société Générale
const SG_FIXTURE = `Date;Libellé;Référence;Débit euros;Crédit euros
2026-01-15;VIR SALAIRE;;; 2 500,00
2026-01-18;FNAC PARIS;ABC123;42,90;
2026-01-22;ABONNEMENT SPOTIFY;XYZ;9,99;`;

// Caisse d'Épargne (encodage simulé UTF-8 pour tests)
const CE_FIXTURE = `Numéro;Date opération;Libellé;Débit;Crédit
1234;15/01/2026;Virement salaire janvier;;2500,00
5678;18/01/2026;Achat Monoprix;67,50;
9012;22/01/2026;Abonnement Free;29,99;`;
```

---

## Fichiers à créer/modifier

| Fichier | Action |
|---------|--------|
| `src/lib/parsers/bnp-paribas.ts` | CRÉER |
| `src/lib/parsers/societe-generale.ts` | CRÉER |
| `src/lib/parsers/caisse-epargne.ts` | CRÉER |
| `src/lib/parsers/registry.ts` | MODIFIER — ajouter 3 parsers |
| `src/lib/parsers/index.ts` | MODIFIER — ajouter 3 exports |
| `tests/unit/lib/parsers/bnp.test.ts` | CRÉER |
| `tests/unit/lib/parsers/societe-generale.test.ts` | CRÉER |
| `tests/unit/lib/parsers/caisse-epargne.test.ts` | CRÉER |
