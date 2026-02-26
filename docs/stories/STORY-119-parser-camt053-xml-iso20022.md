# STORY-119 — Parser CAMT.053 (XML ISO 20022)

**Epic :** import-universel
**Priorité :** P1 | **Complexité :** M | **Points :** 3
**Sprint :** v16
**Statut :** pending
**Bloquée par :** —

## Description

Implémenter un parser pour le format CAMT.053 (XML ISO 20022), standard modern imposé par SWIFT depuis novembre 2025. Toutes les grandes banques françaises (BNP Paribas, Société Générale, Crédit Agricole, LCL, La Banque Postale, Caisse d'Épargne) l'exportent désormais. Ce format XML structuré contient le solde de début/fin et toutes les transactions avec leurs métadonnées.

## Contexte technique

### Structure CAMT.053 (ISO 20022)

```xml
<BkToCstmrStmt>
  <Stmt>
    <Acct><Id><IBAN>FR76...</IBAN></Id></Acct>
    <Bal>
      <Tp><CdOrPrtry><Cd>OPBD</Cd></CdOrPrtry></Tp>
      <Amt Ccy="EUR">1234.56</Amt>
      <Dt><Dt>2025-01-01</Dt></Dt>
    </Bal>
    <Ntry>
      <Amt Ccy="EUR">50.00</Amt>
      <CdtDbtInd>DBIT</CdtDbtInd>  <!-- DBIT=dépense, CRDT=revenu -->
      <BookgDt><Dt>2025-01-15</Dt></BookgDt>
      <NtryDtls><TxDtls><RmtInf><Ustrd>Libellé</Ustrd></RmtInf></TxDtls></NtryDtls>
    </Ntry>
  </Stmt>
</BkToCstmrStmt>
```

### Points critiques

- Extension fichier : `.xml`
- Détection : présence du namespace `urn:iso:std:iso:20022:tech:xsd:camt.053` ou balise `BkToCstmrStmt`
- Solde : balise `<Bal>` avec code `CLBD` (closing balance) ou `OPBD` (opening balance)
- Montant : `<Amt Ccy="EUR">` — positif pour CRDT, négatif pour DBIT
- Date comptabilisation : `<BookgDt><Dt>` (format YYYY-MM-DD natif ISO)
- Libellé : `<Ustrd>` (non structuré) ou `<AddtlNtryInf>` (info additionnelle)
- Devise : attribut `Ccy` sur `<Amt>`

### Parser à implémenter

`src/lib/parsers/camt053.ts` — utiliser le parser XML natif Node.js (`@xmldom/xmldom` ou parsing regex/string pour éviter une dépendance lourde).

## Acceptance Criteria

- **AC-1** : `canHandle` retourne `true` pour tout fichier `.xml` contenant `BkToCstmrStmt` ou le namespace CAMT.053
- **AC-2** : `parse` extrait correctement toutes les transactions avec date (YYYY-MM-DD), montant, type income/expense et libellé
- **AC-3** : Le solde de clôture (`CLBD`) est extrait dans `detectedBalance` + `detectedBalanceDate`
- **AC-4** : La devise est extraite depuis l'attribut `Ccy` (ex : `EUR`, `USD`)
- **AC-5** : `bankName` retourne `"CAMT.053 (ISO 20022)"` — les banques spécifiques peuvent être détectées via le champ `<FinInstnId>`
- **AC-6** : Le parser est enregistré dans `registry.ts` avant le `genericCsvParser`
- **AC-7** : Les transactions avec `CdtDbtInd = DBIT` ont `type = "expense"`, celles avec `CRDT` ont `type = "income"`
- **AC-8** : Résistance aux fichiers CAMT.053 malformés (balises manquantes → skip silencieux)

## Specs Tests

### TU-119-1 : Détection canHandle
```typescript
// Fichier: tests/unit/lib/parsers/camt053.test.ts
it("canHandle retourne true pour XML CAMT.053 valide", () => {
  const xml = `<?xml version="1.0"?>
  <Document xmlns="urn:iso:std:iso:20022:tech:xsd:camt.053.001.02">
    <BkToCstmrStmt>...</BkToCstmrStmt>
  </Document>`;
  expect(camt053Parser.canHandle("releve.xml", xml)).toBe(true);
});

it("canHandle retourne false pour XML non-CAMT", () => {
  expect(camt053Parser.canHandle("data.xml", "<root><data/></root>")).toBe(false);
});

it("canHandle retourne false pour fichier non-XML", () => {
  expect(camt053Parser.canHandle("releve.csv", "Date;Libelle;Montant")).toBe(false);
});
```

### TU-119-2 : Extraction des transactions
```typescript
it("parse extrait les transactions DBIT correctement", () => {
  const result = camt053Parser.parse(SAMPLE_CAMT_XML_WITH_DBIT, null);
  expect(result.transactions[0]).toMatchObject({
    type: "expense",
    amount: 50.00,
    date: "2025-01-15",
    description: expect.stringContaining("CARTE"),
  });
});

it("parse extrait les transactions CRDT correctement", () => {
  const result = camt053Parser.parse(SAMPLE_CAMT_XML_WITH_CRDT, null);
  expect(result.transactions[0]).toMatchObject({
    type: "income",
    amount: 2500.00,
    date: "2025-01-02",
  });
});
```

### TU-119-3 : Solde détecté
```typescript
it("parse extrait le solde de clôture CLBD", () => {
  const result = camt053Parser.parse(SAMPLE_CAMT_XML_WITH_BALANCE, null);
  expect(result.detectedBalance).toBe(3456.78);
  expect(result.detectedBalanceDate).toBe("2025-01-31");
});
```

### TU-119-4 : Devise
```typescript
it("parse extrait la devise EUR", () => {
  const result = camt053Parser.parse(SAMPLE_CAMT_XML, null);
  expect(result.currency).toBe("EUR");
});
```

### TU-119-5 : Fichier malformé
```typescript
it("parse retourne tableau vide pour XML CAMT sans transactions", () => {
  const xml = `<Document xmlns="urn:iso:std:iso:20022:tech:xsd:camt.053.001.02">
    <BkToCstmrStmt><Stmt></Stmt></BkToCstmrStmt>
  </Document>`;
  const result = camt053Parser.parse(xml, null);
  expect(result.transactions).toHaveLength(0);
});
```

## Fichiers

- `src/lib/parsers/camt053.ts` — nouveau parser
- `src/lib/parsers/registry.ts` — ajout du parser avant genericCsvParser
- `src/lib/parsers/index.ts` — export du nouveau parser
- `tests/unit/lib/parsers/camt053.test.ts` — tests unitaires
- `tests/fixtures/camt053-sample.xml` — fixture XML de test (à créer)
