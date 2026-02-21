# STORY-012 — Service email Nodemailer/Hostinger

**Epic :** Emails Transactionnels
**Priorité :** P1
**Complexité :** S
**Statut :** pending
**Bloquée par :** aucune (parallélisable avec STORY-009/010)

---

## User Story

En tant que développeur,
je veux une couche d'abstraction email centralisée,
afin d'envoyer des emails transactionnels depuis n'importe quelle Server Action sans dupliquer la configuration SMTP.

---

## Contexte technique

- Hébergeur email : Hostinger (SMTP)
- Règle projet (CLAUDE.md) : `from` = adresse principale, `replyTo` = alias selon type
- Exemple : `from: contact@track-my-cash.fr`, `replyTo: support@track-my-cash.fr`
- Nodemailer est la solution retenue (npm package)
- Variables d'environnement à prévoir :
  - `EMAIL_HOST` (ex: smtp.hostinger.com)
  - `EMAIL_PORT` (ex: 465 pour SSL, 587 pour TLS)
  - `EMAIL_USER` (adresse principale)
  - `EMAIL_PASS` (mot de passe)
  - `EMAIL_FROM` (adresse expéditeur affichée)
- Si les variables manquent en développement : log console + pas d'envoi (graceful degradation)

---

## Acceptance Criteria

- [ ] AC-1 : `sendEmail({ to, subject, html, replyTo? })` envoie un email via SMTP Hostinger
- [ ] AC-2 : Le `from` est toujours `EMAIL_FROM` (jamais un alias)
- [ ] AC-3 : Si `EMAIL_HOST` est absent, la fonction log un warning et retourne sans erreur (pas de crash)
- [ ] AC-4 : Un template HTML de base (`renderEmailBase(content, title)`) encapsule le contenu dans un layout responsive
- [ ] AC-5 : Le layout email contient : logo TrackMyCash, zone de contenu, footer avec "© TrackMyCash"
- [ ] AC-6 : La fonction `sendEmail` retourne `{ success: boolean; error?: string }` (jamais throw en prod)

---

## Fichiers à créer / modifier

| Fichier | Action |
|---------|--------|
| `src/lib/email.ts` | Créer — singleton Nodemailer + sendEmail + renderEmailBase |
| `.env.example` | Modifier — ajouter les variables EMAIL_* |
| `package.json` | Modifier — ajouter `nodemailer` + `@types/nodemailer` |

---

## Implémentation clé

```typescript
// src/lib/email.ts
import nodemailer from "nodemailer";

export async function sendEmail({
  to,
  subject,
  html,
  replyTo,
}: {
  to: string;
  subject: string;
  html: string;
  replyTo?: string;
}): Promise<{ success: boolean; error?: string }> {
  if (!process.env.EMAIL_HOST || !process.env.EMAIL_USER) {
    console.warn("[email] Variables EMAIL_* manquantes — email non envoyé");
    return { success: false, error: "Email non configuré" };
  }
  try {
    const transporter = nodemailer.createTransport({ ... });
    await transporter.sendMail({ from: process.env.EMAIL_FROM, to, subject, html, replyTo });
    return { success: true };
  } catch (err) {
    console.error("[email] Erreur envoi :", err);
    return { success: false, error: String(err) };
  }
}

export function renderEmailBase(title: string, bodyHtml: string): string {
  return `<!DOCTYPE html><html>...${title}...${bodyHtml}...</html>`;
}
```

---

## Tests unitaires

### TU-1 : sendEmail — graceful degradation
**Fichier :** `tests/unit/email/email.test.ts`

```
TU-1-1 : Si EMAIL_HOST absent → retourne { success: false } sans throw
TU-1-2 : Si EMAIL_USER absent → retourne { success: false } sans throw
TU-1-3 : Si transporter.sendMail échoue → retourne { success: false, error: "..." }
```

### TU-2 : renderEmailBase — structure HTML
**Fichier :** `tests/unit/email/email.test.ts`

```
TU-2-1 : renderEmailBase contient le titre passé en param
TU-2-2 : renderEmailBase contient le bodyHtml passé en param
TU-2-3 : renderEmailBase contient "TrackMyCash" (branding)
TU-2-4 : renderEmailBase retourne un string qui commence par "<!DOCTYPE html>"
```

---

## Fixtures / données de test

```typescript
// Mock nodemailer pour les tests
vi.mock("nodemailer", () => ({
  default: {
    createTransport: vi.fn(() => ({
      sendMail: vi.fn().mockResolvedValue({ messageId: "test-id" }),
    })),
  },
}));
```

---

## Estimation

**Points :** 3
**Durée estimée :** 2h
