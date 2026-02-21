# PRD — Sprint Growth & Qualité (v2.0)

**Version :** 2.0
**Date :** 2026-02-21
**Statut :** En cours de planification
**Périmètre :** Acquisition, rétention, conformité RGPD, features utilisateur

---

## Contexte

Le Sprint Qualité & Finitions (v1.0) est **entièrement livré** :
- ✅ 8/8 stories PASS (64 tests, couverture 87%)
- ✅ Design system sémantique (7 tokens CSS, 16 fichiers)
- ✅ Système SaaS complet (auth, Stripe, IA, multi-devises, i18n 5 langues)

**Problème actuel :** Le produit est techniquement prêt mais **invisible** — aucune page de conversion publique, aucun email transactionnel, pas de conformité RGPD, features utilisateur avancées absentes. Zéro acquisition organique possible.

---

## Objectifs de ce sprint

1. **Créer une présence marketing** pour convertir les visiteurs en utilisateurs
2. **Établir la communication email** pour l'onboarding et la rétention
3. **Assurer la conformité RGPD** (droit à l'oubli, export données)
4. **Ajouter des features différenciantes** (budgets, parsers supplémentaires)

---

## Architecture existante (à connaître avant de coder)

- Route group `(marketing)` : `/src/app/[locale]/(marketing)/` — layout minimal, contient `/tarifs`
- Route group `(app)` : `/src/app/[locale]/(app)/` — protégé par auth, sidebar
- Route group `(auth)` : `/src/app/[locale]/(auth)/` — connexion, inscription
- Emails : Nodemailer + Hostinger — `from` = email principal, `replyTo` = alias (voir CLAUDE.md)
- Plans Stripe : `src/lib/stripe-plans.ts` (Free/Pro/Premium)
- Notifications solde bas : `alert_threshold` sur compte (déjà dans le schéma)

---

## Périmètre — Stories MoSCoW

---

### 🔴 MUST HAVE — Area 1 : Landing Page Marketing

#### STORY-009 : Navbar + Footer publics

**Description :** Les pages marketing n'ont ni navigation ni pied de page. Le layout `(marketing)/layout.tsx` est vide (`min-h-screen bg-background` seulement).

**Travail attendu :**
- Navbar responsive : logo "track-my-cash", liens (Fonctionnalités, Tarifs, Connexion, CTA "S'inscrire")
- Footer : liens légaux (CGU, Politique de confidentialité), copyright
- Intégration dans `(marketing)/layout.tsx`
- Mobile-first avec menu hamburger (shadcn/ui Sheet ou DropdownMenu)

**Acceptance Criteria :**
- AC-1 : La navbar s'affiche sur toutes les pages `(marketing)` (y compris `/tarifs`)
- AC-2 : Sur mobile, un menu hamburger remplace les liens inline
- AC-3 : Le CTA "S'inscrire" redirige vers `/inscription`
- AC-4 : Le footer est présent sur toutes les pages marketing
- AC-5 : Les liens utilisent `<Link>` de `@/i18n/navigation` (i18n-aware)

---

#### STORY-010 : Page d'accueil publique (Landing Page)

**Description :** Aucune page `/` publique n'existe dans le groupe marketing. C'est le point d'entrée pour tous les visiteurs non authentifiés.

**Route :** `/src/app/[locale]/(marketing)/page.tsx`

**Sections à implémenter :**
1. **Hero** : titre accrocheur, sous-titre, CTA principal ("Commencer gratuitement") + CTA secondaire ("Voir les tarifs"), screenshot ou mockup de l'app
2. **Fonctionnalités** : 6 cartes (Comptes multiples, Import CSV/Excel/PDF, Récurrents, Prévisions, Conseiller IA, Multi-devises)
3. **Tarifs** : Version compacte des 3 plans avec lien vers `/tarifs`
4. **CTA final** : Bandeau de conversion ("Prêt à reprendre le contrôle de vos finances ?")

**Acceptance Criteria :**
- AC-1 : La page est accessible sans authentification à `/` (et `/en/`, `/es/`, etc.)
- AC-2 : Le Hero contient un `<h1>` avec le bénéfice principal (SEO)
- AC-3 : Les 6 fonctionnalités sont présentées avec icône + titre + description
- AC-4 : Le CTA "Commencer gratuitement" redirige vers `/inscription`
- AC-5 : La page est responsive (mobile-first)
- AC-6 : Les textes sont traduits via `getTranslations("landing")`

---

#### STORY-011 : SEO meta tags + Open Graph

**Description :** Aucune balise SEO sur les pages marketing. Les partages sur réseaux sociaux affichent une carte vide.

**Travail attendu :**
- `generateMetadata()` sur la landing page et `/tarifs` : title, description, OG tags
- `robots.txt` : autoriser l'indexation des pages publiques, bloquer `/app/`
- `sitemap.xml` dynamique : inclure les pages publiques dans les 5 langues

**Acceptance Criteria :**
- AC-1 : `<title>` et `<meta description>` présents sur la landing page et tarifs
- AC-2 : `og:title`, `og:description`, `og:url` présents
- AC-3 : `robots.txt` accessible à `/robots.txt`
- AC-4 : `sitemap.xml` liste les URLs dans les 5 locales (`/fr/`, `/en/`, `/es/`, `/it/`, `/de/`)
- AC-5 : Les métadonnées sont traduites selon la locale active

---

### 🔴 MUST HAVE — Area 2 : Emails Transactionnels

#### STORY-012 : Service email (Nodemailer/Hostinger)

**Description :** Aucune infrastructure email n'existe. Toutes les communications sont impossibles (reset password, bienvenue, alertes).

**Travail attendu :**
- `src/lib/email.ts` : singleton Nodemailer configuré avec Hostinger SMTP
  - `from` : adresse principale (ex: `contact@track-my-cash.fr`)
  - `replyTo` : alias selon le type (support, no-reply, etc.)
- Fonction `sendEmail({ to, subject, html, replyTo? })` typée
- Variables d'environnement : `EMAIL_HOST`, `EMAIL_PORT`, `EMAIL_USER`, `EMAIL_PASS`, `EMAIL_FROM`
- Template HTML de base réutilisable (header logo, body, footer unsubscribe)

**Acceptance Criteria :**
- AC-1 : `sendEmail()` envoie un email réel via SMTP Hostinger en production
- AC-2 : Le `from` est toujours l'adresse principale (jamais un alias)
- AC-3 : Les variables d'env manquantes n'empêchent pas le build (graceful degradation)
- AC-4 : Le template HTML est responsive (mobile + desktop)
- AC-5 : Un helper `renderEmailTemplate(type, data)` génère le HTML depuis un template

---

#### STORY-013 : Email de bienvenue (post-inscription)

**Description :** Aucun email de bienvenue n'est envoyé après l'inscription. L'utilisateur crée son compte et... silence.

**Travail attendu :**
- Hook post-inscription dans `src/app/actions/auth-actions.ts` ou via better-auth `onAfterCreateUser`
- Template "bienvenue" : nom de l'utilisateur, fonctionnalités clés, CTA vers l'app
- Gestion d'erreur silencieuse (l'email échoue mais l'inscription réussit)

**Acceptance Criteria :**
- AC-1 : Un email de bienvenue est envoyé dans les 30s après inscription
- AC-2 : L'email contient le prénom/email de l'utilisateur
- AC-3 : L'email contient un CTA "Accéder à mon espace" qui redirige vers `/[locale]/`
- AC-4 : Si le service email échoue, l'inscription aboutit quand même (pas de rollback)
- AC-5 : Le sujet de l'email est traduit selon la locale de l'utilisateur

---

#### STORY-014 : Alerte solde bas (email automatique)

**Description :** Le champ `alert_threshold` existe sur les comptes mais aucune alerte n'est envoyée quand le solde passe en dessous.

**Travail attendu :**
- Vérification du seuil après chaque mutation de transaction (`createTransactionAction`, `importFileAction`)
- Si `solde_actuel < alert_threshold` : envoyer un email d'alerte
- Dédupliquer : ne pas envoyer plus d'une alerte par jour par compte (colonne `last_alert_sent_at` ou vérification du timestamp)
- Template email : nom du compte, solde actuel, seuil, CTA vers l'app

**Acceptance Criteria :**
- AC-1 : Un email est envoyé quand `balance < alert_threshold` après une transaction
- AC-2 : L'alerte n'est pas renvoyée si une alerte a déjà été envoyée dans les 24h pour ce compte
- AC-3 : L'email affiche le nom du compte, le solde actuel et le seuil configuré
- AC-4 : Si aucun email n'est configuré pour l'utilisateur, l'alerte est silencieuse

---

### 🟡 SHOULD HAVE — Area 3 : Conformité RGPD

#### STORY-015 : Suppression de compte (droit à l'oubli)

**Description :** Aucune option de suppression de compte n'est disponible. Légalement requis par le RGPD (Article 17).

**Travail attendu :**
- Dans `/parametres` : bouton "Supprimer mon compte" (zone danger)
- Confirmation par dialog (saisie du mot "SUPPRIMER" ou de l'email)
- Server Action `deleteAccountAction()` :
  1. Annule l'abonnement Stripe actif (si existant)
  2. Supprime toutes les données utilisateur dans Turso (comptes, transactions, récurrents)
  3. Supprime l'utilisateur dans better-auth
  4. Déconnecte la session
  5. Redirige vers `/`

**Acceptance Criteria :**
- AC-1 : Un bouton "Supprimer mon compte" est visible dans `/parametres` (zone danger)
- AC-2 : Une confirmation par dialog est requise avant suppression
- AC-3 : L'abonnement Stripe est annulé avant la suppression des données
- AC-4 : Toutes les données sont supprimées (comptes, transactions, récurrents, tags, règles)
- AC-5 : L'utilisateur est redirigé vers `/` après suppression et ne peut plus se reconnecter
- AC-6 : Un email de confirmation de suppression est envoyé (optionnel, best-effort)

---

#### STORY-016 : Extension couverture tests (actions serveur + parsers)

**Description :** La QA v1.0 couvrait uniquement `format.ts` et `currency.ts`. Les parsers et actions serveur restent non testés.

**Travail attendu :**
- `tests/unit/parsers.test.ts` : tests des 3 parsers (BP, MCB, Revolut) avec fixtures CSV/XLSX
- `tests/unit/accounts.test.ts` : logique de calcul de solde date-aware
- `tests/unit/import-actions.test.ts` : `generateImportHash`, `checkDuplicates` (déjà partiellement couvert — étendre)
- Objectif : atteindre >80% lignes sur `src/lib/parsers.ts`

**Acceptance Criteria :**
- AC-1 : Les 3 parsers ont des tests avec fixtures réelles (mini CSV/XLSX en base64 ou fichiers de test)
- AC-2 : Le parser Banque Populaire détecte correctement le séparateur `;` et l'encodage ISO-8859-1
- AC-3 : Le parser MCB détecte les montants avec espaces milliers et la devise MGA
- AC-4 : La couverture `parsers.ts` dépasse 75% lignes
- AC-5 : `npm test` passe en vert (suite complète)

---

### 🟢 COULD HAVE — Area 4 : Features Utilisateur

#### STORY-017 : Budgets par catégorie

**Description :** L'utilisateur ne peut pas définir de budget par catégorie ni voir s'il dépasse ses objectifs.

**Travail attendu :**
- Schéma DB : table `budgets` (`id`, `account_id`, `category`, `amount_limit`, `period` : monthly/yearly, `created_at`)
- Server Actions : `createBudgetAction`, `updateBudgetAction`, `deleteBudgetAction`
- UI dans `/parametres` ou nouvelle page `/budgets` : formulaire + liste des budgets
- Dashboard : indicateur visuel (barre de progression) pour chaque budget avec le mois en cours
- `getBudgetStatus(db, accountId)` : retourne `{ category, spent, limit, percentage }[]`

**Acceptance Criteria :**
- AC-1 : L'utilisateur peut créer un budget mensuel ou annuel par catégorie
- AC-2 : Le dashboard affiche une barre de progression pour chaque budget défini
- AC-3 : La barre passe en rouge (`text-expense`) quand le budget est dépassé (>100%)
- AC-4 : `getBudgetStatus()` calcule correctement le montant dépensé sur la période en cours
- AC-5 : Les budgets sont par compte (`account_id`)

---

#### STORY-018 : Nouveau parser bancaire (Crédit Agricole)

**Description :** Étendre les parsers pour couvrir Crédit Agricole (CSV), l'une des banques françaises les plus utilisées.

**Format Crédit Agricole CSV :**
- Séparateur `;`
- Encodage : UTF-8
- Colonnes : `Date opération`, `Date valeur`, `Libellé`, `Débit`, `Crédit`
- Dates : DD/MM/YYYY
- Montants : avec virgule décimale, négatif pour débit

**Acceptance Criteria :**
- AC-1 : Le parser détecte automatiquement le format CA (via header ou extension)
- AC-2 : Les colonnes Débit/Crédit sont correctement mappées en `type: expense/income`
- AC-3 : La détection de doublon (`import_hash`) fonctionne sur les transactions CA
- AC-4 : Un test unitaire valide le parsing d'un fichier CSV de test (fixture)
- AC-5 : Le parser est enregistré dans `src/lib/parsers.ts` et disponible dans l'import

---

## Critères de succès global

- [ ] Un visiteur non authentifié arrive sur `/` et voit la landing page
- [ ] Le partage de l'URL sur LinkedIn/Twitter affiche une carte OG correcte
- [ ] Après inscription, l'utilisateur reçoit un email de bienvenue sous 30s
- [ ] Quand le solde d'un compte passe sous le seuil, un email d'alerte est envoyé
- [ ] L'utilisateur peut supprimer son compte depuis `/parametres` (données + Stripe supprimés)
- [ ] Les parsers BP, MCB et Revolut ont des tests unitaires qui passent
- [ ] L'utilisateur peut définir un budget mensuel par catégorie et voir sa progression
- [ ] Les fichiers Crédit Agricole sont importés correctement

---

## Ordre de priorité recommandé

```
P0 → STORY-009 (Navbar/Footer) → STORY-010 (Landing) → STORY-011 (SEO)
P1 → STORY-012 (Service email) → STORY-013 (Email bienvenue) → STORY-014 (Alerte solde)
P2 → STORY-015 (RGPD suppression) → STORY-016 (Tests parsers)
P3 → STORY-017 (Budgets) → STORY-018 (Parser CA)
```

---

## Hors scope

- Backoffice admin (phase suivante)
- Notifications push / PWA
- Suppression automatique des inactifs
- A/B testing landing page
- Blog / Content marketing
- App mobile native

---

## Dépendances techniques

| Story | Dépend de |
|-------|-----------|
| STORY-010 | STORY-009 (navbar dans le layout) |
| STORY-013 | STORY-012 (service email configuré) |
| STORY-014 | STORY-012 (service email configuré) |
| STORY-015 | Aucune (Server Action indépendante) |
| STORY-016 | Aucune (tests isolés) |
| STORY-017 | Aucune (nouveau schéma DB) |
| STORY-018 | Aucune (nouveau parser) |

---

*PRD généré par FORGE PM Agent — 2026-02-21*
