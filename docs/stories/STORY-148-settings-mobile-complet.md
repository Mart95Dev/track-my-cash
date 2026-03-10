# STORY-148 : Écran paramètres mobile complet (parité web)

**Sprint :** v18 — Parité Web/Mobile
**Priorité :** P2
**Complexité :** M (5 pts)
**Epic :** parite-ecrans
**Bloqué par :** STORY-145, STORY-142

---

## Contexte

L'écran paramètres mobile est basique (export, weekly report, AI quota, suppression compte). Le web offre beaucoup plus : thème, devise de référence, préférences email, gestion des règles de catégorisation, 2FA.

## Description

Enrichir l'écran settings mobile pour atteindre la parité fonctionnelle avec le web.

## Fichiers impactés

**Projet mobile (track-my-cash-mobile) :**
- `app/(tabs)/settings.tsx` — enrichir les sections
- `src/components/settings/ThemeSelector.tsx` — déjà existant, connecter à l'API
- `src/components/settings/CurrencySelector.tsx` (NOUVEAU) — sélection devise de référence
- `src/components/settings/EmailPreferences.tsx` (NOUVEAU) — toggle préférences email
- `src/components/settings/CategorizationRulesSection.tsx` (NOUVEAU) — gestion des règles
- `src/lib/api/settings.ts` (NOUVEAU) — client API settings

## Acceptance Criteria

### AC-1 : Section Apparence

```gherkin
Given l'utilisateur est sur /parametres
When il change le thème (clair/sombre/auto)
Then le thème est sauvegardé via PUT /api/mobile/settings
And le thème est appliqué immédiatement (NativeWind)
```

### AC-2 : Section Devise de référence

```gherkin
Given l'utilisateur est sur /parametres
When il sélectionne EUR, USD, GBP, MGA, etc.
Then la devise est sauvegardée via PUT /api/mobile/settings { key: "reference_currency", value: "EUR" }
And le dashboard recalcule les totaux
```

### AC-3 : Section Préférences email

```gherkin
Given l'utilisateur est sur /parametres
When il toggle "Récap hebdomadaire" ou "Alertes budget"
Then la préférence est sauvegardée via PUT /api/mobile/settings
```

### AC-4 : Section Règles de catégorisation

```gherkin
Given l'utilisateur est sur /parametres
When il ouvre la section "Catégorisation automatique"
Then la liste des règles est chargée depuis GET /api/mobile/categorization-rules
And il peut ajouter/supprimer des règles
And les règles sont persistées côté serveur (pas local state)
```

### AC-5 : Section Sécurité (2FA)

```gherkin
Given l'utilisateur est sur /parametres
When la section Sécurité affiche l'état du 2FA
Then si 2FA activé : bouton "Désactiver"
Then si 2FA désactivé : bouton "Activer"
```

### AC-6 : Tous les settings chargés au mount

```gherkin
Given l'écran settings est monté
When useQuery('settings') se résout
Then tous les settings sont pré-remplis (thème, devise, préférences email)
```

## Spécifications de tests

**Fichier :** `tests/unit/settings-screen.test.tsx`

| ID | Test | Assertion |
|----|------|-----------|
| TU-1 | Affiche les sections | 5 sections visibles |
| TU-2 | ThemeSelector change le thème | PUT /api/mobile/settings appelé |
| TU-3 | CurrencySelector sauvegarde la devise | PUT settings appelé |
| TU-4 | EmailPreferences toggle fonctionne | PUT settings appelé |
| TU-5 | CategorizationRules liste les règles | GET categorization-rules appelé |
| TU-6 | Ajout de règle | POST categorization-rules appelé |
| TU-7 | Suppression de règle | DELETE categorization-rules/[id] appelé |
| TU-8 | Section 2FA affiche le bon état | Bouton Activer/Désactiver selon l'état |
