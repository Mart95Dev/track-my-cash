# STORY-018 — Nouveau parser bancaire : Crédit Agricole

**Epic :** Features Utilisateur
**Priorité :** P3
**Complexité :** S
**Statut :** pending
**Bloquée par :** aucune

---

## User Story

En tant qu'utilisateur client du Crédit Agricole,
je veux importer mes relevés CSV directement dans TrackMyCash,
afin d'éviter la saisie manuelle de mes transactions.

---

## Contexte technique

- Le registre de parsers est dans `src/lib/parsers/registry.ts`
- L'interface `BankParser` est dans `src/lib/parsers/types.ts`
- Les utilitaires de parsing sont dans `src/lib/parsers/utils.ts` (`parseDateFR`, `parseAmount`)
- **Format Crédit Agricole CSV :**
  - Séparateur : `;`
  - Encodage : UTF-8 (ou Windows-1252 — à vérifier)
  - Colonnes : `Date opération;Date valeur;Libellé;Débit euros;Crédit euros`
  - Dates : DD/MM/YYYY
  - Montants : décimale avec virgule, valeur positive dans la colonne Débit = une dépense
  - Détection : header contient "Libellé" + "Débit euros" + "Crédit euros"

---

## Format du fichier Crédit Agricole

```csv
Date opération;Date valeur;Libellé;Débit euros;Crédit euros
15/02/2026;15/02/2026;VIREMENT RECU SALAIRE;;2500,00
14/02/2026;14/02/2026;CARTE LECLERC;87,50;
13/02/2026;13/02/2026;VIREMENT EDF;120,00;
12/02/2026;12/02/2026;RETRAIT DAB;60,00;
```

**Règle de mapping :**
- "Débit euros" non vide → `type: "expense"`, `amount: parseFloat(débit)`
- "Crédit euros" non vide → `type: "income"`, `amount: parseFloat(crédit)`
- Ligne avec les deux vides → ignorer
- "Solde" : non présent dans l'export standard (detectedBalance = null)

---

## Acceptance Criteria

- [ ] AC-1 : `canHandle` retourne `true` si le CSV contient "Débit euros" ou "Crédit euros" dans le header
- [ ] AC-2 : `parse` retourne les transactions avec le bon type (income/expense)
- [ ] AC-3 : Les montants sont parsés correctement (virgule décimale, espaces milliers)
- [ ] AC-4 : `bankName = "Crédit Agricole"`, `currency = "EUR"`
- [ ] AC-5 : `detectedBalance = null` (non présent dans l'export CA)
- [ ] AC-6 : Le parser est enregistré dans `registry.ts` et est appelé avant le fallback Banque Populaire
- [ ] AC-7 : L'`import_hash` est calculé correctement (MD5 de date+description+montant)
- [ ] AC-8 : Un test unitaire avec la fixture CSV passe en vert

---

## Fichiers à créer / modifier

| Fichier | Action |
|---------|--------|
| `src/lib/parsers/credit-agricole.ts` | Créer — parser CA |
| `src/lib/parsers/registry.ts` | Modifier — enregistrer le parser CA avant banquePopulaireParser |
| `tests/unit/parsers/credit-agricole.test.ts` | Créer — tests du parser |
| `tests/fixtures/credit-agricole.csv` | Créer — fichier CSV de test |

---

## Implémentation clé

```typescript
// src/lib/parsers/credit-agricole.ts
import type { BankParser, ParseResult } from "./types";
import { parseDateFR, parseAmount } from "./utils";

function isCreditAgricole(content: string): boolean {
  return content.includes("Débit euros") || content.includes("Credit euros") || content.includes("Libellé");
}

export const creditAgricoleParser: BankParser = {
  name: "Crédit Agricole",
  canHandle(filename, content) {
    if (!content) return false;
    return isCreditAgricole(content);
  },
  parse(content): ParseResult {
    if (!content) throw new Error("Contenu requis pour le parser Crédit Agricole");
    const lines = content.split(/\r?\n/).filter((l) => l.trim());

    // Trouver l'index du header
    const headerIdx = lines.findIndex((l) => l.includes("Libellé") && (l.includes("Débit") || l.includes("Credit")));
    if (headerIdx === -1) {
      return { transactions: [], detectedBalance: null, detectedBalanceDate: null, bankName: "Crédit Agricole", currency: "EUR" };
    }

    const transactions = [];
    for (let i = headerIdx + 1; i < lines.length; i++) {
      const parts = lines[i].split(";");
      if (parts.length < 5) continue;
      const date = parseDateFR(parts[0].trim());
      const description = parts[2].replace(/^"|"$/g, "").trim();
      const debit = parts[3].trim();
      const credit = parts[4].trim();

      if (!date || !description) continue;

      if (debit && debit !== "0") {
        const amount = parseAmount(debit);
        if (!isNaN(amount) && amount !== 0) {
          transactions.push({ date, description, amount: Math.abs(amount), type: "expense" as const });
        }
      } else if (credit && credit !== "0") {
        const amount = parseAmount(credit);
        if (!isNaN(amount) && amount !== 0) {
          transactions.push({ date, description, amount: Math.abs(amount), type: "income" as const });
        }
      }
    }

    return { transactions, detectedBalance: null, detectedBalanceDate: null, bankName: "Crédit Agricole", currency: "EUR" };
  },
};
```

---

## Tests unitaires

### TU-1 : Parser Crédit Agricole
**Fichier :** `tests/unit/parsers/credit-agricole.test.ts`

```
TU-1-1 : canHandle retourne true si le CSV contient "Débit euros"
TU-1-2 : canHandle retourne false pour un CSV Banque Populaire (Montant(EUROS))
TU-1-3 : parse retourne 4 transactions depuis la fixture
TU-1-4 : VIREMENT RECU SALAIRE est de type "income" avec amount 2500
TU-1-5 : CARTE LECLERC est de type "expense" avec amount 87.50
TU-1-6 : parse retourne bankName = "Crédit Agricole", currency = "EUR"
TU-1-7 : parse retourne detectedBalance = null
TU-1-8 : Ligne avec Débit et Crédit tous deux vides → ignorée
```

---

## Fixture CSV

**`tests/fixtures/credit-agricole.csv`**
```csv
Date opération;Date valeur;Libellé;Débit euros;Crédit euros
15/02/2026;15/02/2026;VIREMENT RECU SALAIRE;;2500,00
14/02/2026;14/02/2026;CARTE LECLERC;87,50;
13/02/2026;13/02/2026;VIREMENT EDF;120,00;
12/02/2026;12/02/2026;RETRAIT DAB;60,00;
```

---

## Estimation

**Points :** 3
**Durée estimée :** 2h
