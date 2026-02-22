# STORY-037 — Centre de notifications in-app

**Sprint :** Sprint Objectifs & Intelligence
**Priorité :** P2
**Complexité :** S (2 points)
**Bloquée par :** STORY-033
**Statut :** pending

---

## Description

L'application génère des événements importants (budget dépassé, solde bas, import terminé) mais les signale uniquement par email. Un centre de notifications in-app permet aux utilisateurs de voir leurs alertes directement dans l'interface, sans avoir à consulter leur boîte mail.

---

## Contexte technique

- Nouvelle table `notifications` dans libsql (Turso)
- Notifications créées par les server actions existantes (budget-actions, import-actions, account-actions)
- UI : icône cloche dans la sidebar avec badge de comptage non-lu
- Polling simple (pas de WebSocket) : les notifications se chargent au chargement de la page
- Auth via `getRequiredUserId()` de `@/lib/auth-utils`

---

## Schéma DB

```sql
CREATE TABLE IF NOT EXISTS notifications (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id TEXT NOT NULL,
  type TEXT NOT NULL,          -- 'budget_exceeded' | 'low_balance' | 'import_complete' | 'goal_reached'
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  read INTEGER NOT NULL DEFAULT 0,   -- 0 = non lu, 1 = lu
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id, read, created_at DESC);
```

---

## Acceptance Criteria

**AC-1 :** Une icône de cloche dans la sidebar affiche un badge rouge avec le nombre de notifications non lues (max "9+" si > 9)

**AC-2 :** Un clic sur la cloche ouvre un dropdown listant les 10 dernières notifications (titre + message + date relative)

**AC-3 :** Les notifications non lues ont un fond coloré distinct des notifications lues

**AC-4 :** Un clic sur une notification la marque comme lue (badge décrémenté)

**AC-5 :** Un bouton "Tout marquer comme lu" marque toutes les notifications comme lues

**AC-6 :** Si 0 notification, le dropdown affiche "Aucune notification"

**AC-7 :** Les notifications de type `goal_reached` (objectif atteint, de STORY-033) sont créées automatiquement quand `current_amount >= target_amount`

---

## Spécifications techniques

### `src/lib/queries.ts` — nouvelles fonctions

```typescript
export interface Notification {
  id: number;
  user_id: string;
  type: "budget_exceeded" | "low_balance" | "import_complete" | "goal_reached";
  title: string;
  message: string;
  read: boolean;
  created_at: string;
}

export async function getNotifications(db: Client, userId: string, limit?: number): Promise<Notification[]>
export async function getUnreadNotificationsCount(db: Client, userId: string): Promise<number>
export async function createNotification(db: Client, userId: string, type: Notification["type"], title: string, message: string): Promise<void>
export async function markNotificationRead(db: Client, id: number, userId: string): Promise<void>
export async function markAllNotificationsRead(db: Client, userId: string): Promise<void>
```

### `src/app/actions/notification-actions.ts` — à créer

```typescript
export async function markNotificationReadAction(id: number): Promise<void>
export async function markAllNotificationsReadAction(): Promise<void>
```

### `src/components/notifications-bell.tsx` — à créer

```typescript
"use client";
// Props: initialNotifications: Notification[], unreadCount: number
// Dropdown (shadcn Popover ou DropdownMenu)
// Chaque item: titre en gras, message en texte, date relative (formatDistanceToNow)
// Background: bg-muted si lu, bg-accent si non lu
```

### Intégration dans la sidebar

Dans `src/app/[locale]/(app)/layout.tsx` (Server Component) :
- Récupère `getNotifications(db, userId, 10)` et `getUnreadNotificationsCount(db, userId)`
- Passe en props à `<NotificationsBell />`

---

## Tests unitaires à créer

**Fichier :** `tests/unit/actions/notification-actions.test.ts`

**TU-1-1 :** `markNotificationReadAction` avec id valide → appelle `markNotificationRead` en DB
**TU-1-2 :** `markAllNotificationsReadAction` → appelle `markAllNotificationsRead` en DB
**TU-1-3 :** `createNotification` avec tous les champs → insertion en DB sans erreur
**TU-1-4 :** `getUnreadNotificationsCount` retourne 0 si aucune notification non lue
**TU-1-5 :** `getNotifications` retourne les notifications triées par `created_at DESC`

**Mocks requis :**
- `@/lib/auth-utils` : `getRequiredUserId`
- `@/lib/db` : `getUserDb`
- `@/lib/queries` : toutes les fonctions notifications
- `next/cache` : `revalidatePath`

---

## Données de test

```typescript
const mockNotification: Notification = {
  id: 1,
  user_id: "user-test",
  type: "budget_exceeded",
  title: "Budget Alimentation dépassé",
  message: "Vous avez dépensé 520 € sur un budget de 400 €",
  read: false,
  created_at: "2026-02-21T10:00:00",
};
```

---

## Fichiers à créer/modifier

- `src/lib/db.ts` — ajouter migration `notifications` dans `initSchema()`
- `src/lib/queries.ts` — ajouter `Notification` interface + 5 fonctions
- `src/app/actions/notification-actions.ts` — créer (2 actions)
- `src/components/notifications-bell.tsx` — créer
- `src/app/[locale]/(app)/layout.tsx` — intégrer `<NotificationsBell />` avec données
- `tests/unit/actions/notification-actions.test.ts` — créer (5 tests)
