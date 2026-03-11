# Koupli

Application de gestion de finances personnelles et en couple. Suivez vos comptes bancaires, budgets, objectifs et dépenses partagées — avec un conseiller IA dédié à votre couple.

## Stack technique

- **Framework** : Next.js 16 (App Router, React 19)
- **Langage** : TypeScript (strict, 0 `any`)
- **Base de données** : Turso (LibSQL) — double DB (Main + Per-user)
- **Auth** : BetterAuth (email/password, OAuth Google/Apple, 2FA TOTP)
- **UI** : Tailwind CSS v4, shadcn/ui, Material Symbols Outlined, DM Sans + DM Serif Display
- **Charts** : Recharts
- **Emails** : Nodemailer
- **Sanitize** : sanitize-html (XSS protection blog)
- **Tests** : Vitest + Testing Library (1862+ tests)

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

### API Mobile
- API REST mobile complete (`/api/mobile/*`) avec auth JWT
- Proxy IA securise (cle API cote serveur uniquement)
- Endpoints CRUD comptes et transactions
- Endpoints 2FA (enable, verify, disable)
- Endpoints RGPD (export donnees, suppression 30j)
- Endpoints Stripe (checkout, portal)
- Endpoints settings et regles de categorisation
- Endpoint detection d'anomalies
- Rate limiting persistant par utilisateur (table Turso)
- CORS dynamique avec validation d'origine

### Securite
- Authentification email/mot de passe
- OAuth Google et Apple
- Authentification a deux facteurs (2FA TOTP)
- Codes de recuperation (generation crypto securisee)
- JWT mobile separe (`JWT_SECRET_MOBILE`) avec garde production
- Anti-enumeration sur forgot-password (reponse constante)
- Validation stricte des body de requetes
- Batch atomique pour operations 2FA multi-tables
- Filtres SQL pushes en base (pas de filtrage in-memory)
- Parametre `months` borne sur anomalies (1-24)

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

### Pages marketing
- Homepage restructuree UX : hero IA-first, 3 pilliers de valeur, pain points fusionnes, section IA showcase dediee, features, temoignages, how-it-works, trust bar, FAQ et CTA
- Page Fonctionnalites (mode couple, IA, import multi-formats)
- Page Tarifs avec toggle mensuel/annuel, comparatif detaille et FAQ accordion
- Blog dynamique (articles depuis Turso, categories, article a la une)
- Template article enrichi : image hero, bloc auteur, TOC sticky (desktop) / repliable (mobile), barre de progression de lecture, partage social (Twitter/LinkedIn/copier), reactions emoji (localStorage), articles lies par categorie, navigation prev/next, prose enrichi (blockquotes colorees, callouts info/warning/tip, code blocks, tables stylisees)
- Newsletter fonctionnelle (inscription, honeypot anti-bot, email de bienvenue)
- Desabonnement newsletter securise par HMAC-SHA256 (timingSafeEqual, page de confirmation)
- Page A propos (histoire, convictions, chiffres cles)
- Page Securite (6 engagements, philosophie)
- Pages auth (connexion, inscription) avec OAuth Google/Apple
- Design system : DM Serif Display (headings) + DM Sans (body), palette Indigo/Stone
- Animations scroll reveal (fade-up, hover-lift) et composants interactifs
- Theme light force sur les pages marketing (override CSS `.marketing-light` pour compatibilite dark mode iOS)

### Pages legales et conformite RGPD
- Mentions legales (/mentions-legales)
- Politique de confidentialite (/politique-confidentialite) — 10 sections RGPD, tableaux finalites et durees de conservation
- Conditions Generales d'Utilisation (/cgu) — 13 articles (objet, inscription, abonnements, IA, responsabilite, litiges)
- Politique de cookies (/cookies) — tableaux cookies necessaires, analytics, marketing
- Bandeau cookie RGPD avec vue simple et vue detaillee (toggles par categorie, persistance localStorage)
- Styles typographiques dedies `.legal-content` (h2/h3/p/ul/table/highlight-box)

### SEO et GEO (Generative Engine Optimization)
- 6 schemas JSON-LD : Organization, WebSite, SoftwareApplication, FAQPage, Article (author Person, speakable, keywords, image conditionnelle), BreadcrumbList
- Metadata enrichie sur toutes les pages (canonical, alternates 5 locales, OG images, Twitter cards)
- FAQ GEO optimisee : 7 questions homepage + 4 questions tarifs (impact IA search engines +40%)
- Robots.txt : GPTBot, PerplexityBot, ClaudeBot autorises pour citation par moteurs IA
- Sitemap complet : 55+ URLs avec priorites differenciees (11 paths × 5 locales)
- OG images : 6 placeholders PNG 1200×630 couleurs de marque
- BreadcrumbList sur toutes les pages marketing, legales et blog
- Infrastructure SEO modulaire (`src/lib/seo/` : constants, schemas, metadata)

### Internationalisation
- 5 langues supportees (fr, en, es, de, it)
- Routes localisees

## Commandes

