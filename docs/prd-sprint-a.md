# PRD — Sprint A : UX & Stabilité (v3.0)

**Version :** 3.0
**Date :** 2026-02-21
**Statut :** Planifié
**Périmètre :** Activation, polish UX, dette technique, rétention

---

## Contexte

Deux sprints livrés (18 stories, 156 tests, QA PASS). Le produit est techniquement prêt et déployé sur Vercel.

**Problème actuel :** Le tunnel d'activation est cassé. Un nouvel utilisateur arrive après inscription sur un dashboard **vide, sans guidance**. Il n'y a ni page d'erreur professionnelle, ni onboarding, ni empty states — le taux de churn à J+1 est maximal.

**Objectif de ce sprint :** Transformer le taux d'activation en corrigeant l'expérience post-inscription et en comblant les lacunes UX qui donnent une impression d'inachevé.

---

## Ordre d'implémentation recommandé

```
STORY-019 → Fix ESLint          (30min, zéro risque)
STORY-020 → Pages d'erreur      (professionnalisme)
STORY-021 → Empty states        (fondation onboarding)
STORY-022 → Onboarding wizard   (impact activation)
STORY-023 → Skeleton screens    (polish perçu)
STORY-024 → Alerte budget 80%   (rétention)
```

---

## Stories

### STORY-019 : Fix ESLint set-state-in-effect

**Priorité :** P0 (dette technique bloquante)
**Complexité :** XS / 1 point

**Contexte :**
3 erreurs ESLint `react-hooks/set-state-in-effect` dans des composants pré-existants :
- `src/components/edit-account-dialog.tsx` (ligne 32)
- `src/components/edit-recurring-dialog.tsx` (ligne 46)
- `src/components/edit-transaction-dialog.tsx` (ligne 46)

Pattern problématique : `setOpen(false)` appelé directement dans `useEffect`, ce qui provoque des cascades de renders.

**Fix attendu :** Envelopper dans `startTransition` ou déplacer hors de l'effet en utilisant `useEffect` avec une condition sur l'état de l'action (`isPending`).

**Acceptance Criteria :**
- AC-1 : `npm run lint` retourne 0 erreurs (les warnings de tests existants sont acceptables)
- AC-2 : Les dialogs continuent de se fermer correctement après une action réussie
- AC-3 : Les tests existants passent toujours

---

### STORY-020 : Pages d'erreur (404, 500, error.tsx)

**Priorité :** P0
**Complexité :** S / 2 points

**Contexte :**
Aucune page d'erreur personnalisée. Next.js affiche ses pages génériques (peu professionnelles). Une 404 ou erreur serveur donne une mauvaise première impression.

**Fichiers à créer :**
- `src/app/[locale]/not-found.tsx` — Page 404 avec lien retour
- `src/app/[locale]/error.tsx` — Boundary d'erreur avec bouton "Réessayer"
- `src/app/not-found.tsx` — Fallback global (hors locale)

**Acceptance Criteria :**
- AC-1 : `/une-url-inexistante` retourne la page 404 personnalisée
- AC-2 : La page 404 contient un lien vers `/` et un vers le dashboard
- AC-3 : `error.tsx` implémente l'interface `{ error, reset }` de Next.js
- AC-4 : Le bouton "Réessayer" appelle `reset()`
- AC-5 : Les pages utilisent le layout marketing (pas le layout app)
- AC-6 : Les textes sont traduits via `useTranslations` / `getTranslations`

---

### STORY-021 : Empty states avec guidance contextuelle

**Priorité :** P1
**Complexité :** S / 3 points

**Contexte :**
Quand un nouvel utilisateur crée son compte, il voit des listes vides sans aucun appel à l'action. L'utilisateur ne sait pas quoi faire ensuite. Chaque page doit afficher un empty state engageant.

**Pages concernées :**
- Dashboard (aucun compte) — CTA "Créer mon premier compte"
- `/comptes` (aucun compte) — idem
- `/transactions` (aucune transaction) — CTA "Importer un relevé"
- `/recurrents` (aucun récurrent) — CTA "Ajouter un paiement récurrent"
- `/previsions` (aucun récurrent) — Message explicatif

**Acceptance Criteria :**
- AC-1 : Chaque page vide affiche une illustration/icône + titre + description + CTA
- AC-2 : Le CTA pointe vers l'action naturelle suivante (créer compte, importer, etc.)
- AC-3 : Composant `EmptyState` réutilisable créé dans `src/components/ui/`
- AC-4 : Les textes passent par les traductions existantes ou nouvelles clés i18n
- AC-5 : Mobile-first, cohérent avec le design system shadcn/ui

---

### STORY-022 : Onboarding first-time (wizard post-inscription)

**Priorité :** P1
**Complexité :** M / 5 points

