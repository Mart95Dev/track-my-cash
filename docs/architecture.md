# Architecture Technique — TrackMyCash (Web + Mobile)

**Version :** 1.0
**Date :** 2026-03-10
**Auteur :** FORGE Architect Agent
**Statut :** VALIDÉ

---

## 1. Vue d'ensemble du système

```
┌─────────────────────────────────────────────────────────────────┐
│                        CLIENTS                                  │
│                                                                 │
│  ┌──────────────────┐     ┌──────────────────────────────┐     │
│  │   App Web (PWA)  │     │   App Mobile (Android)       │     │
│  │   Next.js 16     │     │   React Native / Expo 55     │     │
│  │   React 19       │     │   NativeWind v4              │     │
│  │   Tailwind v4    │     │   Zustand + TanStack Query   │     │
│  │   shadcn/ui      │     │   expo-secure-store          │     │
│  └───────┬──────────┘     └──────────────┬───────────────┘     │
│          │                                │                     │
│          │ Server Actions                 │ REST API (JWT)      │
│          │ (direct)                       │ /api/mobile/*       │
│          │                                │                     │
└──────────┼────────────────────────────────┼─────────────────────┘
           │                                │
           ▼                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                     BACKEND (Next.js 16)                        │
│                                                                 │
│  ┌───────────────┐  ┌─────────────────┐  ┌─────────────────┐  │
│  │ Server Actions│  │ API Mobile      │  │ API Partagée    │  │
│  │ /app/actions/ │  │ /api/mobile/*   │  │ /api/chat       │  │
│  │ (web only)    │  │ JWT auth        │  │ /api/stripe     │  │
│  │               │  │ CORS enabled    │  │ /api/cron       │  │
│  └───────┬───────┘  └───────┬─────────┘  └───────┬─────────┘  │
│          │                  │                     │             │
│          ▼                  ▼                     ▼             │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │              Couche Métier (src/lib/)                    │   │
│  │  queries/* │ parsers/* │ ai-* │ email-* │ stripe-*      │   │
│  └────────────────────────┬────────────────────────────────┘   │
│                           │                                     │
│  ┌────────────────────────┼────────────────────────────────┐   │
│  │                   DONNÉES                                │   │
│  │                                                          │   │
│  │  ┌─────────────┐    ┌──────────────────────────┐        │   │
│  │  │  Main DB    │    │  Per-User DB (×N)        │        │   │
│  │  │  (Turso)    │    │  (Turso shard par user)  │        │   │
│  │  │             │    │                          │        │   │
│  │  │ • user      │    │ • accounts               │        │   │
│  │  │ • session   │    │ • transactions            │        │   │
│  │  │ • twoFactor │    │ • budgets / goals         │        │   │
│  │  │ • subscript.│    │ • recurring_payments      │        │   │
│  │  │ • couples   │    │ • notifications           │        │   │
│  │  │ • admin_logs│    │ • tags / settings         │        │   │
│  │  └─────────────┘    └──────────────────────────┘        │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                 │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │             SERVICES EXTERNES                              │  │
│  │  Stripe │ OpenRouter (IA) │ Nodemailer │ Web Push          │  │
│  └───────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

---

## 2. Stack Technique

### 2.1 Backend (partagé web + mobile)

| Composant | Choix | Justification |
|-----------|-------|---------------|
| **Framework** | Next.js 16 (App Router) | SSR, Server Actions, API routes, déploiement Vercel |
| **Runtime** | Node.js (Vercel) | Écosystème npm, compatibilité Turso |
| **Base de données** | Turso (libSQL/SQLite distribué) | Multi-tenant par user, latence faible, coût minimal |
| **ORM** | Kysely + @libsql/client | Type-safe, léger, compatible libSQL |
| **Auth** | Better-Auth | Email/password, OAuth (Google/Apple), 2FA TOTP |
| **Auth mobile** | JWT custom (JOSE, HS256, 30j) | Stateless, compatible expo-secure-store |
| **Paiements** | Stripe (subscriptions) | Standard SaaS, webhooks, portail client |
| **IA** | OpenRouter via Vercel AI SDK | Multi-modèles (GPT-4o-mini, Claude, Gemini, LLaMA) |
| **Email** | Nodemailer (SMTP Hostinger) | Simple, fiable, templates HTML custom |
| **Push** | web-push (VAPID) | Standard Web Push API, expo-notifications mobile |
| **i18n** | next-intl (5 langues) | FR, EN, ES, IT, DE |
| **Déploiement** | Vercel | Edge functions, cron jobs, preview deploys |

### 2.2 Frontend Web

| Composant | Choix | Justification |
|-----------|-------|---------------|
| **Framework** | React 19 + Next.js 16 | Server Components, streaming, ISR |
| **UI** | shadcn/ui + Radix UI | Accessible, composable, headless |
| **Styling** | Tailwind CSS v4 (`@theme inline`) | Utility-first, design tokens CSS |
| **Charts** | Recharts 3 | React-native, responsive, animations |
| **Icônes** | Material Symbols Outlined + Lucide | Cohérence design system |
| **PWA** | Service Worker vanilla | Cache-first assets, network-first API |

### 2.3 Frontend Mobile (Android)

| Composant | Choix | Justification |
|-----------|-------|---------------|
| **Framework** | React Native 0.83 + Expo 55 | Cross-platform, hot reload, OTA updates |
| **Navigation** | Expo Router (file-based) | Cohérence avec Next.js App Router |
| **Styling** | NativeWind v4 (Tailwind) | Classes identiques au web |
| **State (local)** | Zustand | Léger, pas de boilerplate |
| **State (server)** | TanStack Query 5 | Cache, invalidation, optimistic updates |
| **Auth storage** | expo-secure-store | Enclave sécurisée (Keychain/Keystore) |
| **i18n** | i18next + react-i18next | Même fichiers de traduction que le web |

### 2.4 Design System

| Token | Valeur | Usage |
|-------|--------|-------|
| **primary** | `#4848e5` | Actions principales, liens, focus |
| **couple-pink** | `#EC4899` | Mode couple |
| **background** | `#f6f6f8` (light) / `#111121` (dark) | Fond de page |
| **card** | `#ffffff` (light) / `#1a1a2e` (dark) | Surface cartes |
| **text** | `#0e0e1b` (light) / `#f0f0f5` (dark) | Texte principal |
| **muted** | `#505095` | Texte secondaire |
| **success** | `#078841` | Revenus, validation |
| **warning** | `#e7a008` | Alertes budget |
| **danger** | `#e74008` | Dépenses, erreurs |
| **font** | Manrope (300-800) | Typographie principale |
| **radius** | 0.5 / 1 / 1.5 / 2 rem | Coins arrondis |

