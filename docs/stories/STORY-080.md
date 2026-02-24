# STORY-080 — Emails de rappel trial J-3 et J-1

**Sprint :** Conversion & Monétisation (v11)
**Épique :** engagement
**Priorité :** P1 — MUST HAVE
**Complexité :** M (3 points)
**Statut :** pending
**Bloqué par :** aucune

---

## Description

Envoyer deux emails de rappel automatiques avant l'expiration du trial Pro :
- **J-3** : "Votre essai expire dans 3 jours" — rappel doux avec les features Pro
- **J-1** : "Dernière chance" — urgence + CTA direct checkout

Ces emails sont envoyés par un nouveau cron `/api/cron/trial-reminders` déclenché quotidiennement. Des flags DB évitent les doublons (idempotence). L'infrastructure email existante (`sendEmail()`, `renderEmailBase()`) est réutilisée.

**Contexte technique :**
- DB : Turso/libSQL via `getDb()`
- Email : Nodemailer via `src/lib/email.ts` > `sendEmail()`
- Templates : `src/lib/email-templates.ts` — ajouter `renderTrialReminderEmail()`
- Cron existant de référence : `src/app/api/cron/check-trials/route.ts`

---

## Acceptance Criteria

- **AC-1 :** La migration DB ajoute les colonnes `reminder_3d_sent INTEGER DEFAULT 0` et `reminder_1d_sent INTEGER DEFAULT 0` à la table `subscriptions`
- **AC-2 :** Le cron `GET /api/cron/trial-reminders` est protégé par `Authorization: Bearer CRON_SECRET`
- **AC-3 :** Un utilisateur avec `daysLeft ≈ 3` (entre 2.5 et 3.5 jours) reçoit l'email J-3 et `reminder_3d_sent` passe à 1
- **AC-4 :** Un utilisateur avec `daysLeft ≈ 1` (entre 0.5 et 1.5 jours) reçoit l'email J-1 et `reminder_1d_sent` passe à 1
- **AC-5 :** L'email n'est pas renvoyé si le flag est déjà à 1 (idempotent)
- **AC-6 :** Les emails contiennent le lien `/tarifs` avec CTA "Continuer avec Pro"
- **AC-7 :** Le cron retourne `{ sent: N }` avec le nombre d'emails envoyés
- **AC-8 :** `npm run build` et `npm run lint` passent sans erreur

---

## Fichiers à créer / modifier

| Fichier | Action | Détail |
|---------|--------|--------|
| `src/lib/db.ts` | MODIFIER | Ajouter colonnes `reminder_3d_sent` et `reminder_1d_sent` dans le `CREATE TABLE subscriptions` |
| `src/lib/email-templates.ts` | MODIFIER | Ajouter `renderTrialReminderEmail(daysLeft: 3 \| 1, userName: string, baseUrl: string): string` |
| `src/app/api/cron/trial-reminders/route.ts` | CRÉER | Cron GET protégé par CRON_SECRET |

---

## Schéma DB

```sql
-- Migration additive dans src/lib/db.ts
-- Dans le CREATE TABLE subscriptions (ou ALTER TABLE si existant)
reminder_3d_sent INTEGER DEFAULT 0,
reminder_1d_sent INTEGER DEFAULT 0
```

**Stratégie :** La migration est gérée dans `db.ts` via `CREATE TABLE IF NOT EXISTS` — si la table existe déjà, utiliser `ALTER TABLE ... ADD COLUMN IF NOT EXISTS` ou vérifier `PRAGMA table_info`.

---

## Template email

