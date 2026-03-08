# Track My Cash

Application de gestion de finances personnelles et en couple. Suivez vos comptes bancaires, budgets, objectifs et dépenses partagées.

## Stack technique

- **Framework** : Next.js 16 (App Router, React 19)
- **Langage** : TypeScript (strict, 0 `any`)
- **Base de données** : Turso (LibSQL) — double DB (Main + Per-user)
- **Auth** : BetterAuth (email/password, OAuth Google/Apple, 2FA TOTP)
- **UI** : Tailwind CSS v4, shadcn/ui, Material Symbols Outlined
- **Charts** : Recharts
- **Emails** : Nodemailer
- **Tests** : Vitest + Testing Library (1588 tests)

## Fonctionnalites

### Gestion financiere
- Multi-comptes bancaires avec calcul de solde date-aware
- Import de releves bancaires (18 parsers : BNP, SG, CA, Revolut, N26, CAMT.053, MT940, OFX, CFONB 120, CSV generique...)
- Detection automatique de doublons via `import_hash`
- Transactions avec categories, sous-categories et tags
- Paiements recurrents avec detection IA de suggestions

### Budgets et objectifs
- Budgets par categorie avec alertes (80% et 100%)
- Objectifs d'epargne avec suivi de progression
- Previsions financieres detaillees

### Couple
- Espace couple avec invitation par code
- Depenses partagees (50/50, proportionnel, personnalise)
- Dashboard couple enrichi
- Categories et budgets partages

### Visualisation
- Graphique barres revenus vs depenses (6 mois)
- Camembert repartition par categorie (regroupement < 5% en "Autres")
- Timeline recurrents (3 mois)

### Securite
- Authentification email/mot de passe
- OAuth Google et Apple
- Authentification a deux facteurs (2FA TOTP)
- Codes de recuperation

### PWA et notifications
- Service Worker avec cache offline (Cache-First assets, Network-First navigation)
- Page offline dediee
- Notifications push (Web Push API) pour alertes solde bas et budgets depasses
- Mise a jour automatique du Service Worker

### Rapports et exports
- Export PDF mensuel
- Rapport annuel IA
- Email hebdomadaire de synthese
- Export de donnees complet

### Internationalisation
- 5 langues supportees (fr, en, es, de, it)
- Routes localisees

## Commandes

```bash
npm run dev      # Serveur de developpement (http://localhost:3000)
npm run build    # Build production
npm run lint     # ESLint
npm test         # Tests Vitest (1588 tests)
```

## Variables d'environnement

```env
# Base de donnees Turso
DATABASE_URL_TURSO=
API_KEY_TURSO=

# Auth (BetterAuth)
BETTER_AUTH_SECRET=
BETTER_AUTH_URL=
NEXT_PUBLIC_APP_URL=

# OAuth
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
APPLE_CLIENT_ID=
APPLE_CLIENT_SECRET=

# Push Notifications
VAPID_PUBLIC_KEY=
VAPID_PRIVATE_KEY=
VAPID_EMAIL=

# Stripe
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=

# Email (Nodemailer)
SMTP_HOST=
SMTP_PORT=
SMTP_USER=
SMTP_PASS=
```

## Architecture

```
src/
  app/
    [locale]/(app)/     # Pages application protegees par auth (dashboard, comptes, transactions...)
    [locale]/(auth)/    # Pages auth (connexion, inscription, two-factor)
    [locale]/offline/   # Page offline PWA (hors auth)
    api/                # API routes (auth, push, cron, stripe, reports)
    actions/            # Server Actions (mutations)
  components/           # Composants React (client components)
    charts/             # Graphiques Recharts (barres, camembert, timeline)
  lib/
    queries/            # 13 modules SQL domainaux (barrel re-export)
    parsers/            # 18 parsers bancaires + registry
    email/              # Composants email partages (styles, helpers)
    auth.ts             # Config BetterAuth (server, OAuth, 2FA TOTP)
    auth-client.ts      # Config BetterAuth (client, twoFactorClient)
    db.ts               # Connexion Turso + schema + migrations
    push-notifications.ts # Web Push API (VAPID, envoi, souscriptions)
    alert-service.ts    # Alertes solde bas (email + push)
    budget-alert-service.ts # Alertes budget (email + push)
  i18n/                 # Configuration next-intl (5 langues)
public/
  sw.js                 # Service Worker PWA (cache, offline, push events)
tests/
  unit/                 # 182 fichiers de tests (1588 tests)
```

## Historique des sprints

| Sprint | Theme | Stories | Tests |
|--------|-------|---------|-------|
| v15 | Refonte UI/UX Stitch | 12 | 1201 |
| v16 | Import Universel Bancaire | 6 | 1356 |
| v17 | Refactoring + Infra + Features | 11 | 1588 |
