# STORY-100 — Onboarding couple-first post-inscription

**Sprint :** v14 — Couple-First Onboarding  
**Priorité :** P1  
**Complexité :** M (3 points)  
**Epic :** couple-activation

---

## Objectif

Dès la 1ère visite sur /dashboard (0 compte, pas de couple), montrer un wizard de choix "En couple" / "Seul(e)" AVANT l'onboarding classique. Pousser les utilisateurs à inviter leur partenaire dès le début.

---

## Acceptance Criteria

- **AC-1** : Un composant `CoupleChoiceModal` s'affiche en Dialog au premier lancement (`showOnboarding=true` ET pas de `coupleOnboardingChoice`)
- **AC-2** : Carte "En couple" → appelle `setOnboardingChoiceAction('couple')` + crée automatiquement un couple → affiche le code d'invitation
- **AC-3** : Carte "Seul(e)" → appelle `setOnboardingChoiceAction('solo')` → ferme la modal
- **AC-4** : Code d'invitation affiché avec bouton "Copier" et bouton "Partager" (Web Share API)
- **AC-5** : La modal ne réapparaît pas une fois `onboarding_choice` défini (persisté en DB)
- **AC-6** : Server action `setOnboardingChoiceAction(choice: 'couple' | 'solo')` → UPDATE user SET onboarding_choice=?

---

## Implémentation

### DB Migrations (per-user settings table)
Stockage de `onboarding_choice` dans la per-user DB via `settings` table (clé `onboarding_choice`).

### Nouvelles fonctions dans `src/lib/couple-queries.ts`
- `getOnboardingChoice(db, userId): Promise<string | null>` — lit `onboarding_choice` dans settings

### Nouvelle action dans `src/app/actions/couple-actions.ts`
- `setOnboardingChoiceAction(choice: 'couple' | 'solo'): Promise<void>`

### Nouveau composant `src/components/couple-choice-modal.tsx`
- Dialog shadcn avec 2 cartes cliquables
- Carte "En couple" : icône favorite, texte "Gérez vos finances ensemble"
- Carte "Seul(e)" : icône person, texte "Continuez en solo"
- Après choix "couple" : affiche code invite + bouton Copier

### Intégration dans `src/app/[locale]/(app)/dashboard/page.tsx`
- Afficher CoupleChoiceModal si `!onboardingChoice && accounts.length === 0`

---

## Tests

### `tests/unit/lib/couple-onboarding-choice.test.ts`
- TU-100-1 : `getOnboardingChoice` retourne `null` si ligne absente
- TU-100-2 : `getOnboardingChoice` retourne `'couple'` si SET
- TU-100-3 : `getOnboardingChoice` retourne `'solo'` si SET
- TU-100-4 : `setOnboardingChoiceAction` appelle UPDATE/INSERT settings (mock via vi.mock)

### `tests/unit/components/couple-choice-modal.test.tsx`
- TU-100-5 : affiche 2 cartes (En couple + Seul(e)) par défaut
- TU-100-6 : les 2 cartes sont des boutons cliquables
- TU-100-7 : prop `inviteCode` → affiche le code

---

## Notes techniques

- Pattern identique à `getOnboardingStatus` (STORY-093) mais dans la per-user DB
- La modal s'affiche uniquement si `accounts.length === 0` (premier lancement)
- `createCoupleAction` existant réutilisé pour créer le couple automatiquement
