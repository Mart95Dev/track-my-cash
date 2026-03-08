# PRD — Sprint v17 : Refactoring & Améliorations Techniques

**Version :** 17.0
**Date :** 2026-03-08
**Statut :** 📋 PLANIFIÉ
**Périmètre :** Refactoring code critique, améliorations techniques, nouvelles fonctionnalités

> **Sprints précédents :**
> - v16 (Import Universel Bancaire) : ✅ TERMINÉ — 6/6 stories, 18pts, 1356 tests
> - v15 (Refonte UI/UX Stitch) : ✅ TERMINÉ — 12/12 stories, 1201 tests
> - v14 (Couple-First Onboarding) : ✅ TERMINÉ — 7/7 stories, 911 tests
> - v13 (Activation & Rétention) : ✅ TERMINÉ — 7/7 stories, 778 tests

---

## Section 0 — Agent Onboarding Protocol

### Comment lire ce PRD

1. **Construire le graphe de dépendances** entre les stories (cf. section Ordre d'implémentation)
2. **Respecter les cross-references** : chaque story référence les fichiers source impactés
3. **Glossaire** : cf. section dédiée en fin de document
4. **Tests baseline** : 1356 tests existants. 0 régression tolérée sur chaque story

### Protocole IA-Humain

| Situation | Action |
|-----------|--------|
| Choix de nommage de module | IA décide (convention projet) |
| Ajout de dépendance npm | Demander validation humain |
| Modification schéma DB | Demander validation humain |
| Refactoring interne (même API) | IA décide |
| Nouvelle feature UX | Demander validation humain |
| Choix d'architecture (React Email vs MJML) | Demander validation humain |

---

## Contexte & Objectif

Suite à l'analyse complète du projet (27 400 lignes, 254 fichiers, 19 tables DB), ce sprint vise à :

1. **Améliorer la maintenabilité** : `queries.ts` (1463 lignes, 67 fonctions) est devenu un goulot d'étranglement. Split en modules domainaux.
2. **Réduire la complexité cyclomatique** : `detectColumns()` (153 lignes) et `getDetailedForecast()` (117 lignes) nécessitent une extraction de helpers.
3. **Éliminer la duplication** : `getTransactions()` et `searchTransactions()` partagent 80% de logique.
4. **Moderniser l'infrastructure** : Service Worker PWA, système de templates email, optimisation N+1.
5. **Enrichir les fonctionnalités** : OAuth, 2FA, graphiques avancés, notifications push.

**Contrainte absolue :** 0 changement d'API publique sur les Server Actions. Tous les refactorings sont internes.

---

## Architecture existante à respecter

- **Next.js 16 App Router** — Server Components sauf `"use client"` explicite
- **Tailwind CSS v4** — `@theme inline` dans `globals.css`
- **shadcn/ui** — composants existants à réutiliser
- **i18n next-intl** — 5 langues (FR, EN, ES, IT, DE)
- **DB** — Main DB (`getDb()`) + Per-user DB (`getUserDb(userId)`)
- **Tests** — Vitest + React Testing Library. 1356 tests actuels
- **Server Actions** — Toutes les mutations passent par `src/app/actions/`

---

## Périmètre — Stories MoSCoW (17 stories, ~55 pts)

---

## PHASE A — Refactoring Prioritaire (Must Have)

---

### STORY-125 : Extraction des types et mappers de queries.ts `[Must, S, 3pts]`

**Description :** Extraire les 18 interfaces/types et 6 row mappers de `queries.ts` dans des fichiers dédiés, préalable nécessaire au split complet.

**Fichiers impactés :**
- `src/lib/queries.ts` (source)
- `src/lib/queries/types.ts` (nouveau)
- `src/lib/queries/mappers.ts` (nouveau)
- `src/lib/queries/index.ts` (nouveau — barrel re-export)

**Types à extraire (18) :**
- Account, Transaction, RecurringPayment, ForecastItem, AccountForecastBreakdown, MonthDetail, DetailedForecastResult, Budget, BudgetStatus, BudgetHistoryEntry, Goal, Notification, WeeklySummaryData, CategoryExpense, SpendingTrendEntry, CategorizationRule

**Mappers à extraire (6) :**
- rowToAccount, rowToTransaction, rowToRecurring, rowToGoal, rowToNotification, getMonthlyContribution

**Acceptance Criteria :**

- AC-1 : Fichier `src/lib/queries/types.ts` contient les 18 interfaces exportées
  ```gherkin
  Given le fichier types.ts existe
  When je compte les exports d'interface/type
  Then il y en a exactement 18
  And chaque type est identique à l'original
  ```

- AC-2 : Fichier `src/lib/queries/mappers.ts` contient les 6 helpers
  ```gherkin
  Given le fichier mappers.ts existe
  When je compte les fonctions exportées
  Then il y en a exactement 6
  And chaque mapper produit le même résultat que l'original
  ```

- AC-3 : `src/lib/queries/index.ts` ré-exporte tout (barrel)
  ```gherkin
  Given un import existant "import { Account, getTransactions } from '@/lib/queries'"
  When le barrel index.ts est en place
  Then l'import fonctionne sans modification du code consommateur
  ```

- AC-4 : Tous les 1356 tests passent sans modification
  ```gherkin
  Given le split types/mappers est terminé
  When je lance npm test
  Then 1356 tests passent
  And 0 régression
  ```

- AC-5 : `npm run build` passe sans erreur TypeScript

---

### STORY-126 : Split queries.ts — modules Account et Transaction `[Must, M, 5pts]`

**Description :** Extraire les fonctions Account (7) et Transaction (11) dans des modules dédiés.

**Dépendance :** STORY-125

**Fichiers créés :**
- `src/lib/queries/account-queries.ts` (7 fonctions : getAllAccounts, getAccountById, createAccount, deleteAccount, getCalculatedBalance, updateAccountBalance, updateAccount)
- `src/lib/queries/transaction-queries.ts` (11 fonctions : getTransactions, searchTransactions, createTransaction, deleteTransaction, updateTransaction, updateTransactionNote, updateTransactionCategory, getUncategorizedTransactions, batchUpdateCategories, generateImportHash, checkDuplicates, bulkInsertTransactions)

**Acceptance Criteria :**

- AC-1 : `account-queries.ts` contient 7 fonctions exportées, toutes avec le type `Client` en premier paramètre
  ```gherkin
  Given le module account-queries.ts existe
  When j'importe getAllAccounts depuis '@/lib/queries'
  Then la fonction est disponible et retourne les mêmes résultats
  ```

- AC-2 : `transaction-queries.ts` contient 11 fonctions exportées
  ```gherkin
  Given le module transaction-queries.ts existe
  When j'appelle searchTransactions avec les mêmes paramètres qu'avant
  Then les résultats sont identiques (transactions + total)
  ```

- AC-3 : Les dépendances internes sont respectées (account-queries importe getCalculatedBalance de lui-même)
  ```gherkin
  Given getAllAccounts appelle getCalculatedBalance
  When les deux sont dans account-queries.ts
  Then l'appel est interne au module (pas d'import circulaire)
  ```

- AC-4 : Le barrel `index.ts` ré-exporte les deux modules
- AC-5 : 1356 tests passent, `npm run build` OK

---

### STORY-127 : Split queries.ts — modules Budget, Goal, Notification, Recurring `[Must, M, 5pts]`

**Description :** Extraire les 4 domaines restants les plus indépendants.

**Dépendance :** STORY-125

**Fichiers créés :**
- `src/lib/queries/budget-queries.ts` (7 fonctions : getBudgets, getAllBudgets, getBudgetStatus, upsertBudget, deleteBudget, snapshotBudgetHistory, getBudgetHistory)
- `src/lib/queries/goal-queries.ts` (4 fonctions : getGoals, createGoal, updateGoal, deleteGoal)
- `src/lib/queries/notification-queries.ts` (5 fonctions : getNotifications, getUnreadNotificationsCount, createNotification, markNotificationRead, markAllNotificationsRead)
- `src/lib/queries/recurring-queries.ts` (4 fonctions : getRecurringPayments, createRecurringPayment, deleteRecurringPayment, updateRecurringPayment)

**Acceptance Criteria :**

- AC-1 : Chaque module contient exactement le nombre de fonctions listées
  ```gherkin
  Given les 4 modules existent
  When je compte les exports de chaque module
  Then budget=7, goal=4, notification=5, recurring=4
  ```

- AC-2 : `upsertBudget` appelle `snapshotBudgetHistory` en interne (pas d'import circulaire)
  ```gherkin
  Given upsertBudget et snapshotBudgetHistory sont dans budget-queries.ts
  When upsertBudget est appelée
  Then snapshotBudgetHistory est appelée avant l'upsert
  And aucune dépendance externe au module n'est requise
  ```

- AC-3 : 1356 tests passent, `npm run build` OK

---

### STORY-128 : Split queries.ts — modules Dashboard, Forecast, Settings, Categorization `[Must, M, 5pts]`

**Description :** Extraire les 4 derniers domaines et supprimer `queries.ts` original (remplacé par le barrel).

**Dépendance :** STORY-126, STORY-127

**Fichiers créés :**
- `src/lib/queries/dashboard-queries.ts` (7 fonctions : getDashboardData, getMonthlySummary, getExpensesByCategory, getExpensesByBroadCategory, getSpendingTrend, getMonthlyExpensesByCategory, getWeeklySummaryData)
- `src/lib/queries/forecast-queries.ts` (2 fonctions : getDetailedForecast, getMonthlyBalanceHistory)
- `src/lib/queries/settings-queries.ts` (3 fonctions : getSetting, setSetting, getAllSettings)
- `src/lib/queries/categorization-queries.ts` (4 fonctions : getCategorizationRules, createCategorizationRule, deleteCategorizationRule, autoCategorize)
- `src/lib/queries/import-queries.ts` (2 fonctions : exportAllData, importAllData)

**Acceptance Criteria :**

- AC-1 : `forecast-queries.ts` importe correctement depuis `account-queries` et `recurring-queries`
  ```gherkin
  Given getDetailedForecast dépend de getAllAccounts et getRecurringPayments
  When le module forecast-queries est créé
  Then les imports cross-module sont explicites et non circulaires
  ```

- AC-2 : Le fichier `src/lib/queries.ts` original est supprimé
  ```gherkin
  Given tous les modules sont créés et le barrel index.ts les ré-exporte
  When le fichier queries.ts est supprimé
  Then tous les imports existants dans le projet fonctionnent via '@/lib/queries'
  ```

- AC-3 : Le barrel `src/lib/queries/index.ts` ré-exporte les 11 modules + types + mappers
  ```gherkin
  Given le barrel index.ts existe
  When un fichier importe { Account, getTransactions, getBudgets } from '@/lib/queries'
  Then tout fonctionne sans changement de chemin d'import
  ```

- AC-4 : 1356 tests passent, `npm run build` OK
- AC-5 : Aucun fichier du projet n'importe directement depuis un sous-module (tout passe par le barrel)

---

### STORY-129 : Merger getTransactions + searchTransactions via Query Builder `[Must, S, 3pts]`

**Description :** Créer un `TransactionQueryBuilder` pour éliminer la duplication SQL entre les deux fonctions.

**Dépendance :** STORY-126

**Fichier impacté :** `src/lib/queries/transaction-queries.ts`

**Acceptance Criteria :**

- AC-1 : Un helper interne `buildTransactionQuery(opts)` centralise la construction SQL
  ```gherkin
  Given le builder est créé
  When getTransactions(db, accountId, limit, offset) est appelée
  Then elle délègue à buildTransactionQuery({ accountId, limit, offset, sort: 'date_desc' })
  ```

- AC-2 : `searchTransactions` délègue au même builder
  ```gherkin
  Given le builder est créé
  When searchTransactions(db, { search: 'loyer', tagId: 3, sort: 'amount_desc' }) est appelée
  Then elle délègue à buildTransactionQuery avec les mêmes options
  And le résultat inclut { transactions, total }
  ```

- AC-3 : Le LEFT JOIN `accounts` est défini une seule fois dans le builder
- AC-4 : `rowToTransaction()` est appelée une seule fois (dans le builder)
- AC-5 : 1356 tests passent, `npm run build` OK

---

### STORY-130 : Extraire helpers de detectColumns() et getDetailedForecast() `[Must, S, 3pts]`

**Description :** Réduire la complexité cyclomatique des deux fonctions les plus denses du projet.

**Fichiers impactés :**
- `src/lib/parsers/generic-csv.ts` — `detectColumns()` (153 → ~60 lignes + 4 helpers)
- `src/lib/queries/forecast-queries.ts` — `getDetailedForecast()` (117 → ~50 lignes + 3 helpers)

**Acceptance Criteria :**

- AC-1 : `detectColumns()` est refactorisée en 4 helpers internes
  ```gherkin
  Given les helpers scoreHeaderKeywords, scoreDataValidation, selectBestColumn, computeConfidence existent
  When detectColumns est appelée avec un CSV connu
  Then le résultat est identique à l'implémentation précédente
  ```

- AC-2 : `getDetailedForecast()` est refactorisée en 3 helpers internes
  ```gherkin
  Given les helpers calculateMonthForecast, buildAccountBreakdown, computeEndBalance existent
  When getDetailedForecast est appelée avec des données de test
  Then le résultat est identique à l'implémentation précédente
  ```

- AC-3 : Aucune fonction refactorisée ne dépasse 60 lignes
- AC-4 : Les helpers sont exportés pour tests si pertinent (pattern `*Exported` existant)
- AC-5 : 1356 tests passent, `npm run build` OK

---

## PHASE B — Améliorations Techniques (Should Have)

---

### STORY-131 : Service Worker PWA — cache statique et offline basique `[Should, L, 8pts]`

**Description :** Ajouter un Service Worker pour permettre l'accès offline aux assets statiques et afficher une page fallback hors connexion.

**Fichiers créés :**
- `public/sw.js` — Service Worker (Workbox ou vanilla)
- `src/app/[locale]/(app)/offline/page.tsx` — Page offline fallback
- `src/components/pwa-update-banner.tsx` — Bannière de mise à jour disponible

**Fichiers modifiés :**
- `src/app/manifest.ts` — Ajout screenshots, shortcuts, theme_color aligné design system
- `src/app/layout.tsx` — Registration du SW

**Acceptance Criteria :**

- AC-1 : Le Service Worker met en cache les assets statiques (CSS, JS, fonts, icônes)
  ```gherkin
  Given l'application est chargée une première fois en ligne
  When l'utilisateur passe en mode avion
  Then les pages déjà visitées sont accessibles (shell applicatif)
  And les assets statiques sont servis depuis le cache
  ```

- AC-2 : Une page offline fallback s'affiche pour les pages non cachées
  ```gherkin
  Given l'utilisateur est hors ligne
  When il navigue vers une page non visitée précédemment
  Then la page /offline s'affiche avec un message explicatif
  And un bouton "Réessayer" recharge la page
  ```

- AC-3 : Le manifest est enrichi (screenshots, shortcuts)
  ```gherkin
  Given le manifest.ts est mis à jour
  When je lis les propriétés
  Then theme_color = '#4848e5' (design system primary)
  And shortcuts contient au moins Dashboard et Transactions
  And screenshots contient au moins 1 capture mobile
  ```

- AC-4 : Bannière de mise à jour quand un nouveau SW est disponible
  ```gherkin
  Given un nouveau Service Worker est détecté
  When l'événement 'controllerchange' est émis
  Then une bannière s'affiche proposant de recharger
  And le clic sur "Mettre à jour" recharge la page
  ```

- AC-5 : La stratégie de cache est Network-First pour les API, Cache-First pour les assets
- AC-6 : `npm run build` OK, aucun test cassé

---

### STORY-132 : Système de templates email — extraction composants réutilisables `[Should, M, 5pts]`

**Description :** Refactoriser `email-templates.ts` (467 lignes, 7 templates) en extrayant des composants HTML réutilisables pour éliminer la duplication de styles inline.

**Fichiers impactés :**
- `src/lib/email-templates.ts` (refactoring)
- `src/lib/email/components.ts` (nouveau — helpers HTML réutilisables)
- `src/lib/email/styles.ts` (nouveau — constantes de style)

**Acceptance Criteria :**

- AC-1 : Les composants HTML réutilisables sont extraits
  ```gherkin
  Given le fichier email/components.ts existe
  When je liste les fonctions exportées
  Then il contient au minimum : renderEmailLayout, renderHeader, renderCTA, renderTable, renderFooter
  ```

- AC-2 : Les constantes de style sont centralisées
  ```gherkin
  Given le fichier email/styles.ts existe
  When un template utilise la couleur primaire
  Then elle est référencée via EMAIL_COLORS.primary (pas hardcodée)
  ```

- AC-3 : Chaque template utilise les composants partagés
  ```gherkin
  Given les 7 templates sont refactorisés
  When je cherche des styles inline dupliqués (padding, color, font-family)
  Then aucune duplication n'existe (tout est dans components.ts)
  ```

- AC-4 : Le HTML généré est identique visuellement (pas de régression email)
  ```gherkin
  Given un snapshot du HTML de chaque template avant refactoring
  When je compare le HTML après refactoring
  Then la structure DOM et les styles appliqués sont équivalents
  ```

- AC-5 : Tests unitaires pour chaque composant email (renderHeader, renderCTA, etc.)
- AC-6 : `npm run build` OK

---

### STORY-133 : Optimisation N+1 dans getMonthlyBalanceHistory `[Should, S, 2pts]`

**Description :** Remplacer la boucle comptes × mois par une requête SQL agrégée avec GROUP BY pour éliminer le problème N+1.

**Dépendance :** STORY-128

**Fichier impacté :** `src/lib/queries/dashboard-queries.ts`

**Acceptance Criteria :**

- AC-1 : Une seule requête SQL remplace la boucle
  ```gherkin
  Given getMonthlyBalanceHistory est appelée avec months=12 et 5 comptes
  When la requête est exécutée
  Then 1 seule requête SQL est émise (au lieu de 12 × 5 = 60)
  ```

- AC-2 : Le résultat est identique à l'implémentation précédente
  ```gherkin
  Given des données de test avec 3 comptes et 6 mois d'historique
  When je compare old vs new implementation
  Then les montants par mois sont identiques
  ```

- AC-3 : Performance améliorée (mesurable sur données réelles)
- AC-4 : `npm run build` OK, tests existants passent

---

## PHASE C — Nouvelles Fonctionnalités (Could Have)

---

### STORY-134 : OAuth — Connexion Google `[Could, L, 8pts]`

**Description :** Ajouter la connexion via Google OAuth en complément de l'email/password existant.

**Fichiers impactés :**
- `src/lib/auth.ts` — Ajout plugin socialProviders (Google)
- `src/lib/auth-client.ts` — Ajout méthode signIn.social
- `src/app/[locale]/(auth)/connexion/page.tsx` — Bouton "Continuer avec Google"
- `src/app/[locale]/(auth)/inscription/page.tsx` — Bouton "S'inscrire avec Google"

**Variables d'environnement requises :**
- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`

**Acceptance Criteria :**

- AC-1 : Un bouton "Continuer avec Google" est visible sur la page de connexion
  ```gherkin
  Given la page /connexion est affichée
  When l'utilisateur voit le formulaire
  Then un bouton "Continuer avec Google" est visible sous le formulaire email/password
  And un séparateur "ou" les sépare
  ```

- AC-2 : Le flux OAuth Google fonctionne de bout en bout
  ```gherkin
  Given l'utilisateur clique sur "Continuer avec Google"
  When il s'authentifie sur le popup Google
  Then il est redirigé vers /dashboard
  And son compte est créé avec l'email Google
  And une per-user DB Turso est provisionnée
  ```

- AC-3 : Un utilisateur existant (email/password) peut lier son compte Google
  ```gherkin
  Given un utilisateur avec un compte email existing@test.com
  When il se connecte via Google avec le même email
  Then le compte est fusionné (pas de doublon)
  And il peut se connecter via les deux méthodes
  ```

- AC-4 : Le bouton est traduit dans les 5 langues (FR, EN, ES, IT, DE)
- AC-5 : `npm run build` OK, tests existants passent

---

### STORY-135 : OAuth — Connexion Apple `[Could, M, 5pts]`

**Description :** Ajouter la connexion via Apple Sign In.

**Dépendance :** STORY-134 (même infrastructure OAuth)

**Variables d'environnement requises :**
- `APPLE_CLIENT_ID`
- `APPLE_CLIENT_SECRET`

**Acceptance Criteria :**

- AC-1 : Un bouton "Continuer avec Apple" est visible sur connexion et inscription
  ```gherkin
  Given la page /connexion est affichée
  When l'utilisateur voit les options de connexion
  Then un bouton "Continuer avec Apple" est visible à côté du bouton Google
  ```

- AC-2 : Le flux Apple Sign In fonctionne de bout en bout
  ```gherkin
  Given l'utilisateur clique sur "Continuer avec Apple"
  When il s'authentifie via Apple
  Then il est redirigé vers /dashboard
  And son compte est créé avec les informations Apple
  ```

- AC-3 : Gestion du "Hide My Email" d'Apple (email relay)
- AC-4 : `npm run build` OK, tests existants passent

---

### STORY-136 : Authentification 2FA — TOTP `[Could, L, 8pts]`

**Description :** Ajouter l'authentification à deux facteurs via TOTP (Time-based One-Time Password) compatible Google Authenticator.

**Fichiers impactés :**
- `src/lib/auth.ts` — Plugin twoFactor de BetterAuth
- `src/app/[locale]/(app)/parametres/page.tsx` — Section sécurité 2FA
- `src/components/two-factor-setup.tsx` (nouveau — QR code + vérification)
- `src/components/two-factor-verify.tsx` (nouveau — saisie code à la connexion)

**Acceptance Criteria :**

- AC-1 : L'utilisateur peut activer le 2FA depuis les paramètres
  ```gherkin
  Given l'utilisateur est connecté et sur /parametres
  When il clique sur "Activer l'authentification à deux facteurs"
  Then un QR code TOTP est affiché
  And des codes de récupération sont générés (8 codes)
  And l'utilisateur doit saisir un code pour confirmer l'activation
  ```

- AC-2 : La connexion demande le code 2FA si activé
  ```gherkin
  Given l'utilisateur a le 2FA activé
  When il saisit email + mot de passe corrects
  Then une étape supplémentaire demande le code TOTP
  And la connexion n'aboutit que si le code est valide
  ```

- AC-3 : Les codes de récupération permettent de se connecter en cas de perte du device
  ```gherkin
  Given l'utilisateur a perdu son appareil TOTP
  When il utilise un code de récupération valide
  Then il est connecté
  And le code de récupération est marqué comme utilisé (usage unique)
  ```

- AC-4 : L'utilisateur peut désactiver le 2FA (avec confirmation du code actuel)
- AC-5 : Les textes sont traduits dans les 5 langues
- AC-6 : `npm run build` OK, tests existants passent

---

### STORY-137 : Graphiques enrichis — 3 nouveaux charts Recharts `[Could, M, 5pts]`

**Description :** Enrichir la visualisation avec 3 nouveaux graphiques sur le dashboard et les pages dédiées.

**Fichiers créés :**
- `src/components/charts/income-expense-bar-chart.tsx` — Barres revenus vs dépenses (6 mois)
- `src/components/charts/category-pie-chart.tsx` — Camembert répartition catégories
- `src/components/charts/recurring-timeline-chart.tsx` — Timeline des charges récurrentes

**Fichiers modifiés :**
- `src/app/[locale]/(app)/dashboard/page.tsx` — Intégration des charts
- `src/app/[locale]/(app)/recurrents/page.tsx` — Timeline récurrents

**Acceptance Criteria :**

- AC-1 : Chart barres revenus/dépenses visible sur le dashboard
  ```gherkin
  Given l'utilisateur est sur le dashboard
  When il scrolle vers la section analytique
  Then un graphique barres montre revenus (vert) et dépenses (rouge) sur 6 mois
  And le survol affiche le montant exact formaté
  ```

- AC-2 : Camembert des catégories de dépenses
  ```gherkin
  Given l'utilisateur est sur le dashboard
  When il consulte la répartition des dépenses
  Then un camembert interactif montre les catégories du mois
  And chaque part affiche le pourcentage et le montant
  And les catégories < 5% sont regroupées dans "Autres"
  ```

- AC-3 : Timeline des récurrents sur la page dédiée
  ```gherkin
  Given l'utilisateur est sur /recurrents
  When il consulte la timeline
  Then un graphique montre les prochaines échéances sur 3 mois
  And les revenus et dépenses sont différenciés par couleur
  ```

- AC-4 : Tous les charts sont responsive (mobile-first)
- AC-5 : Les charts respectent le design system Stitch (couleurs, typographie)
- AC-6 : `npm run build` OK, tests existants passent

---

### STORY-138 : Notifications Push (Web Push API) `[Could, L, 8pts]`

**Description :** Implémenter les notifications push via Web Push API pour les alertes de solde bas, dépassement budget et échéances récurrentes.

**Dépendance :** STORY-131 (Service Worker requis)

**Fichiers créés :**
- `src/lib/push-notifications.ts` — Logique d'envoi push (web-push)
- `src/components/push-notification-toggle.tsx` — Toggle activation dans paramètres
- Table `push_subscriptions` (migration DB)

**Fichiers modifiés :**
- `public/sw.js` — Listener `push` event
- `src/app/[locale]/(app)/parametres/page.tsx` — Section notifications push
- `src/lib/alert-service.ts` — Envoi push en plus de l'email
- `src/lib/budget-alert-service.ts` — Envoi push en plus de l'email

**Variables d'environnement requises :**
- `VAPID_PUBLIC_KEY`
- `VAPID_PRIVATE_KEY`
- `VAPID_EMAIL`

**Acceptance Criteria :**

- AC-1 : L'utilisateur peut activer les notifications push depuis les paramètres
  ```gherkin
  Given l'utilisateur est sur /parametres
  When il active le toggle "Notifications push"
  Then le navigateur demande la permission
  And si acceptée, la souscription PushSubscription est sauvée en DB
  ```

- AC-2 : Une notification push est envoyée quand le solde passe sous le seuil d'alerte
  ```gherkin
  Given l'utilisateur a activé les push et défini un seuil à 100€
  When une transaction fait passer le solde à 85€
  Then une notification push est reçue avec titre "Solde bas" et le montant
  ```

- AC-3 : Une notification push est envoyée quand un budget est dépassé
  ```gherkin
  Given l'utilisateur a un budget "Alimentation" à 300€
  When les dépenses du mois atteignent 305€
  Then une notification push est reçue avec titre "Budget dépassé"
  ```

- AC-4 : Les notifications push fonctionnent même quand l'app est fermée (via SW)
- AC-5 : L'utilisateur peut désactiver les push à tout moment
- AC-6 : Fallback email si push non supporté ou désactivé
- AC-7 : `npm run build` OK, tests existants passent

---

## Hors périmètre (Won't Have — ce sprint)

| Item | Raison |
|------|--------|
| Migration vers React Email/MJML | Trop lourd pour ce sprint. STORY-132 prépare le terrain avec des composants réutilisables. |
| OAuth Microsoft/GitHub | Prioriser Google et Apple d'abord |
| Mode offline complet (sync locale) | Complexité élevée (conflict resolution). Le SW cache statique suffit pour v17 |
| Refactoring couple-queries.ts | Stable actuellement (21KB mais bien structuré) |
| Migration Tailwind v5 | Pas de release stable à date |

---

## Ordre d'implémentation

```
Phase A — Refactoring (Must Have)
┌─────────────────────────────────────────────┐
│ STORY-125 (types+mappers)                   │
│     ├── STORY-126 (account+transaction)     │
│     │       └── STORY-129 (query builder)   │
│     ├── STORY-127 (budget+goal+notif+recur) │
│     └── STORY-128 (dashboard+forecast+etc)  │
│             └── STORY-133 (optim N+1)       │
│                                             │
│ STORY-130 (helpers detectColumns+forecast)  │ ← Parallélisable
└─────────────────────────────────────────────┘

Phase B — Améliorations Techniques (Should Have)
┌─────────────────────────────────────────────┐
│ STORY-131 (Service Worker PWA)              │
│ STORY-132 (Templates email)                 │
│ STORY-133 (Optim N+1) ← dépend Phase A     │
└─────────────────────────────────────────────┘

Phase C — Nouvelles Fonctionnalités (Could Have)
┌─────────────────────────────────────────────┐
│ STORY-134 (OAuth Google)                    │
│     └── STORY-135 (OAuth Apple)             │
│ STORY-136 (2FA TOTP)                        │
│ STORY-137 (Charts Recharts)                 │
│ STORY-138 (Notifications Push)              │
│     └── dépend STORY-131 (SW)              │
└─────────────────────────────────────────────┘
```

---

## Exigences non-fonctionnelles

### Performance
- Le split de `queries.ts` ne doit pas impacter les temps de réponse des Server Actions
- Le Service Worker ne doit pas ralentir le premier chargement (registration asynchrone)
- L'optimisation N+1 doit réduire le nombre de requêtes SQL d'au moins 80%

### Sécurité
- OAuth : Tokens stockés côté serveur uniquement (pas de token en localStorage)
- 2FA : Codes TOTP SHA-1, 6 chiffres, validité 30s, tolérance ±1 période
- VAPID keys : Stockées en variables d'environnement, jamais dans le code
- Service Worker : Pas de cache des données sensibles (transactions, soldes)

### Accessibilité
- Boutons OAuth : Contrastes WCAG 2.1 AA, labels accessibles
- QR Code 2FA : Alternative textuelle (clé secrète copiable)
- Charts : Tooltip au survol/focus, légendes textuelles, patterns de couleur distinctifs

### Compatibilité
- Service Worker : Fallback gracieux si non supporté (pas de blocage)
- Web Push : Supporté sur Chrome, Firefox, Edge, Safari 16.4+
- OAuth : Popup flow (pas de redirect pour UX mobile)

---

## Métriques de succès

| Métrique | Objectif | Mesure |
|----------|----------|--------|
| Fichier le plus gros | < 200 lignes (vs 1463 actuellement) | `wc -l src/lib/queries/*.ts` |
| Complexité cyclomatique max | < 15 par fonction (vs ~30) | Inspection manuelle |
| Couverture tests | ≥ 75% lignes (threshold existant) | `npm run test:coverage` |
| Nombre de requêtes N+1 | 0 | Audit getMonthlyBalanceHistory |
| Tests totaux | ≥ 1400 (1356 + nouveaux) | `npm test` |
| Build time | Pas de régression (< 60s) | `npm run build` |

---

## MCP Catalog

| Serveur MCP | Outils pertinents | Usage |
|-------------|-------------------|-------|
| **context7** | `resolve-library-id`, `query-docs` | Docs BetterAuth (OAuth, 2FA), Recharts, Workbox |
| **github** | `create_pull_request`, `list_issues` | PR par phase, tracking issues |
| **firebase** | — | Non utilisé (Turso) |
| **playwright** | `browser_navigate`, `browser_screenshot` | Tests E2E des flux OAuth si nécessaire |

---

## Glossaire

| Terme | Définition |
|-------|------------|
| **Barrel** | Fichier `index.ts` qui ré-exporte les modules d'un dossier |
| **N+1** | Anti-pattern : exécuter N requêtes dans une boucle au lieu d'1 seule |
| **Query Builder** | Pattern : fonction qui construit dynamiquement une requête SQL |
| **Row Mapper** | Fonction qui convertit une ligne brute DB en objet TypeScript typé |
| **TOTP** | Time-based One-Time Password (RFC 6238) |
| **VAPID** | Voluntary Application Server Identification pour Web Push |
| **Service Worker** | Script navigateur exécuté en arrière-plan pour cache/push |
| **MoSCoW** | Must / Should / Could / Won't — priorisation |
| **Per-user DB** | Base de données Turso dédiée par utilisateur |
| **Main DB** | Base de données partagée (auth, couples, subscriptions) |
