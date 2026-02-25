# STORY-093 — Onboarding wizard couple post-inscription

**Sprint :** v13 — Activation & Rétention Couple
**Priorité :** P1 — MUST HAVE
**Complexité :** M
**Points :** 3
**Epic :** couple-activation
**Dépendances :** STORY-086 (createCoupleAction, joinCoupleAction)

---

## Description

Wizard 4 étapes affiché à la première connexion pour guider les nouveaux utilisateurs couple vers leurs premières actions. Drawer/modal non-bloquant skipable à tout moment. Le marqueur `onboarding_couple_completed` dans la per-user DB (table `settings`) contrôle l'affichage.

**Étapes :**
1. **Bienvenue** — "Gérez votre argent de couple ensemble" + bouton Commencer
2. **Créer ou rejoindre un couple** — Tabs "Créer" / "Rejoindre" (réutilise `CoupleCreateForm`/`CoupleJoinForm`)
3. **Inviter votre partenaire** — Affiche le code invite + bouton copier + lien WhatsApp
4. **Vos premières transactions** — CTA import + CTA transactions + bouton "Terminer"

**Déclenchement :** 1er accès `/dashboard` si `onboarding_couple_completed` absent ou `false` dans settings.

---

## Critères d'acceptation

| # | Critère |
|---|---------|
| AC-1 | Wizard affiché au chargement du dashboard si `onboarding_couple_completed !== "true"` |
| AC-2 | Step 2 permet de créer ou rejoindre un couple (onglets) |
| AC-3 | Step 3 affiche le code invite avec bouton "Copier le code" |
| AC-4 | Bouton "Passer" à chaque étape marque `onboarding_couple_completed = true` et ferme le wizard |
| AC-5 | Wizard ne réapparaît pas après complétion ou skip |
| AC-6 | Step 4 propose un lien vers `/transactions` et un bouton "Terminer" |

---

## Cas de tests unitaires

### `markOnboardingCompleteAction()` → `src/app/actions/couple-actions.ts`

| ID | Description | Résultat attendu |
|----|-------------|-----------------|
| TU-93-1 | Action inserts `onboarding_couple_completed=true` dans settings | Setting présent en DB |
| TU-93-2 | Action idempotente (appelée 2x) — aucune erreur | Toujours `true` |

### `getOnboardingStatus(db)` → `src/lib/couple-queries.ts`

| ID | Description | Résultat attendu |
|----|-------------|-----------------|
| TU-93-3 | Retourne `false` si setting absent | `false` |
| TU-93-4 | Retourne `true` si `onboarding_couple_completed=true` | `true` |

### `CoupleOnboardingWizard` component → `src/components/couple-onboarding-wizard.tsx`

| ID | Description | Résultat attendu |
|----|-------------|-----------------|
| TU-93-5 | Rend le step 1 "Bienvenue" par défaut | Texte "couple" visible |
| TU-93-6 | Clic "Suivant" avance au step 2 | Step 2 affiché |
| TU-93-7 | Clic "Passer" (step 1) appelle `markOnboardingCompleteAction` | Action appelée |
| TU-93-8 | Indicateur de progression affiche step courant / total | "1 / 4" ou pills |

---

## Mapping AC → Tests

| AC | Tests couvrants |
|----|----------------|
| AC-1 | TU-93-3, TU-93-5 |
| AC-2 | TU-93-6 |
| AC-3 | TU-93-8 (contenu step 3) |
| AC-4 | TU-93-7 |
| AC-5 | TU-93-4 |
| AC-6 | TU-93-6 (step 4) |

---

## Données de test / fixtures

```typescript
// settings per-user DB — absent = onboarding non complété
const settingsEmpty: Record<string, string> = {};
const settingsCompleted: Record<string, string> = { onboarding_couple_completed: "true" };

// mock couple existant pour step 3
const mockCouple = { id: "couple-1", invite_code: "ABC123", name: "Notre couple" };
```

---

## Fichiers à créer / modifier

| Fichier | Action |
|---------|--------|
| `src/components/couple-onboarding-wizard.tsx` | Créer — Client Component, 4 steps |
| `src/app/actions/couple-actions.ts` | Modifier — ajouter `markOnboardingCompleteAction` |
| `src/lib/couple-queries.ts` | Modifier — ajouter `getOnboardingStatus(db)` |
| `src/app/[locale]/(app)/dashboard/page.tsx` | Modifier — déclenchement conditionnel wizard |
| `tests/unit/components/couple-onboarding-wizard.test.tsx` | Créer |
| `tests/unit/lib/couple-onboarding.test.ts` | Créer |
