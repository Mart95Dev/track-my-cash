# Stories Index — track-my-cash

## Sprint Qualité & Finitions (v1.0) — TERMINÉ ✅

| ID | Titre | Priorité | Complexité | Statut | QA |
|----|-------|----------|------------|--------|----|
| STORY-001 | formatCurrency/formatDate : locale dynamique | P0 | S | ✅ completed | PASS |
| STORY-002 | Redirections Stripe : locale dynamique | P0 | XS | ✅ completed | PASS |
| STORY-003 | Dashboard : conversion multi-devises complète | P0 | S | ✅ completed | PASS |
| STORY-004 | UI Tags dans la page Transactions | P1 | M | ✅ completed | PASS |
| STORY-005 | Bouton Gérer mon abonnement (Stripe Portal) | P1 | S | ✅ completed | CONCERNS |
| STORY-006 | importAllData : restauration complète | P1 | XS | ✅ completed | PASS |
| STORY-007 | Webhook Stripe : utiliser getDb() | P1 | XS | ✅ completed | WAIVED |
| STORY-008 | checkDuplicates : WHERE IN (1 requête) | P2 | XS | ✅ completed | PASS |

---

## Sprint Growth & Qualité (v2.0) — TERMINÉ ✅

| ID | Titre | Priorité | Complexité | Statut | QA |
|----|-------|----------|------------|--------|----|
| STORY-009 | Navbar + Footer publics | P0 | S | ✅ completed | PASS |
| STORY-010 | Page d'accueil publique (Landing Page) | P0 | M | ✅ completed | PASS |
| STORY-011 | SEO meta tags + robots.txt + sitemap.xml | P0 | S | ✅ completed | PASS |
| STORY-012 | Service email Nodemailer/Hostinger | P1 | S | ✅ completed | PASS |
| STORY-013 | Email de bienvenue (post-inscription) | P1 | S | ✅ completed | PASS |
| STORY-014 | Alerte solde bas (email automatique) | P1 | S | ✅ completed | PASS |
| STORY-015 | Suppression de compte RGPD | P2 | M | ✅ completed | PASS |
| STORY-016 | Extension couverture tests (parsers) | P2 | M | ✅ completed | PASS |
| STORY-017 | Budgets par catégorie | P3 | L | ✅ completed | PASS |
| STORY-018 | Nouveau parser Crédit Agricole | P3 | S | ✅ completed | PASS |

---

## Sprint UX & Stabilité — TERMINÉ ✅

| ID | Titre | Priorité | Complexité | Statut | QA |
|----|-------|----------|------------|--------|----|
| STORY-019 | Règles de catégorisation automatique | P1 | M | ✅ completed | PASS |
| STORY-020 | Wizard d'onboarding post-inscription | P1 | S | ✅ completed | PASS |
| STORY-021 | Filtres avancés transactions | P2 | S | ✅ completed | PASS |
| STORY-022 | Empty states contextuels | P2 | XS | ✅ completed | PASS |
| STORY-023 | Clé API OpenRouter dans les paramètres | P2 | S | ✅ completed | PASS |
| STORY-024 | Alertes email dépassement budget | P2 | M | ✅ completed | PASS |

---

## Sprint Rétention & Technique — TERMINÉ ✅

| ID | Titre | Priorité | Complexité | Statut | QA |
|----|-------|----------|------------|--------|----|
| STORY-025 | Export CSV des transactions | P1 | XS | ✅ completed | PASS |
| STORY-026 | Récapitulatif email mensuel | P1 | M | ✅ completed | PASS |
| STORY-027 | Graphique tendances dépenses 6 mois | P2 | M | ✅ completed | PASS |
| STORY-028 | Widget taux d'épargne dashboard | P2 | S | ✅ completed | PASS |
| STORY-029 | En-têtes sécurité HTTP | P1 | XS | ✅ completed | PASS |
| STORY-030 | Rate limiting /api/chat | P1 | S | ✅ completed | PASS |
| STORY-031 | Tests server actions | P2 | M | ✅ completed | PASS |
| STORY-032 | Cache devises persisté en base | P2 | S | ✅ completed | PASS |

---

## Sprint Objectifs & Intelligence — TERMINÉ ✅

| ID | Titre | Priorité | Complexité | Statut | QA |
|----|-------|----------|------------|--------|----|
| STORY-033 | Objectifs d'épargne (Savings Goals) | P1 | M | ✅ completed | PASS |
| STORY-034 | Catégorisation auto des transactions par IA | P1 | M | ✅ completed | PASS |
| STORY-035 | PWA installable (manifest + install prompt) | P2 | S | ✅ completed | PASS |
| STORY-036 | Export rapport PDF mensuel | P2 | M | ✅ completed | PASS |
| STORY-037 | Centre de notifications in-app | P2 | S | ✅ completed | PASS |
| STORY-038 | Prévisions intelligentes (AI forecast) | P2 | M | ✅ completed | PASS |

