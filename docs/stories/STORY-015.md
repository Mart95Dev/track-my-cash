# STORY-015 — Suppression de compte RGPD (droit à l'oubli)

**Epic :** Conformité RGPD
**Priorité :** P2
**Complexité :** M
**Statut :** pending
**Bloquée par :** aucune

---

## User Story

En tant qu'utilisateur,
je veux pouvoir supprimer définitivement mon compte et toutes mes données,
afin d'exercer mon droit à l'oubli conformément au RGPD (Article 17).

---

## Contexte technique

- **Données à supprimer :**
  1. Base Turso per-user : comptes, transactions, récurrents, tags, règles de catégorisation, settings
  2. Table `users_databases` dans la DB principale (mapping userId → dbHostname)
  3. Abonnement Stripe actif : annulation via `stripe.subscriptions.cancel()` (immédiate, pas en fin de période)
  4. Utilisateur better-auth : suppression via `auth.api.deleteUser()` ou DELETE direct en DB
  5. Turso DB per-user : suppression via l'API Turso (si disponible) ou abandon (la DB orpheline sera nettoyée manuellement)
- **Cascade :** la suppression DB SQLite avec `ON DELETE CASCADE` supprime automatiquement les données liées
- **Session :** invalider et rediriger vers `/` après suppression
- **Confirmation :** dialog avec saisie du mot "SUPPRIMER" pour éviter les clics accidentels

---

## Acceptance Criteria

- [ ] AC-1 : Un bouton "Supprimer mon compte" est visible dans `/parametres` (zone danger)
- [ ] AC-2 : Un dialog de confirmation s'ouvre, demandant de taper "SUPPRIMER" pour valider
- [ ] AC-3 : L'abonnement Stripe actif est annulé (si existant) avant la suppression des données
- [ ] AC-4 : Toutes les données utilisateur dans Turso per-user sont supprimées (comptes, transactions, récurrents, tags, règles, settings)
- [ ] AC-5 : L'entrée `users_databases` de l'utilisateur est supprimée de la DB principale
- [ ] AC-6 : L'utilisateur better-auth est supprimé (table `user` + sessions)
- [ ] AC-7 : Après suppression, l'utilisateur est redirigé vers `/` et ne peut plus se reconnecter
- [ ] AC-8 : Si une étape échoue (ex: Stripe), continuer les autres suppressions et logger l'erreur (best-effort)

---

## Fichiers à créer / modifier

| Fichier | Action |
|---------|--------|
| `src/app/actions/delete-account-actions.ts` | Créer — Server Action `deleteUserAccountAction()` |
| `src/components/delete-user-account-dialog.tsx` | Créer — Dialog de confirmation avec champ texte |
| `src/app/[locale]/(app)/parametres/page.tsx` | Modifier — intégrer le bouton/dialog de suppression |
| `src/lib/db.ts` | Modifier — ajouter `deleteUserData(db)` qui nettoie toutes les tables |

---

## Implémentation clé

```typescript
// src/app/actions/delete-account-actions.ts
"use server";

export async function deleteUserAccountAction() {
  const session = await getRequiredSession();
  const userId = session.user.id;

  // 1. Annuler l'abonnement Stripe
  try {
    const subscription = await getUserSubscription();
    if (subscription.stripeSubscriptionId) {
      await stripe.subscriptions.cancel(subscription.stripeSubscriptionId);
    }
  } catch (err) {
    console.error("[delete-account] Stripe cancel failed:", err);
    // Continue quand même
  }

  // 2. Supprimer les données Turso per-user
  try {
    const db = await getUserDb(userId);
    await db.executeMultiple(`
      DELETE FROM transaction_tags;
      DELETE FROM tags;
      DELETE FROM categorization_rules;
      DELETE FROM recurring_payments;
      DELETE FROM transactions;
      DELETE FROM accounts;
      DELETE FROM settings;
    `);
  } catch (err) {
    console.error("[delete-account] User DB cleanup failed:", err);
  }

  // 3. Supprimer l'entrée users_databases
  const mainDb = getDb();
  await mainDb.execute({ sql: "DELETE FROM users_databases WHERE user_id = ?", args: [userId] });

  // 4. Supprimer better-auth user (sessions + user)
  try {
    await auth.api.deleteUser({ headers: await headers() });
  } catch (err) {
    console.error("[delete-account] better-auth deleteUser failed:", err);
  }

  // 5. Rediriger
  redirect("/");
}
```

---

## Tests unitaires

### TU-1 : deleteUserAccountAction — orchestration best-effort
**Fichier :** `tests/unit/actions/delete-account.test.ts`

```
TU-1-1 : Si Stripe cancel échoue → la suppression DB continue quand même
TU-1-2 : Si la suppression DB per-user échoue → la suppression auth continue quand même
TU-1-3 : L'entrée users_databases est supprimée de la DB principale
TU-1-4 : La fonction appelle auth.api.deleteUser
TU-1-5 : La fonction termine par redirect("/")
```

### TU-2 : DeleteUserAccountDialog — validation du champ de confirmation
**Fichier :** `tests/unit/components/delete-user-dialog.test.tsx`

```
TU-2-1 : Le bouton "Confirmer la suppression" est désactivé si le champ est vide
TU-2-2 : Le bouton est désactivé si le champ ne contient pas "SUPPRIMER"
TU-2-3 : Le bouton est activé si le champ contient exactement "SUPPRIMER"
TU-2-4 : La casse est stricte ("supprimer" ≠ "SUPPRIMER")
```

---

## Fixtures / données de test

```typescript
const mockSubscription = {
  stripeSubscriptionId: "sub_123",
  stripeCustomerId: "cus_456",
  planId: "pro",
  status: "active",
};
```

---

## Estimation

**Points :** 5
**Durée estimée :** 3-4h
