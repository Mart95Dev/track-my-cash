# Architecture Technique — Blog Dynamique + Newsletter

**Version :** 1.0
**Date :** 2026-03-10
**Statut :** VALIDEE
**PRD source :** `docs/prd-blog.md`

---

## 1. Vue d'ensemble

```
┌─────────────────────────────────────────────────────────────────┐
│                     Main DB Turso (partagee)                    │
│  blog_posts │ blog_categories │ blog_post_categories │ newsletter│
└──────────┬──────────────────────────────┬───────────────────────┘
           │                              │
     ┌─────┴──────────┐           ┌──────┴──────────┐
     │ track-my-cash   │           │ track-my-cash-  │
     │ (front public)  │           │ admin (back)    │
     │                 │           │                 │
     │ LECTURE seule   │           │ CRUD complet    │
     │ - blog listing  │           │ - articles      │
     │ - page [slug]   │           │ - categories    │
     │ - filtres       │           │ - newsletter    │
     │ - newsletter    │           │   subscribers   │
     │   inscription   │           │                 │
     └─────────────────┘           └─────────────────┘
```

**Principe :** La Main DB Turso est le point de verite unique. L'admin ecrit, le front lit. La newsletter traverse les deux (inscription cote front, gestion cote admin).

---

## 2. Stack technique

### 2.1 Choix technologiques

| Composant | Choix | Justification |
|-----------|-------|---------------|
| Base de donnees | Turso (Main DB existante) | Deja partagee entre les 2 apps, evite un nouveau service |
| Contenu articles | HTML brut (textarea) | MVP suffisant, pas besoin d'editeur WYSIWYG pour 3-10 articles. YAGNI. |
| Email newsletter | Nodemailer (existant) | Deja configure dans track-my-cash, SMTP Hostinger en place |
| Sanitization HTML | `sanitize-html` (npm) | Previent XSS lors du rendu `dangerouslySetInnerHTML`. Leger, zero config |
| Slug generation | Logique custom (regex) | Pas besoin de lib, 5 lignes suffisent |
| Queries blog (front) | Fonctions async dans `src/lib/queries/blog.ts` | Suit le pattern existant des 13 modules queries |
| Queries blog (admin) | Fonctions async dans `src/lib/blog-queries.ts` | Suit le pattern `queries.ts` / `admin-couples.ts` existant |
| Server Actions | `src/app/actions/blog-actions.ts` (admin), `src/app/actions/newsletter-actions.ts` (front) | Pattern etabli dans les 2 projets |
| Protection spam | Honeypot field | Zero dependance, efficace contre les bots basiques |
| Desabonnement | Lien HMAC signe | Securise, pas de token en DB necessaire |

### 2.2 Dependances a ajouter

| Package | Projet | Raison |
|---------|--------|--------|
| `sanitize-html` | track-my-cash | Sanitization du HTML des articles avant rendu |

> **Decision :** Pas d'editeur WYSIWYG (TipTap, Lexical) pour le MVP. Un textarea HTML dans l'admin suffit. L'admin est un utilisateur technique qui peut ecrire du HTML basique. A reconsiderer si le nombre de redacteurs augmente.

### 2.3 Rejete

| Option | Raison du rejet |
|--------|-----------------|
| MDX / Markdown | Ajoute une couche de compilation, complexite inutile pour un blog simple |
| CMS externe (Contentful, Sanity) | Overhead, cout, et on a deja Turso |
| API Route pour le blog | Server Actions + Server Components suffisent, pas de client externe |
| Double-write newsletter (Main + Per-user DB) | Newsletter n'est pas liee a un user authentifie |
| tiptap / lexical | Over-engineering pour le MVP, textarea HTML suffit |

---

## 3. Modele de donnees

### 3.1 Schema SQL (Main DB Turso)

