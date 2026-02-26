# PRD — Sprint v15 : Refonte UI/UX Stitch

**Version :** 15.0
**Date :** 2026-02-25
**Statut :** 🚀 EN COURS
**Périmètre :** Implémentation fidèle des 20 maquettes Google Stitch — landing page + application

> **Sprints précédents :**
> - v14 (Couple-First Onboarding) : ✅ TERMINÉ — 7/7 stories PASS, 911 tests totaux. Bug fix double-write `setOnboardingChoiceAction`.
> - v13 (Activation & Rétention) : ✅ TERMINÉ — 7/7 stories PASS, 778 tests.
> - v12 (Pivot Niche Couple) : ✅ TERMINÉ — 8/8 stories PASS, 643 tests.

---

## Contexte & Objectif

Suite à la conception des maquettes haute-fidélité sur Google Stitch, le Sprint v15 vise à **refondre le design de l'ensemble de l'interface** — landing page marketing ET pages application — pour aligner le produit avec le nouveau design system premium.

**20 maquettes disponibles** dans `/tmp/stitch-maquettes/` :
- Landing : `01-landing.html`, `02-tarifs.html`, `03-features.html`, `04-inscription.html`, `05-login.html`, `06-generated-desktop.html`
- App : `dashboard.html`, `transactions.html`, `comptes.html`, `budgets-1/2.html`, `objectifs-1/2.html`, `conseiller-ia-1/2.html`, `previsions.html`, `parametres-1/2.html`, `recurrents.html`, `compte-suspendu.html`

---

## Design System Stitch (référence globale)

### Tokens CSS (dans `globals.css`)
| Token | Valeur | Usage |
|-------|--------|-------|
| `--primary` | `#4848e5` | Couleur principale ✅ déjà en place |
| `--couple-pink` | `#EC4899` | Accent couple 🆕 à ajouter |
| `--background-light` | `#f6f6f8` | Fond app ✅ déjà en place |
| `--background-dark` | `#111121` | Fond app dark ✅ déjà en place |
| `--card-light` | `#ffffff` | Cartes light ✅ déjà en place |
| `--card-dark` | `#1a1a2e` | Cartes dark ✅ déjà en place |

### Typographie
- **Toutes les pages** : `Manrope` (300–800) ✅ déjà configuré via `--font-manrope`
- Landing : `font-bold tracking-tighter`, grandes tailles (5xl→7xl)
- App : `font-extrabold tracking-tight`, tailles mobiles

### Icônes
- Material Symbols Outlined (font-variation-settings FILL 0, wght 300-400) ✅

### Contrainte explicite
> La directive CLAUDE.md « couleurs unies uniquement » est **levée pour ce sprint** : l'utilisateur a explicitement demandé l'implémentation des maquettes Stitch, qui utilisent des effets visuels (subtle blur spots, btn-premium gradient). Ces effets sont conformes au design approuvé.

### Contrainte fonctionnelle critique
> **La page Fonctionnalités (STORY-110) doit remplacer la section "Multi-Banques / Safe Connect API"** par une section "Import de relevés bancaires (CSV/XLSX/PDF)". L'app ne proposera PAS de connexion bancaire directe au lancement. À la place : import de relevés depuis sa banque via les parsers existants (Banque Populaire, MCB, Revolut, generique).

---

## Architecture existante à respecter

- **Next.js 16 App Router** — Server Components uniquement sauf `"use client"` explicite
- **Tailwind CSS v4** — `@theme inline` dans `globals.css`, classes custom via `@layer utilities`
- **shadcn/ui** — composants Button, Dialog, etc. à réutiliser
- **i18n next-intl** — routes `[locale]/(marketing)/` et `[locale]/(app)/`
- **Bottom Nav** — 5 onglets (Dashboard, Comptes, Transactions, Couple, Conseiller)
- **DB** — Main DB (`getDb()`) + per-user DB (`getUserDb(userId)`)
- **Tests** — Vitest + React Testing Library. 911 tests actuels, 0 régression tolérée

---

## Périmètre — Stories MoSCoW (12 stories, 33 pts)

---

### STORY-107 : Fondation Design System CSS Stitch v2 `[P1, XS, 1pt]`