```bash
npm run dev      # Serveur de developpement (http://localhost:3000)
npm run build    # Build production
npm run lint     # ESLint
npm test         # Tests Vitest
```

## Variables d'environnement

```env
# Base de donnees Turso
DATABASE_URL_TURSO=
API_KEY_TURSO=

# Auth mobile (JWT)
JWT_SECRET_MOBILE=

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

# IA (OpenRouter)
API_KEY_OPENROUTER=

# Email (Nodemailer)
SMTP_HOST=
SMTP_PORT=
SMTP_USER=
SMTP_PASS=

# Newsletter
NEWSLETTER_SECRET=           # Cle HMAC-SHA256 pour signer les liens de desabonnement
```

## Architecture

```
src/
  app/
    [locale]/(app)/     # Pages application protegees par auth (dashboard, comptes, transactions...)
    [locale]/(marketing)/  # Pages marketing + legales (accueil, fonctionnalites, tarifs, blog, a-propos, securite, mentions-legales, politique-confidentialite, cgu, cookies)
    [locale]/(auth)/    # Pages auth (connexion, inscription, two-factor)
    [locale]/offline/   # Page offline PWA (hors auth)
    api/                # API routes (auth, push, cron, stripe, reports)
      mobile/           # API REST mobile (auth JWT, 2FA, chat, CRUD, RGPD, settings)
      newsletter/       # API newsletter (desabonnement HMAC)
    actions/            # Server Actions (mutations, newsletter)
  components/           # Composants React (client components)
    marketing/          # Composants marketing (navbar, footer, scroll-reveal, cookie-banner)
    blog/               # Composants blog (reading-progress-bar, table-of-contents, share-buttons, article-reactions, article-body)
    charts/             # Graphiques Recharts (barres, camembert, timeline)
  lib/
    seo/                # Infrastructure SEO/GEO (constants, schemas JSON-LD, metadata builder)
    queries/            # 13 modules SQL domainaux + blog queries (barrel re-export)
    parsers/            # 18 parsers bancaires + registry
    email/              # Composants email partages (styles, helpers)
    blog-sanitize.ts    # Sanitize HTML articles (XSS protection, callout classes, heading ids)
    blog-html-utils.ts  # Injection IDs headings pour ancres TOC
    blog-db.ts          # Init tables blog (blog_posts, blog_categories, newsletter_subscribers)
    newsletter-utils.ts # HMAC-SHA256 URL signing pour desabonnement
    auth.ts             # Config BetterAuth (server, OAuth, 2FA TOTP)
    auth-client.ts      # Config BetterAuth (client, twoFactorClient)
    mobile-auth.ts      # Auth mobile (JWT sign/verify, CORS dynamique, helpers jsonOk/jsonError)
    mobile-2fa.ts       # 2FA mobile (TOTP, backup codes, temp tokens, batch atomique)
    rate-limiter.ts     # Rate limiting (in-memory sync + persistant Turso async)
    db.ts               # Connexion Turso + schema + migrations
    push-notifications.ts # Web Push API (VAPID, envoi, souscriptions)
    alert-service.ts    # Alertes solde bas (email + push)
    budget-alert-service.ts # Alertes budget (email + push)
  i18n/                 # Configuration next-intl (5 langues)
public/
  sw.js                 # Service Worker PWA (cache, offline, push events)
tests/
  unit/                 # Tests unitaires (213 fichiers, 1862 tests)
  integration/          # Tests d'integration mobile (4 suites, 33 tests)
```

## Historique des sprints

| Sprint | Theme | Stories | Tests |
|--------|-------|---------|-------|
| v15 | Refonte UI/UX Stitch | 12 | 1201 |
| v16 | Import Universel Bancaire | 6 | 1356 |
| v17 | Refactoring + Infra + Features | 11 | 1588 |
| v18 | Parite Web/Mobile | 11 | 1668 |
| v18.1 | Hardening securite API mobile | — | 1668 |
| v19 | Redesign marketing complet (DM Serif/Sans, 8 pages, animations) | — | 1668+ |
| v19.1 | Pages legales RGPD + bandeau cookie (4 pages, cookie banner) | — | 1669+ |
| v19.2 | Fix couleurs delavees iPhone iOS dark mode (marketing-light CSS scope) | — | 1669+ |
| v20 | Blog dynamique + Newsletter (CRUD admin, lecture Turso, page [slug] SEO, newsletter HMAC, dashboard admin) | 8 | 1789 |
| v20.1 | Fix build Vercel (generateStaticParams resilient, useSyncExternalStore cookie banner) | — | 1789 |
| v21 | SEO & GEO (JSON-LD 6 schemas, metadata enrichie, robots IA, sitemap 55+ URLs, FAQ GEO, OG images, BreadcrumbList) | 11 | 1849 |
| v21.1 | Blog article enrichi (hero image, auteur, TOC, progress bar, partage social, reactions, articles lies, nav prev/next, prose enrichi, SEO author/speakable) | — | 1862 |
| v22 | Rebrand Koupli + refonte homepage UX (IA-first hero, 3 pilliers valeur, IA showcase, pain points fusionnes) | — | 1862 |
