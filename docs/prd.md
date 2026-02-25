# PRD — Sprint v13 : Activation & Rétention Couple

**Version :** 13.0
**Date :** 2026-02-24
**Statut :** ✅ TERMINÉ (7/7 stories PASS — 778 tests)
**Périmètre :** Activation des inscrits couple, rétention par notifications + rapports, acquisition SEO

> **Sprint v14 (Couple-First Onboarding) également TERMINÉ** — 7/7 stories PASS, 911 tests totaux.
> Stories : STORY-100 (CoupleChoiceModal) · STORY-101 (bannière invitation) · STORY-102 (BottomNav Couple) · STORY-103 (zones verrouillées) · STORY-104 (emails cron J+1/3/7) · STORY-105 (barre progression) · STORY-106 (hub /couple 3 états).
> Bug fix : `setOnboardingChoiceAction` double-write (per-user DB + Main DB) pour que le cron emails fonctionne.
>
> **Prochain sprint :** à définir via `/forge-plan`.

---

## Contexte

Le Sprint Pivot Niche Couple (v12) est **entièrement livré** :
- ✅ 8/8 stories PASS (643 tests, QA PASS)
- ✅ Features couple opérationnelles : invitation, transactions partagées + balance, dashboard toggle, budgets/objectifs couple, IA conseiller couple, landing page pivot
- ✅ Freemium couple : Pro (4,90 €/mois) = partage couple · Premium (7,90 €/mois) = IA couple

**Problème identifié — Le tunnel d'activation est incomplet :**

Un couple arrive sur la landing page → s'inscrit → et tombe sur un dashboard **vide, sans guidance**. La page `/couple` est fonctionnelle mais basique (code invite + affichage partenaire). Il manque :
1. Un **onboarding wizard** guidant le couple vers ses premières actions
2. Un **dashboard couple riche** montrant balance, dépenses communes, objectifs
3. Des **notifications in-app** pour maintenir l'engagement (alerte balance, objectif atteint)
4. Un **email hebdo enrichi** avec les stats couple pour les abonnés
5. L'**export PDF mensuel** promis dans les tarifs (COMPARISON_FEATURES) mais non encore implémenté
6. Un **blog SEO couple** pour générer du trafic organique qualifié

**Objectif v13 :** Améliorer les métriques d'activation (% couples ayant partagé ≥1 transaction) et de rétention (churn mensuel) par une meilleure expérience post-inscription.

---

## Analyse des risques

| Risque | Impact | Mitigation |
|--------|--------|------------|
| Génération PDF complexe (dépendances lourdes) | M | Utiliser `jsPDF` (léger, no-build) ou HTML→CSS print |
| Notifications in-app : schema DB cross-user | M | Per-user DB, pas de notifs cross-user (push simple) |
| Blog MDX : configuration next-mdx | S | Contenu statique JSON si MDX trop lourd |
| Onboarding intrusif | S | Skipable à tout moment, marqueur localStorage |

---

## Architecture existante à respecter