**Description :** Ajouter les tokens CSS manquants et classes utilitaires custom pour que landing + app aient accès aux effets visuels Stitch.

**Acceptance Criteria :**
- AC-1 : `--couple-pink: #EC4899` ajouté dans `:root` de `globals.css`
- AC-2 : Classe `.glass-panel` dans `@layer utilities` (bg white/75, backdrop-blur-12, border white/50)
- AC-3 : Classe `.btn-premium` dans `@layer utilities` (bg primary, shadow primary/25, hover translateY-1)
- AC-4 : Classe `.gradient-text` dans `@layer utilities` (text transparent via background-clip)
- AC-5 : Token `--color-couple-pink` exposé dans `@theme inline` (pour usage `text-couple-pink`, `bg-couple-pink`)
- AC-6 : `npm run build` passe sans erreur

**Fichiers :**
- `src/app/globals.css`

**Tests :** Tests CSS (vérification des classes générées) — optionnels, couverture par visual inspection.

---

### STORY-108 : Refonte Landing Page Hero `[P1, L, 5pt]`

**Description :** Refonte complète de `src/app/[locale]/(marketing)/page.tsx` d'après `01-landing.html`.

**Sections :**
1. **Header** : Logo T + "TrackMyCash" (fond white/80 backdrop-blur), nav Fonctionnalités/Concept/Tarifs, CTA "Essai gratuit" (btn-premium rounded-full)
2. **Hero** : Badge "Nouvelle version 2.0", titre "L'argent à deux, en toute transparence." (7xl tracking-tighter), sous-titre, 2 CTAs (Commencer + Découvrir), maquette phone flottante avec transaction list
3. **Comment ça marche** : 3 étapes (01/02/03 en grand) — **remplacer** "Connexion" par "Import" (import relevés CSV/XLSX) + "Répartition" + "Vision"
4. **Features bento grid** : Espace Couple (grande), Balance 0€ (sombre), Budgets, IA Assistant, Multi-Import (à la place de Multi-Banques)
5. **Tarification simple** : 3 colonnes (Découverte 0€ / Couple Pro 4,90€ [populaire] / Unlimited 7,90€)
6. **CTA dark** : Section sombre "Votre sérénité financière commence ici"
7. **Footer** : 3 colonnes Produit / Compagnie / Légal

