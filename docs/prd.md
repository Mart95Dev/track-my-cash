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

*PRD généré par FORGE PM Agent — 2026-02-24 [v10]*

---

---

# PRD — Sprint Conversion & Monétisation (v11)

**Version :** 11.0
**Date :** 2026-02-24
**Statut :** Prêt pour décomposition en stories
**Périmètre :** Amélioration du funnel de conversion — Stripe Tax, modales urgence/upgrade, page succès, features sur les cards tarifs

---

## Contexte

Le Sprint Design Stitch (v10) est **entièrement livré** :
- ✅ 11/11 stories PASS (495 tests, QA PASS)
- ✅ Design system Manrope + tokens Stitch + Material Symbols + BottomNav + reskin complet 14 pages
- ✅ 78 stories livrées sur 10 sprints

**Opportunité identifiée :**

L'application est visuellement complète et fonctionnellement mature, mais le **funnel de conversion trial → payant est sous-optimisé** :

1. **TVA non configurée** — `automatic_tax` absent du checkout Stripe → risque de non-conformité fiscale
2. **Urgence visuelle insuffisante** — le `PlanBanner` exist déjà mais aucune modale ne frappe l'utilisateur à J-3/J-1
3. **Mur de feature silencieux** — les guards retournent des toast/erreurs texte ; aucune modale d'upgrade contextuelle ne propose le plan au bon moment
4. **Pas de page de succès** — après paiement, redirection vers `/parametres?tab=billing&success=true` (peu engageant)
5. **Cards /tarifs sans features** — les cards plans sur la page tarifs et la landing page n'affichent pas les bullets de features incluses

---

## Objectifs business

| Métrique | Baseline | Cible sprint |
|----------|----------|--------------|
| Taux trial → payant | ~10% (estimé) | +5 pts grâce à urgence + contextuel |
| Conformité TVA | ❌ non configuré | ✅ Stripe Tax activé |
| NPS post-achat | N/A | Page succès avec onboarding |

---

## Architecture existante (contexte technique)

- **`src/app/api/stripe/checkout/route.ts`** — crée la session Stripe ; `success_url` → `/parametres?tab=billing&success=true`
- **`src/lib/stripe-plans.ts`** — `PLANS` object (free/pro/premium) avec `features[]` et `limits`
- **`src/lib/subscription-utils.ts`** — `getUserPlanId()`, `canCreateAccount()`, `canUseAI()`, `canImportFormat()`
- **`src/components/plan-banner.tsx`** — bannière orange trialing / bleue free
- **`src/app/api/cron/check-trials/route.ts`** — cron qui expire les trials
- **`src/app/[locale]/(marketing)/tarifs/page.tsx`** — page Tarifs, COMPARISON_FEATURES[], SubscribeButton

---

## Stories

### 🔴 MUST HAVE

#### STORY-079 : Stripe Tax — TVA automatique

**Description :** Activer Stripe Tax sur toutes les sessions de checkout pour calculer et collecter automatiquement la TVA selon la localisation du client. Prérequis légal pour les marchés EU.

**Modifications :**
- `src/app/api/stripe/checkout/route.ts` : ajouter `automatic_tax: { enabled: true }` dans `stripe.checkout.sessions.create()`
- `src/app/api/stripe/checkout/route.ts` : activer `customer_update` ou utiliser `tax_id_collection: { enabled: true }` pour permettre la saisie du numéro de TVA professionnel

**Prérequis Stripe Dashboard :**
- Stripe Tax activé dans le Dashboard Stripe (hors code — documenté dans la story)
- Registrations TVA configurées pour les pays cibles (FR minimum)

**Acceptance Criteria :**
- AC-1 : Le paramètre `automatic_tax: { enabled: true }` est présent dans `stripe.checkout.sessions.create()`
- AC-2 : `tax_id_collection: { enabled: true }` est présent pour permettre saisie N° TVA pro
- AC-3 : `npm run build` passe sans erreur TypeScript
- AC-4 : La session checkout est créée sans erreur Stripe (test avec clé test)
- AC-5 : Les tests unitaires de la route checkout passent

**Tests (TU-79-x) :**
- TU-79-1 : Le body de la session Stripe contient `automatic_tax.enabled = true`
- TU-79-2 : Le body contient `tax_id_collection.enabled = true`
- TU-79-3 : La route retourne 400 si `planId` invalide (existant, non-regression)
- TU-79-4 : La route retourne l'URL Stripe si plan valide (existant, non-regression)

---

#### STORY-080 : Emails de rappel trial J-3 et J-1

**Description :** Envoyer un email de rappel automatique à J-3 et J-1 avant l'expiration du trial Pro pour inciter à souscrire. Les emails sont envoyés par le cron existant (ou un nouveau cron dédié).

**Nouvelles colonnes DB :**
- `subscriptions.reminder_3d_sent` (INTEGER DEFAULT 0) — 1 si email J-3 envoyé
- `subscriptions.reminder_1d_sent` (INTEGER DEFAULT 0) — 1 si email J-1 envoyé

**Nouveau cron :**
- `src/app/api/cron/trial-reminders/route.ts` — GET protégé par `CRON_SECRET`
  - Cherche les subscriptions `status = 'trialing'` avec `trial_ends_at` dans 1 à 4 jours
  - Envoie email J-3 si `daysLeft ≈ 3` et `reminder_3d_sent = 0`
  - Envoie email J-1 si `daysLeft ≈ 1` et `reminder_1d_sent = 0`
  - Marque les flags après envoi

**Templates email :**
- `renderTrialReminderEmail(daysLeft: 3 | 1, userName: string)` — HTML minimaliste
- Sujet J-3 : "⏳ Votre essai Pro expire dans 3 jours"
- Sujet J-1 : "⚠️ Dernière chance — votre essai Pro expire demain"
- CTA : bouton "Continuer avec Pro →" → lien `/tarifs`

**Acceptance Criteria :**
- AC-1 : La migration DB ajoute `reminder_3d_sent` et `reminder_1d_sent` à la table `subscriptions`
- AC-2 : Le cron `/api/cron/trial-reminders` est protégé par `CRON_SECRET`
- AC-3 : Un utilisateur avec `daysLeft = 3` reçoit l'email J-3 (flag mis à 1)
- AC-4 : Un utilisateur avec `daysLeft = 1` reçoit l'email J-1 (flag mis à 1)
- AC-5 : L'email n'est pas renvoyé si le flag est déjà à 1 (idempotent)
- AC-6 : Les emails contiennent le lien `/tarifs`

**Tests (TU-80-x) :**
- TU-80-1 : `renderTrialReminderEmail(3, "Alice")` contient "3 jours" et le CTA
- TU-80-2 : `renderTrialReminderEmail(1, "Alice")` contient "demain" et le CTA
- TU-80-3 : Le cron retourne 200 avec `{ sent: 0 }` si aucun trial proche
- TU-80-4 : Le cron retourne 401 sans CRON_SECRET (non-regression)
- TU-80-5 : La logique de filtre identifie correctement les trials à J-3 et J-1

---

