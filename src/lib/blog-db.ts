import type { Client } from "@libsql/client";

/**
 * Crée les tables blog + newsletter dans la Main DB Turso.
 * Idempotent — peut être appelé plusieurs fois sans erreur.
 */
export async function ensureBlogTables(db: Client): Promise<void> {
  await db.executeMultiple(`
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
      author_name TEXT NOT NULL DEFAULT 'Koupli',
      meta_title TEXT,
      meta_description TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE INDEX IF NOT EXISTS idx_blog_posts_slug ON blog_posts(slug);
    CREATE INDEX IF NOT EXISTS idx_blog_posts_status ON blog_posts(status);
    CREATE INDEX IF NOT EXISTS idx_blog_posts_published_at ON blog_posts(published_at);

    CREATE TABLE IF NOT EXISTS blog_categories (
      id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
      name TEXT NOT NULL UNIQUE,
      slug TEXT NOT NULL UNIQUE,
      color TEXT NOT NULL DEFAULT '#4F46E5'
    );

    CREATE TABLE IF NOT EXISTS blog_post_categories (
      post_id TEXT NOT NULL REFERENCES blog_posts(id) ON DELETE CASCADE,
      category_id TEXT NOT NULL REFERENCES blog_categories(id) ON DELETE CASCADE,
      PRIMARY KEY (post_id, category_id)
    );

    CREATE TABLE IF NOT EXISTS newsletter_subscribers (
      id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
      email TEXT NOT NULL UNIQUE,
      status TEXT NOT NULL DEFAULT 'active' CHECK(status IN ('active', 'unsubscribed')),
      subscribed_at TEXT NOT NULL DEFAULT (datetime('now')),
      unsubscribed_at TEXT
    );

    CREATE INDEX IF NOT EXISTS idx_newsletter_email ON newsletter_subscribers(email);
    CREATE INDEX IF NOT EXISTS idx_newsletter_status ON newsletter_subscribers(status);
  `);
}

/** Catégories initiales du blog */
export const SEED_CATEGORIES = [
  { name: "Budget", slug: "budget", color: "#4F46E5" },
  { name: "Couple", slug: "couple", color: "#EC4899" },
  { name: "Épargne", slug: "epargne", color: "#10B981" },
  { name: "IA", slug: "ia", color: "#F59E0B" },
  { name: "Sécurité", slug: "securite", color: "#EF4444" },
] as const;

