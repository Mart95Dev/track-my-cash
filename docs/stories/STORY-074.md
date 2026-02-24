# STORY-074 — Page Transactions : Refonte

**Sprint :** Design Stitch (v10)
**Épique :** app-ui
**Priorité :** P2
**Complexité :** M (3 points)
**Statut :** pending
**Bloqué par :** STORY-069

---

## Description

Refonte de la page `/transactions` selon la maquette Stitch. La barre de recherche passe à un input avec icône Material Symbol intégrée. Les boutons d'action (Import, Export, Auto-catégoriser) sont regroupés visuellement. La liste de transactions passe d'un tableau desktop à des cards mobiles avec couleurs sémantiques, tags colorés et icône note.

**Logique préservée :** `TransactionForm`, `TransactionSearch`, `ImportButton`, `ExportTransactions`, `AutoCategorizeButton`, `EditTransactionDialog`, `DeleteTransactionButton`, `TransactionTagPopover`, `Pagination`.

---

## Acceptance Criteria

- **AC-1 :** La barre de recherche a l'icône `search` à gauche et le style input Stitch (rounded-xl, ring-1)
- **AC-2 :** Les 3 boutons d'action (Import, Export, Auto-catégoriser) ont des icônes Material Symbols
- **AC-3 :** Chaque transaction affiche montant en `text-success` (income) ou `text-danger` (expense)
- **AC-4 :** Les tags colorés s'affichent correctement sous la description
- **AC-5 :** L'icône `sticky_note` s'affiche pour les transactions ayant une note
- **AC-6 :** La pagination fonctionne (boutons Précédent/Suivant avec icônes)
- **AC-7 :** Les actions edit (icône `edit`) et delete (icône `delete_outline`) sont accessibles sur chaque ligne
- **AC-8 :** `npm run build` passe sans erreur TypeScript

---

## Fichiers à créer / modifier

| Fichier | Action | Détail |
|---------|--------|--------|
| `src/app/[locale]/(app)/transactions/page.tsx` | MODIFIER | Restructuration JSX |
| `src/components/transaction-search.tsx` | MODIFIER | Style input Stitch |
| `src/components/pagination.tsx` | MODIFIER | Style boutons avec icônes Material Symbols |

---

## Design barre de recherche + actions

```tsx
{/* Search bar */}
<div className="px-4 mb-3">
  <div className="relative">
    <span className="absolute left-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-text-muted">search</span>
    <input
      type="search"
      placeholder="Rechercher une transaction..."
      className="w-full rounded-xl border-0 py-3.5 pl-12 pr-4 bg-white ring-1 ring-slate-200 focus:ring-2 focus:ring-primary text-text-main placeholder:text-text-muted"
    />
  </div>
</div>

{/* Action buttons */}
<div className="flex items-center gap-2 px-4 mb-4 overflow-x-auto no-scrollbar">
  <ImportButton className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-gray-200 text-text-main text-sm font-medium hover:border-primary hover:text-primary transition-colors shrink-0">
    <span className="material-symbols-outlined text-[18px]">upload_file</span>
    Importer
  </ImportButton>
  <ExportTransactions className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-gray-200 text-sm font-medium shrink-0">
    <span className="material-symbols-outlined text-[18px]">download</span>
    Exporter
  </ExportTransactions>
  {canUseAI && (
    <AutoCategorizeButton className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary/10 text-primary text-sm font-medium shrink-0">
      <span className="material-symbols-outlined text-[18px]">auto_awesome</span>
      Catégoriser
    </AutoCategorizeButton>
  )}
</div>
```

## Design Transaction Item