#### STORY-081 : Modale urgence trial ≤ 3 jours

**Description :** Afficher une modale d'urgence dans l'application quand l'essai Pro expire dans ≤ 3 jours. La modale s'affiche une seule fois par jour (localStorage). Elle est dismissable mais présente un CTA fort.

**Nouveau composant :**
- `src/components/trial-urgency-modal.tsx` — `"use client"`
  - Props : `daysRemaining: number`, `planId: string`
  - S'affiche si `daysRemaining <= 3 && status === "trialing"`
  - Vérifie `localStorage.getItem("trial_modal_shown_date")` — ne s'affiche pas si déjà montré aujourd'hui
  - Après dismiss/CTA : `localStorage.setItem("trial_modal_shown_date", today)`

**Design (Stitch design system) :**
- Overlay `fixed inset-0 bg-black/50 z-50 flex items-center justify-center`
- Card `bg-white rounded-2xl p-6 max-w-sm mx-4 flex flex-col gap-4`
- Icône `hourglass_empty` Material Symbols (FILL=1, 40px, couleur warning)
- Titre : "Votre essai expire bientôt"
- Sous-titre : `${daysRemaining} jour${daysRemaining > 1 ? "s" : ""} restant${daysRemaining > 1 ? "s" : ""}`
- Bullet points des 3 features Pro les plus importantes
- CTA principal : `bg-primary text-white` → `/tarifs`
- Bouton secondaire : `text-text-muted text-sm` → "Plus tard"

**Intégration :**
- Dans `src/app/[locale]/(app)/layout.tsx` : récupérer `daysRemaining` depuis subscription et rendre `<TrialUrgencyModal />`

**Acceptance Criteria :**
- AC-1 : La modale s'affiche si `daysRemaining <= 3` et `status === "trialing"`
- AC-2 : La modale ne s'affiche pas si déjà montrée aujourd'hui (localStorage)
- AC-3 : Le CTA "Souscrire" redirige vers `/tarifs`
- AC-4 : Le bouton "Plus tard" ferme la modale et enregistre la date
- AC-5 : La modale ne s'affiche PAS si `daysRemaining > 3`
- AC-6 : La modale ne s'affiche PAS si plan actif (status = "active") ou free

**Tests (TU-81-x) :**
- TU-81-1 : `<TrialUrgencyModal daysRemaining={3} />` rend la modale (visible)
- TU-81-2 : `<TrialUrgencyModal daysRemaining={4} />` ne rend rien
- TU-81-3 : Clic "Plus tard" cache la modale
- TU-81-4 : localStorage contient `trial_modal_shown_date` après dismiss
- TU-81-5 : Si `trial_modal_shown_date` = aujourd'hui, la modale ne s'affiche pas au montage

---

### 🟡 SHOULD HAVE

#### STORY-082 : Modale upgrade contextuelle

**Description :** Remplacer les messages d'erreur silencieux (toast texte) par une modale d'upgrade contextuelle quand un utilisateur tente d'utiliser une feature réservée à Pro/Premium. La modale présente le plan cible, les features débloquées, et un CTA direct vers le checkout.

**Nouveau hook :**
- `src/hooks/use-upgrade-modal.ts` — `"use client"`
  - `showUpgradeModal(reason: UpgradeReason)` — ouvre la modale
  - `UpgradeReason` : `"ai" | "accounts_limit" | "import_pdf" | "import_xlsx" | "history" | "export_pdf"`
  - Chaque reason mappe vers : titre, description, features débloquées, plan cible (pro/premium)

**Nouveau composant :**
- `src/components/upgrade-modal.tsx` — `"use client"`
  - Props : `reason: UpgradeReason | null`, `onClose: () => void`
  - Design cohérent Stitch : rounded-2xl, bg-white, icône Material Symbols, CTA bg-primary
  - Affiche le plan cible (Pro ou Premium), le prix, la liste des features
  - CTA : "Passer au plan [X]" → déclenche le checkout Stripe directement
  - Lien secondaire : "Voir tous les tarifs →"

**Intégration :**
- Remplacer les `toast.error()` dans les composants client par `showUpgradeModal(reason)`
- Composants concernés : `import-dialog.tsx`, `ai-chat.tsx`, composants d'ajout de compte

**Acceptance Criteria :**
- AC-1 : Tentative d'import PDF sur plan free → modale upgrade (raison "import_pdf") au lieu de toast
- AC-2 : Tentative d'utiliser l'IA sur plan free → modale upgrade (raison "ai")
- AC-3 : Tentative d'ajout compte au-delà de la limite → modale upgrade (raison "accounts_limit")
- AC-4 : La modale affiche le nom du plan cible, le prix et ≥ 3 features
- AC-5 : Le CTA "Passer au plan X" lance le checkout Stripe (appel `/api/stripe/checkout`)
- AC-6 : Le bouton "Fermer" ferme la modale sans redirection

**Tests (TU-82-x) :**
- TU-82-1 : `<UpgradeModal reason="ai" onClose={fn} />` affiche le plan Pro
- TU-82-2 : `<UpgradeModal reason="import_pdf" onClose={fn} />` affiche le plan Pro
- TU-82-3 : `<UpgradeModal reason={null} />` ne rend rien
- TU-82-4 : Clic "Fermer" appelle `onClose`
- TU-82-5 : `useUpgradeModal()` expose `showUpgradeModal` et `upgradeReason`

---

#### STORY-083 : Page succès post-paiement

**Description :** Remplacer la redirection post-paiement vers `/parametres?tab=billing&success=true` par une vraie page de succès `/bienvenue` qui confirme l'achat, récapitule les features débloquées, et guide l'utilisateur vers sa première action.

**Nouvelle page :**
- `src/app/[locale]/(app)/bienvenue/page.tsx` — Server Component
  - Lit le param `?plan=pro` ou `?plan=premium` depuis `searchParams`
  - Récupère la session et affiche le prénom de l'utilisateur

**Design :**
- Icône `check_circle` (Material Symbols FILL=1, 64px, couleur success)
- Titre : "Bienvenue dans le plan [Pro/Premium] !"
- Sous-titre : "Votre abonnement est actif."
- Section "Ce que vous venez de débloquer" : liste des features du plan avec icônes
- 3 boutons d'action : "Importer mes transactions" (→ `/transactions`), "Explorer l'IA" (→ `/ia`), "Voir mon dashboard" (→ `/dashboard`)
- Lien discret : "Gérer mon abonnement" (→ `/parametres?tab=billing`)

**Modification checkout :**
- `src/app/api/stripe/checkout/route.ts` : `success_url` → `${baseUrl}/${locale}/bienvenue?plan=${planId}`

**Acceptance Criteria :**
- AC-1 : La page `/bienvenue` affiche l'icône check_circle + titre de confirmation
- AC-2 : Le nom du plan souscrit est affiché (depuis `searchParams.plan`)
- AC-3 : Les features du plan sont listées (depuis `PLANS[planId].features`)
- AC-4 : Les 3 boutons d'action sont présents et pointent vers les bonnes routes
- AC-5 : La page est accessible sans être connecté (si redirection Stripe directe) — affiche version générique
- AC-6 : `success_url` dans checkout route pointe vers `/bienvenue?plan=...`

