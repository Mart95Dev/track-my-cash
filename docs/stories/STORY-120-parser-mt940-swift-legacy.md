# STORY-120 — Parser MT940 (SWIFT legacy)

**Epic :** import-universel
**Priorité :** P1 | **Complexité :** M | **Points :** 3
**Sprint :** v16
**Statut :** pending
**Bloquée par :** —

## Description

Implémenter un parser pour le format MT940, format SWIFT texte structuré encore massivement utilisé par les banques françaises et européennes (BNP Paribas, Société Générale, Crédit Agricole, LCL, Crédit Mutuel, CIC). Ce format est souvent proposé en export "fichier de relevé comptable" ou "fichier SWIFT". Il restera pertinent en parallèle du CAMT.053 pendant plusieurs années de transition.

## Contexte technique

### Structure MT940

```
:20:REFERENCE
:25:FR7610107001011234567890185/EUR
:28C:00001/001
:60F:C250101EUR1234,56       ← Solde d'ouverture (C=crédit=positif, D=débit=négatif)
:61:2501150115DN50,00NCHK    ← Transaction (YYMMDD date + D=débit/N=neutre + montant)
:86:Libellé de la transaction
:61:2501020102CN2500,00NSAL
:86:Virement salaire
:62F:C250131EUR3684,56       ← Solde de clôture
```

### Champs clés

- `:20:` — référence du relevé
- `:25:` — IBAN + devise
- `:60F:` / `:60M:` — solde d'ouverture (F=final, M=intermédiaire)
- `:61:` — ligne de transaction :
  - Positions 1-6 : date valeur YYMMDD
  - Positions 7-10 : date comptabilisation (optionnel, MMDD)
  - Position 11 : `C`=crédit (income) ou `D`=débit (expense) ou `RD`/`RC`
  - Reste : montant avec virgule décimale (ex : `50,00`) + référence
- `:86:` — libellé de la transaction (suit toujours `:61:`)
- `:62F:` / `:62M:` — solde de clôture

### Règles de parsing

- Montant MT940 : virgule comme séparateur décimal (ex `50,00` → 50.00)
- Date : `YYMMDD` → année à ajouter (si YY > 50 → 19YY, sinon 20YY)
- Devise : extraite de `:25:` (dernière partie après `/`)
- Extension fichier : `.sta`, `.mt940`, `.txt` (avec détection par contenu)
- Détection : présence de `:20:` ET `:61:` dans les 50 premières lignes

## Acceptance Criteria

- **AC-1** : `canHandle` retourne `true` pour tout fichier contenant `:20:` et `:61:` (peu importe l'extension)
- **AC-2** : `parse` extrait les transactions avec date (YYYY-MM-DD), montant, type income/expense et libellé (contenu de `:86:`)
- **AC-3** : Le solde de clôture `:62F:` est extrait dans `detectedBalance` + `detectedBalanceDate`
- **AC-4** : La devise est extraite du champ `:25:` (ou `:60F:` en fallback)
- **AC-5** : `bankName` retourne `"MT940 (SWIFT)"`
- **AC-6** : Le parser est enregistré dans `registry.ts` avant le `genericCsvParser`
- **AC-7** : Les lignes `:61:` avec `D` ou `RD` ont `type = "expense"`, `C` ou `RC` ont `type = "income"`
- **AC-8** : Les montants MT940 avec virgule décimale sont correctement convertis en nombre

## Specs Tests

### TU-120-1 : Détection canHandle
```typescript
// Fichier: tests/unit/lib/parsers/mt940.test.ts
const SAMPLE_MT940 = `:20:REF123\n:25:FR7610107001011234567890185/EUR\n:28C:00001/001\n:60F:C250101EUR1234,56\n:61:2501150115DN50,00NCHK\n:86:CARTE 1234 SUPERMARCHE\n:62F:C250131EUR3684,56`;

it("canHandle retourne true pour contenu MT940 valide", () => {
  expect(mt940Parser.canHandle("releve.sta", SAMPLE_MT940)).toBe(true);
});

it("canHandle retourne true même avec extension .txt", () => {
  expect(mt940Parser.canHandle("export.txt", SAMPLE_MT940)).toBe(true);
});

it("canHandle retourne false pour CSV", () => {
  expect(mt940Parser.canHandle("releve.csv", "Date;Libelle;Montant")).toBe(false);
});
```

### TU-120-2 : Extraction transactions débit
```typescript
it("parse extrait une transaction DN (débit) correctement", () => {
  const result = mt940Parser.parse(SAMPLE_MT940, null);
  const tx = result.transactions.find(t => t.type === "expense");
  expect(tx).toMatchObject({
    type: "expense",
    amount: 50.00,
    date: "2025-01-15",
    description: "CARTE 1234 SUPERMARCHE",
  });
});
```

### TU-120-3 : Extraction transactions crédit
```typescript
it("parse extrait une transaction CN (crédit) correctement", () => {
  const MT940_WITH_CREDIT = `...CN2500,00NSAL\n:86:Virement salaire`;
  const result = mt940Parser.parse(MT940_WITH_CREDIT, null);
  const tx = result.transactions.find(t => t.type === "income");
  expect(tx).toMatchObject({ type: "income", amount: 2500.00 });
});
```

### TU-120-4 : Solde clôture
```typescript
it("parse extrait le solde de clôture :62F:", () => {
  const result = mt940Parser.parse(SAMPLE_MT940, null);
  expect(result.detectedBalance).toBe(3684.56);
  expect(result.detectedBalanceDate).toBe("2025-01-31");
});
```

### TU-120-5 : Devise depuis :25:
```typescript
it("parse extrait la devise EUR depuis le champ :25:", () => {
  const result = mt940Parser.parse(SAMPLE_MT940, null);
  expect(result.currency).toBe("EUR");
});
```

### TU-120-6 : Montant virgule → point
```typescript
it("convertit correctement 1234,56 en 1234.56", () => {
  const result = mt940Parser.parse(SAMPLE_MT940_COMMA_AMOUNTS, null);
  expect(result.transactions[0]?.amount).toBeCloseTo(1234.56);
});
```

## Fichiers

- `src/lib/parsers/mt940.ts` — nouveau parser
- `src/lib/parsers/registry.ts` — ajout du parser
- `src/lib/parsers/index.ts` — export du nouveau parser
- `tests/unit/lib/parsers/mt940.test.ts` — tests unitaires
- `tests/fixtures/mt940-sample.sta` — fixture de test
