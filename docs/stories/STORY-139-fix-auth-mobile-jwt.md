# STORY-139 : Corriger l'auth mobile — utiliser les routes JWT

**Sprint :** v18 — Parité Web/Mobile
**Priorité :** P0 (CRITIQUE)
**Complexité :** S (3 pts)
**Epic :** auth-parite
**Bloqué par :** —

---

## Contexte

Le fichier `auth-client.ts` du projet mobile appelle directement `/api/auth/sign-in/email` et `/api/auth/sign-up/email` (routes Better-Auth). Ces routes retournent un cookie de session (conçu pour le web), pas un JWT. Le mobile attend un JWT stocké dans `expo-secure-store`.

Les routes `/api/mobile/auth/login` et `/api/mobile/auth/register` existent déjà côté backend et retournent correctement `{ user, token }` avec un JWT signé.

## Description

Modifier `auth-client.ts` dans le projet mobile pour utiliser les routes `/api/mobile/auth/*` au lieu des routes Better-Auth directes.

## Fichiers impactés

**Projet mobile (track-my-cash-mobile) :**
- `src/lib/auth/auth-client.ts` — Corriger les URLs login et register

**Projet web (track-my-cash) :**
- Aucune modification

## Acceptance Criteria

### AC-1 : Login utilise `/api/mobile/auth/login`

```gherkin
Given le fichier auth-client.ts est modifié
When login(email, password) est appelée
Then la requête est envoyée à /api/mobile/auth/login (pas /api/auth/sign-in/email)
And la réponse contient { user, token }
And le token JWT est stocké dans expo-secure-store
```

### AC-2 : Register utilise `/api/mobile/auth/register`

```gherkin
Given le fichier auth-client.ts est modifié
When register(email, password, name) est appelée
Then la requête est envoyée à /api/mobile/auth/register (pas /api/auth/sign-up/email)
And la réponse contient { user, token, isNewUser: true }
And le token JWT est stocké dans expo-secure-store
```

### AC-3 : Gestion des erreurs cohérente

```gherkin
Given le backend retourne une erreur 409 (email déjà pris)
When register() est appelée
Then l'erreur est propagée avec le message "Un compte avec cet email existe déjà"

Given le backend retourne une erreur 401 (identifiants invalides)
When login() est appelée
Then l'erreur est propagée avec le message "Identifiants invalides"
```

### AC-4 : Pas de régression logout

```gherkin
Given logout() est appelée
When le JWT est supprimé de SecureStore
Then le auth store est vidé
And l'utilisateur est redirigé vers /auth/login
```

## Spécifications de tests

### Tests unitaires

**Fichier :** `tests/unit/auth-client.test.ts`

| ID | Test | Assertion |
|----|------|-----------|
| TU-1 | login() appelle /api/mobile/auth/login | URL fetch contient `/api/mobile/auth/login` |
| TU-2 | login() stocke le JWT dans SecureStore | `SecureStore.setItemAsync` appelé avec le token |
| TU-3 | login() met à jour le auth store | `useAuthStore.getState().setAuth` appelé |
| TU-4 | login() propage les erreurs 401 | throw Error avec message |
| TU-5 | register() appelle /api/mobile/auth/register | URL fetch contient `/api/mobile/auth/register` |
| TU-6 | register() gère l'erreur 409 | throw Error "email existe déjà" |
| TU-7 | logout() supprime le JWT | `SecureStore.deleteItemAsync` appelé avec 'jwt' |

### Mapping AC → Tests fonctionnels

| AC | Tests |
|----|-------|
| AC-1 | TU-1, TU-2, TU-3 |
| AC-2 | TU-5, TU-6 |
| AC-3 | TU-4, TU-6 |
| AC-4 | TU-7 |

### Fixtures

- Mock `fetch` avec réponses JSON simulées
- Mock `expo-secure-store` (setItemAsync, deleteItemAsync, getItemAsync)
- Mock `useAuthStore`
