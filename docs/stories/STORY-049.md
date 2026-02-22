# STORY-049 — Catégorisation IA automatique à l'import (option)

**Sprint :** Intelligence & UX IA (v7)
**Épique :** intelligence
**Priorité :** P1
**Complexité :** S (2 points)
**Statut :** pending
**Bloqué par :** —

---

## Description

Actuellement, après un import, l'utilisateur doit se rendre dans `/transactions` et cliquer manuellement sur "Auto-catégoriser". Cette étape crée de la friction. Une option dans `/parametres` (section IA, visible uniquement Pro/Premium) permet d'activer la catégorisation IA automatiquement pendant le flow d'import. Si activée, `confirmImportAction()` déclenche `autoCategorizeAction()` en fire-and-forget juste après l'insertion des transactions.

**Clé setting DB :** `auto_categorize_on_import` (valeur : `"true"` / `"false"`)

---

## Acceptance Criteria

- **AC-1 :** Le toggle est visible dans `/parametres` pour les plans Pro/Premium uniquement
- **AC-2 :** Si activé, les transactions sont catégorisées par IA immédiatement après un import réussi
- **AC-3 :** La catégorisation ne bloque pas l'import (fire-and-forget, erreur silencieuse catchée)
- **AC-4 :** Le toggle est persisté en DB via `setSetting()` (survit aux rechargements)
- **AC-5 :** Si l'utilisateur est sur plan Free, le toggle est affiché désactivé avec message "Fonctionnalité Pro/Premium"

---

## Fichiers à créer / modifier

| Fichier | Action |
|---------|--------|
| `src/components/auto-categorize-toggle.tsx` | CRÉER — toggle client avec label |
| `src/app/[locale]/(app)/parametres/page.tsx` | MODIFIER — ajouter section IA avec le toggle |
| `src/app/actions/import-actions.ts` | MODIFIER — hook fire-and-forget dans `confirmImportAction()` |
| `src/app/actions/settings-actions.ts` | MODIFIER ou CRÉER — `toggleAutoCategorizationAction()` |
| `tests/unit/lib/auto-categorize-setting.test.ts` | CRÉER — tests unitaires du comportement de la logique |

---

## Tests unitaires (TU-x)

**Fichier :** `tests/unit/lib/auto-categorize-setting.test.ts`

Note : les tests portent sur la logique de `confirmImportAction()` — ils vérifient que `autoCategorizeAction` est appelé sous les bonnes conditions.

### Cas de test (logique pure testable)

| ID | Description | Résultat attendu |
|----|-------------|-----------------|
| TU-49-1 | `auto_categorize_on_import` = "true" → `autoCategorizeAction` appelée | Mock de `autoCategorizeAction` vérifié appelé 1× |
| TU-49-2 | `auto_categorize_on_import` = "false" → `autoCategorizeAction` non appelée | Mock vérifié non appelé |
| TU-49-3 | `auto_categorize_on_import` absente (défaut) → non appelée | Mock non appelé |
| TU-49-4 | Erreur dans `autoCategorizeAction` → import réussi quand même | `confirmImportAction` retourne `{ success: true }` même si mock throws |

---

## Mapping AC → Tests

| AC | Tests couvrant |
|----|---------------|
| AC-1 | Testé visuellement (toggle visible selon plan) |
| AC-2 | TU-49-1 |
| AC-3 | TU-49-4 (fire-and-forget) |
| AC-4 | TU-49-1 + TU-49-2 (setting lu depuis DB) |
| AC-5 | TU-49-3 (setting absent = non activé) |

---

## Notes d'implémentation

```typescript
// Dans confirmImportAction() — après revalidatePath
const autoCategorize = await getSetting(db, "auto_categorize_on_import");
if (autoCategorize === "true") {
  const aiCheck = await canUseAI(userId);
  if (aiCheck.allowed) {
    autoCategorizeAction(accountId).catch(() => {}); // fire-and-forget
  }
}
```

- Le toggle dans `/parametres` appelle `toggleAutoCategorizationAction(enabled: boolean)` qui fait `setSetting(db, "auto_categorize_on_import", enabled ? "true" : "false")`
- La section IA dans `/parametres` s'affiche pour tous mais le toggle est `disabled` pour les Free avec un tooltip/message explicatif
- `autoCategorizeAction()` est déjà implémentée dans `ai-categorize-actions.ts` — pas de duplication
- Plan vérification : `canUseAI(userId)` dans `confirmImportAction()` avant d'appeler la catégorisation (double-guard)
