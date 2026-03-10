# STORY-155 — Newsletter fonctionnelle (inscription)

**Epic :** blog-dynamique
**Complexite :** M (5 pts)
**Priorite :** P0
**Projet :** track-my-cash
**blockedBy :** [STORY-150]

## Description

Remplacer le formulaire newsletter non fonctionnel (`onSubmit preventDefault`) par un vrai Server Action qui enregistre l'email en DB et envoie un email de confirmation via Nodemailer.

## Fichiers a creer/modifier

- **CREER** `src/app/actions/newsletter-actions.ts` — subscribeNewsletterAction(formData)
- **MODIFIER** `src/app/[locale]/(marketing)/blog/blog-content.tsx` — Remplacer le formulaire par un form avec Server Action + honeypot + feedback
- **MODIFIER** `src/lib/email-templates.ts` — Ajouter renderNewsletterWelcomeEmail(email, unsubscribeUrl)

## Criteres d'acceptation

| # | Critere |
|---|---------|
| AC-155-1 | L'email soumis est enregistre dans `newsletter_subscribers` avec statut "active" |
| AC-155-2 | Un email invalide affiche une erreur sans insertion en DB |
| AC-155-3 | Un email deja inscrit ne cree pas de doublon (reponse gracieuse) |
| AC-155-4 | Un email de confirmation est envoye a l'inscrit |
| AC-155-5 | Un message de succes est affiche apres inscription |
| AC-155-6 | Un champ honeypot (hidden) bloque les bots basiques |

## Specs de tests

### Tests unitaires

| ID | Test | Fichier |
|----|------|---------|
| TU-155-1 | subscribeNewsletterAction avec email valide insere en DB | `tests/unit/actions/newsletter-actions.test.ts` |
| TU-155-2 | subscribeNewsletterAction avec email invalide retourne erreur | `tests/unit/actions/newsletter-actions.test.ts` |
| TU-155-3 | subscribeNewsletterAction avec email doublon retourne message gracieux | `tests/unit/actions/newsletter-actions.test.ts` |
| TU-155-4 | subscribeNewsletterAction avec honeypot rempli retourne succes silencieux | `tests/unit/actions/newsletter-actions.test.ts` |
| TU-155-5 | subscribeNewsletterAction appelle sendEmail avec le bon template | `tests/unit/actions/newsletter-actions.test.ts` |
| TU-155-6 | renderNewsletterWelcomeEmail genere HTML avec lien desabonnement | `tests/unit/lib/email-templates.test.ts` |

### Tests composants

| ID | Test | Fichier |
|----|------|---------|
| TC-155-1 | Le formulaire newsletter contient un champ honeypot hidden | `tests/unit/components/blog-content.test.tsx` |
| TC-155-2 | Le formulaire affiche un message de succes apres soumission | `tests/unit/components/blog-content.test.tsx` |

### Mapping AC → tests

| AC | Tests |
|----|-------|
| AC-155-1 | TU-155-1 |
| AC-155-2 | TU-155-2 |
| AC-155-3 | TU-155-3 |
| AC-155-4 | TU-155-5, TU-155-6 |
| AC-155-5 | TC-155-2 |
| AC-155-6 | TU-155-4, TC-155-1 |

### Donnees de test

- Mock `getDb()` avec table newsletter_subscribers
- Mock `sendEmail()` pour verifier l'appel sans envoyer
- FormData mock avec email valide/invalide/honeypot
