# PRD — Blog Dynamique + Newsletter

**Version :** 1.0
**Date :** 2026-03-10
**Statut :** 📋 PLANIFIÉ
**Périmètre :** Blog dynamique (DB Turso), gestion via track-my-cash-admin, newsletter, page article [slug]

> **Contexte :**
> - Sprint v19.1 : pages légales + cookie banner terminés (1669 tests)
> - Blog actuel : 3 articles hardcodés dans `src/data/blog-posts.ts`, pas de page [slug], newsletter non fonctionnelle
> - Admin app : `/Users/martialwehrling/Documents/Martial-programmation/track-my-cash-admin` — Next.js 16, Turso partagé, auth OTP Resend, Server Actions uniquement

---

## Section 0 — Agent Onboarding Protocol

### Comment lire ce PRD

1. **Deux projets impactés** : `track-my-cash` (front public) et `track-my-cash-admin` (back-office). Chaque story précise quel(s) projet(s) elle touche.
2. **Base de données partagée** : la Main DB Turso est commune aux deux apps. Les nouvelles tables sont créées dans cette DB.
3. **Tests baseline** : 1669 tests sur track-my-cash, ~517 tests sur track-my-cash-admin. 0 régression tolérée.
4. **Design system** : DM Serif Display (headings) + DM Sans (body), palette Indigo/Stone, scroll-reveal animations.

### Protocole IA-Humain

| Situation | Action |
|-----------|--------|
| Schéma de tables DB (colonnes, types) | IA décide (convention projet) |
| Ajout de dépendance npm | Demander validation humain |
| Choix d'un éditeur rich-text pour l'admin | Demander validation humain |
| Structure des routes | IA décide (convention existante) |
| Contenu des articles seed | IA décide (reprendre les 3 existants) |
| Design des pages admin blog | IA décide (suivre patterns admin existants) |
| Stratégie d'envoi newsletter (fréquence, contenu) | Demander validation humain |

---

## 1. Vision produit

Transformer le blog de TrackMyCash d'un placeholder statique en un vrai système de contenu dynamique :
- **Articles gérés depuis l'admin** : CRUD complet, brouillon/publié, catégories
- **Rendu côté public** : page liste avec filtres dynamiques, page article [slug] avec SEO, newsletter fonctionnelle
- **Newsletter** : inscription réelle avec stockage en DB et envoi d'emails

---

## 2. Personas

| Persona | Description | Besoins |
|---------|-------------|---------|
| **Admin/Rédacteur** | Opérateur de TrackMyCash utilisant l'admin | Créer, éditer, publier, dépublier des articles. Voir les inscrits newsletter. |
| **Visiteur marketing** | Prospect sur les pages marketing | Lire des articles, filtrer par catégorie, s'inscrire à la newsletter |
| **Abonné newsletter** | Visiteur ayant souscrit | Recevoir les emails, pouvoir se désinscrire |

---

## 3. Exigences fonctionnelles

### US-BLOG-01 — Tables DB blog + newsletter (Must Have) — P0

**En tant qu'** équipe technique,
**je veux** des tables `blog_posts`, `blog_categories`, `blog_post_categories` et `newsletter_subscribers` dans la Main DB Turso,
**afin de** stocker les articles et inscrits newsletter de manière pérenne.

**Projet(s) :** track-my-cash + track-my-cash-admin (schéma partagé)

**Schéma proposé :**

```sql
-- Articles
CREATE TABLE IF NOT EXISTS blog_posts (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  slug TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  excerpt TEXT NOT NULL,
  content TEXT NOT NULL,
  cover_image_url TEXT,
  reading_time INTEGER NOT NULL DEFAULT 5,
  status TEXT NOT NULL DEFAULT 'draft' CHECK(status IN ('draft', 'published')),
  published_at TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  author_name TEXT NOT NULL DEFAULT 'TrackMyCash',
  meta_title TEXT,
  meta_description TEXT
);

-- Catégories
CREATE TABLE IF NOT EXISTS blog_categories (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  color TEXT NOT NULL DEFAULT '#4F46E5'
);

-- Table de liaison (many-to-many)
CREATE TABLE IF NOT EXISTS blog_post_categories (
  post_id TEXT NOT NULL REFERENCES blog_posts(id) ON DELETE CASCADE,
  category_id TEXT NOT NULL REFERENCES blog_categories(id) ON DELETE CASCADE,
  PRIMARY KEY (post_id, category_id)
);

-- Newsletter
CREATE TABLE IF NOT EXISTS newsletter_subscribers (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  email TEXT NOT NULL UNIQUE,
  status TEXT NOT NULL DEFAULT 'active' CHECK(status IN ('active', 'unsubscribed')),
  subscribed_at TEXT NOT NULL DEFAULT (datetime('now')),
  unsubscribed_at TEXT
);
```

