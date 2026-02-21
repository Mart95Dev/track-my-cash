# STORY-022 — Onboarding first-time (wizard post-inscription)

**Epic :** UX & Stabilité
**Priorité :** P1
**Complexité :** M
**Statut :** pending
**Bloquée par :** STORY-021

## User Story

En tant que nouvel utilisateur venant de créer mon compte, je veux être guidé par un wizard simple en 2-3 étapes, afin de configurer mon premier compte bancaire et comprendre comment utiliser TrackMyCash.

## Contexte technique

- La table `settings` (clé/valeur) existe déjà — stocker `onboarding_completed = "true"`
- Le dashboard est le point d'entrée après inscription
- Le wizard doit être un `Dialog` plein écran sur mobile, centré sur desktop
- Chaque étape utilise les Server Actions existantes (ex: `createAccountAction`)

## Flow du wizard (3 étapes)

**Étape 1 — Bienvenue + Créer un compte**
- Champs : nom du compte (ex: "Compte courant"), devise (select), solde initial
- Bouton : "Créer mon compte →"
- Action : appelle `createAccountAction` existant

**Étape 2 — Importer un relevé (optionnel)**
- Message : "Importez vos transactions depuis votre banque"
- Bouton principal : "Importer un relevé" (ouvre l'import)
- Bouton secondaire : "Passer cette étape →"

**Étape 3 — Terminé !**
- Message de félicitations
- Résumé de ce que l'utilisateur peut faire
- CTA : "Accéder à mon tableau de bord →"
- Action : `completeOnboardingAction()` → setting `onboarding_completed = "true"`

## Mécanisme de détection

Dans `dashboard/page.tsx` :
```tsx
const onboardingCompleted = await getSetting(db, "onboarding_completed");
if (!onboardingCompleted) {
  // Passer `showOnboarding={true}` au composant client
}
```

## Fichiers à créer / modifier

- `src/components/onboarding-wizard.tsx` — Wizard (client component, Dialog multi-étapes)
- `src/app/actions/onboarding-actions.ts` — `completeOnboardingAction()`
- `src/app/[locale]/(app)/dashboard/page.tsx` — Détecter et passer le prop `showOnboarding`

## Acceptance Criteria

- AC-1 : Le wizard s'affiche automatiquement si `onboarding_completed` est absent/null
- AC-2 : Après fermeture ou complétion, le wizard ne s'affiche plus (setting persisté)
- AC-3 : L'étape 1 crée réellement le compte via `createAccountAction`
- AC-4 : L'étape 2 a un bouton "Passer" qui avance à l'étape 3 sans import
- AC-5 : L'utilisateur peut fermer le wizard avec la croix (sans bloquer l'accès au dashboard)
- AC-6 : Sur mobile, le Dialog occupe 90% de la hauteur d'écran
- AC-7 : Le wizard ne s'affiche pas si l'utilisateur a déjà des comptes (double sécurité)

## Tests à créer

`tests/unit/components/onboarding-wizard.test.tsx` (5 tests) :
- TU-1-1 : Le wizard affiche l'étape 1 par défaut
- TU-1-2 : Cliquer "Passer" à l'étape 2 avance à l'étape 3
- TU-1-3 : L'indicateur d'étapes (1/3, 2/3, 3/3) est affiché
- TU-1-4 : Le bouton de fermeture est présent
- TU-1-5 : L'étape 3 affiche le message de félicitations

## Estimation : 5 points / 3-4h
