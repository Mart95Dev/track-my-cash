# STORY-040 — Parser CSV générique avec mapping colonnes (catch-all)

**Sprint :** Sprint Compatibilité, IA & Analyse Avancée (v6)
**Priorité :** P1
**Complexité :** M (3 points)
**Bloquée par :** aucune (parallèle à STORY-039)
**Statut :** pending

---

## Description

Quelle que soit la banque de l'utilisateur, si le format n'est pas reconnu automatiquement, il reçoit actuellement une erreur opaque "Format non reconnu". Cette story implémente un **parser de dernier recours** : tout CSV non reconnu déclenche un dialog de mapping permettant à l'utilisateur de déclarer manuellement quelle colonne correspond à la date, au montant et à la description. Le mapping est sauvegardé en DB pour les prochains imports.

---

## Contexte technique

- L'architecture `detectAndParseFile()` dans `registry.ts` itère les parsers et utilise `banquePopulaireParser` en fallback — ce qui échoue pour les CSV inconnus
- Le composant `import-button.tsx` gère le résultat de l'import côté client
- Les mappings seront sauvegardés via `setSetting(db, "csv_mapping_[fingerprint]", JSON)` dans la table `settings`

---

## Architecture

```
Fichier CSV uploadé
      ↓
detectAndParseFile() — aucun parser reconnaît le fichier
      ↓
genericCsvParser.canHandle() → toujours true pour .csv
      ↓
genericCsvParser.parse() → { needsMapping: true, headers: string[], preview: rows[][] }
      ↓
import-actions.ts retourne { needsMapping: true, headers, preview }
      ↓
CsvMappingDialog.tsx s'ouvre → utilisateur configure les colonnes
      ↓
Re-parse avec le mapping → transactions importées normalement
```

---

## Acceptance Criteria

**AC-1 :** Pour tout CSV non reconnu automatiquement, un dialog de mapping s'ouvre au lieu d'afficher une erreur

**AC-2 :** L'utilisateur peut sélectionner quelle colonne contient : la date, le montant (ou débit/crédit séparément), la description

**AC-3 :** Un aperçu des 5 premières transactions parsées (avec le mapping courant) s'affiche dans le dialog avant validation

**AC-4 :** Après validation, l'import s'effectue normalement — les transactions sont insérées avec `import_hash`

**AC-5 :** Le mapping est sauvegardé en DB (clé basée sur le fingerprint des headers) et proposé automatiquement au prochain import similaire

---

## Spécifications techniques

### `src/lib/parsers/generic-csv.ts`

```typescript
export interface GenericParseResult {
  needsMapping: true;
  headers: string[];
  preview: string[][];
  fingerprint: string; // hash des headers pour identifier le format
}

export interface ColumnMapping {
  dateColumn: string;
  amountColumn?: string;      // Si colonne unique (positif = revenu, négatif = dépense)
  debitColumn?: string;       // Si colonnes séparées
  creditColumn?: string;
  descriptionColumn: string;
  separator: ";" | "," | "\t";
  dateFormat: "DD/MM/YYYY" | "YYYY-MM-DD" | "DD-MM-YYYY" | "DD-MMM-YYYY";
}

export const genericCsvParser: BankParser & {
  parseWithMapping(content: string, mapping: ColumnMapping): ParseResult;
  detectHeaders(content: string): { headers: string[]; preview: string[][]; fingerprint: string };
} = {
  name: "CSV générique",

  canHandle(filename: string): boolean {
    return filename.toLowerCase().endsWith(".csv");
  },

  // Retourne toujours needsMapping si appelé sans mapping
  parse(content): ParseResult {
    // Ce parser ne doit être appelé qu'avec parseWithMapping
    // Si appelé sans contexte, retourner une ParseResult vide qui signale le besoin de mapping
    return { transactions: [], detectedBalance: null, detectedBalanceDate: null, bankName: "CSV générique", currency: "EUR" };
  },

  parseWithMapping(content: string, mapping: ColumnMapping): ParseResult {
    // Parse avec les colonnes configurées
  },

  detectHeaders(content: string): { headers: string[]; preview: string[][]; fingerprint: string } {
    // Détecter le séparateur, extraire les headers et les 5 premières lignes
  }
};
```

### Modification `src/lib/parsers/registry.ts`

```typescript
// Ajouter le genericCsvParser EN DERNIER (après tous les parsers spécialisés)
const parsers: BankParser[] = [
  mcbPdfParser, revolutParser, mcbCsvParser, creditAgricoleParser,
  caisseEpargneParser, societeGeneraleParser, bnpParser,
  banquePopulaireParser,
  genericCsvParser, // ← DERNIER — catch-all
];

export async function detectAndParseFile(
  filename, content, buffer
): Promise<ParseResult | { needsMapping: true; headers: string[]; preview: string[][]; fingerprint: string }> {
  for (const parser of parsers) {
    if (parser.canHandle(filename, content ?? undefined, buffer ?? undefined)) {
      if (parser.name === "CSV générique") {
        // Retourner les headers pour que l'UI ouvre le dialog
        return genericCsvParser.detectHeaders(content ?? "");
      }
      return await parser.parse(content, buffer);
    }
  }
  return { transactions: [], detectedBalance: null, detectedBalanceDate: null, bankName: "Inconnu", currency: "EUR" };
}
```

