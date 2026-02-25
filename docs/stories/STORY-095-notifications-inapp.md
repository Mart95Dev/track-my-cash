# STORY-095 — Centre de notifications in-app

**Sprint :** v13 — Activation & Rétention Couple
**Priorité :** P2 — SHOULD HAVE
**Complexité :** M
**Points :** 3
**Epic :** engagement
**Dépendances :** STORY-094 (couple-queries pour événement partenaire actif)

---

## Description

Système de notifications per-user (per-user DB) avec badge rouge sur la BottomNav et page `/notifications`. Génération d'événements clés : solde bas, balance couple déséquilibrée, objectif atteint, transaction partagée ajoutée par le partenaire.

**Schema DB (per-user DB) :**
```sql
CREATE TABLE IF NOT EXISTS notifications (
  id TEXT PRIMARY KEY,
  type TEXT NOT NULL,           -- 'low_balance' | 'couple_balance' | 'goal_reached' | 'partner_tx'
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  read INTEGER DEFAULT 0,
  created_at TEXT DEFAULT (datetime('now')),
  metadata TEXT                 -- JSON optionnel (accountId, amount, etc.)
);
```

**Événements générateurs :**
| Type | Déclencheur | Titre | Corps |
|------|-------------|-------|-------|
| `low_balance` | Login, balance < `alert_threshold` | "Solde bas" | "Compte {nom} sous le seuil d'alerte" |
| `couple_balance` | Calcul hebdo, `\|diff\| > 50€` | "Balance couple" | "{partenaire} vous doit {X}€ ce mois" |
| `goal_reached` | Mise à jour objectif, current ≥ target | "Objectif atteint 🎉" | "'{nom}' est atteint !" |
| `partner_tx` | Transaction partagée ajoutée par partenaire | "Nouvelle dépense" | "{partenaire} a ajouté {X}€ — {description}" |

**Auto-archivage :** `DELETE FROM notifications WHERE created_at < datetime('now', '-30 days')`

---

## Critères d'acceptation

| # | Critère |
|---|---------|
| AC-1 | Table `notifications` créée en migration per-user DB (try/catch idempotent) |
| AC-2 | Badge rouge sur BottomNav si `unreadCount > 0` |
| AC-3 | Badge absent si `unreadCount = 0` |
| AC-4 | Page `/notifications` liste les 50 dernières notifs, ordre anti-chronologique |
| AC-5 | Tap sur une notif → `markNotificationReadAction(id)` → badge décrémenté |
| AC-6 | Notif `low_balance` créée si balance < seuil au chargement du dashboard |
| AC-7 | Notif `goal_reached` créée lors d'une mise à jour d'objectif franchissant 100% |

---

## Cas de tests unitaires

### `createNotification(db, type, title, body, metadata?)` → `src/lib/notification-queries.ts`

| ID | Description | Résultat attendu |
|----|-------------|-----------------|
| TU-95-1 | Insert notif type `low_balance` | Enregistrement en DB, `read=0` |
| TU-95-2 | Insert avec metadata JSON | `metadata` stocké en string JSON |
| TU-95-3 | `id` généré (nanoid) — unique | Pas de collision |

### `getUnreadCount(db)` → `src/lib/notification-queries.ts`

| ID | Description | Résultat attendu |
|----|-------------|-----------------|
| TU-95-4 | 3 notifs, 1 lue, 2 non lues → retourne 2 | `2` |
| TU-95-5 | Aucune notif → retourne 0 | `0` |

### `markAllRead(db)` → `src/lib/notification-queries.ts`

| ID | Description | Résultat attendu |
|----|-------------|-----------------|
| TU-95-6 | 3 notifs non lues → toutes passent à `read=1` | `getUnreadCount` retourne 0 |

### `getNotifications(db, limit)` → `src/lib/notification-queries.ts`

| ID | Description | Résultat attendu |
|----|-------------|-----------------|
| TU-95-7 | 5 notifs → retourne tableau trié DESC created_at | 5 éléments, le plus récent en premier |
| TU-95-8 | Limit 50 respecté | Max 50 éléments |

### `BottomNav` avec badge → `src/components/bottom-nav.tsx`

| ID | Description | Résultat attendu |
|----|-------------|-----------------|
| TU-95-9 | `unreadCount=3` → badge "3" visible | Élément badge présent |
| TU-95-10 | `unreadCount=0` → pas de badge | Aucun badge dans le DOM |

---

## Mapping AC → Tests

| AC | Tests couvrants |
|----|----------------|
| AC-1 | TU-95-1 (migration implicite dans setup test) |
| AC-2 | TU-95-9 |
| AC-3 | TU-95-10 |
| AC-4 | TU-95-7, TU-95-8 |
| AC-5 | TU-95-6 (markAllRead comme proxy) |
| AC-6 | TU-95-1 (type low_balance) |
| AC-7 | TU-95-1 (type goal_reached) |

---

## Données de test / fixtures

```typescript
// Notifs mockées
const notifs = [
  { id: "n1", type: "low_balance", title: "Solde bas", body: "Compte Courant sous seuil", read: 0 },
  { id: "n2", type: "goal_reached", title: "Objectif atteint", body: "Vacances 2026 atteint", read: 1 },
  { id: "n3", type: "couple_balance", title: "Balance couple", body: "Marie vous doit 75€", read: 0 },
];
```

---

## Fichiers à créer / modifier

| Fichier | Action |
|---------|--------|
| `src/lib/user-db.ts` | Modifier — migration table `notifications` |
| `src/lib/notification-queries.ts` | Créer — CRUD notifications |
| `src/components/bottom-nav.tsx` | Modifier — badge unread count |
| `src/app/[locale]/(app)/notifications/page.tsx` | Créer — liste notifs + markRead |
| `src/app/actions/notification-actions.ts` | Créer — `markNotificationReadAction` |
| `tests/unit/lib/notification-queries.test.ts` | Créer |
| `tests/unit/components/bottom-nav-badge.test.tsx` | Créer |
