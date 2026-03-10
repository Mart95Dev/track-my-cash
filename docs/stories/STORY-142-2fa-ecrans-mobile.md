# STORY-142 : Écrans 2FA TOTP dans l'app mobile

**Sprint :** v18 — Parité Web/Mobile
**Priorité :** P1
**Complexité :** M (5 pts)
**Epic :** auth-parite
**Bloqué par :** STORY-141

---

## Contexte

Les routes API 2FA sont créées (STORY-141). Il faut maintenant les écrans mobile pour :
1. Écran de vérification du code TOTP lors de la connexion
2. Écran d'activation du 2FA dans les paramètres (QR code + backup codes)
3. Désactivation du 2FA dans les paramètres

## Fichiers impactés

**Projet mobile (track-my-cash-mobile) :**
- `app/auth/two-factor.tsx` (NOUVEAU) — écran saisie code TOTP après login
- `src/components/settings/TwoFactorSetup.tsx` (NOUVEAU) — setup 2FA dans paramètres
- `src/components/settings/TwoFactorDisable.tsx` (NOUVEAU) — désactivation 2FA
- `src/lib/api/auth.ts` ou `src/lib/auth/auth-client.ts` — ajouter fonctions 2FA
- `app/(tabs)/settings.tsx` — ajouter section Sécurité 2FA
- `app/auth/login.tsx` — gérer la réponse `requires2FA`
- `src/lib/auth/auth-client.ts` — adapter login() pour le flow 2FA

## Acceptance Criteria

### AC-1 : Écran de vérification TOTP à la connexion

```gherkin
Given l'utilisateur a le 2FA activé
When il saisit email + password corrects sur l'écran login
Then il est redirigé vers app/auth/two-factor
And l'écran affiche un champ de saisie de 6 chiffres
And un lien "Utiliser un code de récupération" est visible
```

### AC-2 : Saisie du code TOTP

```gherkin
Given l'écran two-factor est affiché
When l'utilisateur saisit un code à 6 chiffres valide
Then POST /api/mobile/auth/2fa/verify est appelé avec le tempToken
And le JWT est stocké dans SecureStore
And l'utilisateur est redirigé vers le dashboard
```

### AC-3 : Code de récupération

```gherkin
Given l'utilisateur clique sur "Utiliser un code de récupération"
When il saisit un backup code (format XXXX-XXXX)
Then POST /api/mobile/auth/2fa/verify est appelé avec backupCode
And la connexion aboutit
```

### AC-4 : Setup 2FA dans les paramètres

```gherkin
Given l'utilisateur est sur /parametres
When il clique sur "Activer l'authentification à deux facteurs"
Then POST /api/mobile/auth/2fa/enable est appelé
And un QR code est affiché (image data URL)
And les 8 codes de récupération sont affichés avec bouton "Copier"
And un champ de confirmation demande un code TOTP pour finaliser
```

### AC-5 : Désactivation 2FA

```gherkin
Given le 2FA est activé
When l'utilisateur clique sur "Désactiver le 2FA" dans les paramètres
Then un modal demande le code TOTP actuel
And si le code est valide, le 2FA est désactivé
And un message de confirmation s'affiche
```

### AC-6 : Textes traduits (5 langues)

```gherkin
Given les messages i18n sont ajoutés
When l'écran est affiché en anglais/espagnol/italien/allemand
Then tous les textes sont traduits
```

## Spécifications de tests

### Tests unitaires

**Fichier :** `tests/unit/two-factor-screen.test.tsx`

| ID | Test | Assertion |
|----|------|-----------|
| TU-1 | Écran two-factor affiche le champ 6 chiffres | Input visible, maxLength=6 |
| TU-2 | Soumission appelle verify endpoint | fetch appelé avec /2fa/verify |
| TU-3 | Code invalide affiche message d'erreur | Message d'erreur visible |
| TU-4 | Lien backup code affiche le champ texte | Champ XXXX-XXXX visible |
| TU-5 | TwoFactorSetup affiche QR code | Image QR visible après enable |
| TU-6 | TwoFactorSetup affiche 8 backup codes | 8 codes rendus |
| TU-7 | Bouton Copier copie les codes | Clipboard.setString appelé |
| TU-8 | TwoFactorDisable demande le code actuel | Modal avec input visible |

### Mapping AC → Tests

| AC | Tests |
|----|-------|
| AC-1 | TU-1 |
| AC-2 | TU-2, TU-3 |
| AC-3 | TU-4 |
| AC-4 | TU-5, TU-6, TU-7 |
| AC-5 | TU-8 |