**Critères d'acceptation :**

| # | Critère |
|---|---------|
| AC-01-1 | Les 4 tables existent dans Turso après exécution du script de migration |
| AC-01-2 | Les contraintes UNIQUE sur slug et email fonctionnent (INSERT doublon → erreur) |
| AC-01-3 | ON DELETE CASCADE fonctionne sur blog_post_categories |
| AC-01-4 | Les 3 articles existants + catégories de base sont insérés comme seed data |

```gherkin
Given la Main DB Turso
When le script de migration est exécuté
Then les tables blog_posts, blog_categories, blog_post_categories et newsletter_subscribers existent

Given un article avec slug "test-article" existe
When j'insère un second article avec slug "test-article"
Then une erreur UNIQUE constraint est levée

Given un article lié à une catégorie
When je supprime l'article
Then la liaison dans blog_post_categories est supprimée automatiquement
```

---

### US-BLOG-02 — CRUD articles dans l'admin (Must Have) — P0

**En tant qu'** admin/rédacteur,
**je veux** pouvoir créer, lire, modifier et supprimer des articles depuis l'interface admin,
**afin de** gérer le contenu du blog sans toucher au code.

**Projet :** track-my-cash-admin

**Routes admin :**
- `/blog` — Liste des articles (titre, statut, date, catégories, actions)
- `/blog/new` — Formulaire de création
- `/blog/[id]/edit` — Formulaire d'édition

**Fonctionnalités :**
- Liste avec filtres (statut draft/published, recherche texte)
- Formulaire : titre, slug (auto-généré depuis titre, éditable), extrait, contenu (textarea HTML ou éditeur), catégories (multi-select), image couverture (URL), temps de lecture, meta title, meta description
- Boutons : Enregistrer brouillon / Publier / Dépublier
- Suppression avec confirmation

**Critères d'acceptation :**

| # | Critère |
|---|---------|
| AC-02-1 | La page `/blog` affiche tous les articles avec titre, statut, date et catégories |
| AC-02-2 | Le formulaire `/blog/new` crée un article en DB avec statut "draft" |
| AC-02-3 | Le formulaire `/blog/[id]/edit` pré-remplit les champs et sauvegarde les modifications |
| AC-02-4 | Le bouton "Publier" passe le statut à "published" et renseigne `published_at` |
| AC-02-5 | Le bouton "Dépublier" repasse le statut à "draft" |
| AC-02-6 | La suppression demande confirmation et supprime l'article + liaisons catégories |
| AC-02-7 | Le slug est auto-généré depuis le titre (slugify) mais peut être modifié manuellement |
| AC-02-8 | Les catégories sont sélectionnables via checkboxes/multi-select |

```gherkin
Given je suis connecté à l'admin
When je navigue vers /blog
Then je vois la liste de tous les articles avec leur statut

Given je suis sur /blog/new
When je remplis le formulaire et clique "Enregistrer brouillon"
Then un article est créé en DB avec statut "draft"
And je suis redirigé vers /blog

Given un article en brouillon existe
When je clique "Publier" sur la page d'édition
Then le statut passe à "published"
And published_at est renseigné avec la date courante

Given un article publié existe
When je clique "Supprimer" et confirme
Then l'article est supprimé de blog_posts
And ses liaisons dans blog_post_categories sont supprimées
```

---

### US-BLOG-03 — Gestion des catégories dans l'admin (Must Have) — P0

**En tant qu'** admin,
**je veux** pouvoir créer et gérer des catégories de blog,
**afin de** organiser les articles par thématique.

**Projet :** track-my-cash-admin

**Fonctionnalités :**
- Section catégories sur la page `/blog` (sidebar ou onglet)
- Créer une catégorie (nom, slug auto, couleur)
- Modifier/supprimer une catégorie
- Catégories initiales (seed) : Budget, Couple, Épargne, IA, Sécurité

**Critères d'acceptation :**