**Tests (TU-83-x) :**
- TU-83-1 : La page `/bienvenue?plan=pro` rend sans erreur
- TU-83-2 : La page affiche les features du plan Pro
- TU-83-3 : La page `/bienvenue?plan=premium` affiche les features Premium
- TU-83-4 : `success_url` dans checkout route contient `/bienvenue`

---

### 🟢 NICE TO HAVE

#### STORY-084 : Features bullets sur les cards /tarifs et landing page

**Description :** Afficher les bullets de features incluses directement dans les cards des plans sur la page `/tarifs` et sur la section pricing de la landing page. Actuellement les cards affichent uniquement le prix — les features sont seulement dans le tableau comparatif en dessous.

**Modifications :**
- `src/app/[locale]/(marketing)/tarifs/page.tsx` : dans chaque plan card, ajouter une liste `<ul>` avec les items de `PLANS[planId].features`
  - Chaque item : icône `check` (Material Symbols, text-success) + texte feature
  - Maximum 5 bullets par card (les plus importantes)

- `src/app/[locale]/(marketing)/page.tsx` : même ajout dans la section pricing de la landing page
  - Les features du plan Pro sont mises en avant (fond primary/10 ou border-primary)

**Enrichissement des features dans stripe-plans.ts :**
- Enrichir l'array `features[]` pour chaque plan avec des descriptions concises et percutantes
- Free : ["2 comptes bancaires", "Import CSV", "Transactions illimitées", "Budgets & objectifs", "Résumé mensuel"]
- Pro : ["5 comptes bancaires", "Import PDF & Excel", "Conseiller IA (10 req/mois)", "Multi-devises", "Export CSV & rapports"]
- Premium : ["Comptes illimités", "IA prioritaire illimitée", "Export PDF mensuel", "Rapport annuel IA", "Support prioritaire"]

**Acceptance Criteria :**
- AC-1 : Chaque card plan sur `/tarifs` affiche ≥ 3 bullets de features
- AC-2 : Chaque bullet utilise une icône check Material Symbols en text-success
- AC-3 : Les cards de la landing page section pricing affichent également les features
- AC-4 : Le plan Pro est toujours visuellement mis en avant (bordure primary)
- AC-5 : Les tests existants sur `/tarifs` passent (non-regression)
- AC-6 : `npm run build` passe sans erreur

**Tests (TU-84-x) :**
- TU-84-1 : La page `/tarifs` contient au moins 9 éléments de features (3 plans × 3 min)
- TU-84-2 : Les features du plan Free sont différentes de celles du plan Pro
- TU-84-3 : `PLANS.pro.features` contient ≥ 4 items après enrichissement
- TU-84-4 : `PLANS.premium.features` contient ≥ 4 items

---

## Récapitulatif MoSCoW

| ID | Titre | Priorité | Points | Dépend de |
|----|-------|----------|--------|-----------|
| STORY-079 | Stripe Tax — TVA automatique | MUST | 1 | Aucune |
| STORY-080 | Emails de rappel trial J-3 et J-1 | MUST | 3 | Aucune |
| STORY-081 | Modale urgence trial ≤ 3 jours | MUST | 2 | Aucune |
| STORY-082 | Modale upgrade contextuelle | SHOULD | 3 | Aucune |
| STORY-083 | Page succès post-paiement | SHOULD | 2 | STORY-079 |
| STORY-084 | Features bullets sur cards tarifs | NICE | 1 | Aucune |

**Total :** 6 stories · 12 points

---

## Contraintes techniques

