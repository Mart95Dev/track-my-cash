# PRD — Sprint Design Stitch (v10)

**Version :** 10.0
**Date :** 2026-02-24
**Statut :** Prêt pour décomposition en stories
**Périmètre :** Refonte visuelle complète des 14 pages de l'application à partir des maquettes Google Stitch

---

## Contexte

Le Sprint Engagement & Analyse Avancée (v9) est **entièrement livré** :
- ✅ 7/7 stories PASS (495 tests, QA PASS)
- ✅ Email hebdo IA, récurrents via chat, vue agrégée, YoY, export RGPD, notes transactions, parsers ING + Boursorama
- ✅ 67 stories livrées sur 9 sprints — SaaS complet, freemium opérationnel, IA mature

**Opportunité identifiée :**

L'application est fonctionnellement complète mais le design actuel est générique (shadcn/ui par défaut). Des maquettes professionnelles ont été créées sur Google Stitch pour les 14 pages. Ce sprint est un **reskin complet** : refonte visuelle fidèle aux maquettes sans toucher à la logique métier.

**Maquettes Stitch (Projet ID : 2264243572365741677) :**

| Page | Screen ID |
|------|-----------|
| Prévisions | 118eb6ec10454c86a23c51909bb1590c |
| Mes Comptes | 1473d89887214507977a08e752374bca |
| Objectifs | 2dfd61e3d7974aa798c8cf45b8c6d33d |
| Conseiller IA | 2e941e489a4b45dd81effcc8f2b6c30a |
| Compte suspendu | 3d077234e09d4efa9bf9e53135ed1f68 |
| Dashboard | 44f9211fe059435ebac885039aaa38be |
| Transactions | 6bf846de55694456ba131bbd912e3d36 |
| Paramètres | 6d826d6eeeab4e268bf2c942057eed3f |
| Inscription | 89bf3bb5eb1f47eb8945e6e3c8dd4624 |
| Landing Page | 9fc2079a3cc84e4d9551a76d9da2a96e |
| Connexion | ba021f24ca4d481fb89b6746550f800b |
| Budgets | c391947b97374161acbcd29c53d80a3a |
| Paiements Récurrents | c6c0c00bdf3147a3b412b31db6913c70 |
| Tarifs | f80740c88e1243e78d01be72f3297586 |

---

## Design System — Spécifications extraites des maquettes

### Palette de couleurs

```
primary:           #4848e5   (indigo — CTA, liens actifs, icônes accent)
background-light:  #f6f6f8   (fond général clair)
background-dark:   #111121   (fond général sombre)
card-light:        #ffffff   (fond des cartes en mode clair)
card-dark:         #1a1a2e   (fond des cartes en mode sombre)
text-main:         #0e0e1b   (texte principal)
text-muted:        #505095   (texte secondaire, labels, sous-titres)
success:           #078841   (revenus, budget OK, variation positive)
warning:           #e7a008   (budget à 75%+, alertes)
danger:            #e74008   (dépenses, budget dépassé, solde négatif)
indigo-50:         #eef2ff   (fond subtle pour badges/tags primary)
```

### Typographie

- **Police** : `Manrope` (Google Fonts) — weights 400, 500, 600, 700, 800
- **Icônes** : `Material Symbols Outlined` — remplace Lucide React dans les composants modifiés
- **Body** : font-sans = Manrope, antialiased
- **Titres** : font-extrabold tracking-tight

### Border radius

```
DEFAULT: 0.5rem    (inputs, badges)
lg:      1rem      (boutons, petites cartes)
xl:      1.5rem    (cartes principales)
2xl:     2rem      (grandes cartes, modales)
full:    9999px    (pills, avatars)
```

### Ombres

```
soft: 0 4px 20px -2px rgba(0, 0, 0, 0.05)   (toutes les cartes blanches)
```

### Patterns UI récurrents

