# STORY-078 — Page Paramètres : Refonte sections cards

**Sprint :** Design Stitch (v10)
**Épique :** app-ui
**Priorité :** P3
**Complexité :** M (3 points)
**Statut :** pending
**Bloqué par :** STORY-069

---

## Description

Refonte de la page `/parametres` selon la maquette Stitch. Les sections passent d'une liste plate à des cards thématiques séparées, chacune avec un titre et une icône Material Symbol. La zone danger est visuellement différenciée (`bg-danger/5 border-danger/20`).

**Logique préservée :** `BillingPortalButton`, `ExportImportButtons`, `ExportDataButton`, `MonthlyReportButton`, `AnnualReportButton`, `MonthlySummaryEmailButton`, `WeeklyEmailToggle`, `CurrencySettings`, `AutoCategorizeToggle`, `TagManager`, `CategorizationRules`, `ResetButton`, `DeleteUserAccountDialog`.

---

## Acceptance Criteria

- **AC-1 :** Chaque section est dans une card `bg-white rounded-2xl border border-gray-100 shadow-soft`
- **AC-2 :** Chaque section a un titre avec icône Material Symbol en `text-primary`
- **AC-3 :** La section Abonnement affiche plan, statut, date renouvellement + bouton portail Stripe outline
- **AC-4 :** La section IA affiche la barre de progression du quota mensuel (si Pro/Premium)
- **AC-5 :** La zone Danger est `bg-danger/5 border-danger/20` avec titre "Zone de danger" rouge
- **AC-6 :** Tous les composants fonctionnels existants sont préservés
- **AC-7 :** `npm run build` passe sans erreur TypeScript

---

## Fichiers à créer / modifier

| Fichier | Action | Détail |
|---------|--------|--------|
| `src/app/[locale]/(app)/parametres/page.tsx` | MODIFIER | Restructuration en cards thématiques |

---

## Structure de la page (8 sections)

