# STORY-113 — Refonte Transactions App

**Epic :** ui-refonte  
**Priorité :** P2 | **Complexité :** M | **Points :** 3  
**Sprint :** v15  
**Statut :** pending  
**Bloquée par :** STORY-107

## Description

Refonte de la page transactions d'après `transactions.html`. Header sticky avec filtres, boutons Import/Export/AI Scan, liste groupée par date.

## Maquette de référence

`/tmp/stitch-maquettes/app/transactions.html`

## Acceptance Criteria

- **AC-1** : Header sticky "Transactions" (text-3xl font-extrabold tracking-tight) + bouton "Modifier" à droite
- **AC-2** : Chips filtres scroll horizontal : "Tous les comptes", "Recherche", "Tags"
- **AC-3** : 3 boutons d'action : "Import CSV", "Export Data", "AI Scan" (avec icône auto_awesome bg-primary/10)
- **AC-4** : Liste transactions groupées par date, headers de date sticky (`sticky top-0 z-10`)
- **AC-5** : Chaque transaction : icône catégorie (cercle coloré), nom, montant (rouge dépense / vert revenu), swipe ou action
- **AC-6** : Fond `bg-background-light`, dark mode supporté
- **AC-7** : Fonctionnalité import CSV existante préservée (lien vers la page d'import ou modal existante)

## Specs Tests

### TU-113-1 : Header "Transactions" présent
Vérifier que page.tsx contient "Transactions" comme titre principal h1.

### TU-113-2 : Boutons Import CSV visible
Vérifier que la page contient "Import CSV" ou "Importer" comme texte de bouton.

### TU-113-3 : Groupement par date
Vérifier que les transactions sont groupées (structure avec dates en headers).

### TU-113-4 : Dark mode
Vérifier que la page contient `dark:bg-background-dark`.

## Fichiers

- `src/app/[locale]/(app)/transactions/page.tsx`