| # | Critère |
|---|---------|
| AC-03-1 | Les catégories sont listées dans l'admin |
| AC-03-2 | Créer une catégorie avec nom et couleur persiste en DB |
| AC-03-3 | Supprimer une catégorie détache les articles liés (pas de suppression en cascade des articles) |
| AC-03-4 | Les 5 catégories initiales sont présentes après le seed |

```gherkin
Given je suis sur la gestion des catégories
When je crée une catégorie "Investissement" avec couleur "#10B981"
Then la catégorie apparaît dans la liste
And elle est disponible dans le formulaire d'article

Given une catégorie "IA" est liée à 2 articles
When je supprime la catégorie "IA"
Then la catégorie est supprimée
And les 2 articles existent toujours mais sans la catégorie "IA"
```

---

### US-BLOG-04 — Lecture dynamique des articles côté public (Must Have) — P0

**En tant que** visiteur,
**je veux** voir la liste des articles publiés avec des filtres par catégorie dynamiques,
**afin de** parcourir le contenu du blog.

**Projet :** track-my-cash

**Changements :**
- Remplacer `src/data/blog-posts.ts` (hardcodé) par des queries Turso dans `src/lib/queries/blog.ts`
- `BlogContent` récupère les articles publiés depuis la DB (Server Component ou fetch côté serveur)
- Les catégories du filtre sont dynamiques (lues depuis `blog_categories`)
- L'article à la une = le plus récent publié
- Conserver le design actuel (cards, badges, featured article)

**Critères d'acceptation :**

| # | Critère |
|---|---------|
| AC-04-1 | La page `/blog` affiche uniquement les articles avec statut "published" |
| AC-04-2 | Les filtres catégories sont dynamiques (depuis blog_categories) |
| AC-04-3 | L'article à la une est le plus récent publié |
| AC-04-4 | Un article publié dans l'admin apparaît sur le blog public sans redéploiement |
| AC-04-5 | L'ancien fichier `src/data/blog-posts.ts` est supprimé |
| AC-04-6 | Les tests existants (TU-98-*) sont mis à jour pour le nouveau système |

```gherkin
Given 5 articles existent dont 3 publiés et 2 brouillons
When un visiteur accède à /blog
Then seuls les 3 articles publiés sont affichés

Given des articles avec catégories "Budget" et "Couple" existent
When le visiteur clique sur le filtre "Budget"
Then seuls les articles catégorisés "Budget" sont affichés

Given un admin publie un nouvel article
When un visiteur rafraîchit /blog
Then le nouvel article apparaît dans la liste
```

---

### US-BLOG-05 — Page article [slug] avec SEO (Must Have) — P0

**En tant que** visiteur,
**je veux** pouvoir lire un article complet sur sa propre page,
**afin de** consommer le contenu du blog.

**Projet :** track-my-cash

**Route :** `src/app/[locale]/(marketing)/blog/[slug]/page.tsx`

**Fonctionnalités :**
- Rendu du contenu HTML de l'article
- Metadata dynamique (title, description, openGraph)
- Schema.org `Article` JSON-LD
- CTA en bas d'article : "Gérez votre budget en couple avec TrackMyCash" → `/inscription`
- Slug inexistant → `notFound()` (404)
- Navigation : lien retour vers `/blog`
- Catégories affichées en badges
- Date de publication + temps de lecture

**Critères d'acceptation :**

| # | Critère |
|---|---------|
| AC-05-1 | `/blog/[slug]` affiche le contenu complet de l'article |
| AC-05-2 | Slug inexistant → `notFound()` (404) |
| AC-05-3 | Metadata dynamique (title, description) générée par article |
| AC-05-4 | Schema.org `Article` JSON-LD présent dans le head |
| AC-05-5 | CTA vers `/inscription` présent en bas de l'article |
| AC-05-6 | Seuls les articles publiés sont accessibles (brouillon → 404) |
| AC-05-7 | URLs blog présentes dans `sitemap.xml` |
| AC-05-8 | Le design utilise `.legal-content` ou un style dédié `.blog-content` cohérent |

```gherkin
Given un article publié avec slug "gerer-budget-couple"
When un visiteur accède à /blog/gerer-budget-couple
Then le contenu complet de l'article est affiché
And le <title> correspond au titre de l'article
And un bloc JSON-LD Schema.org Article est présent
And un CTA vers /inscription est affiché en bas

Given un article en brouillon avec slug "article-draft"
When un visiteur accède à /blog/article-draft
Then une page 404 est affichée

Given aucun article avec slug "inexistant"
When un visiteur accède à /blog/inexistant
Then une page 404 est affichée
```

---