---

## 3. Architecture d'authentification

### 3.1 Problème actuel : double système d'auth

Actuellement, **deux systèmes d'auth coexistent** de manière incohérente :

```
Web  → Better-Auth (cookies/session) → /api/auth/*
Mobile → auth-client.ts appelle /api/auth/sign-in/email (Better-Auth direct)
         MAIS aussi /api/mobile/auth/login (wrapper JWT)
         MAIS aussi /api/mobile/auth/oauth (JWT custom)
```

**Problèmes identifiés :**

1. **Le mobile appelle parfois Better-Auth directement** (`/api/auth/sign-in/email`) sans passer par les routes `/api/mobile/auth/*`. Cela retourne un cookie de session inutile pour le mobile au lieu d'un JWT.

2. **Double auth flow** : Les routes `/api/mobile/auth/login` et `/api/mobile/auth/register` appellent Better-Auth en interne puis signent un JWT. Le mobile devrait UNIQUEMENT utiliser ces routes.

3. **OAuth mobile** : Route `/api/mobile/auth/oauth` existe mais le mobile fait aussi des appels directs à OpenRouter avec la clé API exposée côté client.

4. **2FA TOTP** : Implémenté côté web (Better-Auth twoFactor), absent côté mobile.

### 3.2 Architecture cible