- Pas de type `any` en TypeScript
- Couleurs unies uniquement (pas de dégradés)
- Design system Stitch (primary #4848e5, tokens couleurs existants, Manrope, Material Symbols)
- `"use client"` uniquement sur les composants interactifs (modales, hooks)
- Les Server Actions existantes (`createTrialSubscriptionAction`, etc.) ne sont pas modifiées
- La migration DB (STORY-080) doit être additive (nouvelles colonnes nullable/default)

---

## Dépendances techniques v11

| Story | Dépend de |
|-------|-----------|
| STORY-079 | Aucune (modification checkout route) |
| STORY-080 | Aucune (nouveau cron + migration DB) |
| STORY-081 | Aucune (nouveau composant client) |
| STORY-082 | Aucune (nouveau hook + composant) |
| STORY-083 | STORY-079 (success_url modifiée) |
| STORY-084 | Aucune (enrichissement features + UI) |

---

*PRD généré par FORGE PM Agent — 2026-02-24 [v11]*

---

---

# PRD — Sprint Niche Couple (v12)

**Version :** 12.0
**Date :** 2026-02-24
**Statut :** Prêt pour décomposition en stories
**Périmètre :** Pivot de la proposition de valeur vers la niche couple — gestion budgétaire partagée, balance qui-doit-quoi, objectifs communs, IA couple.

---

## Contexte

Le Sprint Conversion & Monétisation (v11) est **entièrement livré** :
- ✅ 6/6 stories PASS (564 tests, QA PASS)
- ✅ Stripe Tax, emails rappel trial, modales urgence/upgrade, page succès, features sur cards tarifs
- ✅ 84 stories livrées sur 11 sprints

**Pivot stratégique :**

Après analyse de marché, le segment "gestion de comptes personnels" généraliste est saturé au niveau de prix de TrackMyCash (4,90 € / 7,90 €). Décision : pivoter vers la niche **couple** — outil de gestion budgétaire commune pour couples. Différenciation :
1. **Comptes partagés** — chaque partenaire voit les transactions marquées "couple"
2. **Balance équitable** — qui a payé quoi ce mois ? Solde automatique
3. **Objectifs communs** — vacances, achat immobilier, épargne d'urgence partagée
4. **IA couple** — conseiller financier personnalisé pour le duo

Périmètre : Prompts 1 à 8 inclus (hors P9 admin dashboard, P10 logs couple).

---

## Décision architecturale critique

**Architecture actuelle :**
- Main DB (`getDb()`) : `users_databases`, `subscriptions`, `ai_usage`, `admin_logs`, `deletion_requests`
- Per-user DB (`getUserDb(userId)`) : `accounts`, `transactions`, `budgets`, `goals`, `notifications`, etc.

**Décision couple :**

Les tables couple couvrent deux utilisateurs distincts (chacun avec sa propre DB Turso). Elles doivent donc résider dans la **Main DB** accessible via `getDb()`.

| Tables | DB cible | Motif |
|--------|----------|-------|
| `couples`, `couple_members`, `couple_balances` | **Main DB** (`getDb()`) | Cross-user, span 2 per-user DBs |
| ALTER TABLE sur `accounts`, `transactions`, `budgets`, `goals` | Per-user DB (migrations dans `initSchema()`) | Données locales de chaque user |

---

## Architecture existante (contexte technique)

- **`src/lib/db.ts`** — `getDb()` (main DB) + `getUserDb(userId)` (per-user DB via turso-manager) + `initSchema()` (migrations additives try/catch dans array `migrations[]`)
- **`src/lib/subscription-utils.ts`** — `getUserPlanId()`, `canCreateAccount()`, `canUseAI()`, `canImportFormat()` — pattern `{allowed: boolean, reason?: string}`
- **`src/hooks/use-upgrade-modal.ts`** — `UpgradeReason` type union + `UPGRADE_CONFIGS` + `useUpgradeModal()` + `detectUpgradeReason()`
- **`src/components/upgrade-modal.tsx`** — modale client `"use client"`, consomme `UpgradeReason`
- **`src/lib/ai-tools.ts`** — factory `createAiTools(db, accountId)` retourne des `tool()` Vercel AI SDK
- **`src/app/api/chat/route.ts`** — `streamText()` avec tools + system prompt
- **`src/components/bottom-nav.tsx`** — 5 onglets fixes (Dashboard, Comptes, Transactions, Récurrents, Conseiller) — **non modifié**

---

## Périmètre — Stories MoSCoW

---

### 🔴 MUST HAVE

#### STORY-085 : DB Migrations couple

**Description :** Créer les 3 tables couple dans la Main DB et ajouter les nouvelles colonnes dans les tables per-user via migrations additives. Prérequis bloquant pour toutes les autres stories couple.

**Tables Main DB** (ajouter à `src/lib/db.ts` dans `initSchema()`) :
```sql
CREATE TABLE IF NOT EXISTS couples (
  id TEXT PRIMARY KEY,
  invite_code TEXT NOT NULL UNIQUE,
  name TEXT,
  created_by TEXT NOT NULL,
  created_at INTEGER NOT NULL DEFAULT (unixepoch())
);

CREATE TABLE IF NOT EXISTS couple_members (
  id TEXT PRIMARY KEY,
  couple_id TEXT NOT NULL REFERENCES couples(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'member',
  status TEXT NOT NULL DEFAULT 'active',
  joined_at INTEGER NOT NULL DEFAULT (unixepoch()),
  UNIQUE(couple_id, user_id)
);

CREATE TABLE IF NOT EXISTS couple_balances (
  id TEXT PRIMARY KEY,
  couple_id TEXT NOT NULL,
  user_id TEXT NOT NULL,
  period_month TEXT NOT NULL,
  total_paid REAL NOT NULL DEFAULT 0,
  computed_at INTEGER NOT NULL DEFAULT (unixepoch()),
  UNIQUE(couple_id, user_id, period_month)
);
```

**Migrations per-user DB** (ajouter à l'array `migrations[]` dans `initSchema()`) :
```sql
ALTER TABLE accounts ADD COLUMN visibility TEXT DEFAULT 'personal';
ALTER TABLE transactions ADD COLUMN is_couple_shared INTEGER DEFAULT 0;
ALTER TABLE transactions ADD COLUMN paid_by TEXT;
ALTER TABLE transactions ADD COLUMN split_type TEXT DEFAULT '50/50';
ALTER TABLE budgets ADD COLUMN scope TEXT DEFAULT 'personal';
ALTER TABLE budgets ADD COLUMN couple_id TEXT;
ALTER TABLE goals ADD COLUMN scope TEXT DEFAULT 'personal';
ALTER TABLE goals ADD COLUMN couple_id TEXT;
```

**Nouveau fichier `src/lib/couple-queries.ts`** :
```typescript
export interface Couple {
  id: string; invite_code: string; name: string | null;
  created_by: string; created_at: number;
}
export interface CoupleMember {
  id: string; couple_id: string; user_id: string;
  role: "owner" | "member"; status: string; joined_at: number;
}
export interface CoupleBalance {
  id: string; couple_id: string; user_id: string;
  period_month: string; total_paid: number; computed_at: number;
}
// Fonctions : getCoupleByUserId, getCoupleMembers, createCouple,
//             joinCouple, leaveCouple, computeCoupleBalance
```

**Fichiers modifiés :**
- `src/lib/db.ts` — 3 CREATE TABLE + 8 ALTER TABLE dans `migrations[]`
- `src/lib/couple-queries.ts` — **nouveau** (queries Main DB + helpers)
- `src/lib/types.ts` — re-export `Couple`, `CoupleMember`, `CoupleBalance`

**Acceptance Criteria :**
- AC-1 : Les 3 tables `couples`, `couple_members`, `couple_balances` sont créées dans la Main DB sans erreur
- AC-2 : Les 8 colonnes sont ajoutées dans les tables per-user via `initSchema()` (idempotentes)
- AC-3 : `getCoupleByUserId(userId)` retourne `null` si l'utilisateur n'a pas de couple
- AC-4 : `createCouple(userId, name?, inviteCode)` insère une ligne dans `couples` + `couple_members` (role=owner)
- AC-5 : `joinCouple(userId, inviteCode)` retourne `null` si le code est invalide
- AC-6 : `computeCoupleBalance(coupleId, period)` retourne un tableau de 0 à N `CoupleBalance`
- AC-7 : `npm run build` passe sans erreur TypeScript

**Tests (TU-85-x) :**
- TU-85-1 : `getCoupleByUserId("unknown")` retourne `null`
- TU-85-2 : `createCouple("user1", "Notre budget", "ABC123")` insère couple + membre owner
- TU-85-3 : `joinCouple("user2", "ABC123")` insère membre avec role="member"
- TU-85-4 : `joinCouple("user2", "INVALID")` retourne `null`
- TU-85-5 : `leaveCouple("user1")` supprime le membre (et le couple si orphelin)
- TU-85-6 : Migrations additives idempotentes (2e appel ne lève pas d'erreur)
- TU-85-7 : `computeCoupleBalance("coupleId", "2026-02")` retourne tableau (vide si pas de données)

---

#### STORY-086 : Système d'invitation couple

**Description :** Permettre à deux utilisateurs de créer un espace couple partagé via un code d'invitation. Inclut les Server Actions et la page de gestion.

**Server Actions** (`src/app/actions/couple-actions.ts` — nouveau) :
```typescript
// createCoupleAction(_prev, formData) :
//   1. getRequiredUserId()
//   2. Guard : canUseCoupleFeature(userId) → UpgradeModal "couple_pro" si non autorisé
//   3. Vérifie que l'user n'a pas déjà un couple
//   4. Génère invite_code (nanoid 6 chars uppercase)
//   5. getDb() → createCouple(userId, name, inviteCode)
//   6. revalidatePath("/couple")
//   7. return { success: true, inviteCode }
//
// joinCoupleAction(_prev, formData) :
//   1. getRequiredUserId()
//   2. Guard : canUseCoupleFeature(userId)
//   3. Vérifie que l'user n'a pas déjà un couple
//   4. getDb() → joinCouple(userId, inviteCode)
//   5. Si null → return { error: "Code invalide" }
//   6. revalidatePath("/couple")
//
// leaveCoupleAction() :
//   1. getRequiredUserId()
//   2. getDb() → getCoupleByUserId(userId)
//   3. Si membre owner et 1 seul membre → supprime le couple
//   4. Sinon → supprime le membre uniquement
//   5. revalidatePath("/couple")
```

**Page** (`src/app/[locale]/(app)/couple/page.tsx` — nouveau, Server Component) :
- **État "pas de couple"** :
  - Formulaire "Créer un espace couple" (champ nom optionnel + submit)
  - Séparateur "ou"
  - Formulaire "Rejoindre avec un code" (champ 6 chars + submit)
- **État "couple actif"** :
  - Avatar partenaire (initiales dans cercle) + nom/email
  - Bloc "Code d'invitation" : code dans un badge + bouton Copier
  - Bouton "Quitter le couple" (danger, avec confirmation)

**Navigation** : Section "Couple" dans `src/app/[locale]/(app)/parametres/page.tsx` avec lien vers `/couple`.

**i18n** : bloc `"couple"` dans `messages/fr.json` :
```json
"couple": {
  "title": "Espace couple",
  "create": "Créer un espace couple",
  "join": "Rejoindre avec un code",
  "leave": "Quitter le couple",
  "inviteCode": "Code d'invitation",
  "partner": "Partenaire"
}
```

**Fichiers modifiés :**
- `src/app/actions/couple-actions.ts` — **nouveau**
- `src/app/[locale]/(app)/couple/page.tsx` — **nouveau**
- `src/app/[locale]/(app)/parametres/page.tsx` — section Couple avec lien
- `messages/fr.json` — bloc couple

**Acceptance Criteria :**
- AC-1 : `createCoupleAction` crée le couple et retourne le code à 6 chars
- AC-2 : `joinCoupleAction` avec code valide lie les deux utilisateurs
- AC-3 : `joinCoupleAction` avec code invalide retourne `{ error: "Code invalide" }`
- AC-4 : Un user déjà en couple ne peut pas créer ni rejoindre un second couple
- AC-5 : La page `/couple` affiche les 2 formulaires si l'user n'a pas de couple
- AC-6 : La page `/couple` affiche les infos partenaire et le code si couple actif
- AC-7 : `leaveCoupleAction` supprime le membre et le couple si orphelin

**Tests (TU-86-x) :**
- TU-86-1 : `createCoupleAction` retourne `{ success: true, inviteCode }` quand autorisé
- TU-86-2 : `createCoupleAction` retourne `{ error: "..." }` si déjà en couple
- TU-86-3 : `joinCoupleAction` avec code valide retourne `{ success: true }`
- TU-86-4 : `joinCoupleAction` avec code invalide retourne `{ error: "Code invalide" }`
- TU-86-5 : `leaveCoupleAction` supprime le couple si dernier membre
- TU-86-6 : La page `/couple` (état pas de couple) rend sans erreur
- TU-86-7 : La page `/couple` (état couple actif) affiche le code d'invitation
- TU-86-8 : La section Couple dans `/parametres` contient un lien vers `/couple`

---

### 🟡 SHOULD HAVE

#### STORY-087 : Transactions partagées + balance couple

**Description :** Permettre de marquer une transaction comme "partagée avec mon partenaire" et calculer automatiquement la balance (qui doit quoi). Affichage d'un widget balance dans le dashboard couple.

**Server Action** (ajout dans `src/app/actions/couple-actions.ts`) :
```typescript
// updateTransactionCoupleAction(txId, isShared, paidBy?, splitType?) :
//   1. getRequiredUserId()
//   2. Guard : canUseCoupleFeature(userId) → UpgradeModal si non autorisé
//   3. getUserDb(userId) → UPDATE transactions SET is_couple_shared=?, paid_by=?, split_type=? WHERE id=?
//   4. revalidatePath("/transactions")
```

**Queries** (dans `src/lib/couple-queries.ts`) :
```typescript
// getSharedTransactionsForCouple(coupleId, userDb1, userDb2, period?) :
//   - SELECT is_couple_shared=1 transactions de userDb1 et userDb2
//   - Fusionne et trie par date DESC
//
// computeCoupleBalanceForPeriod(coupleId, userDb1, userDb2, userId1, userId2, period) :
//   - SUM amounts WHERE is_couple_shared=1 AND paid_by=userId1 → user1Paid
//   - SUM amounts WHERE is_couple_shared=1 AND paid_by=userId2 → user2Paid
//   - diff = user1Paid - user2Paid
//   - return { user1Paid, user2Paid, diff, owes: diff > 0 ? userId2 : userId1, amount: |diff| }
```

**Nouveau composant** `src/components/couple-balance-card.tsx` :
- Props : `user1Paid`, `user2Paid`, `partnerName`, `diff`
- Affiche : "Vous avez payé X€ · Partenaire Y€"
- Badge : "Balance : +Z€ (Partenaire vous doit)" ou "Balance : −Z€ (Vous devez)"
- Couleur badge : text-success si vous avez payé plus, text-danger si vous devez

**Intégration** : Toggle `is_couple_shared` sur chaque transaction dans `/transactions` (bouton icône `people` → active/désactive le partage).

**Fichiers modifiés :**
- `src/app/actions/couple-actions.ts` — `updateTransactionCoupleAction`
- `src/lib/couple-queries.ts` — `getSharedTransactionsForCouple`, `computeCoupleBalanceForPeriod`
- `src/components/couple-balance-card.tsx` — **nouveau**
- `src/app/[locale]/(app)/transactions/page.tsx` — bouton toggle partage

**Acceptance Criteria :**
- AC-1 : Le bouton "Partager" sur une transaction met à jour `is_couple_shared` et `paid_by`
- AC-2 : `computeCoupleBalanceForPeriod` retourne le bon diff (user1 a payé 100€, user2 a payé 60€ → diff=+40€, user2 doit 40€ à user1)
- AC-3 : `CoupleBalanceCard` affiche les montants corrects et la direction de la dette
- AC-4 : La vue couple du dashboard affiche `CoupleBalanceCard` pour le mois en cours
- AC-5 : Guard : le toggle partage est refusé (UpgradeModal) si plan < Pro

**Tests (TU-87-x) :**
- TU-87-1 : `computeCoupleBalanceForPeriod` avec user1=100€, user2=60€ retourne `{ diff: 40, owes: "user2" }`
- TU-87-2 : `computeCoupleBalanceForPeriod` avec user1=0€, user2=0€ retourne `{ diff: 0 }`
- TU-87-3 : `CoupleBalanceCard` affiche "Partenaire vous doit 40,00€" quand diff=40 en faveur de l'user
- TU-87-4 : `CoupleBalanceCard` affiche "Vous devez 40,00€" quand diff=-40
- TU-87-5 : `updateTransactionCoupleAction` met à jour `is_couple_shared=1` et `paid_by`
- TU-87-6 : `updateTransactionCoupleAction` retourne `{ error }` si guard freemium bloque

---

#### STORY-088 : Dashboard toggle Ma vue / Vue couple

**Description :** Ajouter un toggle "Ma vue / Vue couple" en haut du dashboard. La vue couple charge les données partagées des deux partenaires et le widget balance. La vue personnelle reste inchangée.

**Nouveau composant** `src/components/dashboard-view-toggle.tsx` (`"use client"`) :
```typescript
// Props : hasCoupleActive: boolean
// Lit searchParam "view" depuis useSearchParams()
// Rend 2 pills : [Ma vue] [Vue couple]
// Clic → router.push("?view=couple") ou router.push("?view=personal")
// Si !hasCoupleActive : pill "Vue couple" → lien vers /couple avec banner invit
```

**Nouveau composant** `src/components/couple-dashboard.tsx` (Server Component) :
- Reçoit `coupleId`, `userId`, `partnerUserId`
- Charge : `computeCoupleBalanceForPeriod`, shared transactions (5 dernières), budgets scope='couple', goals scope='couple'
- Rend : `CoupleBalanceCard` + liste transactions partagées + sections budgets/objectifs couple

**Modification dashboard** `src/app/[locale]/(app)/dashboard/page.tsx` :
- Lit `searchParams.view` (`"personal"` par défaut)
- Si `view === "couple"` et couple actif → rend `<CoupleDashboard />`
- Si `view === "couple"` et pas de couple → rend banner "Invitez votre partenaire"
- Ajoute `<DashboardViewToggle />` en haut de page

**Acceptance Criteria :**
- AC-1 : Le toggle s'affiche en haut du dashboard pour tous les utilisateurs
- AC-2 : Clic "Vue couple" avec couple actif → affiche `CoupleDashboard`
- AC-3 : Clic "Vue couple" sans couple → banner avec lien vers `/couple`
- AC-4 : Clic "Ma vue" → retour à la vue personnelle normale
- AC-5 : La vue personnelle est identique à l'état actuel (non-régression)
- AC-6 : `DashboardViewToggle` est un composant client (`"use client"`)

**Tests (TU-88-x) :**
- TU-88-1 : `<DashboardViewToggle hasCoupleActive={true} />` rend 2 pills
- TU-88-2 : `<DashboardViewToggle hasCoupleActive={false} />` rend pill "Vue couple" désactivée
- TU-88-3 : Dashboard page avec `?view=couple` et couple actif rend `CoupleDashboard`
- TU-88-4 : Dashboard page avec `?view=couple` sans couple rend le banner invitation
- TU-88-5 : Dashboard page sans searchParam `view` rend la vue personnelle normale
- TU-88-6 : `<CoupleDashboard />` rend sans erreur avec données mockées

---

#### STORY-089 : Freemium gates couple

**Description :** Définir les règles freemium pour les features couple et les intégrer comme guards dans les Server Actions + nouvelles entrées dans le système de modales d'upgrade.

**Règles freemium :**
| Feature | Plan minimum |
|---------|-------------|
| Créer / rejoindre un couple | Pro |
| Transactions partagées | Pro |
| Budgets couple | Pro |
| Objectifs couple | Premium |
| IA conseiller couple | Premium |

**Nouvelles fonctions** dans `src/lib/subscription-utils.ts` :
```typescript
export async function canUseCoupleFeature(userId: string): Promise<{ allowed: boolean; reason?: string }> {
  const planId = await getUserPlanId(userId);
  if (planId === "free") {
    return { allowed: false, reason: "Partagez vos finances en couple à partir du plan Pro (4,90€/mois)." };
  }
  return { allowed: true };
}

export async function canUsePremiumCoupleFeature(userId: string): Promise<{ allowed: boolean; reason?: string }> {
  const planId = await getUserPlanId(userId);
  if (planId !== "premium") {
    return { allowed: false, reason: "Les objectifs couple et l'IA couple sont disponibles en plan Premium (7,90€/mois)." };
  }
  return { allowed: true };
}
```

**Nouveaux `UpgradeReason`** dans `src/hooks/use-upgrade-modal.ts` :
```typescript
export type UpgradeReason =
  | "ai" | "accounts_limit" | "import_pdf" | "import_xlsx" | "export_pdf" | "history"
  | "couple_pro"     // Créer/rejoindre couple, transactions partagées, budgets couple
  | "couple_premium"; // Objectifs couple, IA couple
```

**Nouvelles entrées `UPGRADE_CONFIGS`** :
```typescript
couple_pro: {
  targetPlan: "pro",
  title: "Gérez vos finances en couple",
  description: "Partagez vos dépenses et suivez votre balance ensemble.",
  features: ["Transactions partagées", "Balance qui-doit-quoi", "Budgets couple"],
},
couple_premium: {
  targetPlan: "premium",
  title: "IA et objectifs couple",
  description: "Atteignez vos objectifs financiers ensemble avec l'IA.",
  features: ["Objectifs d'épargne communs", "Conseiller IA couple illimité", "Rapport annuel couple"],
},
```

**Intégration guards** :
- `createCoupleAction`, `joinCoupleAction` → `canUseCoupleFeature`
- `updateTransactionCoupleAction` → `canUseCoupleFeature`
- Goals scope='couple' → `canUsePremiumCoupleFeature`

**Fichiers modifiés :**
- `src/lib/subscription-utils.ts` — 2 nouvelles fonctions
- `src/hooks/use-upgrade-modal.ts` — 2 nouveaux `UpgradeReason` + configs
- `src/app/actions/couple-actions.ts` — guards ajoutés

**Acceptance Criteria :**
- AC-1 : `canUseCoupleFeature` retourne `{allowed: false}` pour plan free
- AC-2 : `canUseCoupleFeature` retourne `{allowed: true}` pour plan pro et premium
- AC-3 : `canUsePremiumCoupleFeature` retourne `{allowed: false}` pour plan pro
- AC-4 : `canUsePremiumCoupleFeature` retourne `{allowed: true}` pour plan premium
- AC-5 : `createCoupleAction` sur plan free retourne `{error: "couple_pro"}`
- AC-6 : `UpgradeModal` avec `reason="couple_pro"` affiche le plan Pro
- AC-7 : `UpgradeModal` avec `reason="couple_premium"` affiche le plan Premium

**Tests (TU-89-x) :**
- TU-89-1 : `canUseCoupleFeature("free-user")` retourne `{allowed: false}`
- TU-89-2 : `canUseCoupleFeature("pro-user")` retourne `{allowed: true}`
- TU-89-3 : `canUsePremiumCoupleFeature("pro-user")` retourne `{allowed: false}`
- TU-89-4 : `canUsePremiumCoupleFeature("premium-user")` retourne `{allowed: true}`
- TU-89-5 : `<UpgradeModal reason="couple_pro" />` rend sans erreur et affiche "Pro"
- TU-89-6 : `<UpgradeModal reason="couple_premium" />` affiche "Premium"
- TU-89-7 : `detectUpgradeReason("Partagez vos finances en couple")` retourne `"couple_pro"`

---

### 🟢 COULD HAVE

#### STORY-090 : Budgets & objectifs couple

**Description :** Permettre de créer des budgets et objectifs d'épargne partagés entre les deux partenaires. Affichage dans la vue couple du dashboard.

**Modifications formulaires :**

`src/components/add-budget-form.tsx` :
- Si couple actif + plan Pro : ajouter champ radio "Personnel / Couple" (scope)
- Si scope='couple' : envoyer `couple_id` dans la form data
- Guard dans `createBudgetAction` → `canUseCoupleFeature` si scope='couple'

`src/components/add-goal-form.tsx` :
- Si couple actif + plan Premium : ajouter champ radio "Personnel / Couple"
- Si scope='couple' : afficher champ `contribution_split` (50/50 par défaut)
- Guard dans `createGoalAction` → `canUsePremiumCoupleFeature` si scope='couple'

**Queries couple** (dans `src/lib/couple-queries.ts`) :
```typescript
// getCoupleSharedBudgets(coupleId, userDb1, userDb2) :
//   - Budgets scope='couple' de chaque membre
//   - Fusionne et déduplique
//
// getCoupleSharedGoals(coupleId, userDb1, userDb2) :
//   - Goals scope='couple' de chaque membre
```

**Intégration dashboard couple** :
- `CoupleDashboard` affiche section "Budgets communs" + "Objectifs communs"

**Fichiers modifiés :**
- `src/components/add-budget-form.tsx` — champ scope
- `src/components/add-goal-form.tsx` — champ scope + contribution_split
- `src/lib/couple-queries.ts` — `getCoupleSharedBudgets`, `getCoupleSharedGoals`
- `src/app/[locale]/(app)/budgets/page.tsx` — section budgets couple si couple actif + Pro
- `src/app/[locale]/(app)/objectifs/page.tsx` — section objectifs couple si couple actif + Premium

**Acceptance Criteria :**
- AC-1 : Le formulaire d'ajout de budget propose scope "Couple" si couple actif + Pro
- AC-2 : Créer un budget scope='couple' applique le guard Pro (UpgradeModal si plan free)
- AC-3 : Le formulaire d'ajout d'objectif propose scope "Couple" si couple actif + Premium
- AC-4 : `getCoupleSharedBudgets` retourne les budgets marqués scope='couple' des 2 membres
- AC-5 : La section "Budgets communs" dans `/budgets` s'affiche si couple actif + Pro
- AC-6 : La section "Objectifs communs" dans `/objectifs` s'affiche si couple actif + Premium

**Tests (TU-90-x) :**
- TU-90-1 : `getCoupleSharedBudgets("coupleId", db1, db2)` retourne les budgets couple
- TU-90-2 : `getCoupleSharedGoals` retourne les objectifs scope='couple'
- TU-90-3 : `<AddBudgetForm hasCoupleActive={true} isPro={true} />` rend le champ scope
- TU-90-4 : `<AddBudgetForm hasCoupleActive={false} />` ne rend pas le champ scope
- TU-90-5 : `<AddGoalForm hasCoupleActive={true} isPremium={true} />` rend scope + contribution_split
- TU-90-6 : createBudgetAction avec scope='couple' sur plan free retourne `{ error }`

---

#### STORY-091 : Conseiller IA couple

**Description :** Enrichir le conseiller IA pour comprendre le contexte couple : system prompt dédié, 2 nouveaux outils IA, suggestions chips contextuelles couple.

**System prompt conditionnel** dans `src/app/api/chat/route.ts` :
```typescript
// Si coupleId présent dans body + Premium :
const systemPrompt = coupleId
  ? `Tu es le conseiller financier du couple "${coupleName}". Tu as accès aux dépenses partagées des deux partenaires. Aide-les à équilibrer leurs dépenses et à atteindre leurs objectifs communs.`
  : systemPromptDefault;
```

**2 nouveaux outils** dans `src/lib/ai-tools.ts` :
```typescript
// getCoupleSummary : résumé du mois couple
// Params : period (YYYY-MM), coupleId
// Retourne : totalShared, user1Paid, user2Paid, balance, nbTransactions

// getCoupleBalance : balance détaillée
// Params : period (YYYY-MM)
// Retourne : CoupleBalance enrichi + message humain
```

**Chips suggestions couple** dans `src/components/ai-chat.tsx` :
```typescript
// Si coupleId présent + Premium :
const COUPLE_SUGGESTIONS = [
  "Analyse nos dépenses communes ce mois",
  "Qui a le plus dépensé ce mois ?",
  "Suggère un budget commun pour ce mois",
  "Quelles économies peut-on faire en couple ?",
];
```

**Gate Premium** dans `/api/chat` :
- Si `coupleId` présent dans le body → vérifier `canUsePremiumCoupleFeature(userId)` → retourner 403 si non Premium

**Fichiers modifiés :**
- `src/lib/ai-tools.ts` — 2 nouveaux tools
- `src/app/api/chat/route.ts` — system prompt conditionnel + gate Premium couple
- `src/components/ai-chat.tsx` — chips suggestions couple conditionnelles
- `src/hooks/use-upgrade-modal.ts` — `detectUpgradeReason` étendu pour couple_premium

**Acceptance Criteria :**
- AC-1 : Si `coupleId` dans le body + Premium → system prompt couple activé
- AC-2 : `getCoupleSummary` tool retourne les totaux partagés du mois
- AC-3 : `getCoupleBalance` tool retourne la balance avec message lisible
- AC-4 : Les chips couple s'affichent si couple actif + Premium
- AC-5 : Gate : `coupleId` + plan Pro ou Free → 403 ou UpgradeModal "couple_premium"
- AC-6 : Vue non-couple → comportement IA inchangé (non-régression)

**Tests (TU-91-x) :**
- TU-91-1 : `getCoupleSummary` retourne `{ totalShared, user1Paid, user2Paid, balance }` bien calculés
- TU-91-2 : `getCoupleBalance` retourne un message humain
- TU-91-3 : `/api/chat` avec `coupleId` + plan Pro → retourne 403
- TU-91-4 : `/api/chat` avec `coupleId` + plan Premium → stream IA démarre
- TU-91-5 : `<AiChat coupleId={undefined} />` — chips couple non affichées
- TU-91-6 : `<AiChat coupleId="abc" isPremium={true} />` — chips couple affichées

---

#### STORY-092 : Landing page + tarifs — pivot marketing couple

**Description :** Refonte du copywriting de la landing page et de la page tarifs pour adresser directement la niche couple. Le design (tokens, composants) reste intact — seul le contenu est modifié.

**Landing page** (`src/app/[locale]/(marketing)/page.tsx`) :

```
Hero :
  Badge pill  : "💑 Gérez vos finances en couple"
  H1          : "Vos finances de couple, enfin maîtrisées"
  Sous-titre  : "Suivez vos dépenses communes, équilibrez qui doit quoi, et atteignez vos objectifs ensemble."
  CTA         : "Commencer ensemble" → /inscription | "Voir les tarifs" → /tarifs

Stats :        "2 000+ couples" · "500k+ transactions suivies" · "5 langues" · "14j essai gratuit"

Features (3 sections alternées) :
  1. "Comptes partagés en un clin d'œil"
     desc: "Centralisez vos dépenses communes. Chaque partenaire voit les transactions marquées 'couple' en temps réel."
     bullets: ["Import depuis n'importe quelle banque", "Transactions partagées en un clic", "Vue couple sur le dashboard"]

  2. "Qui a payé quoi ? Réponse en 1 seconde"
     desc: "Fini les discussions sur les dépenses. TrackMyCash calcule automatiquement votre balance mensuelle."
     bullets: ["Balance automatique mensuelle", "Historique des dépenses partagées", "Notifications si déséquilibre"]

  3. "Vos objectifs, votre rythme"
     desc: "Vacances, achat immobilier, fonds d'urgence commun — définissez vos objectifs et suivez-les ensemble."
     bullets: ["Objectifs d'épargne communs (Premium)", "Suivi de progression partagé", "Conseiller IA couple (Premium)"]

Comment ça marche (3 étapes) :
  1. "Créez votre compte" — inscription en 30s
  2. "Invitez votre partenaire" — code à 6 chiffres
  3. "Gérez ensemble" — dashboard couple partagé

Témoignages (2) :
  - "Marie & Thomas, 3 ans ensemble" : "On n'a plus de disputes sur les dépenses depuis qu'on utilise TrackMyCash. La balance mensuelle est transparente pour les deux."
  - "Sophie & Lucas, jeunes parents" : "On a enfin pu mettre en place un budget commun pour l'éducation de notre fils. L'IA nous donne des conseils adaptés à notre situation."

CTA final : "Commencer ensemble — Essai gratuit 14 jours, sans carte bancaire"
```

**Stripe plans** (`src/lib/stripe-plans.ts`) — update features :
- Pro : ajouter `"Partage avec votre partenaire"`
- Premium : ajouter `"IA conseiller couple illimitée"` et `"Objectifs d'épargne communs"`

**Tarifs** (`src/app/[locale]/(marketing)/tarifs/page.tsx`) :
- Card Pro : badge supplémentaire `"Idéal en couple"` (pill bg-primary/10 text-primary)

**Fichiers modifiés :**
- `src/app/[locale]/(marketing)/page.tsx` — refonte copywriting (structure HTML inchangée autant que possible)
- `src/lib/stripe-plans.ts` — update features Pro + Premium
- `src/app/[locale]/(marketing)/tarifs/page.tsx` — badge "Idéal en couple" sur card Pro

**Acceptance Criteria :**
- AC-1 : Le H1 de la landing page mentionne "couple" (niche claire)
- AC-2 : 3 sections features adressent les besoins couple (comptes partagés, balance, objectifs)
- AC-3 : La section "Comment ça marche" mentionne l'invitation partenaire comme étape 2
- AC-4 : Les témoignages utilisent des profils de couple
- AC-5 : La card Pro sur `/tarifs` affiche le badge "Idéal en couple"
- AC-6 : `PLANS.pro.features` contient "Partage avec votre partenaire"
- AC-7 : `npm run build` passe sans erreur TypeScript
- AC-8 : Tests existants tarifs (TU-84-x) restent PASS (non-régression)

**Tests (TU-92-x) :**
- TU-92-1 : La landing page rend sans erreur côté serveur
- TU-92-2 : Le titre H1 contient le mot "couple" (ou "finances" avec niche claire)
- TU-92-3 : `PLANS.pro.features` contient "Partage avec votre partenaire"
- TU-92-4 : `PLANS.premium.features` contient "IA conseiller couple"
- TU-92-5 : La page `/tarifs` rend sans erreur après la modification
- TU-92-6 : La page `/tarifs` contient "Idéal en couple"

---

## Récapitulatif MoSCoW

| ID | Titre | Priorité | Points | Dépend de |
|----|-------|----------|--------|-----------|
| STORY-085 | DB Migrations couple | MUST | 1 | Aucune |
| STORY-086 | Système d'invitation couple | MUST | 3 | STORY-085, STORY-089 |
| STORY-087 | Transactions partagées + balance | SHOULD | 3 | STORY-085, STORY-089 |
| STORY-088 | Dashboard toggle Ma vue / Vue couple | SHOULD | 3 | STORY-085, STORY-087 |
| STORY-089 | Freemium gates couple | SHOULD | 2 | STORY-085 |
| STORY-090 | Budgets & objectifs couple | COULD | 3 | STORY-085, STORY-089 |
| STORY-091 | Conseiller IA couple | COULD | 3 | STORY-085, STORY-089 |
| STORY-092 | Landing page + tarifs pivot couple | COULD | 2 | Aucune |

**Total :** 8 stories · 20 points · ~60 tests attendus

---

## Ordre d'implémentation recommandé

```
085 (DB fondation) → 089 (gates freemium) → 086 (invitation)
→ 087 (transactions + balance) → 088 (dashboard toggle)
→ 090 (budgets/objectifs) → 091 (IA couple) → 092 (marketing)
```

---

## Contraintes techniques

| Contrainte | Détail |
|------------|--------|
| Main DB | Tables couple via `getDb()` — jamais via `getUserDb()` |
| Per-user migrations | Dans `migrations[]` de `initSchema()` — additive try/catch |
| TypeScript | Pas de type `any`, types couple dans `src/lib/couple-queries.ts` |
| "use client" | Uniquement sur les composants interactifs (toggle, forms couple) |
| BottomNav | Inchangé (5 onglets) — couple accessible via dashboard toggle + paramètres |
| Parsers | Aucune modification de `src/lib/parsers/` |
| Format | Couleurs unies uniquement (pas de dégradés) |
| Non-régression | Les 564 tests existants doivent rester PASS |

---

## Dépendances techniques v12

| Story | Dépend de |
|-------|-----------|
| STORY-085 | Aucune (fondation DB) |
| STORY-086 | STORY-085 (tables couple) + STORY-089 (guards) |
| STORY-087 | STORY-085 (colonnes tx) + STORY-089 (guards) |
| STORY-088 | STORY-085 + STORY-087 (CoupleBalanceCard) |
| STORY-089 | STORY-085 (UpgradeReason couple_pro/couple_premium) |
| STORY-090 | STORY-085 (colonnes budgets/goals) + STORY-089 (guards) |
| STORY-091 | STORY-085 + STORY-089 (gate Premium couple) |
| STORY-092 | Aucune (copywriting indépendant) |

---

## Métriques sprint v12

| Métrique | Valeur |
|----------|--------|
| Total stories | 8 (STORY-085 à STORY-092) |
| Points total | 20 |
| MUST HAVE | 2 × P1 (085, 086) |
| SHOULD HAVE | 3 × P2 (087, 088, 089) |
| COULD HAVE | 3 × P3 (090, 091, 092) |
| Tests nouveaux attendus | ~60 |
| Tests existants | 564 — doivent rester PASS |

---

## Hors scope (sprints suivants)

- Notifications push quand le partenaire ajoute une transaction partagée
- Historique des activités couple (logs)
- Dissolution du couple avec archivage des données partagées
- Admin dashboard couple
- Page dédiée `/couple/transactions` (vue fusionnée des deux partenaires)

---

*PRD généré par FORGE PM Agent — 2026-02-24 [v12]*