```sql
-- ============================================================
-- Table: blog_posts
-- ============================================================
CREATE TABLE IF NOT EXISTS blog_posts (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  slug TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  excerpt TEXT NOT NULL DEFAULT '',
  content TEXT NOT NULL DEFAULT '',
  cover_image_url TEXT,
  reading_time INTEGER NOT NULL DEFAULT 5,
  status TEXT NOT NULL DEFAULT 'draft' CHECK(status IN ('draft', 'published')),
  published_at TEXT,
  author_name TEXT NOT NULL DEFAULT 'TrackMyCash',
  meta_title TEXT,
  meta_description TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_blog_posts_slug ON blog_posts(slug);
CREATE INDEX IF NOT EXISTS idx_blog_posts_status ON blog_posts(status);
CREATE INDEX IF NOT EXISTS idx_blog_posts_published_at ON blog_posts(published_at);

-- ============================================================
-- Table: blog_categories
-- ============================================================
CREATE TABLE IF NOT EXISTS blog_categories (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  color TEXT NOT NULL DEFAULT '#4F46E5'
);

-- ============================================================
-- Table de liaison: blog_post_categories (many-to-many)
-- ============================================================
CREATE TABLE IF NOT EXISTS blog_post_categories (
  post_id TEXT NOT NULL REFERENCES blog_posts(id) ON DELETE CASCADE,
  category_id TEXT NOT NULL REFERENCES blog_categories(id) ON DELETE CASCADE,
  PRIMARY KEY (post_id, category_id)
);

-- ============================================================
-- Table: newsletter_subscribers
-- ============================================================
CREATE TABLE IF NOT EXISTS newsletter_subscribers (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  email TEXT NOT NULL UNIQUE,
  status TEXT NOT NULL DEFAULT 'active' CHECK(status IN ('active', 'unsubscribed')),
  subscribed_at TEXT NOT NULL DEFAULT (datetime('now')),
  unsubscribed_at TEXT
);

CREATE INDEX IF NOT EXISTS idx_newsletter_email ON newsletter_subscribers(email);
CREATE INDEX IF NOT EXISTS idx_newsletter_status ON newsletter_subscribers(status);
```

### 3.2 Relations

```
blog_posts 1──M blog_post_categories M──1 blog_categories
newsletter_subscribers (standalone, pas de FK vers user)
```

### 3.3 Migration

La migration est executee dans `initSchema()` des deux projets :
- **track-my-cash** : `src/lib/db.ts` → ajouter les 4 CREATE TABLE dans `initMainDb()`
- **track-my-cash-admin** : `src/lib/db.ts` → appeler `ensureBlogTables(db)` au demarrage (pattern identique a `ensureCoupleTables`)

---

## 4. Architecture des composants

### 4.1 track-my-cash (front public — LECTURE + newsletter inscription)

```
src/
  lib/
    queries/
      blog.ts                    # NOUVEAU — queries lecture blog
  app/
    actions/
      newsletter-actions.ts      # NOUVEAU — subscribeNewsletterAction
    [locale]/(marketing)/
      blog/
        page.tsx                 # MODIFIE — passe les donnees DB a BlogContent
        blog-content.tsx         # MODIFIE — recoit articles/categories en props
        [slug]/
          page.tsx               # MODIFIE — query DB au lieu de getBlogPost()
    api/
      newsletter/
        unsubscribe/
          route.ts               # NOUVEAU — GET endpoint desabonnement HMAC
  data/
    blog-posts.ts                # SUPPRIME apres migration
```

#### Queries blog (`src/lib/queries/blog.ts`)

```typescript
// Types
type BlogPost = {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  coverImageUrl: string | null;
  readingTime: number;
  status: "draft" | "published";
  publishedAt: string | null;
  authorName: string;
  metaTitle: string | null;
  metaDescription: string | null;
  createdAt: string;
  updatedAt: string;
  categories: { id: string; name: string; slug: string; color: string }[];
};

type BlogCategory = {
  id: string;
  name: string;
  slug: string;
  color: string;
};

// Fonctions (async — Turso)
async function getPublishedPosts(categorySlug?: string): Promise<BlogPost[]>
async function getPostBySlug(slug: string): Promise<BlogPost | null>
async function getAllCategories(): Promise<BlogCategory[]>
async function getPublishedSlugs(): Promise<string[]>  // pour generateStaticParams / sitemap
```

