# STORY-005 — Bouton "Gérer mon abonnement" (Stripe Portal)

**Epic :** Fonctionnalités incomplètes
**Priorité :** P1
**Complexité :** S
**Statut :** pending

## User Story

En tant qu'utilisateur Pro ou Premium,
je veux pouvoir accéder au portail Stripe pour gérer mon abonnement,
afin de pouvoir changer ma carte, voir mes factures ou annuler.

## Critères d'acceptance

- [ ] Dans `/parametres` (onglet Abonnement) : affichage du plan actuel + date de renouvellement
- [ ] Bouton "Gérer mon abonnement" visible si l'utilisateur a un `stripe_customer_id`
- [ ] Le clic déclenche `createBillingPortalSession()` et redirige vers le portail Stripe
- [ ] Si l'utilisateur est en plan Free (pas de customer_id), le bouton est absent ou désactivé
- [ ] Loading state pendant la redirection

## Fichiers à modifier

- `src/app/[locale]/(app)/parametres/page.tsx` → ajouter la section abonnement avec données
- `src/components/billing-portal-button.tsx` → CRÉER (bouton client avec Server Action)
- `src/app/actions/billing-actions.ts` → vérifier `createBillingPortalSession()` + `getSubscription()`

## Tests

- User Pro : bouton visible, clic → appelle createBillingPortalSession
- User Free : bouton absent ou désactivé