| Composant | Classe Tailwind |
|-----------|----------------|
| Carte standard | `bg-white dark:bg-card-dark rounded-2xl border border-gray-100 dark:border-gray-800 shadow-soft p-5` |
| Bouton primaire | `bg-primary hover:bg-primary/90 text-white font-bold py-4 px-6 rounded-xl shadow-lg shadow-primary/20` |
| Bouton outline | `border-2 border-primary text-primary hover:bg-primary/5 font-bold rounded-xl` |
| Input | `rounded-xl border-0 py-4 pl-12 ring-1 ring-slate-200 dark:ring-slate-700 focus:ring-2 focus:ring-primary` |
| Badge success | `bg-success/10 text-success text-xs font-bold rounded-md px-2 py-0.5` |
| Badge warning | `bg-warning/10 text-warning text-xs font-bold rounded-md px-2 py-0.5` |
| Badge danger | `bg-danger/10 text-danger text-xs font-bold rounded-md px-2 py-0.5` |
| Pill actif | `bg-primary text-white rounded-full px-5 h-9 text-sm font-bold` |
| Pill inactif | `bg-white dark:bg-card-dark border border-gray-100 dark:border-gray-700 text-text-muted rounded-full px-5 h-9` |

---

## Architecture existante à respecter (INCHANGÉE)

- **Server Actions** : `src/app/actions/` — aucune modification
- **Queries SQL** : `src/lib/queries.ts` + `src/lib/db.ts` — aucune modification
- **Parsers bancaires** : `src/lib/parsers/` — aucune modification
- **Types TypeScript** : tous les types existants préservés
- **Logique métier** : calculs, IA, Stripe, RGPD, email, crons — tous préservés
- **Tailwind CSS v4** : configuration CSS-first via `@theme` dans `globals.css`
- **shadcn/ui** : composants utilisés dans les dialogues/modales (EditTransactionDialog, etc.) — préservés

---

## Périmètre — Stories MoSCoW

---

### 🔴 MUST HAVE

#### STORY-068 : Foundation — Design tokens, Manrope, Material Symbols

**Description :** Implémenter le design system dans `globals.css` (tokens `@theme` Tailwind v4), charger la police Manrope via `next/font/google`, et installer Material Symbols Outlined. Cette story est le prérequis bloquant pour toutes les autres.

**Fichiers à modifier :**
- `src/app/globals.css` — tokens `@theme` complets (couleurs, radius, ombres)
- `src/app/layout.tsx` (layout racine) — charger Manrope + classe font sur `<body>`
- `src/app/[locale]/layout.tsx` — idem si layout par locale

**Tokens @theme à ajouter :**
```css
@theme {
  --color-primary: #4848e5;
  --color-background-light: #f6f6f8;
  --color-background-dark: #111121;
  --color-card-light: #ffffff;
  --color-card-dark: #1a1a2e;
  --color-text-main: #0e0e1b;
  --color-text-muted: #505095;
  --color-success: #078841;
  --color-warning: #e7a008;
  --color-danger: #e74008;
  --color-indigo-50: #eef2ff;
  --radius: 0.5rem;
  --radius-lg: 1rem;
  --radius-xl: 1.5rem;
  --radius-2xl: 2rem;
  --shadow-soft: 0 4px 20px -2px rgba(0,0,0,0.05);
  --font-sans: 'Manrope', sans-serif;
  --font-display: 'Manrope', sans-serif;
}
```

**Acceptance Criteria :**
- AC-1 : `npm run build` passe sans erreur après modification de `globals.css`
- AC-2 : La classe `text-primary` applique `#4848e5` sur tous les éléments
- AC-3 : La classe `bg-background-light` applique `#f6f6f8`
- AC-4 : La police Manrope est chargée et appliquée sur `<body>` (visible dans DevTools)
- AC-5 : Material Symbols Outlined est accessible via `<span class="material-symbols-outlined">`
- AC-6 : Le dark mode fonctionne (classes `dark:bg-background-dark` etc.)

---

#### STORY-069 : BottomNav + Layout App refonte

**Description :** Créer le composant `<BottomNav>` (barre de navigation mobile en bas, 5 onglets) et adapter le layout de l'application pour le design mobile-first avec `max-w-md mx-auto` et `pb-24`.

**Fichiers à créer/modifier :**
- `src/components/bottom-nav.tsx` — barre de navigation avec 5 onglets :
  - Dashboard (`/dashboard`) — icône `space_dashboard`
  - Comptes (`/comptes`) — icône `account_balance_wallet`
  - Transactions (`/transactions`) — icône `receipt_long`
  - Récurrents (`/recurrents`) — icône `autorenew`
  - Conseiller (`/conseiller`) — icône `smart_toy`
- `src/app/[locale]/(app)/layout.tsx` — intégrer `<BottomNav>`, wrapper `max-w-md mx-auto pb-24 bg-background-light dark:bg-background-dark`
- Supprimer ou adapter la `<Navigation>` latérale existante (remplacée par BottomNav)