```
┌──────────────────────────────────────────────────────────┐
│                   AUTH FLOWS                              │
│                                                          │
│  WEB                          MOBILE                     │
│  ┌─────────────────┐         ┌─────────────────────┐    │
│  │ Better-Auth     │         │ JWT Auth             │    │
│  │ (cookies)       │         │ (Bearer token)       │    │
│  │                 │         │                      │    │
│  │ /api/auth/*     │         │ /api/mobile/auth/*   │    │
│  │ Session-based   │         │ Stateless JWT        │    │
│  └────────┬────────┘         └──────────┬───────────┘   │
│           │                              │               │
│           ▼                              ▼               │
│  ┌──────────────────────────────────────────────────┐   │
│  │           Better-Auth (serveur)                   │   │
│  │  • Email/Password                                 │   │
│  │  • OAuth Google (socialProviders)                 │   │
│  │  • OAuth Apple (socialProviders)                  │   │
│  │  • 2FA TOTP (twoFactor plugin)                   │   │
│  └──────────────────────────────────────────────────┘   │
│                          │                               │
│                          ▼                               │
│                    Main DB (Turso)                        │
│                    user, session, twoFactor               │
└──────────────────────────────────────────────────────────┘
```

**Règle absolue :** Le mobile ne doit JAMAIS appeler `/api/auth/*` directement. Seules les routes `/api/mobile/auth/*` sont autorisées. Ces routes encapsulent Better-Auth côté serveur et retournent un JWT.

### 3.3 Endpoints d'auth — contrat API

| Endpoint | Méthode | Body | Réponse | Notes |
|----------|---------|------|---------|-------|
| `/api/mobile/auth/register` | POST | `{ email, password, name }` | `{ user, token, isNewUser }` | Crée user + trial + email welcome |
| `/api/mobile/auth/login` | POST | `{ email, password }` | `{ user, token }` | Vérifie via Better-Auth interne |
| `/api/mobile/auth/oauth` | POST | `{ provider, idToken }` | `{ user, token, isNewUser }` | Google/Apple via Better-Auth |
| `/api/mobile/auth/forgot` | POST | `{ email }` | `{ success: true }` | Email reset via Better-Auth |
| `/api/mobile/auth/2fa/verify` | POST | `{ code }` | `{ user, token }` | **MANQUANT — à créer** |

### 3.4 Actions correctives requises

| # | Action | Priorité | Détail |
|---|--------|----------|--------|
| 1 | **Mobile : utiliser uniquement `/api/mobile/auth/*`** | CRITIQUE | `auth-client.ts` mobile appelle actuellement `/api/auth/sign-in/email` (Better-Auth direct). Doit appeler `/api/mobile/auth/login` qui retourne un JWT |
| 2 | **Créer `/api/mobile/auth/2fa/verify`** | HAUTE | Route qui accepte le code TOTP et retourne le JWT final si valide |
| 3 | **Supprimer la clé OpenRouter côté mobile** | CRITIQUE | `EXPO_PUBLIC_OPENROUTER_API_KEY` est dans le bundle. L'IA doit passer par `/api/chat` ou une route `/api/mobile/chat` dédiée |
| 4 | **Créer `/api/mobile/chat`** | HAUTE | Proxy sécurisé pour l'IA, identique à `/api/chat` mais avec auth JWT |

---

## 4. Contrat API Mobile — Endpoints complets

### 4.1 Endpoints existants et validés

| Domaine | Endpoints | Méthodes | Status |
|---------|-----------|----------|--------|
| **Auth** | `/api/mobile/auth/{login,register,oauth,forgot}` | POST | OK (sauf 2FA) |
| **Accounts** | `/api/mobile/accounts`, `/api/mobile/accounts/[id]`, `.../[id]/reconcile` | GET, POST, PUT, DELETE | OK |
| **Transactions** | `/api/mobile/transactions`, `.../[id]`, `.../bulk` | GET, POST, PUT, DELETE | OK |
| **Budgets** | `/api/mobile/budgets`, `.../[id]` | GET, POST, PUT, DELETE | OK |
| **Goals** | `/api/mobile/goals`, `.../[id]` | GET, POST, PUT, DELETE | OK |
| **Recurring** | `/api/mobile/recurring`, `.../[id]` | GET, POST, PUT, DELETE | OK |
| **Tags** | `/api/mobile/tags`, `.../[id]` | GET, POST, PUT, DELETE | OK |
| **Dashboard** | `/api/mobile/dashboard` | GET | OK |
| **Forecasts** | `/api/mobile/forecasts?months=N` | GET | OK |
| **Balance History** | `/api/mobile/balance-history?days=N` | GET | OK |
| **Health Score** | `/api/mobile/health-score` | GET | OK |
| **Notifications** | `/api/mobile/notifications`, `.../read/[id]` | GET, PUT | OK |
| **Couple** | `/api/mobile/couple`, `.../create`, `.../join`, `.../leave` | GET, POST | OK |
| **Subscription** | `/api/mobile/subscription` | GET | OK |
| **Import** | `/api/mobile/import`, `.../confirm` | POST | OK |
| **Emails** | `/api/mobile/emails/{welcome,weekly-recap,budget-alert}` | POST | OK |