**Contexte :**
Aucun onboarding. Un nouvel inscrit arrive sur le dashboard et ne sait pas quoi faire. Cette story est la plus impactante du sprint pour le taux d'activation.

**Flow proposé (3 étapes) :**
1. **Bienvenue** — "Créez votre premier compte bancaire" (nom, devise, solde initial)
2. **Import** — "Importez votre premier relevé" (optionnel, bouton "Passer")
3. **Terminé** — "Votre espace est prêt !" + CTA dashboard

**Mécanisme :** Vérification via setting `onboarding_completed` (table `settings`). Si absent → afficher le wizard. Une fois terminé → sauvegarder le setting.

**Fichiers à créer/modifier :**
- `src/components/onboarding-wizard.tsx` — Wizard en dialog ou page dédiée
- `src/app/[locale]/(app)/dashboard/page.tsx` — Vérifier le setting et afficher le wizard
- `src/app/actions/onboarding-actions.ts` — `completeOnboardingAction()`

**Acceptance Criteria :**
- AC-1 : Le wizard s'affiche automatiquement au premier accès au dashboard
- AC-2 : Le wizard ne s'affiche plus après completion (`onboarding_completed = true`)
- AC-3 : L'étape 1 crée réellement le compte bancaire
- AC-4 : L'étape 2 (import) est optionnel — bouton "Passer" disponible
- AC-5 : L'utilisateur peut fermer le wizard à tout moment (sans le bloquer)
- AC-6 : Mobile-friendly (dialog full-screen sur mobile)

---

### STORY-023 : Skeleton screens (loading states)

**Priorité :** P2
**Complexité :** S / 3 points

**Contexte :**
Les pages chargent leurs données côté serveur (Server Components). Entre la navigation et l'affichage, l'écran est blanc. Next.js `loading.tsx` permet d'afficher des squelettes pendant le streaming.

**Fichiers à créer :**
- `src/app/[locale]/(app)/dashboard/loading.tsx`
- `src/app/[locale]/(app)/transactions/loading.tsx`
- `src/app/[locale]/(app)/comptes/loading.tsx`
- `src/components/ui/skeleton-card.tsx` — Composant réutilisable

**Acceptance Criteria :**
- AC-1 : Un skeleton s'affiche pendant le chargement du dashboard
- AC-2 : Un skeleton s'affiche pendant le chargement des transactions
- AC-3 : Le composant `Skeleton` de shadcn/ui est utilisé (déjà disponible)
- AC-4 : Les skeletons reproduisent approximativement la structure de la page chargée
- AC-5 : Pas de flash de contenu vide (le skeleton est visible immédiatement)

---

### STORY-024 : Alerte email budget (seuil 80%)

**Priorité :** P2
**Complexité :** S / 3 points

**Contexte :**
Les budgets par catégorie sont définis (STORY-017). Mais aucune alerte n'est envoyée quand l'utilisateur approche de la limite. L'utilisateur découvre le dépassement trop tard.

**Règles métier :**
- Envoi quand `spent / limit >= 0.80` (80% atteint) ET `spent / limit < 1.00`
- Envoi quand `spent / limit >= 1.00` (dépassement) — email différent
- Anti-spam : 1 alerte par budget par période (stocker `last_alert_sent_at` dans `budgets`)
- Déclencheur : après chaque `createTransactionAction` (comme l'alerte solde bas)

**Acceptance Criteria :**
- AC-1 : Email envoyé quand un budget atteint 80% dans la période courante
- AC-2 : Email différent (sujet + corps) pour le dépassement (>100%)
- AC-3 : Anti-spam : pas de double envoi pour le même seuil dans la même période
- AC-4 : Si `sendEmail` échoue → l'action principale réussit quand même
- AC-5 : Colonne `last_budget_alert_at` ajoutée à la table `budgets` via migration
- AC-6 : Template email affiche : catégorie, dépensé, limite, pourcentage

---

## Critères de succès global

- [ ] `npm run lint` : 0 erreurs
- [ ] Une URL invalide affiche une belle page 404
- [ ] Un nouvel inscrit voit le wizard d'onboarding et peut créer son compte
- [ ] Chaque page vide guide l'utilisateur vers la prochaine action
- [ ] Les transitions de navigation affichent des skeletons
- [ ] Un email est envoyé quand un budget atteint 80% ou est dépassé
- [ ] `npm test` : tous les tests passent, couverture > 80%

---

## Hors scope

- Onboarding vidéo ou tutoriel interactif
- Tour guidé avec highlights (type Shepherd.js)
- Notifications in-app (toasts persistants)
- Dashboard analytics admin
- Tests E2E Playwright

---

*PRD généré par FORGE PM Agent — 2026-02-21*