- **DB principale** (`getDb()`) : couples, couple_members, subscriptions, users
- **DB per-user** (`getUserDb(userId)`) : accounts, transactions, budgets, goals, notifications (à ajouter)
- **Server Actions** uniquement (pas d'API routes nouvelles sauf export PDF)
- **Freemium gates** : `canUseCoupleFeature()` (Pro) · `canUsePremiumCoupleFeature()` (Premium)
- **Design system** : tokens Tailwind v4, Manrope, Material Symbols Outlined

---

## Périmètre — Stories MoSCoW

---

### MUST HAVE — Activation

#### STORY-093 : Onboarding wizard couple post-inscription `[P1, M, 3pts]`

**Description :**
Wizard 4 étapes affiché à la première connexion (ou accessible depuis `/couple` si pas de couple actif) pour guider les nouveaux utilisateurs vers l'activation couple.

**Étapes du wizard :**
1. **Bienvenue** — "Gérez votre argent de couple ensemble" + CTA Commencer
2. **Créez ou rejoignez un couple** — Inline (réutilise `CoupleCreateForm` / `CoupleJoinForm`)
3. **Invitez votre partenaire** — Affiche le code, bouton copier, lien WhatsApp
4. **Vos premières transactions** — Lien vers `/transactions` + lien import + tick "À faire plus tard"

**Marqueur de progression :**
- Setting `onboarding_couple_step` (0–4) dans la per-user DB (table `settings`)
- Bouton "Passer" à chaque étape — marque `onboarding_couple_completed = true`
- Si `onboarding_couple_completed`, le wizard ne réapparaît plus

**Déclenchement :**
- Automatiquement au 1er accès `/dashboard` si `onboarding_couple_completed` absent/false
- Drawer/modal centré (pas de page dédiée) — non-bloquant, closeable

**Fichiers à créer/modifier :**
- `src/components/couple-onboarding-wizard.tsx` — nouveau (Client Component, steps)
- `src/app/[locale]/(app)/dashboard/page.tsx` — déclenchement conditionnel
- `src/app/actions/couple-actions.ts` — `markOnboardingCompleteAction()`
- `tests/unit/components/couple-onboarding-wizard.test.tsx`

**Critères d'acceptation :**
- AC-1 : Wizard affiché à la 1ère connexion si `onboarding_couple_completed` ≠ true
- AC-2 : Step 2 permet de créer ou rejoindre un couple (réutilise actions existantes)
- AC-3 : Step 3 affiche le code invite avec bouton copier (copie dans presse-papiers)
- AC-4 : Bouton "Passer" à chaque étape marque `onboarding_couple_completed = true`
- AC-5 : Wizard ne réapparaît pas après complétion ou skip

---

#### STORY-094 : Dashboard /couple enrichi `[P1, M, 3pts]`

**Description :**
Transformer la page `/couple` d'une simple gestion de membres en un véritable dashboard couple avec métriques, timeline et objectifs.

**Sections :**
1. **En-tête** : Nom couple (éditable) + membres + date rejointe + bouton Quitter (repli)
2. **Balance du mois** : Card `CoupleBalanceCard` (existante) + flèche qui doit quoi
3. **Dépenses communes ce mois** : Total + variation vs mois précédent
4. **Top 3 catégories communes** : Pills avec montant (depuis `getSharedTransactionsForCouple`)
5. **10 dernières transactions partagées** : Mini-liste (date, description, montant, payeur)
6. **Objectifs communs** : Progress bars (depuis `getCoupleSharedGoals`)
7. **Code invite** : Section repliable en bas (pour inviter un 2e partenaire si besoin)

**Fichiers à créer/modifier :**
- `src/app/[locale]/(app)/couple/page.tsx` — refonte complète
- `src/components/couple-stats-card.tsx` — nouveau (dépenses + variation)
- `src/components/couple-categories-pills.tsx` — nouveau
- `src/lib/couple-queries.ts` — `getCoupleMonthStats(coupleId, month)` nouveau
- `tests/unit/lib/couple-month-stats.test.ts`
- `tests/unit/components/couple-stats-card.test.tsx`

**Critères d'acceptation :**
- AC-1 : Page affiche balance couple du mois courant
- AC-2 : Total dépenses communes + variation N-1 mois
- AC-3 : Top 3 catégories communes du mois affichées
- AC-4 : Liste 10 dernières transactions partagées (date, description, montant, payeur)
- AC-5 : Progress objectifs communs (si ≥1 objectif couple)
- AC-6 : Section code invite accessible (collapse par défaut)

---

### SHOULD HAVE — Engagement & Rétention

#### STORY-095 : Centre de notifications in-app `[P2, M, 3pts]`

**Description :**
Système de notifications per-user (per-user DB) avec badge sur la BottomNav et page `/notifications`.

**Événements générateurs :**
| Événement | Déclencheur | Message |
|-----------|-------------|---------|
| Solde bas | `account.balance < alert_threshold` (au login) | "Votre compte {nom} est sous le seuil d'alerte" |
| Balance couple | `Math.abs(diff) > 50€` (calcul hebdo) | "Votre balance couple dépasse 50 € — {partenaire} vous doit X€" |
| Objectif atteint | `goal.current_amount >= goal.target_amount` | "Félicitations ! Objectif '{nom}' atteint" |
| Partenaire actif | Transaction partagée ajoutée par partenaire | "{partenaire} a ajouté une dépense de X€" |

**Schema DB (per-user DB) :**
```sql
CREATE TABLE IF NOT EXISTS notifications (
  id TEXT PRIMARY KEY,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  read INTEGER DEFAULT 0,
  created_at TEXT DEFAULT (datetime('now')),
  metadata TEXT
);
```

**Composants :**
- Badge rouge sur `BottomNav` si notifs non lues (count)
- Drawer ou page `/notifications` — liste chronologique, tap = marque lu
- Auto-archivage : `DELETE WHERE created_at < date('now', '-30 days')`

**Fichiers à créer/modifier :**
- `src/lib/user-db.ts` — migration table `notifications`
- `src/lib/notification-queries.ts` — `createNotification`, `getUnreadCount`, `markAllRead`, `getNotifications`
- `src/components/bottom-nav.tsx` — badge unread count
- `src/app/[locale]/(app)/notifications/page.tsx` — nouveau
- `src/app/actions/notification-actions.ts` — `markNotificationReadAction`
- `tests/unit/lib/notification-queries.test.ts`
- `tests/unit/components/bottom-nav-badge.test.tsx`

**Critères d'acceptation :**
- AC-1 : Table `notifications` créée en migration per-user DB
- AC-2 : Badge rouge sur BottomNav si ≥ 1 notif non lue
- AC-3 : Page `/notifications` liste les 50 dernières notifs
- AC-4 : Tap sur une notif la marque comme lue
- AC-5 : Notif "solde bas" créée si balance < seuil au login
- AC-6 : Notif "objectif atteint" créée lors de la mise à jour d'un objectif

---

#### STORY-096 : Email hebdo étendu — stats couple `[P2, S, 2pts]`

**Description :**
Étendre le `WeeklySummaryData` et le template email (STORY-061) pour inclure une section "Cette semaine en couple" si l'utilisateur a un couple actif et est Pro/Premium.

**Données couple ajoutées :**
```typescript
coupleWeekly?: {
  sharedExpenses: number;       // total dépenses partagées 7 derniers jours
  balance: number;              // balance actuelle (positif = partenaire doit)
  topSharedCategory: string;    // catégorie #1 commune
  transactionCount: number;     // nb transactions partagées
}
```

**Template email :**
- Section conditionnelle "💑 Cette semaine en couple" (si `coupleWeekly` présent)
- Ligne "X transactions partagées — total Y€"
- Ligne "Balance : {partenaire} vous doit Z€" ou "Vous devez Z€ à {partenaire}"

**Fichiers à modifier :**
- `src/lib/weekly-summary.ts` — enrichir `computeWeeklySummary()` avec données couple
- `src/components/emails/weekly-summary.tsx` — section couple conditionnelle
- `src/lib/couple-queries.ts` — `getCoupleWeeklyStats(coupleId, since)`
- `tests/unit/lib/weekly-summary-couple.test.ts`

**Critères d'acceptation :**
- AC-1 : `coupleWeekly` calculé si couple actif + plan Pro/Premium
- AC-2 : Section couple présente dans le rendu email si `coupleWeekly` défini
- AC-3 : Section absente si pas de couple ou plan Gratuit
- AC-4 : Tests unitaires couvrent les 3 cas (pas de couple, Pro sans partage, Pro avec partage)

---

### COULD HAVE — Valeur perçue & Acquisition

#### STORY-097 : Export PDF rapport mensuel `[P3, M, 3pts]`

**Description :**
Implémenter l'export PDF mensuel promis dans les tarifs (`COMPARISON_FEATURES: "Export PDF mensuel", pro: true`). Rapport individuel (et couple si applicable) téléchargeable depuis `/parametres`.

**Contenu du rapport (page A4) :**
- En-tête : Logo TMC + "Rapport mensuel {Mois YYYY}" + nom compte(s)
- Résumé : Revenus / Dépenses / Solde net du mois
- Top 5 catégories dépenses (tableau)
- Transactions du mois (tableau paginé si > 30)
- Si couple actif : section "Dépenses communes" + balance

**Technique :**
- Bibliothèque : `jsPDF` + `jspdf-autotable` (léger, compatible Edge runtime)
- Route : `GET /api/reports/monthly?month=YYYY-MM&accountId=xxx` → `Content-Type: application/pdf`
- Gate : plan Pro ou Premium (`canExportPdf`)

**Fichiers à créer :**
- `src/app/api/reports/monthly/route.ts` — génération PDF
- `src/lib/pdf-report.ts` — `generateMonthlyReport(userId, month, accountId)`
- `src/components/export-pdf-button.tsx` — bouton dans `/parametres`
- `tests/unit/lib/pdf-report.test.ts`

**Critères d'acceptation :**
- AC-1 : `GET /api/reports/monthly?month=YYYY-MM` retourne un PDF valide
- AC-2 : PDF contient revenus, dépenses, solde net du mois
- AC-3 : Section couple incluse si couple actif
- AC-4 : Route retourne 403 si plan Gratuit
- AC-5 : Bouton "Télécharger rapport PDF" visible dans `/parametres` pour Pro/Premium

---

#### STORY-098 : Blog SEO couple — contenu statique `[P3, S, 2pts]`

**Description :**
Créer une section `/blog` avec 3 articles statiques (JSON/MDX) ciblant les mots-clés SEO de la niche couple.

**Articles initiaux :**
1. `gerer-budget-couple` — "Comment gérer son budget en couple sans se disputer"
2. `partager-depenses-equitablement` — "Partager ses dépenses équitablement : méthodes et outils"
3. `objectifs-epargne-couple` — "5 objectifs d'épargne pour les couples en 2026"

**Routes :**
- `/blog` — liste des articles (cards avec image placeholder, titre, extrait, date)
- `/blog/[slug]` — article complet

**SEO :**
- `metadata` dynamique par article (title, description, openGraph)
- Schema.org `Article` dans le HTML
- Mise à jour `sitemap.ts` avec les URLs blog

**Implémentation :**
- Contenu statique en JSON (`src/data/blog-posts.ts`) — pas de CMS, pas de MDX (simplicité)
- Pages Server Components avec `generateStaticParams`

**Fichiers à créer :**
- `src/data/blog-posts.ts` — données articles (slug, title, date, excerpt, content HTML)
- `src/app/[locale]/(marketing)/blog/page.tsx`
- `src/app/[locale]/(marketing)/blog/[slug]/page.tsx`
- `src/app/sitemap.ts` — update avec blog URLs
- `tests/unit/seo/blog-sitemap.test.ts`

**Critères d'acceptation :**
- AC-1 : `/blog` liste les 3 articles avec titre et extrait
- AC-2 : `/blog/[slug]` affiche le contenu complet
- AC-3 : Chaque article a un `<title>` et `<meta description>` uniques
- AC-4 : URLs blog présentes dans `sitemap.xml`
- AC-5 : Schema.org `Article` présent dans le HTML de chaque article

---

#### STORY-099 : Catégories prédéfinies couple `[P3, XS, 1pt]`

**Description :**
Quand une transaction est marquée `is_couple_shared = 1`, suggérer des catégories spécifiques aux dépenses communes de couple.

**Catégories couple :**
`Loyer / charges`, `Courses alimentaires`, `Restaurants & sorties`, `Voyages`, `Factures communes`, `Loisirs communs`, `Santé commune`, `Éducation`

**Comportement :**
- Dans `TransactionCoupleToggle` (STORY-087), quand le toggle est activé :
  - Si la catégorie actuelle est vide ou "Autre" → afficher pills de suggestion catégories couple
  - Clic sur une pill → met à jour la catégorie de la transaction
- Pas de changement si catégorie déjà définie (non-intrusif)

**Fichiers à modifier :**
- `src/lib/couple-categories.ts` — nouveau : `COUPLE_CATEGORIES` constant
- `src/components/transaction-couple-toggle.tsx` — pills suggestion
- `tests/unit/lib/couple-categories.test.ts`

**Critères d'acceptation :**
- AC-1 : `COUPLE_CATEGORIES` liste ≥ 6 catégories
- AC-2 : Pills affichées quand toggle couple activé et catégorie absente
- AC-3 : Clic sur une pill met à jour la catégorie (action existante)
- AC-4 : Aucun affichage si catégorie déjà définie

---

## Métriques de succès v13

| Métrique | Baseline (v12) | Cible v13 |
|----------|---------------|-----------|
| Taux activation couple (≥1 tx partagée) | ~0% (nouveau) | > 40% des inscrits |
| Wizard completion rate | — | > 60% |
| Notifications créées/semaine | 0 | > 5 par user actif |
| Téléchargements PDF/mois | 0 | > 20% des Pro |
| Trafic organique /blog | 0 | > 100 visites/mois |

---

## Dépendances inter-stories

```
093 (Onboarding) → aucune (réutilise STORY-086 createCoupleAction)
094 (Dashboard couple) → aucune (réutilise couple-queries existantes)
095 (Notifications) → 094 (événement partenaire actif)
096 (Email couple) → 095 (partage même infrastructure couple-queries)
097 (PDF) → aucune (API route indépendante)
098 (Blog) → aucune
099 (Catégories) → STORY-087 (TransactionCoupleToggle)
```

## Ordre d'implémentation

```
093 (Onboarding) → 094 (Dashboard couple) → 099 (Catégories)
→ 095 (Notifications) → 096 (Email couple)
→ 097 (PDF) → 098 (Blog)
```

## Récapitulatif

| Story | Titre | Priorité | Complexité | Points |
|-------|-------|----------|-----------|--------|
| STORY-093 | Onboarding wizard couple | P1 | M | 3 |
| STORY-094 | Dashboard /couple enrichi | P1 | M | 3 |
| STORY-095 | Notifications in-app | P2 | M | 3 |
| STORY-096 | Email hebdo + stats couple | P2 | S | 2 |
| STORY-097 | Export PDF rapport mensuel | P3 | M | 3 |
| STORY-098 | Blog SEO couple | P3 | S | 2 |
| STORY-099 | Catégories prédéfinies couple | P3 | XS | 1 |
| **Total** | | | | **17 pts** |

---

*Sprint v13 prêt pour décomposition en stories avec `/forge-stories`.*
