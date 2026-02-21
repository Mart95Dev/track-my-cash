# STORY-013 — Email de bienvenue (post-inscription)

**Epic :** Emails Transactionnels
**Priorité :** P1
**Complexité :** S
**Statut :** pending
**Bloquée par :** STORY-012 (service email)

---

## User Story

En tant que nouvel utilisateur,
je veux recevoir un email de bienvenue après mon inscription,
afin de confirmer que mon compte est créé et découvrir les premières étapes.

---

## Contexte technique

- better-auth (`src/lib/auth.ts`) gère l'inscription via `emailAndPassword`
- Il n'existe pas de hook natif `onAfterCreateUser` dans better-auth sans plugin
- **Stratégie retenue :** wrapper de la Server Action d'inscription dans `src/app/actions/auth-actions.ts`
  - OU : ajouter un `afterCreate` dans la config better-auth si disponible
- L'email de l'utilisateur est disponible dans `session.user.email`
- Contenu email : bienvenue, 3 fonctionnalités clés, CTA "Accéder à mon espace"
- `replyTo` : `support@track-my-cash.fr` (alias Hostinger)

---

## Acceptance Criteria

- [ ] AC-1 : Un email de bienvenue est envoyé après une inscription réussie (< 5s)
- [ ] AC-2 : L'email contient l'adresse email de l'utilisateur dans le corps
- [ ] AC-3 : L'email contient un CTA "Accéder à mon espace" qui redirige vers `BETTER_AUTH_URL + /fr/` (URL de base)
- [ ] AC-4 : Si `sendEmail` échoue, l'inscription aboutit quand même (pas de rollback, erreur silencieuse côté serveur)
- [ ] AC-5 : Le sujet de l'email est "Bienvenue sur TrackMyCash !" (ou localisé)
- [ ] AC-6 : L'email utilise le template `renderEmailBase` de STORY-012

---

## Fichiers à créer / modifier

| Fichier | Action |
|---------|--------|
| `src/lib/email-templates.ts` | Créer — fonctions `renderWelcomeEmail(userEmail, appUrl)` |
| `src/app/[locale]/(auth)/inscription/actions.ts` | Créer ou modifier — déclencher sendEmail post-signup |
| `src/app/[locale]/(auth)/inscription/page.tsx` | Modifier — utiliser la Server Action modifiée si nécessaire |

---

## Implémentation clé

```typescript
// src/lib/email-templates.ts
export function renderWelcomeEmail(userEmail: string, appUrl: string): string {
  const body = `
    <h2>Bienvenue sur TrackMyCash !</h2>
    <p>Votre compte <strong>${userEmail}</strong> est créé.</p>
    <p>TrackMyCash vous permet de :</p>
    <ul>
      <li>Suivre vos comptes bancaires</li>
      <li>Automatiser le suivi de vos récurrents</li>
      <li>Prévoir votre solde futur</li>
    </ul>
    <a href="${appUrl}" style="...">Accéder à mon espace →</a>
  `;
  return renderEmailBase("Bienvenue sur TrackMyCash", body);
}

// Dans la Server Action post-inscription :
await sendEmail({
  to: userEmail,
  subject: "Bienvenue sur TrackMyCash !",
  html: renderWelcomeEmail(userEmail, process.env.BETTER_AUTH_URL ?? ""),
  replyTo: "support@track-my-cash.fr",
});
```

---

## Tests unitaires

### TU-1 : renderWelcomeEmail — contenu
**Fichier :** `tests/unit/email/email-templates.test.ts`

```
TU-1-1 : renderWelcomeEmail contient l'email utilisateur passé en param
TU-1-2 : renderWelcomeEmail contient l'URL de l'app pour le CTA
TU-1-3 : renderWelcomeEmail contient "TrackMyCash" dans le corps
TU-1-4 : renderWelcomeEmail retourne un string HTML valide (commence par <!DOCTYPE)
TU-1-5 : renderWelcomeEmail ne throw pas si userEmail est vide
```

### TU-2 : Intégration post-inscription (mock sendEmail)
**Fichier :** `tests/unit/email/welcome-action.test.ts`

```
TU-2-1 : sendEmail est appelé avec to = email de l'utilisateur
TU-2-2 : sendEmail est appelé avec replyTo = "support@..."
TU-2-3 : Si sendEmail échoue, l'action ne throw pas (erreur silencieuse)
TU-2-4 : Le sujet contient "Bienvenue"
```

---

## Estimation

**Points :** 3
**Durée estimée :** 2h
