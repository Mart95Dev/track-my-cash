# STORY-055 — RGPD — Suppression automatique des comptes (J+25 rappel + J+30 effectif)

**Sprint :** Production SaaS & Croissance (v8)
**Épique :** compliance
**Priorité :** P1
**Complexité :** M (3 points)
**Statut :** pending
**Bloqué par :** —

---

## Description

Implémente le droit à l'oubli RGPD avec grâce de 30 jours. Un utilisateur peut demander la suppression depuis `/parametres`. À J+25, un email de rappel lui rappelle que sa demande sera exécutée dans 5 jours. À J+30, un cron supprime effectivement : DB Turso via API, user Better-Auth, subscriptions, ai_usage. Une page `/compte-suspendu` informe l'utilisateur suspendu.

**Tables DB principale nécessaires :**
- `deletion_requests (user_id, requested_at, scheduled_delete_at, reason)` — si absente, à créer via migration
- `subscriptions.suspended INTEGER DEFAULT 0` — colonne à ajouter si absente

---

## Acceptance Criteria

- **AC-1 :** Bouton "Supprimer mon compte" dans `/parametres` → dialog confirmation → `requestAccountDeletionAction()`
- **AC-2 :** `requestAccountDeletionAction()` crée une entrée dans `deletion_requests` avec `scheduled_delete_at = now + 30j`
- **AC-3 :** `GET /api/cron/deletion-reminder` (CRON_SECRET) → envoie email aux users dont `requested_at + 25j <= now` et pas encore notifiés
- **AC-4 :** `GET /api/cron/delete-accounts` (CRON_SECRET) → supprime les users dont `scheduled_delete_at <= now` (DB Turso + auth + subscriptions)
- **AC-5 :** Page `src/app/[locale]/compte-suspendu/page.tsx` accessible sans auth — affiche message + email de contact
- **AC-6 :** Les 2 crons répondent 401 sans `Authorization: Bearer CRON_SECRET`

---

## Fichiers à créer / modifier

| Fichier | Action |
|---------|--------|
| `src/lib/db.ts` | MODIFIER — migrations `deletion_requests` + `subscriptions.suspended` |
| `src/app/actions/account-deletion-actions.ts` | CRÉER — `requestAccountDeletionAction()`, `cancelDeletionAction()` |
| `src/app/api/cron/deletion-reminder/route.ts` | CRÉER — GET, envoie emails J+25 |
| `src/app/api/cron/delete-accounts/route.ts` | CRÉER — GET, suppression effective J+30 |
| `src/app/[locale]/compte-suspendu/page.tsx` | CRÉER — page info (sans auth) |
| `src/app/[locale]/(app)/parametres/page.tsx` | MODIFIER — bouton "Supprimer mon compte" |
| `vercel.json` | MODIFIER — ajouter 2 crons (`0 7 * * *` pour les 2) |
| `tests/unit/lib/deletion-utils.test.ts` | CRÉER — tests unitaires |

---

## Tests unitaires (TU-x)

**Fichier :** `tests/unit/lib/deletion-utils.test.ts`

### Données de test

```typescript
const REQUEST_25_DAYS_AGO = {
  user_id: "user-1",
  requested_at: new Date(Date.now() - 25 * 86400000).toISOString(),
  scheduled_delete_at: new Date(Date.now() + 5 * 86400000).toISOString(),
};

const REQUEST_OVERDUE = {
  user_id: "user-2",
  requested_at: new Date(Date.now() - 31 * 86400000).toISOString(),
  scheduled_delete_at: new Date(Date.now() - 1 * 86400000).toISOString(),
};
```

### Cas de test

| ID | Description | Résultat attendu |
|----|-------------|-----------------|
| TU-55-1 | `GET /api/cron/deletion-reminder` sans secret | `401` |
| TU-55-2 | `GET /api/cron/delete-accounts` sans secret | `401` |
| TU-55-3 | `isEligibleForReminder(REQUEST_25_DAYS_AGO)` — J+25 atteint | `true` |
| TU-55-4 | `isEligibleForDeletion(REQUEST_OVERDUE)` — J+30 dépassé | `true` |
| TU-55-5 | `isEligibleForDeletion(REQUEST_25_DAYS_AGO)` — J+30 pas encore atteint | `false` |

---

## Mapping AC → Tests

| AC | Tests couvrant |
|----|---------------|
| AC-1 | Intégration UI /parametres |
| AC-2 | Intégration server action |
| AC-3 | TU-55-1 + TU-55-3 |
| AC-4 | TU-55-2 + TU-55-4 |
| AC-5 | Rendering page compte-suspendu |
| AC-6 | TU-55-1 + TU-55-2 |

---

## Interface TypeScript

```typescript
// src/lib/deletion-utils.ts

export interface DeletionRequest {
  user_id: string;
  requested_at: string;
  scheduled_delete_at: string;
  notified_at?: string | null;
}

export function isEligibleForReminder(req: DeletionRequest): boolean
// true si requested_at + 25j <= now ET notified_at IS NULL

export function isEligibleForDeletion(req: DeletionRequest): boolean
// true si scheduled_delete_at <= now
```

---

## Notes d'implémentation

- Les 2 crons partagent la même heure d'exécution `0 7 * * *` (chaque jour à 7h UTC)
- La suppression effective dans `delete-accounts` : séquence atomique par user :
  1. DELETE Turso DB via API (fire-and-forget si échec API)
  2. DELETE Better-Auth user (via `auth.api.admin.deleteUser`)
  3. DELETE `deletion_requests WHERE user_id = ?`
  4. DELETE `subscriptions WHERE user_id = ?`
  5. DELETE `ai_usage WHERE user_id = ?`
- Email de rappel J+25 via `sendEmail()` existant (template dédié)
- La page `/compte-suspendu` est en dehors du route group `(app)` — pas de protection auth middleware
- `cancelDeletionAction()` supprime l'entrée dans `deletion_requests` (bouton "Annuler" dans email rappel)
