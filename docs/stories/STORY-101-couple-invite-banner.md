# STORY-101 — Bannière persistante invitation partenaire

**Sprint :** v14 — Couple-First Onboarding
**Priorité :** P1
**Complexité :** S (2 points)
**Epic :** couple-activation

---

## Objectif

Afficher une bannière persistante et non-dismissable sur TOUTES les pages de l'app quand l'utilisateur a choisi `onboarding_choice='couple'` mais que son couple n'a qu'un seul membre actif (partenaire pas encore rejoint).

---

## Acceptance Criteria

- **AC-1** : La bannière est visible sur toutes les pages `/(app)/*` quand `onboarding_choice='couple'` ET `activeMemberCount < 2`
- **AC-2** : La bannière affiche le code d'invitation et un lien vers `/{locale}/couple`
- **AC-3** : La bannière disparaît automatiquement quand un partenaire rejoint (2 membres actifs)
- **AC-4** : La bannière est non-dismissable (aucun bouton de fermeture)
- **AC-5** : Intégrée dans `src/app/[locale]/(app)/layout.tsx` (une seule fois, pour toutes les pages)

---

## Implémentation

### Nouveau composant `src/components/couple-invite-banner.tsx`

- Server Component (pas de `"use client"`)
- Props : `inviteCode: string`, `locale: string`
- `role="banner"` pour l'accessibilité
- Bande `bg-primary/10`, icône `favorite`, code en gras + tracking-wider
- Lien `/{locale}/couple`

### Intégration dans `src/app/[locale]/(app)/layout.tsx`

Logique :
```typescript
const showInviteBanner =
  onboardingChoice === "couple" && (couple === null || activeMemberCount < 2);
```

Rendu :
```tsx
{showInviteBanner && couple && (
  <CoupleInviteBanner inviteCode={couple.invite_code} locale={locale} />
)}
```

---

## Tests

### `tests/unit/components/couple-invite-banner.test.tsx`
- TU-101-1 : affiche le code d'invitation
- TU-101-2 : lien href vers `/{locale}/couple`
- TU-101-3 : pas de bouton de fermeture

### Tests QA dans `tests/unit/components/couple-hub-qa.test.tsx`
- QA-101-1 : aucun bouton (container scope)
- QA-101-1b : pas d'aria-label fermer/close
- QA-101-2 : code visible en texte
- QA-101-2b : code en gras/tracking
- QA-101-1c : role=banner présent
- QA-101-AC3 : showInviteBanner=false si 2 membres actifs
- QA-101-AC3b : showInviteBanner=true si 1 membre
- QA-101-AC1 : showInviteBanner=false si choice='solo'
- QA-101-AC1b : showInviteBanner=false si choice=null
