# STORY-073 — Page Comptes : Refonte

**Sprint :** Design Stitch (v10)
**Épique :** app-ui
**Priorité :** P2
**Complexité :** M (3 points)
**Statut :** pending
**Bloqué par :** STORY-069

---

## Description

Refonte de la page `/comptes`. Chaque compte passe d'un tableau ou d'une card basique à une card blanche avec icône colorée, solde en couleur sémantique, badges d'alerte, et actions icônes accessibles. Le formulaire d'ajout est intégré dans une card collapsible ou toujours visible.

**Logique préservée :** `getAccounts()`, `getCalculatedBalance()`, `AccountForm`, `ReconciliationDialog`, `EditAccountDialog`, `DeleteAccountButton`.

---

## Acceptance Criteria

- **AC-1 :** Chaque compte est dans une card `bg-white rounded-2xl border border-gray-100 shadow-soft`
- **AC-2 :** Le solde calculé est `text-success` si ≥ 0, `text-danger` si < 0 — en `text-xl font-bold`
- **AC-3 :** Badge d'alerte `bg-warning/10 text-warning` si solde < `alert_threshold`
- **AC-4 :** Les 3 boutons d'action (réconciliation, édition, suppression) utilisent des icônes Material Symbols
- **AC-5 :** Le formulaire d'ajout de compte est accessible (card ou section dédiée)
- **AC-6 :** Header de page : titre "Mes Comptes" + icône `account_balance_wallet`
- **AC-7 :** `npm run build` passe sans erreur TypeScript

---

## Fichiers à créer / modifier

| Fichier | Action | Détail |
|---------|--------|--------|
| `src/app/[locale]/(app)/comptes/page.tsx` | MODIFIER | Restructuration JSX |
| `src/components/account-form.tsx` | VÉRIFIER | Adapter si besoin les classes |

---

## Design Account Card

```tsx
function AccountCard({ account, calculatedBalance }: { account: Account; calculatedBalance: number }) {
  const isAlert = account.alert_threshold !== null && calculatedBalance < account.alert_threshold;
  const isNegative = calculatedBalance < 0;

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-soft p-5">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          {/* Icône compte */}
          <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
            <span className="material-symbols-outlined">account_balance_wallet</span>
          </div>
          <div>
            <h3 className="font-bold text-text-main">{account.name}</h3>
            <p className="text-text-muted text-xs">{account.currency}</p>
          </div>
        </div>
        {/* Solde */}
        <div className="text-right">
          <p className={`text-xl font-bold ${isNegative ? "text-danger" : "text-success"}`}>
            {formatCurrency(calculatedBalance, account.currency)}
          </p>
          {isAlert && (
            <span className="inline-flex items-center gap-1 bg-warning/10 text-warning text-xs font-bold rounded-md px-2 py-0.5 mt-1">
              <span className="material-symbols-outlined text-[14px]">warning</span>
              Alerte solde
            </span>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 mt-4 pt-4 border-t border-gray-100">
        <ReconciliationDialog account={account}>
          <button className="flex items-center gap-1.5 text-xs font-medium text-text-muted hover:text-primary px-3 py-1.5 rounded-lg hover:bg-primary/5 transition-colors">
            <span className="material-symbols-outlined text-[16px]">balance</span>
            Réconcilier
          </button>
        </ReconciliationDialog>
        <EditAccountDialog account={account}>
          <button className="flex items-center gap-1.5 text-xs font-medium text-text-muted hover:text-primary px-3 py-1.5 rounded-lg hover:bg-primary/5 transition-colors">
            <span className="material-symbols-outlined text-[16px]">edit</span>
            Modifier
          </button>
        </EditAccountDialog>
        <div className="ml-auto">
          <DeleteAccountButton accountId={account.id} />
        </div>
      </div>
    </div>
  );
}
```

## Structure page Comptes

```tsx
export default async function ComptesPage() {
  const accounts = await getAccounts(db);
  const accountsWithBalance = accounts.map(a => ({
    ...a,
    calculatedBalance: getCalculatedBalance(db, a.id),
  }));

  return (
    <div className="flex flex-col px-4 pt-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <span className="material-symbols-outlined text-primary text-[28px]">account_balance_wallet</span>
        <h1 className="text-2xl font-bold text-text-main">Mes Comptes</h1>
      </div>

      {/* Formulaire ajout */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-soft p-5 mb-6">
        <h2 className="font-bold text-text-main mb-4">Ajouter un compte</h2>
        <AccountForm />
      </div>

      {/* Liste comptes */}
      {accountsWithBalance.length === 0 ? (
        <EmptyState icon="account_balance_wallet" message="Aucun compte. Ajoutez votre premier compte ci-dessus." />
      ) : (
        <div className="flex flex-col gap-4">
          {accountsWithBalance.map(a => (
            <AccountCard key={a.id} account={a} calculatedBalance={a.calculatedBalance} />
          ))}
        </div>
      )}
    </div>
  );
}
```

---

## Tests unitaires (TU-x)

**Fichier :** `tests/unit/components/account-card.test.tsx`

| ID | Description | Résultat attendu |
|----|-------------|-----------------|
| TU-73-1 | Solde positif → classe `text-success` | présente sur l'élément montant |
| TU-73-2 | Solde négatif → classe `text-danger` | présente sur l'élément montant |
| TU-73-3 | Solde < alert_threshold → badge "Alerte solde" | `getByText(/alerte solde/i)` |
| TU-73-4 | Solde ≥ alert_threshold → pas de badge alerte | badge absent |
| TU-73-5 | Nom du compte affiché | `getByText(account.name)` |
| TU-73-6 | Devise du compte affichée | `getByText(account.currency)` |

---

## Mapping AC → Tests

| AC | Tests couvrant |
|----|---------------|
| AC-1 | Code review classe CSS |
| AC-2 | TU-73-1, TU-73-2 |
| AC-3 | TU-73-3, TU-73-4 |
| AC-4 | Code review icônes Material Symbols |
| AC-5, AC-6, AC-7 | `npm run build` |

---

## Notes d'implémentation

1. **`DeleteAccountButton`** : garder tel quel (logique de confirmation existante)
2. **`ReconciliationDialog`** et **`EditAccountDialog`** : composants shadcn Dialog préservés intégralement
3. **Icône par type de compte** : utiliser `account_balance_wallet` pour tous par défaut, ou varier selon le nom (heuristique simple)
4. **Solde calculé** : lire depuis la query existante, ne pas recalculer dans le composant
