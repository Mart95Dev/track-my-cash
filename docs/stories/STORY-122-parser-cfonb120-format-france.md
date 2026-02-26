# STORY-122 — Parser CFONB 120 (format bancaire France)

**Epic :** import-universel
**Priorité :** P2 | **Complexité :** S | **Points :** 2
**Sprint :** v16
**Statut :** pending
**Bloquée par :** —

## Description

Implémenter un parser pour le format CFONB 120 (Comité Français d'Organisation et de Normalisation Bancaire), format d'échange interbancaire français à longueur fixe de 120 caractères par ligne. Encore utilisé par Caisse d'Épargne, Crédit Agricole, Crédit Mutuel/CIC, La Banque Postale pour les exports comptables. Particulièrement important pour les clients qui utilisent des logiciels de comptabilité français (EBP, Sage, Cegid).

## Contexte technique

### Structure CFONB 120 (lignes de 120 caractères à longueur fixe)

Chaque ligne est structurée par position :

| Position | Longueur | Contenu |
|----------|----------|---------|
| 1-2 | 2 | Code enregistrement (`01`=solde ouverture, `04`=opération, `07`=solde clôture) |
| 3 | 1 | Code banque (5 chiffres en réalité, voir ci-dessous) |
| 4-8 | 5 | Code établissement |
| 9-14 | 6 | Numéro guichet |
| 15-25 | 11 | Numéro de compte |
| 26 | 1 | Code devise (EUR, USD...) |
| 27-34 | 8 | Date opération JJMMAAAA |
| 35-42 | 8 | Date valeur JJMMAAAA |
| 43-53 | 11 | Code opération (nature) |
| 54-69 | 16 | Référence |
| 70-85 | 16 | Libellé |
| 86-87 | 2 | Signe montant (positionnel) |
| 88-98 | 11 | Montant (en centimes, 2 décimales implicites) |
| 99-105 | 7 | N° de séquence |
| 106-120 | 15 | Informations complémentaires |

### Codes enregistrement

- `01` : Solde d'ouverture (solde initial du relevé)
- `04` : Mouvement / opération
- `07` : Solde de clôture (solde final du relevé)

### Signe montant

- Position 86-87 vide (ou espace) = crédit (income)
- Position 86-87 = `-` ou `D` = débit (expense)

### Détection

- Extension fichier : `.cfonb`, `.asc`, `.txt` (avec détection contenu)
- Ligne exactement 120 ou 121 caractères (avec `\n`)
- Première ligne commençant par `01` ou `04`

## Acceptance Criteria

- **AC-1** : `canHandle` retourne `true` pour tout fichier dont les lignes font exactement 120 caractères et dont la première ligne commence par `01` ou `04`
- **AC-2** : `parse` lit les lignes de code `04` et extrait date (positions 27-34), montant (positions 88-98), signe et libellé (positions 70-85)
- **AC-3** : Le montant CFONB en centimes (ex : `0000001500`) est converti en euros (15.00)
- **AC-4** : Le solde de clôture (code `07`) est extrait dans `detectedBalance` + `detectedBalanceDate`
- **AC-5** : La date CFONB `JJMMAAAA` (ex : `15012025`) est convertie en `YYYY-MM-DD` (`2025-01-15`)
- **AC-6** : `bankName` retourne `"CFONB 120"`
- **AC-7** : Le parser gère les fichiers avec retours à la ligne Windows (`\r\n`) et Unix (`\n`)
- **AC-8** : Les lignes de longueur incorrecte sont ignorées silencieusement

## Specs Tests

### TU-122-1 : Détection canHandle
```typescript
// Fichier: tests/unit/lib/parsers/cfonb120.test.ts
// Ligne CFONB valide (120 chars) avec code 04 (opération)
const CFONB_LINE = "04" + "30006" + "00001" + "000123" + "12345678901" + "E" + "15012025" + "17012025" + "00012345678" + "REF00000001" + "CARTES DEBIT   " + "D" + "00000050000" + "0000001" + "               ";
// → longueur = 120

it("canHandle retourne true pour contenu CFONB valide", () => {
  const content = CFONB_LINE.padEnd(120, " ") + "\n";
  expect(cfonb120Parser.canHandle("releve.cfonb", content)).toBe(true);
});

it("canHandle retourne false pour CSV", () => {
  expect(cfonb120Parser.canHandle("releve.csv", "Date;Libelle;Montant")).toBe(false);
});
```

### TU-122-2 : Conversion montant centimes → euros
```typescript
it("convertit 00000050000 (centimes) en 500.00 euros", () => {
  const result = cfonb120Parser.parse(SAMPLE_CFONB_500_EUROS, null);
  expect(result.transactions[0]?.amount).toBe(500.00);
});
```

### TU-122-3 : Conversion date CFONB
```typescript
it("convertit 15012025 en 2025-01-15", () => {
  expect(parseCFONBDate("15012025")).toBe("2025-01-15");
});
```

### TU-122-4 : Type expense/income depuis signe
```typescript
it("ligne avec D au signe donne type expense", () => {
  const result = cfonb120Parser.parse(SAMPLE_CFONB_DEBIT, null);
  expect(result.transactions[0]?.type).toBe("expense");
});

it("ligne sans signe (crédit) donne type income", () => {
  const result = cfonb120Parser.parse(SAMPLE_CFONB_CREDIT, null);
  expect(result.transactions[0]?.type).toBe("income");
});
```

### TU-122-5 : Solde clôture (code 07)
```typescript
it("extrait le solde de clôture depuis la ligne code 07", () => {
  const result = cfonb120Parser.parse(SAMPLE_CFONB_WITH_CLOSING, null);
  expect(result.detectedBalance).toBe(1234.56);
  expect(result.detectedBalanceDate).toBe("2025-01-31");
});
```

## Fichiers

- `src/lib/parsers/cfonb120.ts` — nouveau parser
- `src/lib/parsers/registry.ts` — ajout du parser
- `src/lib/parsers/index.ts` — export du nouveau parser
- `tests/unit/lib/parsers/cfonb120.test.ts` — tests unitaires
- `tests/fixtures/cfonb120-sample.cfonb` — fixture de test (lignes 120 chars)
