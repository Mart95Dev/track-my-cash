export interface BlogPost {
  slug: string;
  title: string;
  date: string;
  excerpt: string;
  content: string;
  readingTime: number;
  tags: string[];
}

export const BLOG_POSTS: BlogPost[] = [
  {
    slug: "gerer-budget-couple",
    title: "Comment gérer son budget en couple sans se disputer",
    date: "2026-02-24",
    excerpt:
      "La gestion de l'argent est l'une des premières sources de tension en couple. Voici les méthodes qui fonctionnent vraiment.",
    readingTime: 5,
    tags: ["budget", "couple", "finances"],
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
  },
  {
    slug: "partager-depenses-equitablement",
    title: "Partager ses dépenses équitablement : 3 méthodes éprouvées",
    date: "2026-02-17",
    excerpt:
      "Vous ne savez pas comment répartir les dépenses avec votre partenaire ? Découvrez 3 approches concrètes pour que chacun se sente traité équitablement.",
    readingTime: 4,
    tags: ["dépenses", "couple", "équilibre"],
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
  },
  {
    slug: "objectifs-epargne-couple",
    title: "5 objectifs d'épargne pour les couples en 2026",
    date: "2026-02-10",
    excerpt:
      "Épargner ensemble, c'est bien. Épargner avec des objectifs clairs et motivants, c'est mieux. Voici 5 projets d'épargne qui soudent les couples.",
    readingTime: 5,
    tags: ["épargne", "couple", "objectifs"],
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
  },
];

export function getBlogPost(slug: string): BlogPost | undefined {
  return BLOG_POSTS.find((p) => p.slug === slug);
}