/** Articles seed migrés depuis src/data/blog-posts.ts */
export const SEED_POSTS = [
  {
    slug: "gerer-budget-couple",
    title: "Comment gérer son budget en couple sans se disputer",
    excerpt:
      "La gestion de l'argent est l'une des premières sources de tension en couple. Voici les méthodes qui fonctionnent vraiment.",
    content: `<h2>Pourquoi l'argent crée des tensions en couple ?</h2>
<p>Selon une étude de l'Observatoire des finances françaises, les disputes liées à l'argent sont la deuxième cause de séparation. Pourtant, avec les bons outils et méthodes, il est tout à fait possible de gérer un budget commun sereinement.</p>

<h2>Les 3 méthodes les plus efficaces</h2>

<h3>1. Le compte commun partiel</h3>
<p>Chaque partenaire verse une contribution proportionnelle à ses revenus sur un compte commun. Ce compte sert uniquement aux dépenses communes : loyer, courses, sorties. Les dépenses personnelles restent séparées.</p>

<h3>2. Le pot commun intégral</h3>
<p>Tous les revenus sont mis en commun. Cette méthode convient aux couples stables qui ont les mêmes objectifs financiers et un niveau de confiance élevé.</p>

<h3>3. Le remboursement au fil de l'eau</h3>
<p>Chacun paie ce qu'il veut, et on équilibre les comptes régulièrement (mensuellement par exemple). Cette méthode est flexible mais requiert un suivi rigoureux.</p>

<h2>L'outil clé : le suivi des dépenses partagées</h2>
<p>Quelle que soit la méthode choisie, le suivi des dépenses est indispensable. Un bon outil vous permet de visualiser en temps réel qui a dépensé quoi, et d'équilibrer automatiquement la balance.</p>`,
    readingTime: 5,
    publishedAt: "2026-02-24T10:00:00.000Z",
    categories: ["budget", "couple"],
  },
  {
    slug: "partager-depenses-equitablement",
    title: "Partager ses dépenses équitablement : 3 méthodes éprouvées",
    excerpt:
      "Vous ne savez pas comment répartir les dépenses avec votre partenaire ? Découvrez 3 approches concrètes pour que chacun se sente traité équitablement.",
    content: `<h2>L'équité, pas toujours l'égalité</h2>
<p>Partager équitablement les dépenses ne signifie pas forcément payer 50/50. Si vos revenus sont différents, une répartition proportionnelle est souvent plus juste.</p>

<h2>Méthode 1 : 50/50 strict</h2>
<p>Idéale pour les couples aux revenus proches. Chaque dépense commune est divisée en deux parts égales. Simple, transparent, mais peut créer des tensions si les revenus sont très différents.</p>

<h2>Méthode 2 : Proportionnel aux revenus</h2>
<p>Si l'un gagne 3 000 €/mois et l'autre 2 000 €, le premier contribue à hauteur de 60 %, le second 40 %. Cette méthode est perçue comme la plus équitable par la majorité des couples.</p>

<h2>Méthode 3 : Par poste de dépense</h2>
<p>Chaque partenaire prend en charge certains postes spécifiques : l'un paie le loyer, l'autre les courses et les abonnements. Pratique pour éviter les calculs constants, mais attention aux déséquilibres dans le temps.</p>

<h2>Comment un outil de suivi vous aide</h2>
<p>Un bon outil calcule automatiquement la balance entre vous et votre partenaire, en tenant compte de qui a payé quoi. Plus besoin de sortir la calculatrice en fin de mois.</p>`,
    readingTime: 4,
    publishedAt: "2026-02-17T10:00:00.000Z",
    categories: ["couple"],
  },
  {
    slug: "objectifs-epargne-couple",
    title: "5 objectifs d'épargne pour les couples en 2026",
    excerpt:
      "Épargner ensemble, c'est bien. Épargner avec des objectifs clairs et motivants, c'est mieux. Voici 5 projets d'épargne qui soudent les couples.",
    content: `<h2>Pourquoi définir des objectifs communs ?</h2>
<p>Épargner sans but précis est difficile à maintenir dans la durée. Avoir des objectifs partagés crée une motivation commune et renforce la cohésion du couple.</p>

<h2>Objectif 1 : Le fonds d'urgence commun</h2>
<p>Visez 3 à 6 mois de dépenses communes en réserve. Ce matelas de sécurité vous protège des imprévus sans devoir vous endetter.</p>

<h2>Objectif 2 : Le voyage de rêve</h2>
<p>Définissez ensemble une destination et un budget. En mettant de côté 200-300 € par mois, un voyage à 3 000 € est accessible en moins d'un an.</p>

<h2>Objectif 3 : L'apport pour un bien immobilier</h2>
<p>Pour un apport de 20 000 €, un couple économisant 500 €/mois y arrive en 3 ans et 4 mois. Un objectif ambitieux mais réalisable avec de la discipline.</p>

<h2>Objectif 4 : La voiture ou la rénovation</h2>
<p>Des projets à moyen terme (12-24 mois) permettent de s'offrir de grands achats sans crédit. Définissez un montant cible et suivez votre progression chaque mois.</p>

<h2>Objectif 5 : La retraite anticipée</h2>
<p>Si vous commencez tôt, même une petite épargne mensuelle peut faire une grande différence à long terme. Utilisez un simulateur pour visualiser la croissance de votre capital.</p>`,
    readingTime: 5,
    publishedAt: "2026-02-10T10:00:00.000Z",
    categories: ["epargne", "couple"],
  },
] as const;

/**
 * Insère les données seed (catégories + articles + liaisons).
 * Utilise INSERT OR IGNORE pour être idempotent.
 */
export async function seedBlogData(db: Client): Promise<void> {
  // Insert categories
  for (const cat of SEED_CATEGORIES) {
    await db.execute({
      sql: `INSERT OR IGNORE INTO blog_categories (id, name, slug, color)
            VALUES (lower(hex(randomblob(16))), ?, ?, ?)`,
      args: [cat.name, cat.slug, cat.color],
    });
  }

  // Insert posts
  for (const post of SEED_POSTS) {
    // Check if post already exists
    const existing = await db.execute({
      sql: "SELECT id FROM blog_posts WHERE slug = ?",
      args: [post.slug],
    });

    if (existing.rows.length > 0) continue;

    const postResult = await db.execute({
      sql: `INSERT INTO blog_posts (id, slug, title, excerpt, content, reading_time, status, published_at, author_name)
            VALUES (lower(hex(randomblob(16))), ?, ?, ?, ?, ?, 'published', ?, 'Koupli')
            RETURNING id`,
      args: [
        post.slug,
        post.title,
        post.excerpt,
        post.content,
        post.readingTime,
        post.publishedAt,
      ],
    });

    const postId = String(postResult.rows[0].id);

    // Link categories
    for (const catSlug of post.categories) {
      await db.execute({
        sql: `INSERT OR IGNORE INTO blog_post_categories (post_id, category_id)
              SELECT ?, id FROM blog_categories WHERE slug = ?`,
        args: [postId, catSlug],
      });
    }
  }
}
