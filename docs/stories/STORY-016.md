# STORY-016 — Extension couverture tests (parsers + actions serveur)

**Epic :** Qualité Technique
**Priorité :** P2
**Complexité :** M
**Statut :** pending
**Bloquée par :** aucune

---

## User Story

En tant que développeur,
je veux que les parsers bancaires et les Server Actions critiques soient couverts par des tests unitaires,
afin de détecter les régressions lors des modifications futures.

---

## Contexte technique

- La QA v1.0 couvrait uniquement `src/lib/format.ts` et `src/lib/currency.ts`
- Les parsers sont dans `src/lib/parsers/` : `banque-populaire.ts`, `mcb-csv.ts`, `revolut.ts`, `mcb-pdf.ts`
- Le `vitest.config.ts` actuel a `include: ["src/lib/format.ts", "src/lib/currency.ts"]` — à élargir
- Tests existants : `tests/unit/` (format, currency, checkout-locale, queries, tag-batch)
- Objectifs de couverture : >75% lignes sur `parsers/*.ts`
- Les parsers utilisent `parseDateFR`, `parseAmount` depuis `src/lib/parsers/utils.ts`

---

## Acceptance Criteria

- [ ] AC-1 : `tests/unit/parsers/banque-populaire.test.ts` existe et passe (>6 tests)
- [ ] AC-2 : `tests/unit/parsers/mcb-csv.test.ts` existe et passe (>4 tests)
- [ ] AC-3 : `tests/unit/parsers/utils.test.ts` couvre `parseDateFR` et `parseAmount`
- [ ] AC-4 : `npm test` passe en vert (toutes suites y compris les nouvelles)
- [ ] AC-5 : La couverture lignes sur `src/lib/parsers/banque-populaire.ts` dépasse 75%
- [ ] AC-6 : `vitest.config.ts` est mis à jour pour inclure `src/lib/parsers/*.ts` dans la couverture

---

## Fichiers à créer / modifier

| Fichier | Action |
|---------|--------|
| `tests/unit/parsers/banque-populaire.test.ts` | Créer — tests parser BP |
| `tests/unit/parsers/mcb-csv.test.ts` | Créer — tests parser MCB CSV |
| `tests/unit/parsers/utils.test.ts` | Créer — tests parseDateFR, parseAmount |
| `tests/fixtures/banque-populaire.csv` | Créer — fichier CSV de test BP |
| `tests/fixtures/mcb.csv` | Créer — fichier CSV de test MCB |
| `vitest.config.ts` | Modifier — élargir coverage include |

---

## Fixtures CSV de test

### Banque Populaire (`tests/fixtures/banque-populaire.csv`)
```csv
Solde;1500,25
Date;15/02/2026

Date;Libellé;Montant(EUROS)
15/02/2026;VIREMENT SALAIRE;2000,00
14/02/2026;PRELEVEMENT EDF;-120,50
13/02/2026;ACHAT CARREFOUR;-67,80
```

### MCB Madagascar (`tests/fixtures/mcb.csv`)
```csv
Date,Description,Amount,Currency
15-Feb-2026,Salary,150 000,MGA
14-Feb-2026,Electricity,-25 000,MGA
```

---

## Tests unitaires

### TU-1 : Parser Banque Populaire
**Fichier :** `tests/unit/parsers/banque-populaire.test.ts`

```
TU-1-1 : canHandle retourne true pour un CSV avec "Montant(EUROS)"
TU-1-2 : canHandle retourne false pour un XLSX vide
TU-1-3 : parse détecte le solde initial (1500.25) depuis l'en-tête "Solde"
TU-1-4 : parse détecte la date du solde (2026-02-15) depuis "Date"
TU-1-5 : parse retourne 3 transactions depuis la fixture
TU-1-6 : La transaction VIREMENT SALAIRE est de type "income"
TU-1-7 : La transaction PRELEVEMENT EDF est de type "expense" avec amount 120.50
TU-1-8 : parse retourne bankName = "Banque Populaire", currency = "EUR"
TU-1-9 : parse retourne [] transactions si le CSV ne contient pas "Date;Libellé"
```

### TU-2 : Parser utils (parseDateFR, parseAmount)
**Fichier :** `tests/unit/parsers/utils.test.ts`

```
TU-2-1 : parseDateFR("15/02/2026") → "2026-02-15"
TU-2-2 : parseDateFR("01/01/2026") → "2026-01-01"
TU-2-3 : parseDateFR("") → null
TU-2-4 : parseDateFR("invalid") → null
TU-2-5 : parseAmount("1 234,56") → 1234.56
TU-2-6 : parseAmount("-567,89") → -567.89
TU-2-7 : parseAmount("0") → 0
TU-2-8 : parseAmount("abc") → NaN
```

### TU-3 : Parser MCB CSV
**Fichier :** `tests/unit/parsers/mcb-csv.test.ts`

```
TU-3-1 : canHandle détecte le format MCB (via header ou contenu "MGA")
TU-3-2 : parse retourne currency = "MGA"
TU-3-3 : parse supprime les espaces milliers dans les montants (150 000 → 150000)
TU-3-4 : parse retourne des transactions avec type income/expense correct
```

---

## Estimation

**Points :** 5
**Durée estimée :** 3-4h