### US-BLOG-06 — Newsletter fonctionnelle (Must Have) — P0

**En tant que** visiteur,
**je veux** pouvoir m'inscrire à la newsletter depuis la page blog,
**afin de** recevoir les nouveaux articles et conseils.

**Projet :** track-my-cash

**Changements :**
- Remplacer le `onSubmit={(e) => e.preventDefault()}` par un vrai Server Action
- Server Action `subscribeNewsletterAction(email)` :
  - Valide l'email (format)
  - Insère dans `newsletter_subscribers` (gestion doublon gracieuse)
  - Envoie un email de confirmation via Nodemailer
  - Retourne un message de succès/erreur
- Feedback visuel : message de succès ou erreur après soumission
- Protection anti-spam : honeypot field ou rate limiting basique

**Critères d'acceptation :**

| # | Critère |
|---|---------|
| AC-06-1 | L'email soumis est enregistré dans `newsletter_subscribers` |
| AC-06-2 | Un email invalide affiche une erreur sans insertion en DB |
| AC-06-3 | Un email déjà inscrit ne crée pas de doublon (réponse gracieuse) |
| AC-06-4 | Un email de confirmation est envoyé à l'inscrit |
| AC-06-5 | Un message de succès est affiché après inscription |
| AC-06-6 | Un champ honeypot (hidden) bloque les bots basiques |

```gherkin
Given un visiteur est sur /blog
When il entre "test@example.com" et soumet le formulaire newsletter
Then l'email est enregistré dans newsletter_subscribers avec statut "active"
And un email de confirmation est envoyé
And un message "Inscription confirmée !" s'affiche

Given "test@example.com" est déjà inscrit
When il soumet à nouveau le même email
Then aucun doublon n'est créé
And un message "Vous êtes déjà inscrit(e) !" s'affiche

Given un bot remplit le champ honeypot
When le formulaire est soumis
Then l'inscription est silencieusement ignorée
```

---

### US-BLOG-07 — Dashboard inscrits newsletter dans l'admin (Should Have) — P1

**En tant qu'** admin,
**je veux** voir la liste des inscrits à la newsletter et des métriques,
**afin de** suivre la croissance de la liste.

**Projet :** track-my-cash-admin

**Fonctionnalités :**
- Section ou onglet dans `/blog` (ou page dédiée `/blog/newsletter`)
- Liste des inscrits (email, date, statut)
- Compteurs : total actifs, total désinscrits, nouveaux ce mois
- Export CSV de la liste

**Critères d'acceptation :**

| # | Critère |
|---|---------|
| AC-07-1 | La liste des inscrits est affichée avec email, date et statut |
| AC-07-2 | Les compteurs (actifs, désinscrits, nouveaux ce mois) sont calculés correctement |
| AC-07-3 | L'export CSV télécharge un fichier valide |

```gherkin
Given 50 inscrits dont 45 actifs et 5 désinscrits
When l'admin accède à la page newsletter
Then les compteurs affichent "45 actifs", "5 désinscrits"
And la liste montre les 50 inscrits
```

---

### US-BLOG-08 — Lien désabonnement newsletter (Should Have) — P1

**En tant qu'** abonné newsletter,
**je veux** pouvoir me désinscrire via un lien dans l'email,
**afin de** ne plus recevoir les emails.

**Projet :** track-my-cash

**Route :** `/api/newsletter/unsubscribe?email=xxx&token=xxx`

**Fonctionnalités :**
- Lien de désabonnement signé (HMAC token) dans chaque email
- Endpoint met à jour le statut à "unsubscribed" et renseigne `unsubscribed_at`
- Page de confirmation simple ("Vous avez été désinscrit(e)")

**Critères d'acceptation :**

| # | Critère |
|---|---------|
| AC-08-1 | Le lien de désabonnement dans l'email est fonctionnel |
| AC-08-2 | Le statut passe à "unsubscribed" en DB |
| AC-08-3 | Un token invalide retourne une erreur 403 |
| AC-08-4 | Une page de confirmation s'affiche |

```gherkin
Given un abonné avec email "user@test.com" et token valide
When il clique le lien de désabonnement
Then son statut passe à "unsubscribed"
And unsubscribed_at est renseigné
And une page "Désinscription confirmée" s'affiche
```

---

## 4. Exigences non fonctionnelles

