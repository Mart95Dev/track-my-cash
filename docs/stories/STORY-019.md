# STORY-019 — Fix ESLint set-state-in-effect

**Epic :** UX & Stabilité
**Priorité :** P0
**Complexité :** XS
**Statut :** pending
**Bloquée par :** aucune

## User Story

En tant que développeur, je veux que le code respecte les règles ESLint sans erreur, afin d'éviter des cascades de renders et des bugs subtils dans les dialogs.

## Contexte technique

3 composants appellent `setOpen(false)` directement dans un `useEffect`, ce qui viole `react-hooks/set-state-in-effect`. Le pattern correct est d'utiliser `useEffect` avec une dépendance sur l'état de l'action (ex: `isPending` ou le retour de `useActionState`), ou de déplacer le `setOpen` dans un callback.

Pattern problématique actuel :
```tsx
useEffect(() => {
  if (state && "success" in state) {
    toast.success(t("success"));
    setOpen(false); // ← ESLint error
  }
}, [state]);
```

Fix recommandé : utiliser `startTransition` ou déplacer `setOpen` dans un `useCallback` appelé depuis l'effet de façon asynchrone (via `setTimeout(fn, 0)`) ou utiliser `flushSync`.

La solution la plus simple et compatible React 19 :
```tsx
useEffect(() => {
  if (state && "success" in state) {
    toast.success(t("success"));
    // Différer la mise à jour d'état hors du cycle de rendu courant
    const timer = setTimeout(() => setOpen(false), 0);
    return () => clearTimeout(timer);
  }
}, [state]);
```

## Fichiers à modifier

- `src/components/edit-account-dialog.tsx` — ligne ~32
- `src/components/edit-recurring-dialog.tsx` — ligne ~46
- `src/components/edit-transaction-dialog.tsx` — ligne ~46

## Acceptance Criteria

- AC-1 : `npm run lint` retourne 0 erreurs
- AC-2 : Les dialogs se ferment correctement après une action réussie
- AC-3 : Les tests existants passent toujours (`npm test`)
- AC-4 : Aucun nouveau type `any` introduit

## Tests à créer

Aucun test nouveau requis (comportement déjà couvert par les tests existants + validation manuelle).

## Estimation : 1 point / 30min
