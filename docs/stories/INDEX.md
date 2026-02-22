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
- **Tests sprint :** 58 nouveaux tests (316 total, 0 échec)
- **Fichiers créés :** 17 nouveaux fichiers (lib + actions + components)
- **TypeScript :** 0 erreur (`npx tsc --noEmit`)