| # | Catégorie | Exigence |
|---|-----------|----------|
| NFR-01 | Performance | Les pages blog publiques se chargent en < 2s (Server Components, pas de waterfall client) |
| NFR-02 | SEO | Chaque article a un score Lighthouse SEO ≥ 95 |
| NFR-03 | Sécurité | Le contenu HTML des articles est sanitizé côté rendu (pas d'injection XSS) |
| NFR-04 | Sécurité | La newsletter utilise un honeypot + validation email stricte |
| NFR-05 | Sécurité | Les liens de désabonnement sont signés (HMAC) |
| NFR-06 | Accessibilité | Les pages blog respectent WCAG 2.1 AA (headings hiérarchiques, alt images, contraste) |
| NFR-07 | i18n | Les articles sont en français (langue unique pour le blog dans un premier temps). L'interface admin reste en français. |
| NFR-08 | Tests | Couverture ≥ 90% sur les nouvelles queries et actions. 0 régression sur les tests existants. |
| NFR-09 | Scalabilité | Le système supporte 1000+ articles sans dégradation (pagination côté DB) |
| NFR-10 | Disponibilité | Un article publié dans l'admin est visible sur le site public sans redéploiement (ISR ou fetch runtime) |

---

## 5. Hors périmètre (Won't Have — cette itération)

| Élément | Raison |
|---------|--------|
| Éditeur WYSIWYG riche (TipTap, Lexical) | Textarea HTML suffit pour le MVP. À ajouter en v2 |
| Commentaires sur les articles | Pas de besoin identifié |
| Multi-langue des articles (i18n) | Blog FR uniquement pour l'instant |
| Envoi automatique de newsletter aux inscrits | Requiert un système de queue. Phase 2 |
| Upload d'images intégré | URL externe suffit pour le MVP |
| Recherche full-text dans les articles | À considérer en v2 |
| Système de tags (en plus des catégories) | Les catégories suffisent |

---

## 6. Seed data

Les 3 articles existants dans `src/data/blog-posts.ts` sont migrés comme seed :

| Slug | Titre | Catégories |
|------|-------|------------|
| `gerer-budget-couple` | Comment gérer son budget en couple sans se disputer | Budget, Couple |
| `partager-depenses-equitablement` | Partager ses dépenses équitablement : 3 méthodes éprouvées | Couple |
| `objectifs-epargne-couple` | 5 objectifs d'épargne pour les couples en 2026 | Épargne, Couple |

Catégories initiales : Budget, Couple, Épargne, IA, Sécurité

---

## 7. Ordre d'implémentation suggéré

```
US-BLOG-01 (Tables DB)
    ↓
US-BLOG-03 (Catégories admin)  ←  US-BLOG-02 (CRUD articles admin)
    ↓                                    ↓
US-BLOG-04 (Lecture publique)   US-BLOG-05 (Page [slug])
    ↓
US-BLOG-06 (Newsletter)
    ↓
US-BLOG-07 (Dashboard newsletter admin)  +  US-BLOG-08 (Désabonnement)
```

**Chemin critique :** US-BLOG-01 → US-BLOG-02 → US-BLOG-04 → US-BLOG-05

---

## 8. Métriques de succès

| Métrique | Cible |
|----------|-------|
| Articles publiés via admin | ≥ 3 (seed) sans intervention code |
| Page [slug] fonctionnelle | 0 lien cassé "Lire l'article" |
| Inscriptions newsletter | Formulaire fonctionnel (insert DB confirmé) |
| Tests | 0 régression + couverture ≥ 90% nouvelles queries |
| Lighthouse SEO | ≥ 95 sur pages blog |

---

## 9. Glossaire

| Terme | Définition |
|-------|------------|
| Main DB | Base Turso partagée entre track-my-cash et track-my-cash-admin |
| Per-user DB | Base Turso par utilisateur (comptes, transactions) — non concernée ici |
| Seed data | Données initiales insérées à la migration (3 articles + 5 catégories) |
| Server Action | Fonction serveur Next.js appelée depuis un formulaire client |
| ISR | Incremental Static Regeneration — revalidation à la demande |
| Honeypot | Champ formulaire invisible, piège à bots |
| Slugify | Transformer un titre en URL-friendly string (ex: "Mon Article" → "mon-article") |

---

## 10. MCP Catalog

| Serveur MCP | Outils pertinents |
|-------------|-------------------|
| context7 | `query-docs` — Documentation à jour Next.js 16, Turso |
| github | `create_pull_request`, `push_files` — PR entre les deux repos |
| firebase | Non utilisé pour ce sprint |
