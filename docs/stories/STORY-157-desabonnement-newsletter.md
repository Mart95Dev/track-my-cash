# STORY-157 — Lien desabonnement newsletter

**Epic :** blog-dynamique
**Complexite :** S (3 pts)
**Priorite :** P1
**Projet :** track-my-cash
**blockedBy :** [STORY-155]

## Description

Implementer un endpoint de desabonnement securise par HMAC. Chaque email de newsletter contient un lien signe qui permet de se desinscrire en un clic.

## Fichiers a creer/modifier

- **CREER** `src/app/api/newsletter/unsubscribe/route.ts` — GET endpoint avec verification HMAC
- **CREER** `src/lib/newsletter-utils.ts` — generateUnsubscribeUrl(email), verifyUnsubscribeToken(email, token)
- **MODIFIER** `src/lib/email-templates.ts` — Inclure le lien de desabonnement dans renderNewsletterWelcomeEmail

## Criteres d'acceptation

| # | Critere |
|---|---------|
| AC-157-1 | Le lien de desabonnement dans l'email est fonctionnel |
| AC-157-2 | Le statut passe a "unsubscribed" en DB avec unsubscribed_at renseigne |
| AC-157-3 | Un token HMAC invalide retourne une erreur 403 |
| AC-157-4 | Une page HTML de confirmation "Desinscription confirmee" s'affiche |
| AC-157-5 | Un email deja desabonne ne genere pas d'erreur (idempotent) |

## Specs de tests

### Tests unitaires

| ID | Test | Fichier |
|----|------|---------|
| TU-157-1 | generateUnsubscribeUrl genere une URL avec email et token HMAC | `tests/unit/lib/newsletter-utils.test.ts` |
| TU-157-2 | verifyUnsubscribeToken retourne true pour un token valide | `tests/unit/lib/newsletter-utils.test.ts` |
| TU-157-3 | verifyUnsubscribeToken retourne false pour un token invalide | `tests/unit/lib/newsletter-utils.test.ts` |
| TU-157-4 | verifyUnsubscribeToken retourne false si email modifie | `tests/unit/lib/newsletter-utils.test.ts` |

### Tests API route

| ID | Test | Fichier |
|----|------|---------|
| TF-157-1 | GET /api/newsletter/unsubscribe avec token valide → status 200 + HTML | `tests/unit/api/newsletter-unsubscribe.test.ts` |
| TF-157-2 | GET /api/newsletter/unsubscribe avec token invalide → status 403 | `tests/unit/api/newsletter-unsubscribe.test.ts` |
| TF-157-3 | GET /api/newsletter/unsubscribe sans params → status 400 | `tests/unit/api/newsletter-unsubscribe.test.ts` |
| TF-157-4 | GET /api/newsletter/unsubscribe met a jour status et unsubscribed_at en DB | `tests/unit/api/newsletter-unsubscribe.test.ts` |
| TF-157-5 | GET /api/newsletter/unsubscribe avec email deja desabonne → status 200 (idempotent) | `tests/unit/api/newsletter-unsubscribe.test.ts` |

### Mapping AC → tests

| AC | Tests |
|----|-------|
| AC-157-1 | TU-157-1, TF-157-1 |
| AC-157-2 | TF-157-4 |
| AC-157-3 | TU-157-3, TF-157-2 |
| AC-157-4 | TF-157-1 |
| AC-157-5 | TF-157-5 |

### Variable d'environnement

- `NEWSLETTER_SECRET` : cle HMAC pour signer les tokens (a ajouter dans `.env`)