### Modification `src/app/actions/import-actions.ts`

```typescript
export async function importFileAction(formData: FormData) {
  // ...
  const result = await detectAndParseFile(filename, content, buffer);

  if ("needsMapping" in result && result.needsMapping) {
    // Vérifier si un mapping sauvegardé existe pour ce fingerprint
    const savedMapping = await getSetting(db, `csv_mapping_${result.fingerprint}`);
    if (savedMapping) {
      const mapping: ColumnMapping = JSON.parse(savedMapping);
      const parsed = genericCsvParser.parseWithMapping(content!, mapping);
      // Continuer avec l'import normal
    }
    // Retourner les infos pour le dialog
    return { needsMapping: true, headers: result.headers, preview: result.preview, fingerprint: result.fingerprint };
  }
  // ... import normal
}

export async function importWithMappingAction(
  formData: FormData,
  mapping: ColumnMapping,
  fingerprint: string,
  saveMapping: boolean
): Promise<ImportResult> {
  // Parse avec le mapping
  // Si saveMapping → setSetting(db, `csv_mapping_${fingerprint}`, JSON.stringify(mapping))
  // Insérer les transactions
}
```

### `src/components/csv-mapping-dialog.tsx` (nouveau)

```typescript
"use client";
// Props: open, onClose, headers, preview, fingerprint
// State: mapping (ColumnMapping), saveMappingForFuture: boolean

// UI (shadcn Dialog) :
// 1. Titre : "Format CSV non reconnu — Configurez le mapping des colonnes"
// 2. Sélecteur "Colonne date" → <Select> avec les headers
// 3. Toggle "Montant unique / Débit+Crédit séparés"
// 4. Sélecteurs colonnes selon le toggle
// 5. Sélecteur "Colonne description"
// 6. Sélecteur "Format de date" (DD/MM/YYYY | YYYY-MM-DD | DD-MM-YYYY)
// 7. Aperçu : tableau des 5 premières transactions parsées avec le mapping courant
// 8. Checkbox "Mémoriser ce format"
// 9. Bouton "Importer" → appelle importWithMappingAction()
```

---

## Tests unitaires

**Fichier :** `tests/unit/lib/parsers/generic-csv.test.ts`

**TU-1-1 :** `genericCsvParser.canHandle("releve.csv")` → `true`
**TU-1-2 :** `genericCsvParser.canHandle("releve.xlsx")` → `false`
**TU-1-3 :** `genericCsvParser.detectHeaders(CSV_CONTENT)` → retourne les headers corrects et 5 lignes de preview
**TU-1-4 :** `genericCsvParser.parseWithMapping(CONTENT, MAPPING_SEMICOLON)` → 3 transactions correctement parsées
**TU-1-5 :** `genericCsvParser.parseWithMapping(CONTENT, MAPPING_DEBIT_CREDIT)` — colonnes Débit/Crédit séparées → type expense/income correct
**TU-1-6 :** `genericCsvParser.detectHeaders()` — détecte automatiquement le séparateur `;` vs `,`

---

## Fixtures de test

```typescript
const GENERIC_CSV_SEMICOLON = `Date;Libellé;Montant;Solde
2026-01-15;Virement salaire;2500.00;3200.00
2026-01-18;Carrefour;-85.30;3114.70
2026-01-22;Abonnement Netflix;-15.99;3098.71`;

const MAPPING_SIMPLE: ColumnMapping = {
  dateColumn: "Date",
  amountColumn: "Montant",
  descriptionColumn: "Libellé",
  separator: ";",
  dateFormat: "YYYY-MM-DD",
};
```

---

## Fichiers à créer/modifier

| Fichier | Action |
|---------|--------|
| `src/lib/parsers/generic-csv.ts` | CRÉER |
| `src/lib/parsers/registry.ts` | MODIFIER — ajouter genericCsvParser + gérer needsMapping |
| `src/lib/parsers/index.ts` | MODIFIER — exporter genericCsvParser |
| `src/app/actions/import-actions.ts` | MODIFIER — gérer `needsMapping`, ajouter `importWithMappingAction` |
| `src/components/csv-mapping-dialog.tsx` | CRÉER |
| `src/components/import-button.tsx` | MODIFIER — ouvrir `CsvMappingDialog` si `needsMapping` |
| `tests/unit/lib/parsers/generic-csv.test.ts` | CRÉER |