### 4.2 Endpoints manquants à créer

| Endpoint | Méthode | Justification |
|----------|---------|---------------|
| `/api/mobile/auth/2fa/verify` | POST | Supporter le 2FA TOTP sur mobile |
| `/api/mobile/auth/2fa/enable` | POST | Activer le 2FA depuis les paramètres mobile |
| `/api/mobile/auth/2fa/disable` | POST | Désactiver le 2FA |
| `/api/mobile/chat` | POST | Proxy IA sécurisé (remplace l'appel direct OpenRouter) |
| `/api/mobile/subscription/checkout` | POST | Créer session Stripe checkout |
| `/api/mobile/subscription/portal-url` | GET | URL du portail Stripe |
| `/api/mobile/user/export` | GET | Export données RGPD |
| `/api/mobile/user/delete` | DELETE | Suppression compte RGPD |
| `/api/mobile/settings` | GET, PUT | Lire/modifier les paramètres utilisateur |
| `/api/mobile/categorization-rules` | GET, POST, DELETE | Règles d'auto-catégorisation |

---

## 5. Matrice de parité fonctionnelle Web ↔ Mobile

### 5.1 Fonctionnalités en parité (OK)

| Fonctionnalité | Web | Mobile | Parité |
|----------------|-----|--------|--------|
| Comptes bancaires (CRUD) | Server Actions | REST API | OK |
| Transactions (CRUD + filtres + recherche) | Server Actions | REST API | OK |
| Import bancaire (18 formats) | Server Actions | REST API (parsing serveur) | OK |
| Budgets (CRUD + alertes) | Server Actions | REST API | OK |
| Objectifs d'épargne | Server Actions | REST API | OK |
| Paiements récurrents | Server Actions | REST API | OK |
| Tags de transactions | Server Actions | REST API | OK |
| Dashboard KPIs | Server Actions | REST API | OK |
| Prévisions (3/6/12/24 mois) | Server Actions | REST API | OK |
| Score de santé financière | Server Actions | REST API | OK |
| Mode couple | Server Actions | REST API | OK |
| Notifications in-app | Server Actions | REST API | OK |
| Abonnement Stripe | Stripe checkout | WebView externe | OK |
| i18n (5 langues) | next-intl | i18next | OK |
| Dark mode | next-themes | NativeWind | OK |

### 5.2 Écarts à corriger

| Fonctionnalité | Web | Mobile | Action requise |
|----------------|-----|--------|----------------|
| **Auth email/password** | Better-Auth (session) | Appelle `/api/auth/*` directement | **CORRIGER** : mobile doit utiliser `/api/mobile/auth/login` |
| **2FA TOTP** | Better-Auth twoFactor | Non implémenté | **AJOUTER** : routes `/api/mobile/auth/2fa/*` + écrans mobile |
| **Conseiller IA** | `/api/chat` (clé serveur) | Appel OpenRouter direct (clé client) | **CORRIGER** : créer `/api/mobile/chat` + supprimer clé client |
| **Auto-catégorisation IA** | Server Action | Appel OpenRouter direct | **CORRIGER** : créer endpoint ou réutiliser `/api/mobile/chat` |
| **Export données (RGPD)** | Server Action | Non implémenté backend | **AJOUTER** : `/api/mobile/user/export` |
| **Suppression compte (RGPD)** | Server Action | Non implémenté backend | **AJOUTER** : `/api/mobile/user/delete` |
| **Paramètres utilisateur** | Server Action | Pas d'endpoint dédié | **AJOUTER** : `/api/mobile/settings` |
| **Règles de catégorisation** | Server Action | Local state uniquement | **AJOUTER** : `/api/mobile/categorization-rules` |
| **Rapports PDF** | jsPDF serveur | expo-print (basique) | ACCEPTABLE (différence plateforme) |
| **Détection anomalies** | anomaly-detector.ts | Appel local | **AJOUTER** : `/api/mobile/anomalies` |
| **Rapport annuel** | annual-report.ts | Appel OpenRouter direct | **CORRIGER** : passer par API serveur |
| **Suggestions budget** | budget-suggester.ts | Appel OpenRouter direct | **CORRIGER** : passer par API serveur |
| **Pages marketing** | / /fonctionnalites /tarifs /blog | Absentes | NORMAL (pas pertinent mobile) |
| **PWA / Service Worker** | SW vanilla | N/A (natif) | NORMAL (différence plateforme) |

### 5.3 Risques de sécurité identifiés

| Risque | Sévérité | Détail | Correction |
|--------|----------|--------|------------|
| **Clé OpenRouter exposée** | CRITIQUE | `EXPO_PUBLIC_OPENROUTER_API_KEY` dans le bundle mobile Android. Extractible par décompilation APK. | Supprimer la variable, passer par `/api/mobile/chat` |
| **Auth directe Better-Auth** | HAUTE | Le mobile appelle `/api/auth/sign-in/email` qui retourne un cookie (inutile mobile). Le JWT n'est pas généré dans ce flux. | Utiliser uniquement `/api/mobile/auth/login` |
| **CORS `*`** | MOYENNE | `Access-Control-Allow-Origin: *` sur toutes les routes mobile. Acceptable pour app mobile, mais risque si des données sensibles sont exposées. | Restreindre aux origines connues en production |

---

## 6. Architecture des données

### 6.1 Main DB (Turso — partagée)

```sql
-- Better-Auth (géré automatiquement)
user (id, name, email, emailVerified, image, createdAt, updatedAt,
      onboarding_choice, onboarding_completed_at,
      reminder_couple_1d_sent, reminder_couple_3d_sent, reminder_couple_7d_sent)
session (id, expiresAt, token, createdAt, updatedAt, ipAddress, userAgent, userId)
account (id, accountId, providerId, userId, ...)  -- OAuth accounts
verification (id, identifier, value, expiresAt, ...)
twoFactor (id, secret, backupCodes, userId)

-- Custom
users_databases (user_id PK, db_hostname, created_at)
subscriptions (id PK, user_id UNIQUE, stripe_customer_id, stripe_subscription_id,
               plan_id, status, current_period_end, cancel_at_period_end,
               trial_ends_at, suspended, reminder_3d_sent, reminder_1d_sent, created_at)
couples (id PK, invite_code UNIQUE, name, created_by, created_at)
couple_members (id PK, couple_id, user_id, role, status, joined_at)
couple_balances (id PK, couple_id, user_id, period_month, total_paid, computed_at)
user_platforms (user_id+platform PK, app_version, last_seen_at, first_seen_at)
push_subscriptions (user_id PK, endpoint, keys_p256dh, keys_auth, created_at)
admin_logs (id PK, type, user_id, message, payload, created_at)
deletion_requests (user_id PK, requested_at, scheduled_delete_at, reason, notified_at)
ai_usage (user_id+month PK, count)
```

### 6.2 Per-User DB (Turso shard — une par utilisateur)

```sql
accounts (id PK, name, initial_balance, balance_date, currency,
          alert_threshold, statement_balance, statement_date,
          last_alert_sent_at, visibility, created_at)
transactions (id PK, account_id FK, type, amount, date, category, subcategory,
              description, import_hash, note, reconciled,
              is_couple_shared, paid_by, split_type, created_at)
recurring_payments (id PK, account_id FK, name, type, amount, frequency,
                    next_date, end_date, category, subcategory, created_at)
budgets (id PK, account_id FK, category, amount_limit, period,
         last_budget_alert_at, last_budget_alert_type,
         scope, couple_id, created_at)
goals (id PK, name, target_amount, current_amount, currency, deadline,
       account_id FK, monthly_contribution, scope, couple_id, created_at)
tags (id PK, name UNIQUE, color)
transaction_tags (transaction_id+tag_id PK)
notifications (id PK, type, title, message, read, created_at)
categorization_rules (id PK, pattern, category, priority, created_at)
budget_history (id PK, account_id, category, period, limit_amount, spent_amount, month, created_at)
settings (key PK, value)
```

### 6.3 Stratégie multi-tenant

```
Nouvel utilisateur → createTrialSubscription() → getUserDb(userId)
  → turso-manager.ts crée un nouveau DB Turso (API Turso Platform)
  → enregistre le hostname dans users_databases (Main DB)
  → initUserSchema() crée les tables dans la per-user DB
```

**Avantage :** Isolation complète des données financières. Suppression RGPD = drop la DB entière.

---

## 7. Flux applicatifs critiques

### 7.1 Inscription (web + mobile identique)

```
1. User saisit email + password + nom
2. Web  → Server Action → Better-Auth sign-up → session cookie → redirect /bienvenue
   Mobile → POST /api/mobile/auth/register → Better-Auth sign-up (interne) → JWT → SecureStore
3. Side-effects (fire-and-forget) :
   - createTrialSubscription() → 14 jours trial
   - sendEmail() → email de bienvenue
   - writeAdminLog() → "trial_started"
   - upsertUserPlatform() → track plateforme
4. Onboarding wizard (choix solo/couple)
```

### 7.2 Connexion avec 2FA

```
1. User saisit email + password
2. Backend vérifie credentials via Better-Auth
3. SI 2FA activé :
   Web    → redirect /two-factor → saisie code TOTP → session validée
   Mobile → réponse { requires2FA: true } → écran 2FA → POST /api/mobile/auth/2fa/verify
4. JWT/session retourné
```

### 7.3 Import bancaire

```
1. User sélectionne un fichier (web: input file, mobile: expo-document-picker)
2. Upload vers le serveur (web: Server Action, mobile: POST /api/mobile/import)
3. Serveur détecte le format (registry.ts → 18 parsers)
4. Retourne preview : { transactions[], detectedParser, duplicates, newCount }
5. User confirme → (web: Server Action, mobile: POST /api/mobile/import/confirm)
6. Transactions insérées avec import_hash (déduplication)
7. Side-effects : checkAndSendLowBalanceAlert(), anomaly detection
```

### 7.4 Conseiller IA (architecture cible)

```
                    Web                          Mobile
                     │                              │
                     ▼                              ▼
              POST /api/chat              POST /api/mobile/chat
              (session auth)              (JWT auth)
                     │                              │
                     └──────────┬───────────────────┘
                                │
                                ▼
                    ┌───────────────────────┐
                    │  Logique IA partagée  │
                    │  • buildFinancialCtx  │
                    │  • rate limiter       │
                    │  • canUseAI() guard   │
                    │  • tool calling       │
                    │  • consensus mode     │
                    └───────────┬───────────┘
                                │
                                ▼
                    ┌───────────────────────┐
                    │    OpenRouter API     │
                    │  (clé API serveur)    │
                    │  JAMAIS côté client   │
                    └───────────────────────┘
```

---

## 8. Plans et limites (Stripe)

| Fonctionnalité | Free | Pro (4,90€/mois) | Premium (7,90€/mois) |
|----------------|------|-------------------|----------------------|
| Comptes | 2 | 5 | Illimité |
| Import CSV | Oui | Oui | Oui |
| Import XLSX/PDF/OFX | Non | Oui | Oui |
| Budgets | Non | Oui | Oui |
| Objectifs | Non | Oui | Oui |
| Conseiller IA | Non | 10 req/mois | Illimité |
| Mode consensus IA | Non | Non | Oui |
| Mode couple | Non | Non | Oui |
| Export CSV | Oui | Oui | Oui |
| Rapport PDF | Non | Oui | Oui |
| Support prioritaire | Non | Non | Oui |

---

## 9. Services externes et cron jobs

### 9.1 Cron jobs (Vercel)

| Route | Fréquence | Fonction |
|-------|-----------|----------|
| `/api/cron/check-trials` | Quotidien | Expirer les trials > 14 jours |
| `/api/cron/trial-reminders` | Quotidien | Emails rappel trial J-7, J-3, J-1 |
| `/api/cron/couple-reminders` | Quotidien | Rappels couple setup J+1, J+3, J+7 |
| `/api/cron/weekly-summary` | Lundi 8h | Email récap hebdomadaire |
| `/api/cron/monthly-contributions` | 1er du mois 6h | Mise à jour contributions objectifs |
| `/api/cron/deletion-reminder` | Quotidien | Rappel suppression J+25 |
| `/api/cron/delete-accounts` | Quotidien | Suppression RGPD J+30 |

### 9.2 Services emails

| Template | Déclencheur | Contenu |
|----------|-------------|---------|
| Welcome | Inscription | Bienvenue + guide démarrage |
| Low Balance Alert | Transaction → solde < seuil | Alerte solde bas |
| Budget Alert | Transaction → budget ≥ 80% | Alerte budget (warning/exceeded) |
| Weekly Recap | Cron lundi | Résumé semaine (revenus/dépenses) |
| Monthly Summary | Cron mensuel | Récap mensuel détaillé |
| Trial Reminder | Cron quotidien | Rappels fin de trial |
| Couple Reminder | Cron quotidien | Rappels setup couple |
| Deletion Reminder | Cron quotidien | Rappel suppression planifiée |

---

## 10. Patterns architecturaux

### 10.1 Fire-and-forget

Les side-effects non-critiques (emails, logs, alertes) ne bloquent jamais l'action principale :

```typescript
// Pattern établi dans tout le projet
sendEmail({...}).catch(() => {});
writeAdminLog(db, "type", userId, "msg", {}).catch(() => {});
checkAndSendLowBalanceAlert(db, userId, accountId).catch(() => {});
```

### 10.2 Server Actions (web) vs REST API (mobile)

La même logique métier (`src/lib/queries/*`, `src/lib/*.ts`) est consommée par :
- **Web** : Server Actions dans `src/app/actions/` (accès direct, revalidatePath)
- **Mobile** : API routes dans `src/app/api/mobile/` (REST, JWT, CORS)

### 10.3 Multi-tenant par-user DB

```
getUserDb(userId) → turso-manager.ts
  1. Check cache Map<userId, Client>
  2. Si absent : SELECT db_hostname FROM users_databases
  3. Si absent : createDatabase() via Turso Platform API
  4. initUserSchema(client) → CREATE TABLE IF NOT EXISTS...
  5. Return client (cached)
```

### 10.4 Calcul de solde date-aware

```
solde_actuel = initial_balance + SUM(amount * CASE type WHEN 'income' THEN 1 ELSE -1 END)
               WHERE date >= balance_date
```

Jamais d'écriture directe du solde. Le solde est toujours calculé dynamiquement.

### 10.5 Déduplication import (import_hash)

```
import_hash = MD5(date + description + amount)
→ UNIQUE constraint → INSERT OR IGNORE
→ Retourne { new: N, duplicates: M } dans le preview
```

---

## 11. Plan d'action pour la parité

### Phase 1 — Corrections critiques de sécurité (URGENT)

1. **Supprimer `EXPO_PUBLIC_OPENROUTER_API_KEY`** du projet mobile
2. **Créer `/api/mobile/chat`** — proxy IA avec auth JWT (réutilise la logique de `/api/chat`)
3. **Corriger `auth-client.ts` mobile** — utiliser `/api/mobile/auth/login` au lieu de `/api/auth/sign-in/email`

### Phase 2 — Auth parité

4. **Créer `/api/mobile/auth/2fa/verify`** — vérification TOTP pour le flow mobile
5. **Créer `/api/mobile/auth/2fa/enable`** — activation 2FA depuis l'app mobile
6. **Créer `/api/mobile/auth/2fa/disable`** — désactivation 2FA
7. **Ajouter l'écran 2FA** dans l'app mobile

### Phase 3 — Endpoints manquants

8. **`/api/mobile/subscription/checkout`** — session Stripe checkout
9. **`/api/mobile/subscription/portal-url`** — URL portail Stripe
10. **`/api/mobile/user/export`** — export RGPD
11. **`/api/mobile/user/delete`** — suppression compte RGPD
12. **`/api/mobile/settings`** — CRUD paramètres
13. **`/api/mobile/categorization-rules`** — CRUD règles auto-catégorisation
14. **`/api/mobile/anomalies`** — détection anomalies

### Phase 4 — Écrans mobile manquants

15. Écran 2FA setup/verify
16. Écran paramètres complet (settings, règles catégorisation)
17. Refactorer le conseiller IA pour passer par `/api/mobile/chat`
18. Refactorer auto-catégorisation pour passer par le serveur
19. Refactorer suggestions budget pour passer par le serveur

---

## 12. Infrastructure et déploiement

```
┌─────────────────────────────────────────────────┐
│  Vercel (Production)                             │
│  ├── Next.js 16 (Serverless Functions)          │
│  ├── Edge Runtime (middleware)                   │
│  ├── Cron Jobs (7 routes)                       │
│  └── Preview Deploys (PR)                       │
├─────────────────────────────────────────────────┤
│  Turso (Database)                                │
│  ├── Main DB (1 instance)                       │
│  └── Per-User DBs (N instances, 1 par user)     │
├─────────────────────────────────────────────────┤
│  Services externes                               │
│  ├── Stripe (paiements)                         │
│  ├── OpenRouter (IA multi-modèles)              │
│  ├── Hostinger SMTP (emails)                    │
│  └── Web Push VAPID (notifications)             │
├─────────────────────────────────────────────────┤
│  Mobile (Android)                                │
│  ├── EAS Build (Expo Application Services)      │
│  ├── Google Play Store                          │
│  └── Firebase Crashlytics                       │
└─────────────────────────────────────────────────┘
```

### Variables d'environnement

| Variable | Service | Où |
|----------|---------|-----|
| `DATABASE_URL_TURSO` | Turso Main DB | Vercel |
| `API_KEY_TURSO` | Turso auth | Vercel |
| `TURSO_PLATFORM_API_TOKEN` | Turso Platform API | Vercel |
| `TURSO_ORG_NAME` | Turso org | Vercel |
| `BETTER_AUTH_SECRET` | Better-Auth + JWT mobile | Vercel |
| `BETTER_AUTH_URL` | Better-Auth callback | Vercel |
| `API_KEY_OPENROUTER` | OpenRouter IA | Vercel (JAMAIS client) |
| `GOOGLE_CLIENT_ID` | OAuth Google | Vercel |
| `GOOGLE_CLIENT_SECRET` | OAuth Google | Vercel |
| `APPLE_CLIENT_ID` | OAuth Apple | Vercel |
| `APPLE_CLIENT_SECRET` | OAuth Apple | Vercel |
| `STRIPE_SECRET_KEY` | Stripe | Vercel |
| `STRIPE_WEBHOOK_SECRET` | Stripe webhook | Vercel |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Stripe (client) | Vercel |
| `VAPID_PUBLIC_KEY` | Web Push | Vercel |
| `VAPID_PRIVATE_KEY` | Web Push | Vercel |
| `VAPID_EMAIL` | Web Push | Vercel |
| `EMAIL_HOST` | SMTP | Vercel |
| `EMAIL_PORT` | SMTP | Vercel |
| `EMAIL_USER` | SMTP | Vercel |
| `EMAIL_PASS` | SMTP | Vercel |
| `EXPO_PUBLIC_API_URL` | Backend URL | Mobile (.env) |
| `EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Stripe | Mobile (.env) |

---

## 13. Glossaire

| Terme | Définition |
|-------|------------|
| **Main DB** | Base de données Turso partagée (auth, subscriptions, couples, admin) |
| **Per-User DB** | Base de données Turso dédiée par utilisateur (données financières) |
| **Server Action** | Fonction serveur Next.js appelée directement depuis le client web (pas de REST) |
| **JWT mobile** | JSON Web Token HS256, signé avec BETTER_AUTH_SECRET, validité 30 jours |
| **Fire-and-forget** | Pattern : lancer une opération async sans attendre le résultat |
| **Import hash** | MD5(date+description+montant) pour dédupliquer les imports bancaires |
| **Better-Auth** | Librairie auth auto-hébergée (pas de vendor lock-in) |
| **Turso** | SQLite distribué en edge (compatible libSQL) |
| **OpenRouter** | API proxy multi-modèles LLM (GPT, Claude, Gemini, LLaMA) |
| **VAPID** | Voluntary Application Server Identification pour Web Push |
| **NativeWind** | Tailwind CSS pour React Native (même classes utilitaires) |
