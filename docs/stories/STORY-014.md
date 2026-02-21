# STORY-014 — Alerte solde bas (email automatique)

**Epic :** Emails Transactionnels
**Priorité :** P1
**Complexité :** S
**Statut :** pending
**Bloquée par :** STORY-012 (service email)

---

## User Story

En tant qu'utilisateur qui a configuré un seuil d'alerte sur mon compte,
je veux recevoir un email automatiquement quand mon solde passe en dessous de ce seuil,
afin d'être prévenu avant de tomber à découvert.

---

## Contexte technique

- `alert_threshold` existe dans la table `accounts` (colonne nullable, migrations déjà appliquées)
- Le solde calculé est `initial_balance + SUM(transactions WHERE date >= balance_date)`
- Les Server Actions qui modifient le solde : `createTransactionAction`, `importFileAction`, `confirmImportAction`
- L'email de l'utilisateur est disponible via `session.user.email` (better-auth)
- **Anti-spam :** une seule alerte par compte par 24h maximum
  - Stratégie : ajouter colonne `last_alert_sent_at TEXT` sur la table `accounts` dans les migrations
- `replyTo` : `support@track-my-cash.fr`

---

## Acceptance Criteria

- [ ] AC-1 : Après `createTransactionAction`, si le solde calculé < `alert_threshold`, un email d'alerte est envoyé
- [ ] AC-2 : Après `confirmImportAction`, même vérification et envoi
- [ ] AC-3 : L'email affiche : nom du compte, solde actuel (formaté), seuil configuré
- [ ] AC-4 : Si une alerte a déjà été envoyée dans les 24h pour ce compte → ne pas renvoyer (colonne `last_alert_sent_at`)
- [ ] AC-5 : Si `alert_threshold` est NULL → aucune vérification, aucun email
- [ ] AC-6 : Si `sendEmail` échoue → l'action principale réussit quand même (erreur silencieuse)
- [ ] AC-7 : `last_alert_sent_at` est mis à jour après chaque envoi réussi

---

## Fichiers à créer / modifier

| Fichier | Action |
|---------|--------|
| `src/lib/email-templates.ts` | Modifier — ajouter `renderLowBalanceAlert(accountName, balance, threshold, currency)` |
| `src/lib/alert-service.ts` | Créer — `checkAndSendLowBalanceAlert(db, accountId, userId)` |
| `src/lib/db.ts` | Modifier — ajouter migration `ALTER TABLE accounts ADD COLUMN last_alert_sent_at TEXT` |
| `src/app/actions/transaction-actions.ts` | Modifier — appeler `checkAndSendLowBalanceAlert` après création |
| `src/app/actions/import-actions.ts` | Modifier — appeler `checkAndSendLowBalanceAlert` après import confirmé |

---

## Implémentation clé

```typescript
// src/lib/alert-service.ts
export async function checkAndSendLowBalanceAlert(
  db: Client,
  accountId: number,
  userEmail: string
): Promise<void> {
  const account = await getAccountWithBalance(db, accountId);
  if (!account.alert_threshold) return;

  const balance = account.calculated_balance ?? account.initial_balance;
  if (balance >= account.alert_threshold) return;

  // Vérifier anti-spam 24h
  if (account.last_alert_sent_at) {
    const lastSent = new Date(account.last_alert_sent_at);
    const hoursSince = (Date.now() - lastSent.getTime()) / (1000 * 3600);
    if (hoursSince < 24) return;
  }

  // Envoyer l'alerte
  await sendEmail({
    to: userEmail,
    subject: `⚠️ Solde bas — ${account.name}`,
    html: renderLowBalanceAlert(account.name, balance, account.alert_threshold, account.currency),
    replyTo: "support@track-my-cash.fr",
  });

  // Mettre à jour last_alert_sent_at
  await db.execute({
    sql: "UPDATE accounts SET last_alert_sent_at = ? WHERE id = ?",
    args: [new Date().toISOString(), accountId],
  });
}
```

---

## Tests unitaires

### TU-1 : checkAndSendLowBalanceAlert — logique métier
**Fichier :** `tests/unit/email/alert-service.test.ts`

```
TU-1-1 : Si alert_threshold est NULL → sendEmail n'est PAS appelé
TU-1-2 : Si balance >= threshold → sendEmail n'est PAS appelé
TU-1-3 : Si balance < threshold ET last_alert_sent_at NULL → sendEmail est appelé
TU-1-4 : Si balance < threshold ET last_alert_sent_at > 24h ago → sendEmail est appelé
TU-1-5 : Si balance < threshold ET last_alert_sent_at < 24h ago → sendEmail n'est PAS appelé (anti-spam)
TU-1-6 : Après envoi réussi → last_alert_sent_at est mis à jour en DB
TU-1-7 : Si sendEmail échoue → la fonction ne throw pas
```

### TU-2 : renderLowBalanceAlert — contenu email
**Fichier :** `tests/unit/email/email-templates.test.ts`

```
TU-2-1 : renderLowBalanceAlert contient le nom du compte
TU-2-2 : renderLowBalanceAlert contient le solde formaté
TU-2-3 : renderLowBalanceAlert contient le seuil d'alerte
TU-2-4 : renderLowBalanceAlert contient "⚠️" ou "alerte" dans le texte
```

---

## Fixtures / données de test

```typescript
const mockAccount = {
  id: 1,
  name: "Compte Courant",
  alert_threshold: 500,
  calculated_balance: 250,  // < threshold → doit alerter
  currency: "EUR",
  last_alert_sent_at: null,
};

const mockAccountRecentAlert = {
  ...mockAccount,
  last_alert_sent_at: new Date(Date.now() - 3 * 3600 * 1000).toISOString(), // 3h ago → anti-spam
};
```

---

## Estimation

**Points :** 3
**Durée estimée :** 2-3h
