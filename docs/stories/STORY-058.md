# STORY-058 — Parsers bancaires UK (HSBC + Monzo)

**Sprint :** Production SaaS & Croissance (v8)
**Épique :** parsers
**Priorité :** P2
**Complexité :** S (2 points)
**Statut :** pending
**Bloqué par :** —

---

## Description

L'app cible le marché international (FR, EN, ES, IT, DE). Le Royaume-Uni est le 2ème marché le plus grand en Europe pour les fintech. HSBC et Monzo sont les 2 banques UK avec le plus grand nombre d'utilisateurs qui exportent des CSV. Cette story ajoute les 2 parsers dans le registre existant.

**Formats sources :**
- **HSBC UK** : CSV séparateur `,`, colonnes `Date,Description,Amount`, date `DD/MM/YYYY`, montant négatif = dépense
- **Monzo** : CSV séparateur `,`, colonnes `Transaction ID,Date,Time,Type,Name,Emoji,Category,Amount,Currency`, date `YYYY-MM-DD`, montant négatif = dépense

---

## Acceptance Criteria

- **AC-1 :** `HsbcParser` détecte les exports HSBC (header `Date,Description,Amount`) avec score >= 0.85
- **AC-2 :** `HsbcParser.parse()` retourne des transactions conformes à `ParsedTransaction` (date YYYY-MM-DD, type income/expense, amount positif)
- **AC-3 :** `MonzoParser` détecte les exports Monzo (header contenant `Transaction ID`) avec score >= 0.85
- **AC-4 :** `MonzoParser.parse()` retourne des transactions conformes (date déjà YYYY-MM-DD dans le CSV Monzo)
- **AC-5 :** Les 2 parsers sont enregistrés dans `src/lib/parsers/index.ts` avant `genericCsvParser`
- **AC-6 :** Montant négatif → `type: "expense"`, positif → `type: "income"` pour les 2 parsers

---

## Fichiers à créer / modifier

| Fichier | Action |
|---------|--------|
| `src/lib/parsers/hsbc.ts` | CRÉER — `HsbcParser` |
| `src/lib/parsers/monzo.ts` | CRÉER — `MonzoParser` |
| `src/lib/parsers/index.ts` | MODIFIER — enregistrer les 2 nouveaux parsers |
| `tests/unit/parsers/hsbc.test.ts` | CRÉER — tests unitaires |
| `tests/unit/parsers/monzo.test.ts` | CRÉER — tests unitaires |

---

## Tests unitaires (TU-x)

### Fichier : `tests/unit/parsers/hsbc.test.ts`

#### Données de test

```typescript
const HSBC_CSV = `Date,Description,Amount
15/01/2026,SAINSBURYS SUPERMARKET,-45.23
20/01/2026,SALARY PAYMENT,2500.00
22/01/2026,AMAZON.CO.UK,-23.99`;
```

| ID | Description | Résultat attendu |
|----|-------------|-----------------|
| TU-58-1 | `HsbcParser.detect()` sur CSV HSBC valide | score >= 0.85 |
| TU-58-2 | `HsbcParser.detect()` sur CSV Banque Populaire (FR) | score = 0 |
| TU-58-3 | `HsbcParser.parse()` retourne 3 transactions | `length === 3` |
| TU-58-4 | Ligne `15/01/2026,-45.23` → expense + date `2026-01-15` | `type === "expense"`, `date === "2026-01-15"` |
| TU-58-5 | Ligne SALARY `2500.00` → income | `type === "income"` |

### Fichier : `tests/unit/parsers/monzo.test.ts`

#### Données de test

```typescript
const MONZO_CSV = `Transaction ID,Date,Time,Type,Name,Emoji,Category,Amount,Currency
tx_1,2026-01-15,10:30:00,Debit,Sainsbury's,🛒,Groceries,-45.23,GBP
tx_2,2026-01-20,09:00:00,Credit,Employer,,Income,2500.00,GBP`;
```

| ID | Description | Résultat attendu |
|----|-------------|-----------------|
| TU-58-6 | `MonzoParser.detect()` sur CSV Monzo valide | score >= 0.85 |
| TU-58-7 | `MonzoParser.detect()` sur CSV HSBC | score = 0 |
| TU-58-8 | `MonzoParser.parse()` — date déjà YYYY-MM-DD | `date === "2026-01-15"` |
| TU-58-9 | Montant `-45.23` → expense | `type === "expense"`, `amount === 45.23` |
| TU-58-10 | Montant `2500.00` → income | `type === "income"`, `amount === 2500.00` |

---

## Mapping AC → Tests

| AC | Tests couvrant |
|----|---------------|
| AC-1 | TU-58-1 + TU-58-2 |
| AC-2 | TU-58-3 + TU-58-4 + TU-58-5 |
| AC-3 | TU-58-6 + TU-58-7 |
| AC-4 | TU-58-8 |
| AC-5 | Vérification registry.ts |
| AC-6 | TU-58-4 + TU-58-9 |

---

## Interface TypeScript

```typescript
// src/lib/parsers/hsbc.ts
import type { BankParser } from "./types";

export const hsbcParser = {
  id: "hsbc",
  name: "HSBC UK",
  parse(content: string | null, _buffer: Buffer | null): ParseResult { ... }
} satisfies BankParser;

// src/lib/parsers/monzo.ts
export const monzoParser = {
  id: "monzo",
  name: "Monzo",
  parse(content: string | null, _buffer: Buffer | null): ParseResult { ... }
} satisfies BankParser;
```

---

## Notes d'implémentation

- Les parsers utilisent le pattern `satisfies BankParser` (comme les parsers récents)
- Détection HSBC : `content?.includes("Date,Description,Amount")` ou `content?.includes("HSBC")`
- Détection Monzo : `content?.includes("Transaction ID")` (header unique à Monzo)
- Conversion date HSBC `DD/MM/YYYY` → `YYYY-MM-DD` : utiliser `parseDateFR()` de `utils.ts` si compatible, sinon helper local
- L'`amount` dans `ParsedTransaction` est toujours positif — le `type` porte la direction
- Devise détectée depuis la colonne Currency de Monzo (si absente → "GBP" par défaut)
- Registre order : HSBC et Monzo ajoutés avant `genericCsv` (catch-all)
