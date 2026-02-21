# STORY-002 — Redirections Stripe : locale dynamique

**Epic :** Bugs critiques
**Priorité :** P0
**Complexité :** XS
**Statut :** pending

## User Story

En tant qu'utilisateur avec la locale /en/,
je veux être redirigé vers /en/parametres après mon paiement Stripe,
afin de ne pas me retrouver sur une page en français après avoir payé.

## Critères d'acceptance

- [ ] `success_url` utilise la locale extraite de l'en-tête de la requête
- [ ] `cancel_url` utilise la locale extraite de l'en-tête de la requête
- [ ] `return_url` dans billing-actions.ts utilise la locale dynamique
- [ ] Une requête depuis `/en/tarifs` → redirige vers `/en/parametres?tab=billing&success=true`
- [ ] Une requête depuis `/fr/tarifs` → redirige vers `/fr/parametres?tab=billing&success=true`

## Fichiers à modifier

- `src/app/api/stripe/checkout/route.ts` → extraire locale du header `referer` ou la recevoir en body
- `src/app/actions/billing-actions.ts` → passer `locale` en paramètre de `createBillingPortalSession()`

## Tests

- Checkout depuis `/en/` → success_url contient `/en/`
- Checkout depuis `/fr/` → success_url contient `/fr/`
