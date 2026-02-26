# STORY-123 — Amélioration Parser CSV Générique : Auto-détection intelligente

**Epic :** import-universel
**Priorité :** P1 | **Complexité :** M | **Points :** 3
**Sprint :** v16
**Statut :** pending
**Bloquée par :** —

## Description

Améliorer le parser CSV générique (`generic-csv.ts`) avec une auto-détection intelligente des colonnes sans intervention utilisateur. Actuellement, quand aucun parser spécialisé ne reconnaît le fichier, l'utilisateur doit manuellement mapper les colonnes. L'objectif est de détecter automatiquement les colonnes de date, montant et libellé via des heuristiques (scoring des en-têtes + analyse du contenu des colonnes), réduisant le recours au mapping manuel de ~80%.

## Contexte technique

### Problème actuel

Le flux actuel dans `registry.ts` quand aucun parser ne reconnaît le fichier :
1. `genericCsvParser.canHandle()` retourne `true` (catch-all)
2. `registry.ts` retourne `{ needsMapping: true, headers, preview, fingerprint }`
3. L'interface demande à l'utilisateur de mapper manuellement

### Solution : scoring des colonnes

**Score pour colonne DATE :**
- Nom contient "date", "dat", "jour", "day", "datum" → +10
- Contenu ressemble à une date (regex `\d{2}[/\-\.]\d{2}[/\-\.]\d{2,4}` ou `\d{4}-\d{2}-\d{2}`) → +8
- Nom contient "val", "value", "comptable" → +3

**Score pour colonne MONTANT :**
- Nom contient "montant", "amount", "débit", "crédit", "debit", "credit", "solde", "balance" → +10
- Contenu ressemble à un nombre avec décimales → +8
- Nom contient "EUR", "devise" → +5

**Score pour colonne LIBELLÉ :**
- Nom contient "libellé", "libelle", "label", "description", "desc", "opération", "operation", "nom", "name", "tiers", "bénéficiaire" → +10
- Contenu a longueur moyenne > 15 chars → +5
- Contenu est du texte alphabétique → +3

### Logique de décision

- Si colonne date + colonne montant (ou débit/crédit) détectées avec confiance ≥ 7 → auto-parse sans mapping
- Sinon → retourner `needsMapping: true` avec `suggestedMapping` pré-rempli pour faciliter la correction
- Sauvegarder automatiquement le mapping détecté par fingerprint pour réutilisation future

### Formats de date à détecter

- `DD/MM/YYYY` ou `DD/MM/YY`
- `YYYY-MM-DD`
- `DD-MM-YYYY`
- `DD.MM.YYYY`
- `DD-MMM-YYYY` (ex : `15-Jan-2025`)
- `MM/DD/YYYY` (format américain — à scorer moins haut)

## Acceptance Criteria

- **AC-1** : La nouvelle fonction `autoDetectMapping(headers, preview)` retourne un `ColumnMapping` avec `confidence: number` (0-100) quand les colonnes sont détectées
- **AC-2** : Si `confidence >= 70`, `detectHeaders` retourne `{ autoDetected: true, mapping, ...}` au lieu de `needsMapping: true`
- **AC-3** : Le format de date est auto-détecté parmi les 6 formats supportés via analyse des premières lignes de données
- **AC-4** : Les fichiers avec colonnes séparées Débit/Crédit sont correctement identifiés (scoring "débit" + "crédit" en même ligne de headers)
- **AC-5** : La fonction `parseWithAutoDetect(content)` parse directement quand `confidence >= 70`
- **AC-6** : Les `suggestedMapping` sont ajoutés au résultat `needsMapping: true` pour pré-remplir l'UI de mapping manuel
- **AC-7** : `bankName` mentionne `"CSV auto-détecté"` quand l'auto-détection réussit
- **AC-8** : La logique de fingerprint + cache mapping est préservée (aucune régression sur le mapping manuel existant)

## Specs Tests

### TU-123-1 : Auto-détection colonnes simples
```typescript
// Fichier: tests/unit/lib/parsers/generic-csv-autodetect.test.ts
it("auto-détecte colonnes Date/Montant/Libellé évidents", () => {
  const headers = ["Date", "Libellé", "Montant"];
  const preview = [
    ["15/01/2025", "CARREFOUR", "-50.00"],
    ["16/01/2025", "VIREMENT", "+2500.00"],
  ];
  const result = autoDetectMapping(headers, preview);
  expect(result.confidence).toBeGreaterThanOrEqual(70);
  expect(result.dateColumn).toBe("Date");
  expect(result.descriptionColumn).toBe("Libellé");
  expect(result.amountColumn).toBe("Montant");
});
```

### TU-123-2 : Auto-détection Débit/Crédit séparés
```typescript
it("auto-détecte colonnes Date/Description/Débit/Crédit séparées", () => {
  const headers = ["Date opération", "Description", "Débit", "Crédit"];
  const preview = [
    ["15/01/2025", "CARTE", "50.00", ""],
    ["02/01/2025", "SALAIRE", "", "2500.00"],
  ];
  const result = autoDetectMapping(headers, preview);
  expect(result.confidence).toBeGreaterThanOrEqual(70);
  expect(result.debitColumn).toBe("Débit");
  expect(result.creditColumn).toBe("Crédit");
});
```

### TU-123-3 : Détection format de date
```typescript
it("détecte format DD/MM/YYYY", () => {
  const samples = ["15/01/2025", "02/01/2025", "31/12/2024"];
  expect(detectDateFormat(samples)).toBe("DD/MM/YYYY");
});

it("détecte format YYYY-MM-DD", () => {
  const samples = ["2025-01-15", "2025-01-02", "2024-12-31"];
  expect(detectDateFormat(samples)).toBe("YYYY-MM-DD");
});
```

### TU-123-4 : Confidence faible → needsMapping avec suggestions
```typescript
it("retourne needsMapping avec suggestedMapping si confidence < 70", () => {
  const headers = ["Col1", "Col2", "Col3"];
  const preview = [["abc", "def", "ghi"]];
  const result = autoDetectMapping(headers, preview);
  expect(result.confidence).toBeLessThan(70);
});
```

### TU-123-5 : Aucune régression sur mapping manuel existant
```typescript
it("parseWithMapping fonctionne toujours avec un mapping explicite", () => {
  const mapping: ColumnMapping = {
    dateColumn: "Date",
    amountColumn: "Montant",
    descriptionColumn: "Libellé",
    separator: ";",
    dateFormat: "DD/MM/YYYY",
  };
  const content = "Date;Libellé;Montant\n15/01/2025;CARTE;-50";
  const result = genericCsvParser.parseWithMapping(content, mapping);
  expect(result.transactions).toHaveLength(1);
});
```

### TU-123-6 : Headers anglais reconnus
```typescript
it("auto-détecte headers en anglais amount/description/date", () => {
  const headers = ["date", "description", "amount"];
  const preview = [["2025-01-15", "SUPERMARKET", "-50.00"]];
  const result = autoDetectMapping(headers, preview);
  expect(result.confidence).toBeGreaterThanOrEqual(70);
});
```

## Fichiers

- `src/lib/parsers/generic-csv.ts` — ajout de `autoDetectMapping`, `detectDateFormat`, `parseWithAutoDetect`
- `src/lib/parsers/registry.ts` — utiliser `parseWithAutoDetect` avant de retourner `needsMapping: true`
- `tests/unit/lib/parsers/generic-csv-autodetect.test.ts` — nouveaux tests
- `tests/unit/lib/parsers/generic-csv.test.ts` — vérification aucune régression