**Pattern query N+1 evite :** Utiliser `json_group_array` + `json_object` pour joindre les categories en une seule requete (pattern deja utilise dans le projet pour les tags).

```sql
SELECT bp.*,
  json_group_array(json_object('id', bc.id, 'name', bc.name, 'slug', bc.slug, 'color', bc.color))
    FILTER (WHERE bc.id IS NOT NULL) AS categories_json
FROM blog_posts bp
LEFT JOIN blog_post_categories bpc ON bp.id = bpc.post_id
LEFT JOIN blog_categories bc ON bpc.category_id = bc.id
WHERE bp.status = 'published'
GROUP BY bp.id
ORDER BY bp.published_at DESC
```

#### Server Action newsletter (`src/app/actions/newsletter-actions.ts`)

```typescript
"use server";

type SubscribeResult = { success: true; message: string } | { error: string };

async function subscribeNewsletterAction(formData: FormData): Promise<SubscribeResult> {
  // 1. Honeypot check (champ "website" rempli = bot)
  // 2. Validation email (regex basique)
  // 3. INSERT OR IGNORE dans newsletter_subscribers
  // 4. Si nouvel inscrit → envoyer email confirmation via sendEmail()
  // 5. Si doublon → reponse gracieuse "Vous etes deja inscrit(e)"
}
```

#### API Route desabonnement (`src/app/api/newsletter/unsubscribe/route.ts`)

```typescript
// GET /api/newsletter/unsubscribe?email=xxx&token=xxx
// 1. Verifier HMAC(email, NEWSLETTER_SECRET) === token
// 2. UPDATE newsletter_subscribers SET status='unsubscribed', unsubscribed_at=datetime('now')
// 3. Retourner page HTML de confirmation
```

**Generation du token :** `crypto.createHmac('sha256', process.env.NEWSLETTER_SECRET).update(email).digest('hex')`

#### Composant BlogContent modifie

```typescript
// Avant: "use client" + import BLOG_POSTS
// Apres: recoit les donnees en props depuis le Server Component parent

type BlogContentProps = {
  posts: BlogPost[];
  categories: BlogCategory[];
};

export function BlogContent({ posts, categories }: BlogContentProps) {
  // Filtre cote client sur les donnees deja chargees (meme pattern qu'avant)
  // Newsletter: formulaire avec Server Action au lieu de preventDefault
}
```

### 4.2 track-my-cash-admin (back-office — CRUD complet)

```
src/
  lib/
    blog-queries.ts              # NOUVEAU — CRUD queries blog + newsletter
  app/
    actions/
      blog-actions.ts            # NOUVEAU — Server Actions CRUD
    (admin)/
      blog/
        page.tsx                 # NOUVEAU — Liste articles + sidebar categories
        new/
          page.tsx               # NOUVEAU — Formulaire creation
        [id]/
          edit/
            page.tsx             # NOUVEAU — Formulaire edition
        newsletter/
          page.tsx               # NOUVEAU — Liste inscrits + metriques
  components/
    blog/
      blog-table.tsx             # NOUVEAU — Tableau articles
      blog-form.tsx              # NOUVEAU — Formulaire article (create/edit)
      category-manager.tsx       # NOUVEAU — CRUD categories (inline)
      newsletter-table.tsx       # NOUVEAU — Tableau inscrits
      newsletter-stats.tsx       # NOUVEAU — KPIs newsletter
```

#### Queries blog admin (`src/lib/blog-queries.ts`)

