# STORY-107 — Fondation Design System CSS Stitch v2

**Epic :** ui-refonte  
**Priorité :** P1 | **Complexité :** XS | **Points :** 1  
**Sprint :** v15  
**Statut :** pending

## Description

Ajouter dans `globals.css` les tokens CSS manquants et classes utilitaires custom pour que landing + app aient accès aux effets visuels des maquettes Stitch.

## Acceptance Criteria

- **AC-1** : `--couple-pink: #EC4899` ajouté dans `:root` de `globals.css`
- **AC-2** : `--color-couple-pink` exposé dans `@theme inline` → classes `text-couple-pink`, `bg-couple-pink` disponibles
- **AC-3** : Classe `.glass-panel` dans `@layer utilities` : `background: rgba(255,255,255,0.75)`, `backdrop-filter: blur(12px)`, `border: 1px solid rgba(255,255,255,0.5)`
- **AC-4** : Classe `.btn-premium` dans `@layer utilities` : `background: #4848e5`, `box-shadow: 0 4px 12px rgba(72,72,229,0.25)`, transition, hover `translateY(-1px)`
- **AC-5** : Classe `.gradient-text` dans `@layer utilities` : `background-clip: text`, `-webkit-text-fill-color: transparent`, gradient `#1e293b → #4848e5`
- **AC-6** : `npm run build` passe sans erreur TypeScript

## Specs Tests

### TU-107-1 : globals.css contient --couple-pink
Vérifier que le fichier globals.css contient `--couple-pink: #EC4899`

### TU-107-2 : @theme expose color-couple-pink
Vérifier que `@theme inline` contient `--color-couple-pink`

### TU-107-3 : glass-panel définie
Vérifier que `.glass-panel` est définie dans `@layer utilities`

### TU-107-4 : btn-premium définie
Vérifier que `.btn-premium` est définie dans `@layer utilities`

### TU-107-5 : gradient-text définie
Vérifier que `.gradient-text` est définie dans `@layer utilities`

## Fichiers

- `src/app/globals.css` — ajout tokens + classes utilitaires
