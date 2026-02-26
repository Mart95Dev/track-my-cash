# STORY-121 — Parser OFX/QFX (Open Financial Exchange)

**Epic :** import-universel
**Priorité :** P2 | **Complexité :** S | **Points :** 2
**Sprint :** v16
**Statut :** pending
**Bloquée par :** —

## Description

Implémenter un parser pour le format OFX (Open Financial Exchange) et sa variante QFX (utilisée par Quicken). Ce format est utilisé par La Banque Postale, certaines banques américaines (Wells Fargo, Chase), et des outils de comptabilité. OFX v1 est un format SGML propriétaire (non XML valide), OFX v2 est du XML. Les deux doivent être supportés.

## Contexte technique

### Structure OFX v1 (SGML — non XML)

```
OFXHEADER:100
DATA:OFXSGML
VERSION:151
...
<OFX>
<BANKMSGSRSV1>
<STMTTRNRS>
<STMTRS>
<CURDEF>EUR
<BANKACCTFROM><ACCTID>1234567890</ACCTID></BANKACCTFROM>
<LEDGERBAL><BALAMT>1234.56</BALAMT><DTASOF>20250131</DTASOF></LEDGERBAL>
<BANKTRANLIST>
<STMTTRN>
<TRNTYPE>DEBIT</TRNTYPE>
<DTPOSTED>20250115120000</DTPOSTED>
<TRNAMT>-50.00</TRNAMT>
<NAME>SUPERMARCHE CARREFOUR</NAME>
<MEMO>CB 1234</MEMO>
</STMTTRN>
</BANKTRANLIST>
</STMTRS>
```

### Structure OFX v2 (XML)

Identique mais avec prologue XML standard `<?xml version="1.0"?>` et namespace `xmlns="http://ofx.net/types/2003/04"`.

### Points critiques

- Extension fichier : `.ofx` ou `.qfx`
- Détection : présence de `OFXHEADER` ou `<OFX>` dans le contenu
- Date OFX : format `YYYYMMDDHHMMSS` ou `YYYYMMDD` → convertir en `YYYY-MM-DD`
- Montant : `<TRNAMT>` — négatif = expense, positif = income
- Libellé : `<NAME>` + optionnellement `<MEMO>`
- Solde : `<LEDGERBAL><BALAMT>` + `<DTASOF>`
- Devise : `<CURDEF>` au niveau du relevé

### Stratégie de parsing

OFX v1 n'étant pas du XML valide, utiliser une approche par regex/string matching plutôt qu'un parseur XML. Extraire les balises avec regex `/<TAGNAME>(.*?)<\/TAGNAME>|<TAGNAME>([^<\n]+)/`.

## Acceptance Criteria

- **AC-1** : `canHandle` retourne `true` pour fichiers `.ofx` et `.qfx`, et pour tout contenu commençant par `OFXHEADER` ou contenant `<OFX>`
- **AC-2** : `parse` extrait les transactions depuis `<STMTTRN>` avec date, montant, type et libellé
- **AC-3** : Les montants négatifs `<TRNAMT>` ont `type = "expense"`, positifs ont `type = "income"`
- **AC-4** : La date `<DTPOSTED>` au format `YYYYMMDD[HHMMSS]` est convertie en `YYYY-MM-DD`
- **AC-5** : Le solde `<LEDGERBAL>` est extrait dans `detectedBalance` + `detectedBalanceDate`
- **AC-6** : Le libellé combine `<NAME>` et `<MEMO>` si les deux sont présents
- **AC-7** : `bankName` retourne `"OFX/QFX"`
- **AC-8** : Le parser gère les deux variantes OFX v1 (SGML) et OFX v2 (XML)

## Specs Tests

### TU-121-1 : Détection canHandle
```typescript
// Fichier: tests/unit/lib/parsers/ofx.test.ts
it("canHandle retourne true pour extension .ofx", () => {
  expect(ofxParser.canHandle("releve.ofx", SAMPLE_OFX)).toBe(true);
});

it("canHandle retourne true pour extension .qfx", () => {
  expect(ofxParser.canHandle("quicken.qfx", SAMPLE_OFX)).toBe(true);
});

it("canHandle retourne true pour contenu avec OFXHEADER", () => {
  expect(ofxParser.canHandle("releve.txt", "OFXHEADER:100\nDATA:OFXSGML")).toBe(true);
});
```

### TU-121-2 : Parsing transactions
```typescript
it("parse extrait une transaction DEBIT correctement", () => {
  const result = ofxParser.parse(SAMPLE_OFX, null);
  const tx = result.transactions[0];
  expect(tx).toMatchObject({
    type: "expense",
    amount: 50.00,
    date: "2025-01-15",
    description: expect.stringContaining("CARREFOUR"),
  });
});
```

### TU-121-3 : Conversion date OFX
```typescript
it("convertit 20250115120000 en 2025-01-15", () => {
  expect(parseOFXDate("20250115120000")).toBe("2025-01-15");
});

it("convertit 20250201 en 2025-02-01", () => {
  expect(parseOFXDate("20250201")).toBe("2025-02-01");
});
```

### TU-121-4 : Solde
```typescript
it("extrait le solde LEDGERBAL", () => {
  const result = ofxParser.parse(SAMPLE_OFX_WITH_BALANCE, null);
  expect(result.detectedBalance).toBe(1234.56);
  expect(result.detectedBalanceDate).toBe("2025-01-31");
});
```

### TU-121-5 : Libellé combiné NAME + MEMO
```typescript
it("combine NAME et MEMO quand les deux sont présents", () => {
  const result = ofxParser.parse(SAMPLE_OFX_WITH_MEMO, null);
  const desc = result.transactions[0]?.description ?? "";
  expect(desc).toContain("CARREFOUR");
  expect(desc).toContain("CB 1234");
});
```

## Fichiers

- `src/lib/parsers/ofx.ts` — nouveau parser OFX/QFX
- `src/lib/parsers/registry.ts` — ajout du parser
- `src/lib/parsers/index.ts` — export du nouveau parser
- `tests/unit/lib/parsers/ofx.test.ts` — tests unitaires
- `tests/fixtures/ofx-sample.ofx` — fixture de test OFX v1