---

## Sprint Compatibilité, IA & Analyse Avancée (v6) — TERMINÉ ✅

| ID | Titre | Priorité | Complexité | Statut | QA |
|----|-------|----------|------------|--------|----|
| STORY-039 | Parsers BNP Paribas + Société Générale + Caisse d'Épargne | P1 | M | ✅ completed | — |
| STORY-040 | Parser CSV générique avec mapping colonnes | P1 | M | ✅ completed | — |
| STORY-041 | Comparaisons Mois/Mois (MoM) dans le Dashboard | P1 | S | ✅ completed | — |
| STORY-042 | Détection automatique des paiements récurrents | P2 | M | ✅ completed | — |
| STORY-043 | Parsers N26 + Wise (marché EU) | P2 | S | ✅ completed | — |
| STORY-044 | Enrichissement contexte conseiller IA (objectifs + budgets) | P1 | S | ✅ completed | — |
| STORY-045 | Détection d'anomalies financières (push post-import) | P2 | M | ✅ completed | — |
| STORY-046 | Bilan annuel IA + export PDF (Pro/Premium) | P3 | M | ✅ completed | — |

### Métriques Sprint Compatibilité & IA

- **Stories complétées :** 8/8 ✅
- **Points total :** 22/22 ✅
- **Tests sprint :** 67 nouveaux tests (325 total, 0 échec)
- **Fichiers créés :** 17 nouveaux fichiers (lib + actions + components)
- **TypeScript :** 0 erreur (`npx tsc --noEmit`)

---

## Sprint Intelligence & UX IA (v7) — TERMINÉ ✅

| ID | Titre | Priorité | Complexité | Statut | QA |
|----|-------|----------|------------|--------|-------|
| STORY-047 | Score de santé financière (widget dashboard) | P1 | M | ✅ completed | PASS |
| STORY-048 | Questions suggérées dans le chat conseiller | P1 | S | ✅ completed | PASS |
| STORY-049 | Catégorisation IA automatique à l'import (option) | P1 | S | ✅ completed | PASS |
| STORY-050 | Tool calling — créer budgets/objectifs depuis le chat | P2 | M | ✅ completed | PASS |
| STORY-051 | Simulateur de scénarios "Et si..." dans les prévisions | P2 | M | ✅ completed | PASS |
| STORY-052 | Suggestions de budgets basées sur l'historique | P3 | S | ✅ completed | PASS |

### Métriques Sprint Intelligence & UX IA

- **Stories complétées :** 6/6 ✅
- **Points total :** 15/15 ✅
- **Tests sprint :** 50 nouveaux tests (375 total, 0 échec)
- **TypeScript :** 0 erreur

---

## Sprint Production SaaS & Croissance (v8) — TERMINÉ ✅

| ID | Titre | Priorité | Complexité | Statut | QA |
|----|-------|----------|------------|--------|-------|
| STORY-053 | Suivi utilisation IA (ai_usage + décompte UI) | P1 | S | ✅ completed | PASS |
| STORY-054 | Période d'essai 14j Pro à l'inscription | P1 | M | ✅ completed | PASS |
| STORY-055 | RGPD — Suppression automatique des comptes (J+25 + J+30) | P1 | M | ✅ completed | PASS |
| STORY-056 | Skeleton screens (loading states) | P2 | XS | ✅ completed | PASS |
| STORY-057 | Pages d'erreur 404/500 personnalisées | P2 | S | ✅ completed | PASS |
| STORY-058 | Parsers bancaires UK (HSBC + Monzo) | P2 | S | ✅ completed | PASS |
| STORY-059 | Conseiller IA multi-modèles parallèles (3 modèles + synthèse) | P2 | M | ✅ completed | PASS |
| STORY-060 | Bannière upgrade freemium + page tarifs enrichie | P1 | S | ✅ completed | PASS |

### Métriques Sprint Production SaaS & Croissance

- **Stories complétées :** 8/8 ✅
- **Points total :** 18/18 ✅
- **Tests sprint :** 54 nouveaux tests (429 total, 0 échec)
- **TypeScript :** 0 erreur — commit `cec9051`

---

## Sprint Conversion & Monétisation (v11) — TERMINÉ ✅

