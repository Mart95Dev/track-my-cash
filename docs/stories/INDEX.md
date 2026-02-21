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

## Sprint Growth & Qualité (v2.0) — EN COURS 🔄

### 🔴 Area 1 : Landing Page Marketing

| ID | Titre | Priorité | Complexité | Statut | Bloquée par |
|----|-------|----------|------------|--------|-------------|
| STORY-009 | Navbar + Footer publics | P0 | S | pending | — |
| STORY-010 | Page d'accueil publique (Landing Page) | P0 | M | pending | STORY-009 |
| STORY-011 | SEO meta tags + robots.txt + sitemap.xml | P0 | S | pending | STORY-010 |

### 🔴 Area 2 : Emails Transactionnels

| ID | Titre | Priorité | Complexité | Statut | Bloquée par |
|----|-------|----------|------------|--------|-------------|
| STORY-012 | Service email Nodemailer/Hostinger | P1 | S | pending | — |
| STORY-013 | Email de bienvenue (post-inscription) | P1 | S | pending | STORY-012 |
| STORY-014 | Alerte solde bas (email automatique) | P1 | S | pending | STORY-012 |

### 🟡 Area 3 : Conformité RGPD + Qualité

| ID | Titre | Priorité | Complexité | Statut | Bloquée par |
|----|-------|----------|------------|--------|-------------|
| STORY-015 | Suppression de compte RGPD | P2 | M | pending | — |
| STORY-016 | Extension couverture tests (parsers) | P2 | M | pending | — |

### 🟢 Area 4 : Features Utilisateur

| ID | Titre | Priorité | Complexité | Statut | Bloquée par |
|----|-------|----------|------------|--------|-------------|
| STORY-017 | Budgets par catégorie | P3 | L | pending | — |
| STORY-018 | Nouveau parser Crédit Agricole | P3 | S | pending | — |

---

## Métriques v2.0

- **Total stories :** 10
- **Complétées :** 0
- **En cours :** 0
- **En attente :** 10
- **Points total estimés :** 39
- **Durée estimée :** 25-30h

## Ordre d'exécution recommandé

```
Parallèle 1 : STORY-009 + STORY-012 (aucune dépendance)
Parallèle 2 : STORY-010 (après 009) + STORY-013 + STORY-014 (après 012) + STORY-015 + STORY-016
Séquentiel : STORY-011 (après 010)
Parallèle 3 : STORY-017 + STORY-018 (indépendantes, P3)
```
