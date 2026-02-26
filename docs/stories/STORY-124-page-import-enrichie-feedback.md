# STORY-124 — Page d'import enrichie : feedback parser + stats + gestion doublons

**Epic :** import-universel
**Priorité :** P1 | **Complexité :** L | **Points :** 5
**Sprint :** v16
**Statut :** pending
**Bloquée par :** STORY-119, STORY-120, STORY-121, STORY-122, STORY-123

## Description

Créer une page `/import` dédiée et enrichie qui remplace le workflow d'import actuel (dispersé dans les composants de la page comptes). La nouvelle page offre un retour utilisateur détaillé : quel parser a été utilisé, combien de transactions parsées, taux de doublons, confirmation avant import définitif, et gestion des formats inconnus avec suggestion.

## Contexte technique

### État actuel

L'import est actuellement déclenché depuis la page `/comptes` via un bouton inline. Il n'y a pas de page dédiée. Le feedback est minimal (toast succès/erreur).

### Nouvelle page `/import`

Route : `/[locale]/(app)/import/page.tsx`

Workflow en 3 étapes :

**Étape 1 — Sélection du fichier**
- Zone de drag & drop + bouton "Choisir un fichier"
- Formats supportés listés avec badges : CSV, XLSX, XML (CAMT.053), STA (MT940), OFX/QFX, CFONB, PDF
- Sélection du compte de destination
- Bouton "Analyser le fichier"

**Étape 2 — Prévisualisation**
- Badge "Parser détecté" : nom du parser (ex : "BNP Paribas", "CAMT.053 (ISO 20022)", "CSV auto-détecté")
- Stats : nombre de transactions parsées, dont X nouvelles, Y doublons
- Solde détecté (si disponible) avec date
- Tableau prévisualisation des 5 premières transactions
- Si `needsMapping: true` → afficher l'UI de mapping colonnes (existante) avec suggestions pré-remplies
- Bouton "Importer X transactions"

**Étape 3 — Confirmation**
- Animation de succès (icône check)
- Résumé : "X transactions importées · Y doublons ignorés · Solde mis à jour"
- Lien "Voir les transactions" vers `/transactions`
- Lien "Importer un autre fichier" (reset du formulaire)

### Composants à créer

- `src/components/import/ImportDropzone.tsx` — drag & drop
- `src/components/import/ParserBadge.tsx` — badge avec nom du parser et icône format
- `src/components/import/ImportStats.tsx` — stats nouvelles/doublons/solde
- `src/components/import/ImportPreviewTable.tsx` — tableau 5 premières transactions
- `src/components/import/ImportSuccess.tsx` — écran de confirmation
- `src/components/import/ColumnMappingForm.tsx` — formulaire mapping (refacto depuis import existant)

## Acceptance Criteria

- **AC-1** : La page `/[locale]/(app)/import` existe et est accessible depuis la navigation (lien dans la sidebar ou le menu)
- **AC-2** : La zone de drag & drop accepte les extensions : `.csv`, `.xlsx`, `.xml`, `.sta`, `.mt940`, `.ofx`, `.qfx`, `.cfonb`, `.asc`, `.pdf`
- **AC-3** : Après analyse, un `ParserBadge` affiche le nom du parser détecté (ex : "BNP Paribas · CSV") avec une icône représentant le format
- **AC-4** : Les stats affichent : total parsé, nouvelles transactions, doublons, solde détecté (si disponible)
- **AC-5** : Le tableau de prévisualisation montre les 5 premières transactions avec colonnes date/description/montant/type
- **AC-6** : Si `needsMapping: true` (CSV non reconnu), l'UI de mapping s'affiche avec les suggestions auto-détectées pré-remplies
- **AC-7** : L'import définitif (bouton confirmation) est déclenché via `confirmImportAction`
- **AC-8** : L'écran de succès affiche le nombre exact de transactions importées et les doublons ignorés
- **AC-9** : En cas d'erreur (fichier corrompu, aucune transaction), un message d'erreur clair est affiché avec suggestion (ex : "Essayez le format CSV générique")
- **AC-10** : La page est responsive (mobile-first, fonctionnelle sur mobile)
- **AC-11** : La liste des formats supportés dans l'UI est mise à jour pour inclure tous les nouveaux parsers du sprint v16