**Comportement BottomNav :**
```
- Position : fixed bottom-0, w-full, z-50
- Fond : bg-white dark:bg-card-dark border-t border-gray-100 dark:border-gray-800
- Onglet actif : icône + label text-primary
- Onglet inactif : icône + label text-text-muted
- Hauteur : h-16 (64px) + safe-area-bottom (pb-safe)
```

**Acceptance Criteria :**
- AC-1 : Le `<BottomNav>` s'affiche en bas de toutes les pages app
- AC-2 : L'onglet actif est mis en surbrillance (couleur primary)
- AC-3 : La navigation fonctionne vers les 5 routes
- AC-4 : Le contenu des pages n'est pas masqué par la barre (padding-bottom: 80px)
- AC-5 : Le layout app est centré `max-w-md mx-auto`
- AC-6 : Le BottomNav est Server Component (utilise `usePathname` via un client wrapper)

---

#### STORY-070 : Pages Auth — Connexion, Inscription, Compte suspendu

**Description :** Refonte complète des 3 pages d'authentification selon les maquettes Stitch.

**Connexion (`/connexion`) — design maquette :**
- Fond `bg-background-light`
- Logo : icône `account_balance_wallet` dans un carré primary/10, texte "TMC" en primary
- Titre : "Bon retour !" (font-extrabold, 3xl)
- Inputs : avec icône Material Symbol à gauche (`mail`, `lock`), icône visibility pour le mot de passe
- Bouton submit : bg-primary + icône `arrow_forward`
- Séparateur "ou" + lien "Créer un compte"

**Inscription (`/inscription`) — design maquette :**
- Même structure que Connexion
- Titre : "Rejoignez TrackMyCash"
- 3 champs : nom (icône `person`), email (icône `mail`), mot de passe (icône `lock`)
- Bouton : "Créer mon compte" + icône `arrow_forward`
- Lien : "Déjà un compte ? Se connecter"

**Compte suspendu (`/compte-suspendu`) — design maquette :**
- Icône `warning` (Material Symbol FILL=1, taille 64px, couleur warning)
- Titre : "Compte suspendu"
- Card d'alerte (bg-warning/10, border-warning/20) avec délai 30j et date
- Section "Comment réactiver ?" avec 2 étapes numérotées
- Bouton outline "Retour à l'accueil"

**Acceptance Criteria :**
- AC-1 : La page Connexion affiche le logo TMC + form avec icônes Material Symbols
- AC-2 : La page Inscription affiche 3 champs avec icônes
- AC-3 : La logique d'authentification existante (authClient.signIn/signUp) est préservée
- AC-4 : Les états loading et erreur fonctionnent toujours
- AC-5 : La page Compte suspendu affiche l'icône warning + les étapes + le bouton retour
- AC-6 : Les pages sont responsive et centrées `max-w-[400px] mx-auto`

---

#### STORY-071 : Pages Marketing — Landing Page + Tarifs

**Description :** Refonte des 2 pages marketing publiques selon les maquettes Stitch.