```typescript
// Articles
async function getBlogPosts(db, filters?: { status?: string; search?: string }): Promise<BlogPost[]>
async function getBlogPostById(db, id: string): Promise<BlogPost | null>
async function createBlogPost(db, data: CreateBlogPostInput): Promise<string>  // retourne id
async function updateBlogPost(db, id: string, data: UpdateBlogPostInput): Promise<void>
async function deleteBlogPost(db, id: string): Promise<void>
async function publishBlogPost(db, id: string): Promise<void>
async function unpublishBlogPost(db, id: string): Promise<void>

// Categories
async function getCategories(db): Promise<BlogCategory[]>
async function createCategory(db, name: string, color: string): Promise<string>
async function updateCategory(db, id: string, name: string, color: string): Promise<void>
async function deleteCategory(db, id: string): Promise<void>

// Liaison post-categories
async function setPostCategories(db, postId: string, categoryIds: string[]): Promise<void>

// Newsletter
async function getNewsletterSubscribers(db, filters?: { status?: string }): Promise<NewsletterSub[]>
async function getNewsletterStats(db): Promise<{ active: number; unsubscribed: number; thisMonth: number }>
async function exportNewsletterCsv(db): Promise<string>  // retourne CSV string
```

#### Server Actions admin (`src/app/actions/blog-actions.ts`)

```typescript
"use server";

async function createPostAction(formData: FormData): Promise<{ success: true; id: string } | { error: string }>
async function updatePostAction(id: string, formData: FormData): Promise<{ success: true } | { error: string }>
async function deletePostAction(id: string): Promise<{ success: true } | { error: string }>
async function publishPostAction(id: string): Promise<{ success: true } | { error: string }>
async function unpublishPostAction(id: string): Promise<{ success: true } | { error: string }>

async function createCategoryAction(formData: FormData): Promise<{ success: true } | { error: string }>
async function updateCategoryAction(id: string, formData: FormData): Promise<{ success: true } | { error: string }>
async function deleteCategoryAction(id: string): Promise<{ success: true } | { error: string }>
```

#### Routes admin

| Route | Type | Description |
|-------|------|-------------|
| `/blog` | Server Component | Liste articles (tableau) + sidebar categories |
| `/blog/new` | Server Component + Client Form | Formulaire creation article |
| `/blog/[id]/edit` | Server Component + Client Form | Formulaire edition article |
| `/blog/newsletter` | Server Component | Liste inscrits + KPIs + export CSV |

#### Navigation sidebar

Ajouter dans `src/components/layout/sidebar.tsx` :

```typescript
{ label: "Blog", href: "/blog", icon: FileText },
```

Entre "Couples" et "Turso" dans l'ordre du menu.

---

## 5. Flux de donnees

### 5.1 Publication d'un article

```
Admin → /blog/new → createPostAction() → INSERT blog_posts (draft)
  → /blog/[id]/edit → publishPostAction() → UPDATE status='published', published_at=now()
    → Visiteur → /blog → getPublishedPosts() → SELECT WHERE status='published'
```

**Pas de redeploiement necessaire :** Les pages blog sont des Server Components qui font un fetch Turso a chaque requete (pas de cache statique). Un article publie dans l'admin apparait immediatement.

### 5.2 Inscription newsletter

```
Visiteur → /blog → formulaire email → subscribeNewsletterAction(formData)
  → Validation email + honeypot check
  → INSERT OR IGNORE newsletter_subscribers
  → sendEmail() confirmation via Nodemailer
  → Retour message succes/erreur au client
```

### 5.3 Desabonnement

```
Email recu → clic lien "Se desinscrire"
  → GET /api/newsletter/unsubscribe?email=x&token=hmac(x)
  → Verification HMAC
  → UPDATE status='unsubscribed'
  → Page HTML "Desinscription confirmee"
```

---

## 6. Design patterns

### 6.1 Pattern existants reutilises

| Pattern | Utilisation blog |
|---------|-----------------|
| Server Components data fetching | Pages blog (front) font des queries directes |
| Server Actions mutations | CRUD articles, inscription newsletter |
| `json_group_array` N+1 avoidance | Categories jointes aux articles en 1 requete |
| `ensureXxxTables(db)` idempotent | Migration tables blog au demarrage admin |
| Honeypot anti-spam | Champ invisible dans formulaire newsletter |
| HMAC signing | Token desabonnement newsletter |
| `sendEmail()` Nodemailer | Confirmation inscription newsletter |
| `revalidatePath` apres mutation | Apres publish/unpublish dans l'admin |

### 6.2 Slugify

```typescript
function slugify(text: string): string {
  return text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")  // retire accents
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}
```