## Specs Tests

### TU-124-1 : Page accessible
```typescript
// Fichier: tests/unit/components/import/import-page.test.tsx
it("la page /import est rendue sans erreur", () => {
  render(<ImportPage />);
  expect(screen.getByText(/Importer un relevé/i)).toBeInTheDocument();
});
```

### TU-124-2 : ParserBadge affiche le bon nom
```typescript
// Fichier: tests/unit/components/import/parser-badge.test.tsx
it("ParserBadge affiche BNP Paribas · CSV", () => {
  render(<ParserBadge bankName="BNP Paribas" format="CSV" />);
  expect(screen.getByText(/BNP Paribas/)).toBeInTheDocument();
  expect(screen.getByText(/CSV/)).toBeInTheDocument();
});

it("ParserBadge affiche CAMT.053 (ISO 20022) · XML", () => {
  render(<ParserBadge bankName="CAMT.053 (ISO 20022)" format="XML" />);
  expect(screen.getByText(/CAMT\.053/)).toBeInTheDocument();
});
```

### TU-124-3 : ImportStats affiche nouvelles + doublons
```typescript
// Fichier: tests/unit/components/import/import-stats.test.tsx
it("ImportStats affiche correctement 10 nouvelles et 2 doublons", () => {
  render(<ImportStats newCount={10} duplicateCount={2} totalCount={12} detectedBalance={null} />);
  expect(screen.getByText(/10/)).toBeInTheDocument();
  expect(screen.getByText(/2 doublons/i)).toBeInTheDocument();
});

it("ImportStats affiche le solde détecté quand disponible", () => {
  render(<ImportStats newCount={5} duplicateCount={0} totalCount={5} detectedBalance={1234.56} detectedBalanceDate="2025-01-31" />);
  expect(screen.getByText(/1 234,56/)).toBeInTheDocument();
});
```

### TU-124-4 : ImportPreviewTable affiche 5 lignes max
```typescript
// Fichier: tests/unit/components/import/import-preview-table.test.tsx
it("affiche au maximum 5 transactions en prévisualisation", () => {
  const transactions = Array.from({ length: 10 }, (_, i) => ({
    date: "2025-01-15",
    description: `Transaction ${i}`,
    amount: 50,
    type: "expense" as const,
    import_hash: `hash_${i}`,
    category: "Autre",
    subcategory: "",
  }));
  render(<ImportPreviewTable transactions={transactions} />);
  const rows = screen.getAllByRole("row");
  expect(rows.length).toBeLessThanOrEqual(6); // 5 lignes + 1 header
});
```

### TU-124-5 : Écran succès avec bilan
```typescript
// Fichier: tests/unit/components/import/import-success.test.tsx
it("ImportSuccess affiche le nombre de transactions importées", () => {
  render(<ImportSuccess imported={42} duplicateCount={3} balanceUpdated={true} />);
  expect(screen.getByText(/42 transactions importées/i)).toBeInTheDocument();
  expect(screen.getByText(/3 doublons ignorés/i)).toBeInTheDocument();
});
```

### TU-124-6 : Formats supportés dans l'UI
```typescript
// Fichier: tests/unit/components/import/import-page.test.tsx
it("liste tous les formats supportés incluant XML, STA, OFX", () => {
  render(<ImportPage />);
  expect(screen.getByText(/XML/i)).toBeInTheDocument();
  expect(screen.getByText(/OFX/i)).toBeInTheDocument();
  expect(screen.getByText(/MT940/i)).toBeInTheDocument();
});
```

## Fichiers

- `src/app/[locale]/(app)/import/page.tsx` — nouvelle page d'import dédiée (Server Component)
- `src/components/import/ImportDropzone.tsx` — zone drag & drop
- `src/components/import/ParserBadge.tsx` — badge parser détecté
- `src/components/import/ImportStats.tsx` — statistiques import
- `src/components/import/ImportPreviewTable.tsx` — tableau prévisualisation
- `src/components/import/ImportSuccess.tsx` — écran de confirmation
- `src/components/import/ColumnMappingForm.tsx` — formulaire mapping (refacto)
- `src/components/import/ImportWizard.tsx` — orchestrateur Client Component (3 étapes)
- `tests/unit/components/import/` — dossier de tests
