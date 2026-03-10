# STORY-143 : Endpoints Stripe subscription pour le mobile

**Sprint :** v18 — Parité Web/Mobile
**Priorité :** P1
**Complexité :** S (3 pts)
**Epic :** parite-endpoints
**Bloqué par :** STORY-139

---

## Contexte

Le mobile a besoin de 2 endpoints supplémentaires pour gérer les abonnements Stripe :
- Créer une session checkout (upgrade de plan)
- Obtenir l'URL du portail client Stripe (gérer/annuler abonnement)

Le web a déjà cette logique dans `/api/stripe/checkout` et `billing-actions.ts`.

## Fichiers impactés

**Projet web (track-my-cash) :**
- `src/app/api/mobile/subscription/checkout/route.ts` (NOUVEAU)
- `src/app/api/mobile/subscription/portal-url/route.ts` (NOUVEAU)

## Acceptance Criteria

### AC-1 : Checkout session

```gherkin
Given un utilisateur authentifié (JWT)
When POST /api/mobile/subscription/checkout avec { planId: "pro" }
Then une session Stripe Checkout est créée
And la réponse contient { url: "https://checkout.stripe.com/..." }
And success_url et cancel_url pointent vers l'app mobile (deep link ou web fallback)
```

### AC-2 : Portal URL

```gherkin
Given un utilisateur avec un abonnement actif
When GET /api/mobile/subscription/portal-url
Then la réponse contient { url: "https://billing.stripe.com/..." }

Given un utilisateur sans abonnement Stripe
When GET /api/mobile/subscription/portal-url
Then la réponse est 404 "Aucun abonnement trouvé"
```

### AC-3 : Plans validés

```gherkin
Given un planId invalide ("invalid-plan")
When POST /api/mobile/subscription/checkout avec { planId: "invalid-plan" }
Then la réponse est 400 "Plan invalide"
```

### AC-4 : Auth JWT requise

```gherkin
Given pas de header Authorization
When POST /api/mobile/subscription/checkout
Then la réponse est 401
```

## Spécifications de tests

**Fichier :** `tests/unit/api-mobile-subscription.test.ts`

| ID | Test | Assertion |
|----|------|-----------|
| TU-1 | checkout retourne URL Stripe | Status 200, url présent |
| TU-2 | checkout rejette plan invalide | Status 400 |
| TU-3 | checkout requiert auth | Status 401 sans JWT |
| TU-4 | portal-url retourne URL | Status 200, url présent |
| TU-5 | portal-url 404 sans abonnement | Status 404 |