| ID | Titre | Priorité | Complexité | Statut | QA |
|----|-------|----------|------------|--------|-------|
| STORY-079 | Stripe Tax — TVA automatique | P1 | XS | ✅ completed | PASS |
| STORY-080 | Emails de rappel trial J-3 et J-1 | P1 | M | ✅ completed | PASS |
| STORY-081 | Modale urgence trial ≤ 3 jours | P1 | S | ✅ completed | PASS |
| STORY-082 | Modale upgrade contextuelle | P2 | M | ✅ completed | PASS |
| STORY-083 | Page succès post-paiement `/bienvenue` | P2 | S | ✅ completed | PASS |
| STORY-084 | Features bullets sur les cards /tarifs | P3 | XS | ✅ completed | PASS |

### Métriques Sprint Conversion & Monétisation

- **Stories complétées :** 6/6 ✅
- **Points total :** 12/12 ✅
- **Tests sprint :** 52 nouveaux tests (564 total, 0 échec)
- **TypeScript :** 0 erreur — commit `860d0fd`

---

## Sprint Design Stitch (v10) — TERMINÉ ✅

| ID | Titre | Priorité | Complexité | Statut | QA |
|----|-------|----------|------------|--------|-------|
| STORY-068 | Foundation — Design tokens Tailwind v4, Manrope, Material Symbols | P1 | S | ✅ completed | PASS |
| STORY-069 | BottomNav + Layout App refonte mobile-first | P1 | S | ✅ completed | PASS |
| STORY-070 | Pages Auth — Connexion, Inscription, Compte suspendu | P1 | M | ✅ completed | PASS |
| STORY-071 | Pages Marketing — Landing Page + Tarifs + Fonctionnalités | P1 | M | ✅ completed | PASS |
| STORY-072 | Dashboard — Refonte complète | P1 | L | ✅ completed | PASS |
| STORY-073 | Page Comptes — Refonte | P2 | M | ✅ completed | PASS |
| STORY-074 | Page Transactions — Refonte | P2 | M | ✅ completed | PASS |
| STORY-075 | Pages Récurrents + Prévisions — Refonte | P2 | M | ✅ completed | PASS |
| STORY-076 | Pages Budgets + Objectifs — Refonte | P2 | M | ✅ completed | PASS |
| STORY-077 | Page Conseiller IA — Refonte chat mobile | P3 | M | ✅ completed | PASS |
| STORY-078 | Page Paramètres — Refonte sections cards | P3 | M | ✅ completed | PASS |

### Métriques Sprint Design Stitch

- **Stories complétées :** 11/11 ✅
- **Points total :** 26/26 ✅
- **Tests sprint :** 0 nouveaux tests (sprint design-only) — 495 total, 0 échec
- **Régressions corrigées :** 7 tests + 3 lint errors

---

## Sprint Engagement & Analyse Avancée (v9) — TERMINÉ ✅


| ID | Titre | Priorité | Complexité | Statut | QA |
|----|-------|----------|------------|--------|-------|
| STORY-061 | Email récapitulatif hebdomadaire IA (Pro/Premium) | P1 | M | ✅ completed | PASS |
| STORY-062 | Création de récurrents via tool calling chat IA | P2 | S | ✅ completed | PASS |
| STORY-063 | Vue agrégée "Tous les comptes" (dashboard global) | P1 | M | ✅ completed | PASS |
| STORY-064 | Comparaison Année/Année (YoY) dans le dashboard | P2 | S | ✅ completed | PASS |
| STORY-065 | Export données personnelles (portabilité RGPD) | P1 | S | ✅ completed | PASS |
| STORY-066 | Notes et mémos sur les transactions | P2 | S | ✅ completed | PASS |
| STORY-067 | Parsers ING Direct + Boursorama (marché FR) | P3 | S | ✅ completed | PASS |

### Métriques Sprint Engagement & Analyse Avancée

- **Stories complétées :** 7/7 ✅
- **Points total :** 17/17 ✅
- **Tests sprint :** 66 nouveaux tests — 495 total, 0 échec
- **TypeScript :** 0 erreur

---

## Sprint Pivot Niche Couple (v12) — TERMINÉ ✅

| ID | Titre | Priorité | Complexité | Statut | QA |
|----|-------|----------|------------|--------|-----|
| STORY-085 | DB Migrations couple (Main DB + per-user ALTER TABLE) | P1 | XS | ✅ completed | PASS |
| STORY-086 | Système d'invitation couple | P1 | M | ✅ completed | PASS |
| STORY-087 | Transactions partagées + balance couple | P2 | M | ✅ completed | PASS |
| STORY-088 | Dashboard toggle Ma vue / Vue couple | P2 | M | ✅ completed | PASS |
| STORY-089 | Freemium gates couple (Pro/Premium) | P2 | S | ✅ completed | PASS |
| STORY-090 | Budgets & objectifs couple | P3 | M | ✅ completed | PASS |
| STORY-091 | Conseiller IA couple | P3 | M | ✅ completed | PASS |
| STORY-092 | Landing page + tarifs — pivot marketing couple | P3 | S | ✅ completed | PASS |

