# STORY-054 — Période d'essai 14j Pro à l'inscription

**Sprint :** Production SaaS & Croissance (v8)
**Épique :** monetization
**Priorité :** P1
**Complexité :** M (3 points)
**Statut :** pending
**Bloqué par :** STORY-053

---

## Description

Les nouveaux utilisateurs arrivent directement en plan Free, sans expérimenter les fonctionnalités Pro. Cette story crée un essai automatique de 14 jours Pro à l'inscription. Une bannière visible dans le layout app indique le temps restant. À expiration, un cron quotidien repasse l'utilisateur en Free.

**Mécanisme :**
- À l'inscription (Better-Auth `after` hook ou dans le flow d'onboarding) → créer `subscriptions (plan: "pro", status: "trialing", trial_ends_at: now + 14j)`
- Bannière dans `(app)/layout.tsx` : "Essai Pro — X jours restants"
- Cron `/api/cron/check-trials` : vérifie les essais expirés et met à jour le plan

---

## Acceptance Criteria

- **AC-1 :** À l'inscription, `subscriptions` est créé avec `plan: "pro"`, `status: "trialing"`, `trial_ends_at = now + 14j`
- **AC-2 :** `<TrialBanner />` visible dans le layout app quand le plan est `trialing` et la date n'est pas expirée
- **AC-3 :** La bannière affiche exactement le nombre de jours restants (arrondi inférieur)
- **AC-4 :** Un bouton "Souscrire" dans la bannière redirige vers `/tarifs`
- **AC-5 :** `GET /api/cron/check-trials` (CRON_SECRET) expire les essais dépassés → `status: "expired"`, `plan: "free"`
- **AC-6 :** La bannière n'est pas visible pour les plans `pro` (payant) ni `premium`

---

## Fichiers à créer / modifier

| Fichier | Action |
|---------|--------|
| `src/lib/trial-utils.ts` | CRÉER — `isInTrial()`, `getDaysRemaining()`, `createTrialSubscription()` |
| `src/app/[locale]/(app)/layout.tsx` | MODIFIER — afficher `<TrialBanner />` |
| `src/components/trial-banner.tsx` | CRÉER — bannière countdown |
| `src/app/api/cron/check-trials/route.ts` | CRÉER — GET, expirez les essais |
| `src/app/[locale]/(auth)/inscription/page.tsx` | MODIFIER — appeler `createTrialSubscription` après inscription |
| `vercel.json` | MODIFIER — ajouter cron `check-trials` (`0 8 * * *` = tous les jours à 8h) |
| `tests/unit/lib/trial-utils.test.ts` | CRÉER — tests unitaires |

---

## Tests unitaires (TU-x)

**Fichier :** `tests/unit/lib/trial-utils.test.ts`

### Données de test

```typescript
const FUTURE_DATE = new Date(Date.now() + 5 * 86400000).toISOString(); // +5 jours
const PAST_DATE = new Date(Date.now() - 1 * 86400000).toISOString();   // -1 jour
```

### Cas de test

| ID | Description | Résultat attendu |
|----|-------------|-----------------|
| TU-54-1 | `isInTrial({ status: "trialing", trial_ends_at: FUTURE_DATE })` | `true` |
| TU-54-2 | `isInTrial({ status: "trialing", trial_ends_at: PAST_DATE })` | `false` |
| TU-54-3 | `isInTrial({ status: "active", plan: "pro" })` | `false` |
| TU-54-4 | `getDaysRemaining(FUTURE_DATE)` → int positif | `5` (ou proche) |
| TU-54-5 | `getDaysRemaining(PAST_DATE)` → jamais négatif | `0` |
| TU-54-6 | `GET /api/cron/check-trials` sans `Authorization` header | `401 Unauthorized` |

---

## Mapping AC → Tests

| AC | Tests couvrant |
|----|---------------|
| AC-1 | Intégration inscription |
| AC-2 | TU-54-1 (condition d'affichage) |
| AC-3 | TU-54-4 |
| AC-4 | Intégration UI |
| AC-5 | TU-54-6 + intégration cron |
| AC-6 | TU-54-3 |

---

## Interface TypeScript

```typescript
// src/lib/trial-utils.ts

export interface Subscription {
  plan: "free" | "pro" | "premium";
  status: "inactive" | "active" | "trialing" | "canceled" | "expired";
  trial_ends_at?: string | null;
}

export function isInTrial(subscription: Subscription | null): boolean

export function getDaysRemaining(trial_ends_at: string): number  // min 0

export async function createTrialSubscription(
  mainDb: Client,
  userId: string
): Promise<void>
```

---

## Notes d'implémentation

- `trial_ends_at` stocké en ISO8601 dans `subscriptions` (colonne à ajouter via migration si absente)
- Lors de l'inscription : si `createTrialSubscription` échoue → l'inscription réussit quand même (fire-and-forget)
- Cron `check-trials` : `UPDATE subscriptions SET status = 'expired', plan = 'free' WHERE status = 'trialing' AND trial_ends_at <= datetime('now')`
- Ajouter `"0 8 * * *"` dans `vercel.json` — s'exécute chaque jour à 8h00 UTC
- `<TrialBanner />` est un Client Component (utilise `useTranslations` + reçoit les props `plan`, `status`, `daysRemaining` du Server Component parent)
- Migration : `ALTER TABLE subscriptions ADD COLUMN trial_ends_at TEXT` (avec try/catch silencieux)