**Landing Page (`/`) — sections :**
1. **Navbar** : sticky, `bg-background-light/80 backdrop-blur-md`, logo "Track My Cash" + bouton "Connexion" en primary
2. **Hero** : badge pill "✨ Nouvelle version", titre 4xl extrabold, sous-titre, 2 CTA (S'inscrire = bg-primary, En savoir plus = border)
3. **Features** : grille 1/2/3 colonnes, 6 cards (icône Material Symbols dans bg-indigo-50 + titre + description)
4. **Pricing** : 3 plans horizontaux sur desktop, plan Pro mis en avant (border-primary, badge "Populaire", scale-105)
5. **Sticky CTA bottom** : `sticky bottom-0 bg-white border-t`, texte + bouton "Créer mon compte"
6. **Footer** : liens Confidentialité, Conditions, Contact

**Tarifs (`/tarifs`) — sections :**
1. **3 cartes plans** : Gratuit (0€), Pro (4,99€/mois, bordure primary), Premium (9,99€/mois)
2. **Plan populaire** : badge "Populaire" absolu -top-3, transform scale-105 sur desktop
3. **Tableau comparatif** : 12 features, check_circle (primary) / cancel (slate-400) avec Material Symbols
4. **CTA bas** : 2 cards Pro + Premium avec `<SubscribeButton>` Stripe existant

**Acceptance Criteria :**
- AC-1 : La Landing Page affiche les 6 sections dans l'ordre (navbar, hero, features, pricing, CTA, footer)
- AC-2 : Les 6 feature cards utilisent des icônes Material Symbols
- AC-3 : Le plan Pro est visuellement mis en avant (bordure primary, badge "Populaire")
- AC-4 : La Sticky CTA reste visible en bas de la Landing Page
- AC-5 : La page Tarifs affiche le tableau comparatif avec 12 features
- AC-6 : Les boutons Stripe (`<SubscribeButton>`) fonctionnent toujours sur /tarifs
- AC-7 : Les métadonnées SEO (title, description) sont préservées
- AC-8 : `npm run build` passe sans erreur

---

#### STORY-072 : Dashboard — Refonte complète

**Description :** Refonte complète de la page Dashboard selon la maquette Stitch. Page la plus complexe avec le plus de composants visuels.

**Structure de la page (ordre d'affichage) :**

1. **Header** : avatar utilisateur (initiales dans cercle primary) + prénom + "Bonjour," + bouton notifications
2. **Account selector pills** : scroll horizontal, pill "Tous les comptes" (ou nom compte), pills par compte (bg-white border)
3. **Balance card** : carte blanche grande, label "Solde total", montant XXX,XX€ bold, badge variation (+/- %), mini badges devises
4. **KPI cards (3 colonnes)** : Revenus (icône arrow_downward, bg-green-100), Dépenses (icône arrow_upward, bg-red-100), Récurrents (icône autorenew, bg-primary/10)
5. **Health Score + Spending (grid 2 col)** : Health Score = SVG circle progress (0-100, libellé "Excellent/Bien/Attention"), Spending = donut SVG + légende catégories
6. **Balance Evolution chart** : card blanche, titre "Évolution du solde", badge +X%, SVG inline simple (path courbe)
7. **Budgets** : titre "Budgets" + lien "Voir tout" → /budgets, liste 2-3 budget cards avec progress bar colorée
8. **Savings Goals** : titre "Objectifs d'épargne", card bg-primary (fond uni), icône goal + nom + montant atteint/cible + progress bar blanche

**Composants à créer/modifier :**
- `src/components/health-score-widget.tsx` — SVG circle progress (remplace l'existant ou adapte)
- `src/components/spending-donut.tsx` — donut SVG inline (sans Recharts)
- `src/components/balance-evolution-chart.tsx` — SVG path inline (sans Recharts pour la vue principale)
- `src/components/kpi-cards.tsx` — 3 colonnes KPI

**Acceptance Criteria :**
- AC-1 : Le header affiche avatar (initiales) + prénom de l'utilisateur
- AC-2 : Les account pills permettent de basculer entre comptes (logique existante préservée)
- AC-3 : La balance card affiche le solde calculé réel (pas de données fictives)
- AC-4 : Les 3 KPI cards affichent revenus/dépenses/récurrents du mois réel
- AC-5 : Le Health Score SVG affiche le score calculé (0-100) depuis `computeHealthScore()`
- AC-6 : La section Budgets affiche les budgets réels du mois avec progression
- AC-7 : La section Goals affiche les objectifs réels avec leur progression
- AC-8 : Le fond des cards Goals est bg-primary (uni, pas de dégradé)

---

### 🟡 SHOULD HAVE

#### STORY-073 : Page Comptes — Refonte

**Description :** Refonte de la page `/comptes` selon la maquette Stitch.

**Design maquette :**
- Header de page : titre "Mes Comptes" (text-main, font-bold) + bouton "+" (ajouter)
- Liste des comptes : cards blanches avec :
  - Icône compte dans cercle coloré (bg-primary/10 pour courant, bg-success/10 pour épargne)
  - Nom du compte + type (badge)
  - Solde calculé : vert si positif, rouge si négatif, font-bold text-xl
  - Badges : alerte si < seuil (bg-warning/10 text-warning)
  - Actions : boutons icône edit (edit), reconciliation (balance), delete (delete)
- Formulaire d'ajout : dans une card ou bottom sheet

**Acceptance Criteria :**
- AC-1 : Chaque compte est affiché dans une card blanche rounded-2xl
- AC-2 : Le solde est coloré (text-success si ≥0, text-danger si <0)
- AC-3 : Le badge d'alerte apparaît si le solde est sous le seuil
- AC-4 : Les boutons edit/reconciliation/delete fonctionnent (logique existante préservée)
- AC-5 : Le formulaire d'ajout de compte est accessible
- AC-6 : Le design est cohérent avec le design system (Manrope, tokens couleurs)

---

#### STORY-074 : Page Transactions — Refonte

**Description :** Refonte de la page `/transactions` selon la maquette Stitch.

**Design maquette :**
- Barre de recherche : input rounded-xl avec icône `search` à gauche
- Actions en ligne : boutons Import (icône `upload_file`) + Export (icône `download`) + Auto-catégoriser (icône `auto_awesome`)
- Filtres : pills comptes + tags (scroll horizontal)
- Liste transactions : cards ou rows avec :
  - Date (text-muted xs)
  - Description (font-medium)
  - Catégorie + sous-catégorie (badge bg-indigo-50 text-primary)
  - Tags (badges colorés)
  - Montant (text-success pour income, text-danger pour expense)
  - Icône note (sticky_note) si note présente
  - Actions : edit (edit), delete (delete_outline)
- Pagination : boutons Précédent/Suivant

**Acceptance Criteria :**
- AC-1 : La barre de recherche fonctionne (filtrage existant préservé)
- AC-2 : Les boutons Import/Export/Auto-catégoriser déclenchent les actions existantes
- AC-3 : Les montants income sont en text-success, expense en text-danger
- AC-4 : Les tags colorés s'affichent correctement
- AC-5 : La pagination fonctionne (20 par page)
- AC-6 : L'icône note apparaît sur les transactions qui ont une note (STORY-066)
- AC-7 : Design responsive : liste cards sur mobile

---

#### STORY-075 : Pages Récurrents + Prévisions — Refonte

**Description :** Refonte des pages `/recurrents` et `/previsions`.

**Récurrents (`/recurrents`) — design :**
- Header + filtre compte (pill scroll)
- Section "Suggestions IA" collapsible (si suggestions disponibles) : cards avec bouton Accepter/Ignorer
- Liste paiements récurrents : cards avec icône catégorie, nom, fréquence (badge pill), montant (coloré), prochaine date
- Badge fréquence : "Mensuel" / "Hebdo" / "Annuel" (bg-indigo-50 text-primary)
- Actions : edit, delete

**Prévisions (`/previsions`) — design :**
- 4 KPI cards en ligne (scroll) : Solde actuel, Revenus/mois, Dépenses/mois, Solde projeté
- Tableau mensuel : card blanche, lignes alternées, colonnes mois/revenus/dépenses/net/solde
- Section récurrents séparée : 2 sous-sections "Revenus récurrents" / "Dépenses récurrentes"
- Section "Mois prochain" : forecast par catégorie + insights IA (si Premium)
- ScenarioSimulator : card avec sliders/inputs pour what-if

**Acceptance Criteria Récurrents :**
- AC-1 : Les paiements récurrents s'affichent en cards avec badge fréquence
- AC-2 : Les montants sont colorés (success/danger)
- AC-3 : Les suggestions IA s'affichent si disponibles (logique existante préservée)
- AC-4 : Les actions edit/delete fonctionnent

**Acceptance Criteria Prévisions :**
- AC-5 : Les 4 KPI cards affichent les données réelles de forecast
- AC-6 : Le tableau mensuel est lisible et bien structuré
- AC-7 : Le ScenarioSimulator est accessible et fonctionnel
- AC-8 : Les insights IA s'affichent pour les plans Premium (guard préservé)

---

#### STORY-076 : Pages Budgets + Objectifs — Refonte

**Description :** Refonte des pages `/budgets` et `/objectifs`.

**Budgets (`/budgets`) — design :**
- Section "Suggestions IA" : cards avec budgets suggérés (montant + catégorie + bouton Accepter)
- Liste budgets actifs : cards avec :
  - Icône catégorie dans cercle coloré (shopping_cart, directions_car, etc.)
  - Nom catégorie + "X€ sur Y€"
  - Barre progression : h-2 rounded-full, couleur dynamique :
    - < 60% : bg-success
    - 60%-90% : bg-warning
    - > 90% : bg-danger
  - Badge % à droite (même couleur)
- Formulaire d'ajout : dans card ou bottom sheet

**Objectifs (`/objectifs`) — design :**
- Header : titre + icône `target`
- Liste objectifs : cards avec :
  - Icône objectif (flight_takeoff, house, etc.)
  - Nom + montant cible
  - Montant actuel + barre progression (bg-primary)
  - Badge % atteint
  - Badge deadline (bg-warning/10 si proche, bg-success/10 si loin)
- Formulaire d'ajout dans card

**Acceptance Criteria :**
- AC-1 : Les budgets affichent la barre de progression avec la couleur correcte selon le %
- AC-2 : Les suggestions IA de budgets s'affichent et peuvent être acceptées
- AC-3 : Le formulaire d'ajout de budget fonctionne (logique existante préservée)
- AC-4 : Les objectifs affichent le % de progression et la deadline
- AC-5 : La barre de progression des objectifs est bg-primary
- AC-6 : Le formulaire d'ajout d'objectif fonctionne

---

### 🟢 COULD HAVE

#### STORY-077 : Page Conseiller IA — Refonte

**Description :** Refonte de la page `/conseiller` selon la maquette chat mobile.

**Design maquette :**
- Header : icône `smart_toy` + titre "Conseiller IA" + badge plan (Pro/Premium)
- Zone de messages : scroll, bulles utilisateur (bg-primary text-white, aligné droite) vs IA (bg-white, aligné gauche)
- ToolResultCards : cards spéciales pour résultats budget/goal/recurring créés
- Chips suggestions : scroll horizontal en bas, bg-indigo-50 text-primary rounded-full, cliquables
- Input : fixed bottom (au-dessus du BottomNav), rounded-full, bouton send bg-primary
- État vide : icône smart_toy centré + texte invite

**Acceptance Criteria :**
- AC-1 : L'interface chat affiche les messages avec les bulles gauche/droite
- AC-2 : Les chips de suggestions sont cliquables et pré-remplissent l'input
- AC-3 : L'input est positionné au-dessus du BottomNav (z-index correct)
- AC-4 : Les ToolResultCards s'affichent pour budget/goal/recurring créés
- AC-5 : Le guard freemium (canUseAI) est préservé
- AC-6 : L'état vide affiche un message invitant à poser une question

---

#### STORY-078 : Page Paramètres — Refonte

**Description :** Refonte de la page `/parametres` selon la maquette Stitch.

**Design maquette — sections en cards séparées :**

1. **Abonnement** : card avec plan actuel (badge coloré), prix, statut, date renouvellement, bouton "Gérer mon abonnement" (outline primary)
2. **Données** : card avec boutons "Exporter mes données" + "Importer des données" + "Télécharger mes données RGPD"
3. **Rapports** : card avec boutons "Rapport mensuel PDF" + "Rapport annuel PDF" + toggle "Email récapitulatif hebdomadaire"
4. **Devises** : card avec sélecteur devise de référence + taux de change EUR/MGA
5. **IA** : card avec quota mensuel (barre progression) + toggle "Auto-catégorisation à l'import"
6. **Tags** : card avec liste tags colorés + bouton ajouter
7. **Règles de catégorisation** : card accordéon avec liste règles
8. **Zone Danger** : card bg-danger/5 border-danger/20, boutons "Réinitialiser les données" + "Supprimer mon compte"

**Acceptance Criteria :**
- AC-1 : Chaque section est dans une card blanche avec titre et icône
- AC-2 : Le plan actuel et son statut s'affichent correctement
- AC-3 : Le bouton portail Stripe fonctionne (`<BillingPortalButton>`)
- AC-4 : Les exports (données, RGPD, rapports) fonctionnent
- AC-5 : Le toggle auto-catégorisation fonctionne
- AC-6 : La zone danger affiche les boutons reset et suppression
- AC-7 : La suppression compte RGPD redirige vers `/compte-suspendu`

---

## Contraintes techniques impératives

| Contrainte | Détail |
|------------|--------|
| Server Actions | Aucune modification de `src/app/actions/` |
| Queries | Aucune modification de `src/lib/queries.ts` et `src/lib/db.ts` |
| Parsers | Aucune modification de `src/lib/parsers/` |
| TypeScript | Pas de type `any`, tous les types existants préservés |
| Logique IA | Guards freemium, canUseAI(), consensus — tous préservés |
| Stripe | SubscribeButton, BillingPortalButton — fonctionnement préservé |
| RGPD | Crons, deletion_requests, export JSON — préservés |
| Tailwind v4 | CSS-first, tokens via `@theme` dans globals.css |
| Couleurs | Unies uniquement (pas de dégradés) — exception : card Goals peut avoir bg-primary uni |
| Icônes | Remplacer Lucide par Material Symbols uniquement dans les composants modifiés |
| shadcn/ui | Dialogues et modales complexes peuvent garder shadcn (EditTransactionDialog, etc.) |
| Tests | Les tests existants doivent continuer à passer (`npm test`) |

---

## Critères de succès global

- [ ] La police Manrope est visible sur toutes les pages
- [ ] Les couleurs primary `#4848e5` et tokens sont appliquées correctement
- [ ] Le BottomNav s'affiche sur toutes les pages app avec l'onglet actif mis en surbrillance
- [ ] La Landing Page ressemble à la maquette Stitch (hero + features + pricing)
- [ ] Les pages auth (connexion, inscription) ont le design avec icônes Material Symbols
- [ ] Le Dashboard affiche les vraies données avec le nouveau design
- [ ] Les budgets et objectifs ont des barres de progression colorées
- [ ] Le chat IA a l'interface mobile avec bulles et chips suggestions
- [ ] `npm run build` passe sans erreur
- [ ] `npm test` : 495 tests existants PASS (pas de régression)

---

## Ordre de priorité recommandé

```
P1 → STORY-068 (Foundation — bloquant)
     ↓
P1 → STORY-069 (BottomNav + Layout — bloquant pour Phase 3+4)
     ↓
P1 → STORY-070 (Auth pages — indépendant)
P1 → STORY-071 (Marketing pages — indépendant)
     ↓
P1 → STORY-072 (Dashboard — page principale)
     ↓
P2 → STORY-073 (Comptes)
P2 → STORY-074 (Transactions)
     ↓
P2 → STORY-075 (Récurrents + Prévisions — indépendants entre eux)
P2 → STORY-076 (Budgets + Objectifs — indépendants entre eux)
     ↓
P3 → STORY-077 (Conseiller IA)
P3 → STORY-078 (Paramètres)
```

## Parallélisation possible

```
STORY-068
    ↓
STORY-069 (BottomNav)
    ↓
STORY-070  STORY-071   (Auth + Marketing — parallèles)
    ↓
STORY-072 (Dashboard)
    ↓
STORY-073  STORY-074   (Comptes + Transactions — parallèles)
    ↓
STORY-075  STORY-076   (Récurrents+Prévisions + Budgets+Objectifs — parallèles)
    ↓
STORY-077  STORY-078   (Chat IA + Paramètres — parallèles)
```

---

## Métriques sprint

| Métrique | Valeur |
|----------|--------|
| Total stories | 11 (STORY-068 à STORY-078) |
| Points total | 26 (2+2+3+3+4+3+3+3+3+2+3) |
| MUST HAVE | 5 × P1 (068-072) |
| SHOULD HAVE | 4 × P2 (073-076) |
| COULD HAVE | 2 × P3 (077-078) |
| Tests nouveaux attendus | ~15 (composants purs testables) |
| Tests existants | 495 — doivent rester PASS |

---

## Hors scope (sprint suivant)

- Animations et transitions (framer-motion, micro-animations)
- Mode sombre complet (dark mode toggle) — les tokens dark: sont en place mais le switch UI n'est pas prioritaire
- Onboarding wizard redesign
- Pages d'erreur (not-found, error boundary) redesign
- Notifications bell redesign avancé
- PWA splash screen redesign

---

## Dépendances techniques

| Story | Dépend de |
|-------|-----------|
| STORY-068 | Aucune (fondation) |
| STORY-069 | STORY-068 (tokens couleurs) |
| STORY-070 | STORY-068 (tokens + Manrope) |
| STORY-071 | STORY-068 (tokens + Manrope) |
| STORY-072 | STORY-069 (BottomNav + layout) |
| STORY-073 | STORY-069 (BottomNav + layout) |
| STORY-074 | STORY-069 (BottomNav + layout) |
| STORY-075 | STORY-069 (BottomNav + layout) |
| STORY-076 | STORY-069 (BottomNav + layout) |
| STORY-077 | STORY-069 (BottomNav + layout + z-index input) |
| STORY-078 | STORY-069 (BottomNav + layout) |

---

*PRD généré par FORGE PM Agent — 2026-02-24*