```ts
// src/lib/email-templates.ts — ajout
export function renderTrialReminderEmail(
  daysLeft: 3 | 1,
  userName: string,
  baseUrl: string
): string {
  const isUrgent = daysLeft === 1;
  const subject = isUrgent
    ? "⚠️ Dernière chance — votre essai Pro expire demain"
    : "⏳ Votre essai Pro expire dans 3 jours";

  const headline = isUrgent
    ? "Votre essai Pro expire demain"
    : `Encore ${daysLeft} jours d'essai Pro`;

  const intro = isUrgent
    ? "C'est votre dernière chance de conserver toutes vos fonctionnalités Pro."
    : "Votre période d'essai gratuite se termine bientôt. Continuez à profiter de toutes les fonctionnalités Pro.";

  const features = [
    "5 comptes bancaires",
    "Import PDF & Excel",
    "Conseiller IA (10 requêtes/mois)",
    "Multi-devises",
    "Export CSV & rapports",
  ];

  const featuresHtml = features
    .map((f) => `<li style="padding: 4px 0; color: #555;">${f}</li>`)
    .join("");

  return renderEmailBase({
    title: subject,
    preheader: headline,
    content: `
      <h2 style="color: #0e0e1b; font-size: 20px; margin: 0 0 12px;">${headline}</h2>
      <p style="color: #505095; margin: 0 0 20px;">${intro}</p>
      <p style="color: #0e0e1b; font-weight: 600; margin: 0 0 8px;">Ce que vous conservez avec Pro :</p>
      <ul style="margin: 0 0 24px; padding-left: 20px;">${featuresHtml}</ul>
      <a href="${baseUrl}/tarifs"
         style="display: inline-block; background: #4848e5; color: white; font-weight: 700;
                padding: 14px 28px; border-radius: 10px; text-decoration: none; font-size: 15px;">
        Continuer avec Pro →
      </a>
      <p style="color: #888; font-size: 12px; margin-top: 24px;">
        Si vous ne souhaitez pas souscrire, votre compte passera automatiquement en plan Gratuit.
      </p>
    `,
  });
}
```

---

## Cron route

```ts
// src/app/api/cron/trial-reminders/route.ts
export async function GET(request: NextRequest) {
  // 1. Auth CRON_SECRET
  // 2. Requête : subscriptions WHERE status = 'trialing'
  //              AND trial_ends_at BETWEEN now+Xh AND now+Yh
  //              AND reminder_Xd_sent = 0
  // 3. Pour chaque résultat : récupérer email user, envoyer email, UPDATE flag
  // 4. Retourner { sent: N }
}
```

**Fenêtres de détection :**
- J-3 : `trial_ends_at BETWEEN datetime('now', '+2 days', '+12 hours') AND datetime('now', '+3 days', '+12 hours')`
- J-1 : `trial_ends_at BETWEEN datetime('now', '+12 hours') AND datetime('now', '+1 day', '+12 hours')`

---

## Tests unitaires

**Fichier :** `tests/unit/email/trial-reminder-email.test.ts`
**Fichier :** `tests/unit/api/trial-reminders-cron.test.ts`

| ID | Description | Résultat attendu |
|----|-------------|-----------------|
| TU-80-1 | `renderTrialReminderEmail(3, "Alice", "http://localhost")` contient "3 jours" | `html.includes("3 jours")` |
| TU-80-2 | `renderTrialReminderEmail(3, ...)` contient le lien `/tarifs` | `html.includes("/tarifs")` |
| TU-80-3 | `renderTrialReminderEmail(1, "Alice", "http://localhost")` contient "demain" | `html.includes("demain")` |
| TU-80-4 | `renderTrialReminderEmail(1, ...)` contient le CTA "Continuer avec Pro" | `html.includes("Continuer avec Pro")` |
| TU-80-5 | Cron retourne 401 sans Authorization header | `status === 401` |
| TU-80-6 | Cron retourne 401 avec mauvais CRON_SECRET | `status === 401` |
| TU-80-7 | Cron retourne `{ sent: 0 }` si aucun trial dans la fenêtre | `body.sent === 0` |
| TU-80-8 | `reminder_3d_sent` et `reminder_1d_sent` existent dans le schéma DB | `PRAGMA table_info` ou test d'insertion |

---

## Mapping AC → Tests

| AC | Tests couvrant |
|----|---------------|
| AC-1 | TU-80-8 |
| AC-2 | TU-80-5, TU-80-6 |
| AC-3 | TU-80-1, TU-80-2 (template) + test intégration cron |
| AC-4 | TU-80-3, TU-80-4 (template) + test intégration cron |
| AC-5 | TU-80-7 (flag déjà à 1 → 0 email) |
| AC-6 | TU-80-2, TU-80-4 |
| AC-7 | TU-80-7 |
| AC-8 | `npm run build && npm run lint` |

---

## Notes d'implémentation

1. **Migration DB** : Vérifier si `db.ts` utilise `CREATE TABLE IF NOT EXISTS` — si oui, ajouter les colonnes dans le DDL. Si la table existe en prod sans ces colonnes, ajouter un `ALTER TABLE subscriptions ADD COLUMN IF NOT EXISTS ...` conditionnel
2. **Récupération de l'email user** : `SELECT u.email, u.name FROM subscriptions s JOIN user u ON u.id = s.user_id` — le schéma BetterAuth nomme la table `user` (sans `s`)
3. **baseUrl** : utiliser `process.env.BETTER_AUTH_URL ?? "http://localhost:3000"`
4. **Pas de type `any`** : typer les rows DB avec une interface locale
5. **Fire-and-forget** : chaque `sendEmail()` dans une `try/catch` — un échec d'envoi ne bloque pas les autres
