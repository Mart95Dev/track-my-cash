# STORY-079 — Stripe Tax : TVA automatique

**Sprint :** Conversion & Monétisation (v11)
**Épique :** monetisation
**Priorité :** P1 — MUST HAVE
**Complexité :** XS (1 point)
**Statut :** completed
**Bloqué par :** aucune

---

## Description

Activer Stripe Tax sur les sessions de checkout pour collecter la TVA automatiquement selon la localisation du client. Sans cette configuration, TrackMyCash facture HT quel que soit le pays du client — risque de non-conformité fiscale en zone EU.

La modification est minimaliste (2 paramètres dans la route checkout) mais son impact légal est critique : les ventes réalisées sans TVA dans les pays où elle s'applique engagent la responsabilité de l'éditeur.

**Prérequis hors code (Stripe Dashboard) :**
- Activer Stripe Tax dans Settings > Tax (hors scope du code)
- Ajouter au moins une Registration TVA pour la France (FR)
- Vérifier que les `stripePriceId` en base sont configurés avec les bons tax codes produit

---

## Acceptance Criteria

- **AC-1 :** `automatic_tax: { enabled: true }` est présent dans `stripe.checkout.sessions.create()`
- **AC-2 :** `tax_id_collection: { enabled: true }` est présent pour permettre la saisie du numéro de TVA intracommunautaire
- **AC-3 :** Aucune régression : la route retourne toujours 400 pour un plan invalide et l'URL Stripe pour un plan valide
- **AC-4 :** `npm run build` passe sans erreur TypeScript
- **AC-5 :** 0 erreur lint (`npm run lint`)

---

## Fichiers à modifier

| Fichier | Action | Détail |
|---------|--------|--------|
| `src/app/api/stripe/checkout/route.ts` | MODIFIER | Ajouter `automatic_tax` et `tax_id_collection` dans `stripe.checkout.sessions.create()` |

---

## Implémentation cible

```ts
// src/app/api/stripe/checkout/route.ts
const checkoutSession = await stripe.checkout.sessions.create({
  mode: "subscription",
  payment_method_types: ["card"],
  line_items: [{ price: plan.stripePriceId, quantity: 1 }],
  customer_email: userEmail,
  metadata: { userId, planId },
  automatic_tax: { enabled: true },          // ← AJOUT
  tax_id_collection: { enabled: true },       // ← AJOUT
  success_url: `${baseUrl}/${locale}/parametres?tab=billing&success=true`,
  cancel_url: `${baseUrl}/${locale}/tarifs`,
  subscription_data: {
    metadata: { userId, planId },
  },
});
```

**Note :** `automatic_tax` nécessite que Stripe Tax soit activé dans le Dashboard. En mode test, la session se crée normalement mais la TVA n'est calculée que si une registration est configurée.

---

## Tests unitaires

**Fichier :** `tests/unit/api/stripe-checkout.test.ts`

| ID | Description | Résultat attendu |
|----|-------------|-----------------|
| TU-79-1 | La session créée contient `automatic_tax.enabled = true` | Mock Stripe vérifie le paramètre |
| TU-79-2 | La session créée contient `tax_id_collection.enabled = true` | Mock Stripe vérifie le paramètre |
| TU-79-3 | Route retourne 400 si `planId = "free"` (sans stripePriceId) | `status === 400` |
| TU-79-4 | Route retourne 400 si `planId = "invalid"` | `status === 400` |
| TU-79-5 | Route retourne `{ url }` si planId valide | `body.url` défini |

---

## Mapping AC → Tests

| AC | Tests couvrant |
|----|---------------|
| AC-1 | TU-79-1 |
| AC-2 | TU-79-2 |
| AC-3 | TU-79-3, TU-79-4, TU-79-5 |
| AC-4, AC-5 | `npm run build && npm run lint` |

---

## Données de test / Fixtures

```ts
// Mock Stripe dans les tests
vi.mock("@/lib/stripe", () => ({
  stripe: {
    checkout: {
      sessions: {
        create: vi.fn().mockResolvedValue({ url: "https://checkout.stripe.com/test" }),
      },
    },
  },
}));
```

---

## Notes d'implémentation

1. **TypeScript** : `automatic_tax` et `tax_id_collection` sont dans le type `Stripe.Checkout.SessionCreateParams` — pas de `any` nécessaire
2. **Tests** : La route est une API Route Next.js — mocker `@/lib/stripe`, `@/lib/auth-utils`, `next/headers`
3. **Non-régression** : les tests existants sur cette route (s'ils existent) doivent continuer à passer
