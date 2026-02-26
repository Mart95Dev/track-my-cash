# STORY-112 — Refonte Dashboard App

**Epic :** ui-refonte  
**Priorité :** P1 | **Complexité :** L | **Points :** 5  
**Sprint :** v15  
**Statut :** pending  
**Bloquée par :** STORY-107

## Description

Refonte du dashboard application d'après `dashboard.html`. Nouveau layout mobile-first avec balance card principale, 3 KPIs, historique de balance, transactions récentes.

## Maquette de référence

`/tmp/stitch-maquettes/app/dashboard.html`

## Acceptance Criteria

- **AC-1** : Header avec avatar user (cercle 48px), prénom user, badge statut vert, bouton notifications (cloche)
- **AC-2** : Chips filtres scroll horizontal : All, Personal, Couple (fond dark si actif, border sinon)
- **AC-3** : Balance Card : label "Solde total", montant principal en `text-4xl font-bold tracking-tighter`, variation % colorée, cartes bancaires miniatures
- **AC-4** : 3 KPIs en `grid-cols-3` : "Entrées" (revenus mois), "Sorties" (dépenses mois), "Fixes" (récurrents)
- **AC-5** : Section "Historique" avec label + badge période + graphique `BalanceEvolutionChart` existant réutilisé
- **AC-6** : Section "Dernières transactions" : 5 dernières avec icône catégorie, montant coloré (income/expense)
- **AC-7** : Fond `bg-background-light`, cards `bg-card-light shadow-soft border border-gray-100`
- **AC-8** : Dark mode : `dark:bg-background-dark`, `dark:bg-card-dark`, `dark:border-gray-800`
- **AC-9** : Mobile-first, `max-w-md mx-auto`
- **AC-10** : Composants couple (OnboardingWizard, CoupleChoiceModal, CoupleDashboard, etc.) préservés

## Specs Tests

### TU-112-1 : KpiCards 3 items
Vérifier que KpiCards reçoit les données revenus, dépenses, récurrents.

### TU-112-2 : BalanceCard montant en grand
Vérifier que BalanceCard contient une classe text-4xl, text-3xl ou text-5xl.

### TU-112-3 : Recent transactions 5 max
Vérifier que le dashboard ne charge que 5 dernières transactions pour la vue récente.

### TU-112-4 : Dark mode classes présentes
Vérifier que la page dashboard contient `dark:bg-background-dark`.

### TU-112-5 : Couple features préservées
Vérifier que CoupleDashboard et CoupleChoiceModal sont toujours importés.

## Fichiers

- `src/app/[locale]/(app)/dashboard/page.tsx`
- `src/components/balance-card.tsx`
- `src/components/kpi-cards.tsx`