### Métriques Sprint Pivot Niche Couple

- **Stories complétées :** 8/8 ✅
- **Points total :** 20/20 ✅
- **Tests sprint :** 76 nouveaux tests — 643 total, 0 régression
- **TypeScript :** 0 erreur · Commit : `4a7de54`

---

## Sprint Couple-First Onboarding (v14) — TERMINÉ ✅

| ID | Titre | Priorité | Complexité | Statut | QA |
|----|-------|----------|------------|--------|-----|
| STORY-100 | Onboarding couple-first post-inscription (CoupleChoiceModal) | P1 | M | ✅ completed | PASS |
| STORY-101 | Bannière persistante invitation partenaire | P1 | S | ✅ completed | PASS |
| STORY-102 | Navigation onglet Couple (BottomNav) | P2 | S | ✅ completed | PASS |
| STORY-103 | Dashboard zones verrouillées couple | P2 | S | ✅ completed | PASS |
| STORY-104 | Emails de relance cron couple (J+1, J+3, J+7) | P2 | S | ✅ completed | PASS |
| STORY-105 | Barre de progression onboarding gamifiée | P2 | S | ✅ completed | PASS |
| STORY-106 | Page /couple hub central (3 états) | P3 | M | ✅ completed | PASS |

### Métriques Sprint Couple-First Onboarding

- **Stories complétées :** 7/7 ✅
- **Points total :** 16/16 ✅
- **Tests sprint :** 79 nouveaux tests QA — 911 total, 0 régression
- **TypeScript :** 0 erreur · Bug fix : double-write `setOnboardingChoiceAction` (cron emails)

---

## Sprint Activation & Rétention Couple (v13) — TERMINÉ ✅

| ID | Titre | Priorité | Complexité | Statut | QA |
|----|-------|----------|------------|--------|-----|
| STORY-093 | Onboarding wizard couple post-inscription | P1 | M | ✅ completed | PASS |
| STORY-094 | Dashboard /couple enrichi | P1 | M | ✅ completed | PASS |
| STORY-095 | Centre de notifications in-app | P2 | M | ✅ completed | PASS |
| STORY-096 | Email hebdo étendu — stats couple | P2 | S | ✅ completed | PASS |
| STORY-097 | Export PDF rapport mensuel (Pro/Premium) | P3 | M | ✅ completed | PASS |
| STORY-098 | Blog SEO couple — contenu statique | P3 | S | ✅ completed | PASS |
| STORY-099 | Catégories prédéfinies couple | P3 | XS | ✅ completed | PASS |

### Métriques Sprint Activation & Rétention Couple

- **Stories complétées :** 7/7 ✅
- **Points total :** 17/17 ✅
- **Tests sprint :** 125 nouveaux tests — 778 total, 0 régression
- **TypeScript :** 0 erreur

---

## Sprint Refonte UI/UX Stitch (v15) — 🚀 EN COURS

| ID | Titre | Priorité | Complexité | Statut | QA |
|----|-------|----------|------------|--------|-----|
| STORY-107 | Fondation Design System CSS Stitch v2 | P1 | XS | 🔲 pending | — |
| STORY-108 | Refonte Landing Page | P1 | L | 🔲 pending | — |
| STORY-109 | Refonte Page Tarifs | P1 | M | 🔲 pending | — |
| STORY-110 | Refonte Fonctionnalités + Import Relevés | P1 | M | 🔲 pending | — |
| STORY-111 | Refonte Pages Auth (Inscription + Connexion) | P2 | S | 🔲 pending | — |
| STORY-112 | Refonte Dashboard App | P1 | L | 🔲 pending | — |
| STORY-113 | Refonte Transactions App | P2 | M | 🔲 pending | — |
| STORY-114 | Refonte Comptes App | P2 | S | 🔲 pending | — |
| STORY-115 | Refonte Budgets & Objectifs App | P2 | M | 🔲 pending | — |
| STORY-116 | Refonte Paramètres + Récurrents + Prévisions | P2 | M | 🔲 pending | — |
| STORY-117 | Refonte Conseiller IA | P2 | S | 🔲 pending | — |
| STORY-118 | Refonte Compte Suspendu | P3 | XS | 🔲 pending | — |

### Métriques cible Sprint Refonte UI/UX

- **Stories :** 0/12 (en cours)
- **Points :** 0/33
- **Tests baseline :** 911 (0 régression tolérée)
- **Objectif :** Fidélité visuelle ≥ 90% vs maquettes Stitch