Utilise dans le formulaire admin pour auto-generer le slug depuis le titre.

---

## 7. Securite

| Risque | Mitigation |
|--------|------------|
| XSS via contenu article | `sanitize-html` avant rendu `dangerouslySetInnerHTML` |
| Spam newsletter | Honeypot field + validation email stricte |
| Desabonnement forge | Token HMAC signe avec secret serveur |
| Acces articles brouillon | Query filtre `status='published'` cote front |
| Injection SQL | Requetes parametrees (Turso client) |
| Auth admin | Middleware OTP + session HMAC existant protege les routes /blog admin |

---

## 8. Performance

| Aspect | Strategie |
|--------|-----------|
| Liste articles | Query SQL avec LIMIT (pagination si > 20 articles) |
| Page [slug] | Server Component, 1 query DB, pas de waterfall client |
| Categories | Chargees en parallele avec les articles (Promise.all) |
| N+1 categories | `json_group_array` en 1 requete (pas de boucle) |
| Images couverture | URL externe, `<img loading="lazy">` |
| SEO | Metadata dynamique + JSON-LD genere cote serveur |

---

## 9. Variables d'environnement

### Nouvelles variables requises

| Variable | Projet | Description |
|----------|--------|-------------|
| `NEWSLETTER_SECRET` | track-my-cash | Cle HMAC pour signer les liens de desabonnement |

> Les variables existantes (`DATABASE_URL_TURSO`, `API_KEY_TURSO`, `EMAIL_HOST`, etc.) sont deja en place.

---

## 10. Tests

### 10.1 track-my-cash

| Fichier test | Couverture |
|-------------|------------|
| `tests/unit/lib/queries/blog.test.ts` | getPublishedPosts, getPostBySlug, getAllCategories |
| `tests/unit/actions/newsletter-actions.test.ts` | subscribeNewsletterAction (email valide, invalide, doublon, honeypot) |
| `tests/unit/api/newsletter-unsubscribe.test.ts` | Token HMAC valide/invalide, mise a jour status |

### 10.2 track-my-cash-admin

| Fichier test | Couverture |
|-------------|------------|
| `tests/unit/lib/blog-queries.test.ts` | CRUD articles, categories, newsletter subscribers |
| `tests/unit/actions/blog-actions.test.ts` | create, update, delete, publish, unpublish |

---

## 11. Seed data

Script de seed execute dans la migration (`ensureBlogTables`) :

**5 categories :**

| Nom | Slug | Couleur |
|-----|------|---------|
| Budget | budget | #4F46E5 |
| Couple | couple | #EC4899 |
| Epargne | epargne | #10B981 |
| IA | ia | #F59E0B |
| Securite | securite | #EF4444 |

**3 articles existants migres :** Contenu repris de `src/data/blog-posts.ts`, publies avec `published_at` correspondant aux dates actuelles.

---

## 12. Sitemap

Modifier `src/app/sitemap.ts` pour inclure les slugs publies :

```typescript
// Ajouter apres les routes statiques
const publishedSlugs = await getPublishedSlugs();
const blogUrls = publishedSlugs.map((slug) => ({
  url: `${baseUrl}/blog/${slug}`,
  lastModified: new Date(),
  changeFrequency: "weekly" as const,
  priority: 0.7,
}));
```

---

## 13. Ordre d'implementation

```
Phase 1 — Fondations (les 2 projets)
  STORY-01: Tables DB + migration + seed

Phase 2 — Admin (track-my-cash-admin)
  STORY-02: CRUD articles (routes + actions + queries + composants)
  STORY-03: Gestion categories (inline dans /blog)

Phase 3 — Front public (track-my-cash)
  STORY-04: Lecture dynamique (queries + BlogContent modifie)
  STORY-05: Page [slug] (query DB + sanitize-html + SEO)

Phase 4 — Newsletter (les 2 projets)
  STORY-06: Inscription newsletter (front: action + email confirmation)
  STORY-07: Dashboard newsletter (admin: liste + stats + export)
  STORY-08: Desabonnement (front: API route HMAC)
```
