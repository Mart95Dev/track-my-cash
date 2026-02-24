# STORY-092 — Landing page + tarifs pivot marketing couple

**Epic** : marketing-ui
**Priorité** : P3
**Complexité** : S (2 points)
**Dépendances** : aucune (contenu statique)

---

## Description

Pivoter le copywriting de la landing page et de la page tarifs vers la niche couple.
L'objectif est d'adresser directement les couples qui cherchent un outil de gestion budgétaire partagée.

---

## Acceptance Criteria

- **AC-1** : Le hero de la landing page affiche "Vos finances de couple, enfin maîtrisées" (ou variante avec "couple")
- **AC-2** : La landing page présente 3 features centrées couple : comptes partagés, balance équitable, objectifs & IA
- **AC-3** : La section "Comment ça marche" montre les étapes couple : Créer → Inviter partenaire → Analyser ensemble
- **AC-4** : La landing page affiche 2 témoignages couple illustratifs
- **AC-5** : `PLANS.pro.features` contient une feature mentionnant "couple" ou "partenaire"
- **AC-6** : `PLANS.premium.features` contient une feature "IA couple" ou "IA conseiller couple"
- **AC-7** : La page tarifs affiche un badge "Idéal en couple" sur la card Pro
- **AC-8** : La table de comparaison tarifs contient des lignes couple (Partage couple, IA couple)

---

## Test Cases

| ID | Description | Type |
|----|-------------|------|
| TU-92-1 | FEATURES[0].title contient "couple" ou "commun" | Unit |
| TU-92-2 | FEATURES a exactement 3 éléments | Unit |
| TU-92-3 | STEPS contient une étape mentionnant "partenaire" | Unit |
| TU-92-4 | TESTIMONIALS a 2 éléments avec auteur et texte | Unit |
| TU-92-5 | PLANS.pro.features contient "couple" ou "partenaire" | Unit |
| TU-92-6 | PLANS.premium.features contient "couple" ou "IA couple" | Unit |
| TU-92-7 | COMPARISON_FEATURES contient une ligne "Partage couple" | Unit |
| TU-92-8 | COMPARISON_FEATURES contient une ligne "IA couple" | Unit |

---

## Fichiers modifiés

- `src/lib/stripe-plans.ts` — features Pro + Premium couple
- `src/app/[locale]/(marketing)/page.tsx` — hero couple + features + steps + témoignages
- `src/app/[locale]/(marketing)/tarifs/page.tsx` — badge "Idéal en couple" + lignes couple