```tsx
function TransactionItem({ tx, tags }: { tx: Transaction; tags: Tag[] }) {
  const isIncome = tx.type === "income";
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-soft p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          {/* Date + description */}
          <p className="text-text-muted text-xs mb-0.5">{formatDate(tx.date)}</p>
          <p className="font-medium text-text-main truncate">{tx.description}</p>

          {/* Catégorie */}
          {tx.category && (
            <span className="inline-block mt-1 bg-indigo-50 text-primary text-xs font-medium rounded-md px-2 py-0.5">
              {tx.category}{tx.subcategory ? ` · ${tx.subcategory}` : ""}
            </span>
          )}

          {/* Tags */}
          {tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {tags.map(tag => (
                <span key={tag.id}
                  className="text-xs font-medium rounded-full px-2 py-0.5"
                  style={{ backgroundColor: tag.color + "20", color: tag.color }}
                >
                  {tag.name}
                </span>
              ))}
            </div>
          )}
        </div>

        <div className="flex flex-col items-end gap-2 shrink-0">
          {/* Montant */}
          <p className={`font-bold text-lg ${isIncome ? "text-success" : "text-danger"}`}>
            {isIncome ? "+" : "-"}{formatCurrency(Math.abs(tx.amount), tx.currency ?? "EUR")}
          </p>

          {/* Actions */}
          <div className="flex items-center gap-1">
            {tx.note && (
              <span className="material-symbols-outlined text-text-muted text-[18px]" title={tx.note}>sticky_note</span>
            )}
            <EditTransactionDialog tx={tx}>
              <button className="p-1 rounded-lg hover:bg-gray-100 text-text-muted hover:text-primary transition-colors">
                <span className="material-symbols-outlined text-[18px]">edit</span>
              </button>
            </EditTransactionDialog>
            <DeleteTransactionButton txId={tx.id} />
          </div>
        </div>
      </div>
    </div>
  );
}
```

## Design Pagination

```tsx
// src/components/pagination.tsx
export function Pagination({ currentPage, totalPages, baseUrl }: PaginationProps) {
  return (
    <div className="flex items-center justify-between px-4 py-4">
      <Link
        href={`${baseUrl}?page=${currentPage - 1}`}
        className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
          currentPage <= 1
            ? "text-text-muted cursor-not-allowed pointer-events-none"
            : "bg-white border border-gray-200 text-text-main hover:border-primary hover:text-primary"
        }`}
      >
        <span className="material-symbols-outlined text-[18px]">chevron_left</span>
        Précédent
      </Link>
      <span className="text-text-muted text-sm">{currentPage} / {totalPages}</span>
      <Link
        href={`${baseUrl}?page=${currentPage + 1}`}
        className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
          currentPage >= totalPages
            ? "text-text-muted cursor-not-allowed pointer-events-none"
            : "bg-white border border-gray-200 text-text-main hover:border-primary hover:text-primary"
        }`}
      >
        Suivant
        <span className="material-symbols-outlined text-[18px]">chevron_right</span>
      </Link>
    </div>
  );
}
```

---

## Tests unitaires (TU-x)

**Fichier :** `tests/unit/components/transaction-item.test.tsx`

| ID | Description | Résultat attendu |
|----|-------------|-----------------|
| TU-74-1 | Transaction income → classe `text-success` sur montant | présente |
| TU-74-2 | Transaction expense → classe `text-danger` sur montant | présente |
| TU-74-3 | Transaction avec note → icône `sticky_note` présente | `getByText('sticky_note')` |
| TU-74-4 | Transaction sans note → pas d'icône sticky_note | absent |
| TU-74-5 | Catégorie affichée dans badge indigo | `getByText(tx.category)` avec classe `bg-indigo-50` |
| TU-74-6 | Tags affichés avec couleur custom | badge tag avec `style.color` |

---

## Mapping AC → Tests

| AC | Tests couvrant |
|----|---------------|
| AC-1 | Code review input style |
| AC-2 | Code review boutons |
| AC-3 | TU-74-1, TU-74-2 |
| AC-4 | TU-74-6 |
| AC-5 | TU-74-3, TU-74-4 |
| AC-6 | Code review Pagination |
| AC-7 | Code review boutons edit/delete |
| AC-8 | `npm run build` |

---

## Notes d'implémentation

1. **`TransactionSearch`** : composant client existant — adapter uniquement le style de l'input
2. **`TransactionTagPopover`** : préserver intégralement — accessible depuis l'icône `label` sur chaque item
3. **`ImportButton`** : peut accepter des `className` overrides ou wrapper dans un div stylé
4. **`no-scrollbar`** : ajouter dans `globals.css` : `.no-scrollbar::-webkit-scrollbar { display: none; } .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }`
5. **Formulaire ajout transaction** : `<TransactionForm>` accessible via un bouton flottant (+) ou en haut de page dans une card