**Acceptance Criteria :**
- AC-1 : Hero titre "L'argent à deux, en toute transparence." présent
- AC-2 : Section "Comment ça marche" avec étapes numérotées 01/02/03, PAS de mention "connexion bancaire directe"
- AC-3 : Bento grid features 4-colonnes avec la grande card "Espace Couple"
- AC-4 : Section prix 3 cards, "Couple Pro" marqué "Populaire", prix 4,90€
- AC-5 : CTA dark section visible, fond slate-900
- AC-6 : Footer complet avec colonnes Produit/Compagnie/Légal
- AC-7 : Responsive (mobile + desktop), fond `bg-surface` (#F9FAFB)
- AC-8 : `npm run build` passe, `npm run lint` 0 erreur

**Fichiers :**
- `src/app/[locale]/(marketing)/page.tsx`
- `messages/fr.json` (si nouvelles traductions)

---

### STORY-109 : Refonte Page Tarifs `[P1, M, 3pt]`

**Description :** Refonte de `tarifs/page.tsx` d'après `02-tarifs.html`.

**Design :**
- Header identique à landing (composant partagé ou inline)
- Toggle Mensuel/Annuel (pill buttons style)
- Badge "Économisez 20% en annuel" avec icône auto_awesome
- 3 cards : Gratuit / Couple Pro (animated border + highlighted) / Unlimited
- Tableau comparatif existant conservé, style actualisé

**Acceptance Criteria :**
- AC-1 : Toggle mensuel/annuel fonctionnel (client component)
- AC-2 : Card "Couple Pro" avec `animated-border-wrapper` (border animé gradient primary→pink)
- AC-3 : Prix 4,90€/mois et 7,90€/mois affichés
- AC-4 : Badge "Pour les couples" ou "Populaire" sur card Pro
- AC-5 : Tableau comparatif préservé et stylé
- AC-6 : Fond `background-light` (#f6f6f8)

**Fichiers :**
- `src/app/[locale]/(marketing)/tarifs/page.tsx`

---

### STORY-110 : Refonte Fonctionnalités + Import Relevés `[P1, M, 3pt]`

**Description :** Refonte de `fonctionnalites/page.tsx` d'après `03-features.html` avec remplacement de "connexion bancaire directe" par "import de relevés bancaires".

**Contrainte critique :** Remplacer la section "Multi-Banques / Safe Connect API" par une section qui met en avant :
- Import CSV (Banque Populaire, etc.)
- Import XLSX (Revolut, etc.)
- Import PDF (détecter et parser les données)
- Mention : "3 formats supportés : CSV, XLSX, PDF"
- Sous-titre : "Compatible avec toutes les banques françaises"

**Acceptance Criteria :**
- AC-1 : Hero : "L'argent dans votre couple, enfin clarifié."
- AC-2 : Section Mode Couple avec liste de fonctionnalités couple (Partage instantané, Règles 50/50, Calcul automatique)
- AC-3 : Section "Import Multi-Formats" (CSV/XLSX/PDF) — PAS de mention "Safe Connect API", "connexion directe", ni logos de banques avec API
- AC-4 : Section IA Assistant
- AC-5 : Section Objectifs communs
- AC-6 : Appel à action Essai gratuit
- AC-7 : Vérification dans `src/lib/parsers.ts` que les 3 formats (CSV BP, CSV MCB, XLSX Revolut) sont bien supportés → mettre à jour la copie si nécessaire

**Fichiers :**
- `src/app/[locale]/(marketing)/fonctionnalites/page.tsx`
- `src/lib/parsers.ts` (vérification uniquement, pas de modification)

---

### STORY-111 : Refonte Pages Auth `[P2, S, 2pt]`

**Description :** Refonte de `inscription/page.tsx` et `connexion/page.tsx` d'après `04-inscription.html` et `05-login.html`.

**Design inscription :**
- Background avec blur spots (primary/5 + couple-pink/5)
- Header desktop (logo + "Déjà un compte ?")
- Mobile : logo centré
- Card white rounded-3xl shadow-apple
- Boutons OAuth Google + Apple (SVG inline)
- Divider "Ou avec email"
- Form (prénom, email, mot de passe) + bouton CTA
- Badge "Essai 14j offert" dans le sous-titre

**Design connexion :**
- Identique au design inscription
- Titre "Bon retour !"
- Form email + mot de passe + "Mot de passe oublié ?"
- Lien "Créer un compte"

**Acceptance Criteria :**
- AC-1 : Page inscription avec blur spots background
- AC-2 : Boutons OAuth (Google, Apple) présents
- AC-3 : Badge "Essai 14j offert"
- AC-4 : Page connexion avec titre "Bon retour !"
- AC-5 : Lien de bascule inscription ↔ connexion
- AC-6 : Formulaires fonctionnels (les Server Actions existantes sont réutilisées)

**Fichiers :**
- `src/app/[locale]/(auth)/inscription/page.tsx`
- `src/app/[locale]/(auth)/connexion/page.tsx`

---

### STORY-112 : Refonte Dashboard App `[P1, L, 5pt]`

**Description :** Refonte de `dashboard/page.tsx` et composants dashboard d'après `dashboard.html`.

**Sections :**
- Header : Avatar user + "Good morning, {prénom}" + icône notifications
- Chips filtres : All / Personal / Couple / Business (scroll horizontal)
- **Balance Card** : Total Balance en grand (4xl bold), % variation vert, cartes VISA/Mastercard inline
- **3 KPIs** : In / Out / Fixed (grid 3 colonnes)
- **Balance History** : label "Balance History" + badge "30 Days" + graphique (réutilise `BalanceEvolutionChart` existant)
- **Transactions récentes** : titre + liste (5 transactions max)
- **Quick actions** flottant (bouton + rond)

**Acceptance Criteria :**
- AC-1 : Header avec avatar, prénom, bouton notifications
- AC-2 : Chips filtres scroll horizontal (All, Personal, Couple)
- AC-3 : Balance Card avec montant principal en `text-4xl font-bold`
- AC-4 : 3 KPI cards (In/Out/Fixed) en grid 3 colonnes
- AC-5 : Section "Balance History" avec le graphique existant réutilisé
- AC-6 : Liste des 5 dernières transactions (réutilise les données existantes)
- AC-7 : Fond `bg-background-light`, cards `bg-card-light` avec `shadow-soft border border-gray-100`
- AC-8 : Dark mode supporté (`dark:bg-background-dark`, etc.)
- AC-9 : Mobile-first, max-w-md

**Composants à créer/modifier :**
- `src/components/balance-card.tsx` (refonte)
- `src/components/kpi-cards.tsx` (refonte)
- `src/app/[locale]/(app)/dashboard/page.tsx` (mise à jour layout)

---

### STORY-113 : Refonte Transactions App `[P2, M, 3pt]`

**Description :** Refonte de `transactions/page.tsx` et composants d'après `transactions.html`.

**Sections :**
- Header sticky : titre "Transactions" (3xl extrabold) + bouton "Edit"
- Chips filtres scroll : All Accounts, Search, Tags
- **3 boutons d'action** : Import CSV / Export Data / AI Scan (icône auto_awesome)
- Liste groupée par date (sticky date headers)
- Chaque transaction : icône catégorie, nom, amount, swipe actions

**Acceptance Criteria :**
- AC-1 : Header sticky "Transactions" avec backdrop-blur
- AC-2 : Chips filtres scroll horizontal
- AC-3 : 3 boutons Import CSV / Export Data / AI Scan visibles
- AC-4 : Liste groupée par date avec headers sticky
- AC-5 : Chaque transaction avec icône catégorie ronde
- AC-6 : Montants en rouge (`text-expense`) / vert (`text-income`)
- AC-7 : Fond `bg-background-light`, dark mode

**Fichiers :**
- `src/app/[locale]/(app)/transactions/page.tsx`
- `src/components/transaction-list.tsx` (si existe)

---

### STORY-114 : Refonte Comptes App `[P2, S, 2pt]`

**Description :** Refonte de `comptes/page.tsx` d'après `comptes.html`.

**Design :**
- Header : label "Track My Cash" (primary), titre "Mes comptes" (3xl extrabold), bouton + arrondi bg-primary
- Cards comptes : rounded-2xl bg-white shadow-sm border, montant en emerald (positif) ou rose (négatif)
- Solde avec signe + ou - coloré
- Badge devise (EUR/MGA) en haut droite de la card
- "Mise à jour: Aujourd'hui, 10:00" sous le nom

**Acceptance Criteria :**
- AC-1 : Header avec label primary "Track My Cash" + bouton + bg-primary
- AC-2 : Cards avec rounded-2xl, fond blanc, shadow
- AC-3 : Solde coloré (vert si positif, rouge si négatif)
- AC-4 : Badge devise
- AC-5 : Dark mode supporté

**Fichiers :**
- `src/app/[locale]/(app)/comptes/page.tsx`

---

### STORY-115 : Refonte Budgets & Objectifs App `[P2, M, 3pt]`

**Description :** Refonte de `budgets/page.tsx` et `objectifs/page.tsx` d'après `budgets-1/2.html` et `objectifs-1/2.html`.

**Budgets :**
- Header "Budgets" + bouton add flottant
- Card "Smart Suggestions" (glass-panel, icône auto_awesome, suggestion IA)
- Liste budgets avec progress bars colorées (primary si OK, danger si dépassé)
- Chaque budget : icône catégorie, titre, montant dépensé/total, %

**Objectifs :**
- Header "Objectifs d'épargne"
- Stats summary : total épargné + nb projets actifs
- Cards objectifs : émoji + titre + progress bar + montant actuel/cible + badge "J-X jours"

**Acceptance Criteria :**
- AC-1 : Budgets — card "Smart Suggestions" avec effet glass-panel
- AC-2 : Budgets — progress bars colorées selon état (ok/warning/danger)
- AC-3 : Objectifs — stats summary (total + nb projets)
- AC-4 : Objectifs — cards avec émoji, progress bar, badge jours restants
- AC-5 : Dark mode

**Fichiers :**
- `src/app/[locale]/(app)/budgets/page.tsx`
- `src/app/[locale]/(app)/objectifs/page.tsx`

---

### STORY-116 : Refonte Paramètres + Récurrents + Prévisions `[P2, M, 3pt]`

**Description :** Refonte de `parametres/page.tsx`, `recurrents/page.tsx` et `previsions/page.tsx`.

**Paramètres :** Style iOS — grouped lists, ios-toggle pour dark mode, section headers, chevron right, fond `background-light` (#f2f2f7)

**Récurrents :** Card "Insight IA" (glass-panel) avec détection abonnements + liste récurrents

**Prévisions :** Navigation mois (tab), filtres comptes en chips, sliders pour projections

**Acceptance Criteria :**
- AC-1 : Paramètres — grouped lists style iOS, fond #f2f2f7
- AC-2 : Paramètres — toggle switch iOS (custom CSS)
- AC-3 : Récurrents — card "Insight" avec glass-panel
- AC-4 : Prévisions — onglets mois navigation
- AC-5 : Dark mode sur les 3 pages

**Fichiers :**
- `src/app/[locale]/(app)/parametres/page.tsx`
- `src/app/[locale]/(app)/recurrents/page.tsx`
- `src/app/[locale]/(app)/previsions/page.tsx`

---

### STORY-117 : Refonte Conseiller IA `[P2, S, 2pt]`

**Description :** Refonte du chat IA d'après `conseiller-ia-1/2.html`.

**Design :**
- Header : back button + titre "Conseiller IA" + badge "Premium" bg-primary/10
- Messages utilisateur (alignés droite, bg-primary text-white, rounded-2xl)
- Messages IA (alignés gauche, bg-card, rounded-2xl) avec avatar gradient indigo→purple
- Structured data cards (cards avec données formatées, progress bars)
- Input zone fixe en bas (rounded-full, bg-card)
- Chips suggestions : "Analyse nos dépenses communes", "Optimise notre budget"

**Acceptance Criteria :**
- AC-1 : Header avec badge "Premium"
- AC-2 : Bulles messages user (droite, bg-primary) et IA (gauche, bg-card)
- AC-3 : Avatar IA avec initiales ou icône smart_toy
- AC-4 : Structured data card (analyse avec progress bar)
- AC-5 : Chips suggestions scrollables
- AC-6 : Input fixe en bas

**Fichiers :**
- `src/app/[locale]/(app)/conseiller/page.tsx`
- `src/components/ai-chat.tsx`

---

### STORY-118 : Refonte Compte Suspendu `[P3, XS, 1pt]`

**Description :** Refonte de `compte-suspendu/page.tsx` d'après `compte-suspendu.html`.

**Design :**
- Badge pulsant rouge "Compte restreint"
- Titre "Compte Suspendu" avec icône lock
- Card warning "Suppression programmée dans X jours"
- Steps 1-2 pour récupérer le compte
- Liens mailto support

**Acceptance Criteria :**
- AC-1 : Badge "Compte restreint" avec animation pulse rouge
- AC-2 : Card danger avec délai de suppression
- AC-3 : Steps numérotés pour récupération
- AC-4 : Lien vers support

**Fichiers :**
- `src/app/[locale]/compte-suspendu/page.tsx`

---

## Ordre d'implémentation

```
107 (CSS tokens) → 108 (landing) → 109 (tarifs) → 110 (features+import)
→ 111 (auth) → 112 (dashboard) → 113 (transactions) → 114 (comptes)
→ 115 (budgets/objectifs) → 116 (paramètres/récurrents/prévisions)
→ 117 (conseiller IA) → 118 (compte suspendu)
```

**Note :** STORY-107 est un prérequis pour toutes les autres.

## Métriques cible sprint v15

| Métrique | Cible |
|---------|-------|
| Stories livrées | 12/12 |
| Tests ajoutés | ≥ 36 (3/story min) |
| Zéro régression | 911+ tests PASS |
| Build TypeScript | 0 erreur |
| Fidélité visuelle | ≥ 90% vs maquettes Stitch |

---

## Fichiers à ne pas toucher

- `src/lib/parsers.ts` — parsers bancaires (lecture seule pour STORY-110)
- `src/lib/couple-queries.ts` — logique couple
- `src/lib/queries.ts` — requêtes SQL
- `src/app/actions/` — Server Actions