```tsx
export default async function ParametresPage() {
  // ... chargement données existant préservé ...
  return (
    <div className="flex flex-col gap-4 px-4 pt-6 pb-4">

      {/* Header page */}
      <div className="flex items-center gap-3 mb-2">
        <span className="material-symbols-outlined text-primary text-[28px]">settings</span>
        <h1 className="text-2xl font-bold text-text-main">Paramètres</h1>
      </div>

      {/* 1. Abonnement */}
      <SettingsCard icon="workspace_premium" title="Abonnement">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="font-bold text-text-main">{planName}</p>
            <p className="text-text-muted text-sm">{statusLabel}</p>
          </div>
          <span className={`text-xs font-bold rounded-full px-3 py-1 ${planBadgeColor}`}>{planName}</span>
        </div>
        {renewalDate && <p className="text-text-muted text-sm mb-4">Renouvellement : {formatDate(renewalDate)}</p>}
        <BillingPortalButton className="w-full flex items-center justify-center gap-2 border-2 border-primary text-primary font-bold py-3 rounded-xl hover:bg-primary/5 transition-colors">
          <span className="material-symbols-outlined text-[18px]">open_in_new</span>
          Gérer mon abonnement
        </BillingPortalButton>
      </SettingsCard>

      {/* 2. Données */}
      <SettingsCard icon="database" title="Mes données">
        <div className="flex flex-col gap-3">
          <ExportImportButtons />
          <ExportDataButton className="flex items-center gap-2 text-sm font-medium text-text-main py-2 hover:text-primary transition-colors">
            <span className="material-symbols-outlined text-[18px]">download</span>
            Télécharger mes données (RGPD)
          </ExportDataButton>
        </div>
      </SettingsCard>

      {/* 3. Rapports */}
      <SettingsCard icon="summarize" title="Rapports">
        <div className="flex flex-col gap-3">
          <MonthlyReportButton />
          <AnnualReportButton />
          <MonthlySummaryEmailButton />
          <WeeklyEmailToggle enabled={weeklyEmailEnabled} />
        </div>
      </SettingsCard>

      {/* 4. Devises */}
      <SettingsCard icon="currency_exchange" title="Devises">
        <CurrencySettings rate={exchangeRate} />
      </SettingsCard>

      {/* 5. Intelligence artificielle */}
      {(isPro || isPremium) && (
        <SettingsCard icon="auto_awesome" title="Intelligence artificielle">
          {/* Barre quota IA */}
          {aiUsageCount !== undefined && aiLimit !== undefined && (
            <div className="mb-4">
              <div className="flex justify-between text-sm mb-1.5">
                <span className="text-text-muted">Conversations ce mois</span>
                <span className="font-bold text-text-main">{aiUsageCount} / {aiLimit === Infinity ? "∞" : aiLimit}</span>
              </div>
              {aiLimit !== Infinity && (
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${aiUsageCount / aiLimit >= 0.9 ? "bg-danger" : aiUsageCount / aiLimit >= 0.6 ? "bg-warning" : "bg-primary"}`}
                    style={{ width: `${Math.min((aiUsageCount / aiLimit) * 100, 100)}%` }}
                  />
                </div>
              )}
            </div>
          )}
          <AutoCategorizeToggle enabled={autoCategEnabled} />
        </SettingsCard>
      )}

      {/* 6. Tags */}
      <SettingsCard icon="label" title="Tags">
        <TagManager tags={tags} />
      </SettingsCard>

      {/* 7. Catégorisation */}
      <SettingsCard icon="category" title="Règles de catégorisation">
        <CategorizationRules rules={rules} />
      </SettingsCard>

      {/* 8. Zone danger */}
      <div className="bg-danger/5 border border-danger/20 rounded-2xl p-5">
        <div className="flex items-center gap-2 mb-4">
          <span className="material-symbols-outlined text-danger text-[20px]">warning</span>
          <h2 className="font-bold text-danger">Zone de danger</h2>
        </div>
        <div className="flex flex-col gap-3">
          <ResetButton />
          <DeleteUserAccountDialog />
        </div>
      </div>

    </div>
  );
}
```

## Composant SettingsCard (helper)

```typescript
// Composant helper local dans le fichier page.tsx
function SettingsCard({
  icon,
  title,
  children,
}: {
  icon: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-soft p-5">
      <div className="flex items-center gap-2 mb-4">
        <span className="material-symbols-outlined text-primary text-[20px]">{icon}</span>
        <h2 className="font-bold text-text-main">{title}</h2>
      </div>
      {children}
    </div>
  );
}
```

---

## Tests unitaires (TU-x)

**Fichier :** `tests/unit/components/settings-card.test.tsx`

| ID | Description | Résultat attendu |
|----|-------------|-----------------|
| TU-78-1 | `<SettingsCard icon="settings" title="Test">` affiche le titre | `getByText("Test")` |
| TU-78-2 | `<SettingsCard>` affiche l'icône | `getByText("settings")` dans `.material-symbols-outlined` |
| TU-78-3 | `<SettingsCard>` rend les children | contenu children présent |
| TU-78-4 | Quota IA 5/10 → barre 50% → classe bg-primary | classe présente |
| TU-78-5 | Quota IA 7/10 → barre 70% → classe bg-warning | classe présente |
| TU-78-6 | Quota IA 10/10 → barre 100% → classe bg-danger | classe présente |

---

## Mapping AC → Tests

| AC | Tests couvrant |
|----|---------------|
| AC-1 | TU-78-1, TU-78-2, TU-78-3 |
| AC-2 | TU-78-2 |
| AC-3 | Intégration BillingPortalButton |
| AC-4 | TU-78-4 à TU-78-6 |
| AC-5 | Code review danger zone |
| AC-6 | Intégration composants existants |
| AC-7 | `npm run build` |

---

## Notes d'implémentation

1. **`SettingsCard`** : simple composant helper défini dans le même fichier `page.tsx` (pas de fichier séparé — utilisé une seule fois)
2. **Boutons des composants existants** : certains composants (`BillingPortalButton`, `ExportImportButtons`) ont leur propre rendu — les wrapper ou leur passer une prop `className` si leur API le permet
3. **`aiLimit === Infinity`** pour Premium** : afficher "∞" et pas de barre de progression
4. **Sections conditionnelles** : IA seulement pour Pro/Premium, Rapports pour tous — préserver la logique existante
5. **`DeleteUserAccountDialog`** : déjà dans une Dialog shadcn — préserver intégralement, juste adapter les classes du trigger bouton
