import type { Metadata } from "next";
import { Link } from "@/i18n/navigation";
import { ScrollRevealSection } from "@/components/marketing/scroll-reveal";
import { buildPageMetadata } from "@/lib/seo/metadata";
import {
  webSiteSchema,
  softwareApplicationSchema,
  faqPageSchema,
} from "@/lib/seo/schemas";
import { FaqAccordion } from "./tarifs/faq-accordion";
import { DESCRIPTIONS, HOME_FAQ_ITEMS } from "./homepage-data";

// Re-export for backward compatibility with tests
export { DESCRIPTIONS, HOME_FAQ_ITEMS };

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const description = DESCRIPTIONS[locale] ?? DESCRIPTIONS.fr;

  return buildPageMetadata({
    title: "TrackMyCash — Gérez vos finances personnelles",
    description,
    path: "",
    locale,
    ogImage: "/og/home.png",
  });
}

// ── Tarification affichage — STORY-108 ───────────────────────────────────
type PricingDisplay = {
  id: "free" | "pro" | "premium";
  name: string;
  price: string;
  desc: string;
  highlighted: boolean;
  badge?: string;
  cta: string;
  href: string;
};

export const PRICING_DISPLAY: PricingDisplay[] = [
  {
    id: "free",
    name: "Découverte",
    price: "0€",
    desc: "Idéal pour tester l'interface en solo avant d'inviter votre partenaire.",
    highlighted: false,
    cta: "Commencer",
    href: "/inscription",
  },
  {
    id: "pro",
    name: "Couple Pro",
    price: "4,90€",
    desc: "L'expérience complète pour gérer le budget à deux.",
    highlighted: true,
    badge: "Populaire",
    cta: "Choisir Pro",
    href: "/tarifs",
  },
  {
    id: "premium",
    name: "Unlimited",
    price: "7,90€",
    desc: "Pour les power users qui veulent optimiser leur patrimoine.",
    highlighted: false,
    cta: "Choisir Unlimited",
    href: "/tarifs",
  },
];

// ── Legacy exports (backward compat with tests) ─────────────────────────

export const FEATURES = [
  {
    icon: "favorite",
    title: "Comptes partagés, vision commune",
    desc: "Centralisez les comptes du couple en un seul endroit. Tagguez vos transactions partagées et visualisez votre budget commun en temps réel.",
    bullets: [
      "Transactions partagées en un clic",
      "Solde couple calculé automatiquement",
      "Historique commun complet",
    ],
  },
  {
    icon: "balance",
    title: "Balance équitable, toujours à jour",
    desc: "Sachez en permanence qui a payé quoi. TrackMyCash calcule la différence et indique qui doit rembourser l'autre, sans prise de tête.",
    bullets: [
      "Qui doit quoi en temps réel",
      "Calcul automatique de la balance",
      "Historique des remboursements",
    ],
  },
  {
    icon: "auto_awesome",
    title: "Objectifs communs & IA couple",
    desc: "Épargnez ensemble pour vos projets et bénéficiez d'un conseiller IA dédié au couple pour analyser vos dépenses communes et optimiser votre budget.",
    bullets: [
      "Objectifs d'épargne partagés",
      "IA conseiller couple (Premium)",
      "Analyse des tendances communes",
    ],
  },
];

export const TESTIMONIALS = [
  {
    author: "Sophie & Thomas, Paris",
    role: "En couple depuis 3 ans",
    text: "On sait enfin en temps réel qui doit quoi ! Plus de disputes sur les dépenses, la balance se met à jour automatiquement.",
    icon: "favorite",
  },
  {
    author: "Léa & Marc, Lyon",
    role: "Propriétaires d'un appartement",
    text: "L'IA couple nous a aidé à repérer où on gaspillait. On a économisé plus de 200 € par mois en quelques semaines.",
    icon: "savings",
  },
];

export const STEPS = [
  {
    num: "01",
    icon: "upload_file",
    title: "Import",
    desc: "Importez vos relevés bancaires (CSV, XLSX, PDF). Invitez votre partenaire à faire de même en quelques secondes.",
  },
  {
    num: "02",
    icon: "balance",
    title: "Répartition",
    desc: "Définissez vos règles de partage. 50/50, au prorata des revenus, ou dépense par dépense.",
  },
  {
    num: "03",
    icon: "insights",
    title: "Vision",
    desc: "Suivez l'évolution de votre épargne commune et planifiez vos futurs projets de vie.",
  },
];

type BentoFeature = {
  id: string;
  title: string;
  desc?: string;
  subtitle?: string;
  icon?: string;
  colSpan?: number;
  dark?: boolean;
};

export const BENTO_FEATURES: BentoFeature[] = [
  {
    id: "couple",
    title: "Espace Couple",
    desc: "Un tableau de bord unifié où tout est clair. Fini les fichiers Excel obscurs.",
    colSpan: 2,
    dark: false,
  },
  {
    id: "balance",
    title: "0€",
    subtitle: "Écart de balance",
    icon: "balance",
    colSpan: 1,
    dark: true,
  },
  {
    id: "budgets",
    title: "Budgets",
    desc: "Limites intelligentes pour les courses et les sorties.",
    icon: "pie_chart",
    colSpan: 1,
    dark: false,
  },
  {
    id: "ia",
    title: "IA Assistant",
    desc: "Conseils personnalisés basés sur vos habitudes communes.",
    colSpan: 1,
    dark: false,
  },
  {
    id: "import",
    title: "Multi-Import",
    desc: "Importez tous vos comptes. CSV, XLSX et PDF — tous les formats bancaires supportés.",
    colSpan: 3,
    dark: false,
  },
];

// ── Data ─────────────────────────────────────────────────────────────────

const PAIN_POINTS = [
  {
    before: "« Tu me dois combien déjà ? »",
    after: "Chaque dépense est répartie automatiquement. Zéro calcul, zéro oubli.",
  },
  {
    before: "« Passe-moi le fichier Excel… »",
    after: "Un tableau de bord partagé, toujours à jour. Fini les fichiers perdus.",
  },
  {
    before: "« Tu as dépensé combien ?! »",
    after: "Chacun garde son jardin secret. Seuls les comptes partagés sont visibles.",
  },
  {
    before: "« On épargne pour quoi au fait ? »",
    after: "Des objectifs communs visuels. Voyez votre progression ensemble.",
  },
];

const FEATURE_CARDS = [
  {
    num: "01",
    title: "Import en 30 secondes",
    desc: "Glissez votre relevé bancaire (CSV, XLSX, PDF). Toutes les banques françaises sont reconnues automatiquement.",
  },
  {
    num: "02",
    title: "IA qui vous connaît",
    desc: "Un conseiller IA dédié au couple qui analyse vos habitudes et propose des économies concrètes.",
  },
  {
    num: "03",
    title: "Répartition flexible",
    desc: "50/50, au prorata des revenus, ou dépense par dépense. Vous choisissez vos règles.",
  },
  {
    num: "04",
    title: "Objectifs à deux",
    desc: "Vacances, apport immobilier, fonds d'urgence. Suivez votre progression ensemble en temps réel.",
  },
  {
    num: "05",
    title: "Vie privée préservée",
    desc: "Chacun garde son jardin secret. Seuls les comptes partagés sont visibles par l'autre.",
  },
  {
    num: "06",
    title: "Récap hebdo",
    desc: "Chaque lundi, un résumé clair de la semaine : dépenses, balance, objectifs. Rien ne vous échappe.",
  },
];

const TESTIMONIAL_CARDS = [
  {
    stars: 5,
    text: "On sait enfin qui doit quoi en temps réel. Plus de disputes, plus de tableurs. L'IA nous a même aidé à économiser 200 € par mois.",
    name: "Sophie & Thomas",
    city: "Paris",
    duration: "Utilisateurs depuis 8 mois",
    color: "bg-violet-500",
    initials: "ST",
  },
  {
    stars: 5,
    text: "L'import automatique est magique. En 30 secondes, tous nos comptes sont synchronisés. On ne pourrait plus s'en passer.",
    name: "Léa & Marc",
    city: "Lyon",
    duration: "Utilisateurs depuis 1 an",
    color: "bg-pink-500",
    initials: "LM",
  },
  {
    stars: 5,
    text: "Ce qui m'a convaincue, c'est que chacun garde son espace privé. On partage ce qu'on veut, quand on veut.",
    name: "Camille & Julien",
    city: "Bordeaux",
    duration: "Utilisateurs depuis 6 mois",
    color: "bg-amber-500",
    initials: "CJ",
  },
];

const TRUST_ITEMS = [
  "Données sécurisées",
  "Aucun accès à vos comptes",
  "Suppression à tout moment",
  "Vie privée par défaut",
];

// ── Page ─────────────────────────────────────────────────────────────────

export default function HomePage() {
  return (
    <ScrollRevealSection>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(webSiteSchema()) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareApplicationSchema()) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqPageSchema(HOME_FAQ_ITEMS)) }}
      />
      <div>
        {/* ── HERO ── */}
        <section className="relative bg-[#F5F3FF] pt-28 pb-20 md:pt-40 md:pb-28 overflow-hidden">
          <div className="max-w-7xl mx-auto px-6">
            <div className="flex flex-col lg:flex-row items-center gap-16 lg:gap-24">
              {/* Text left */}
              <div className="flex-1 text-center lg:text-left fade-up">
                <div className="inline-flex items-center gap-2 bg-primary/8 text-primary px-4 py-1.5 rounded-full text-xs font-semibold mb-8">
                  Nouveau — Conseiller IA pour couples
                </div>

                <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl font-bold leading-[1.1] tracking-tight mb-6 text-[#1C1917]">
                  L&apos;argent ne devrait{" "}
                  <em className="text-primary not-italic font-bold italic">jamais</em>{" "}
                  être un sujet de dispute.
                </h1>

                <p className="text-text-muted text-lg md:text-xl mb-10 leading-relaxed max-w-xl mx-auto lg:mx-0">
                  TrackMyCash synchronise vos finances de couple en toute transparence,
                  tout en préservant l&apos;intimité de chacun. En 2 minutes, c&apos;est réglé.
                </p>

                <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start mb-8">
                  <Link
                    href="/inscription"
                    className="bg-primary text-white font-semibold py-3.5 px-8 rounded-full text-center hover:opacity-90 transition-opacity"
                  >
                    Commencer gratuitement
                  </Link>
                  <Link
                    href="/fonctionnalites"
                    className="border border-border-light text-[#1C1917] font-semibold py-3.5 px-8 rounded-full text-center hover:bg-white/60 transition-colors"
                  >
                    Voir comment ça marche
                  </Link>
                </div>

                {/* Social proof */}
                <div className="flex items-center justify-center lg:justify-start gap-3">
                  <div className="flex -space-x-2">
                    <div className="w-8 h-8 rounded-full bg-violet-500 border-2 border-white" />
                    <div className="w-8 h-8 rounded-full bg-pink-500 border-2 border-white" />
                    <div className="w-8 h-8 rounded-full bg-amber-500 border-2 border-white" />
                    <div className="w-8 h-8 rounded-full bg-emerald-500 border-2 border-white" />
                  </div>
                  <p className="text-sm text-text-muted">
                    <span className="font-bold text-[#1C1917]">12 000+</span> couples gèrent déjà leurs finances ensemble
                  </p>
                </div>
              </div>

              {/* Mock dashboard card right */}
              <div className="flex-1 w-full max-w-md relative hidden lg:block fade-up">
                <div className="bg-white rounded-3xl shadow-xl border border-border-light p-6 relative">
                  {/* Header */}
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <p className="text-xs font-semibold text-text-muted uppercase tracking-wider">Espace Couple</p>
                      <p className="text-3xl font-bold tracking-tight text-[#1C1917] mt-1">2 850,00 €</p>
                    </div>
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary text-sm font-bold">
                      EC
                    </div>
                  </div>

                  {/* Last transactions */}
                  <div className="space-y-3 mb-5">
                    <div className="flex items-center justify-between py-2 border-b border-border-light">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-orange-50 flex items-center justify-center text-sm">
                          🛒
                        </div>
                        <div>
                          <p className="text-sm font-medium text-[#1C1917]">Courses Carrefour</p>
                          <p className="text-xs text-text-muted">Aujourd&apos;hui</p>
                        </div>
                      </div>
                      <span className="text-sm font-semibold text-red-500">-84,50 €</span>
                    </div>
                    <div className="flex items-center justify-between py-2 border-b border-border-light">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-red-50 flex items-center justify-center text-sm">
                          🍝
                        </div>
                        <div>
                          <p className="text-sm font-medium text-[#1C1917]">Resto Italien</p>
                          <p className="text-xs text-text-muted">Hier</p>
                        </div>
                      </div>
                      <span className="text-sm font-semibold text-red-500">-62,00 €</span>
                    </div>
                    <div className="flex items-center justify-between py-2">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center text-sm">
                          🏠
                        </div>
                        <div>
                          <p className="text-sm font-medium text-[#1C1917]">Loyer Mars</p>
                          <p className="text-xs text-text-muted">01/03</p>
                        </div>
                      </div>
                      <span className="text-sm font-semibold text-red-500">-1 200 €</span>
                    </div>
                  </div>

                  {/* Balance chips */}
                  <div className="flex gap-2 mb-4">
                    <span className="text-xs font-medium bg-amber-50 text-amber-700 px-3 py-1 rounded-full">
                      Sophie doit 43,25 €
                    </span>
                    <span className="text-xs font-medium bg-emerald-50 text-emerald-700 px-3 py-1 rounded-full">
                      Écart Équilibré
                    </span>
                  </div>

                  {/* Floating AI advice badge */}
                  <div className="absolute -bottom-4 -right-4 bg-primary text-white text-xs font-semibold px-4 py-2 rounded-full shadow-lg">
                    💡 IA : Pensez à épargner 50 €
                  </div>
                </div>
              </div>
            </div>

            {/* Stats row */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-16 fade-up">
              {[
                { value: "12 000+", label: "couples actifs" },
                { value: "4,8/5", label: "App Store" },
                { value: "< 2 min", label: "pour démarrer" },
                { value: "0 €", label: "pour essayer" },
              ].map((stat) => (
                <div
                  key={stat.label}
                  className="bg-white/70 backdrop-blur rounded-2xl p-5 text-center border border-border-light hover-lift"
                >
                  <p className="text-2xl font-bold text-[#1C1917]">{stat.value}</p>
                  <p className="text-sm text-text-muted mt-1">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── PAIN POINTS ── */}
        <section className="py-24 md:py-32">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center mb-16 fade-up">
              <span className="inline-block bg-amber-100 text-amber-800 text-xs font-semibold px-4 py-1.5 rounded-full mb-6">
                On connaît le problème
              </span>
              <h2 className="font-serif text-3xl md:text-5xl font-bold tracking-tight text-[#1C1917]">
                Ces phrases, c&apos;est fini.
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
              {PAIN_POINTS.map((point) => (
                <div
                  key={point.before}
                  className="bg-white rounded-2xl border border-border-light p-6 hover-lift fade-up"
                >
                  <p className="text-red-400 italic line-through mb-4 text-sm">
                    {point.before}
                  </p>
                  <div className="border-l-4 border-emerald-500 pl-4">
                    <p className="text-[#1C1917] text-sm leading-relaxed font-medium">
                      {point.after}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── FEATURES ── */}
        <section className="py-24 md:py-32 bg-white">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center mb-16 fade-up">
              <span className="inline-block bg-violet-100 text-violet-800 text-xs font-semibold px-4 py-1.5 rounded-full mb-6">
                Tout ce qu&apos;il faut
              </span>
              <h2 className="font-serif text-3xl md:text-5xl font-bold tracking-tight text-[#1C1917]">
                Pensé pour les couples,{" "}
                <em className="text-primary italic">vraiment.</em>
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {FEATURE_CARDS.map((feature) => (
                <div
                  key={feature.num}
                  className="bg-white rounded-2xl border border-border-light p-6 hover-lift fade-up"
                >
                  <span className="text-4xl font-bold text-primary/15 block mb-4">
                    {feature.num}
                  </span>
                  <h3 className="text-lg font-bold text-[#1C1917] mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-sm text-text-muted leading-relaxed">
                    {feature.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── TESTIMONIALS ── */}
        <section className="py-24 md:py-32">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center mb-16 fade-up">
              <span className="inline-block bg-pink-100 text-pink-800 text-xs font-semibold px-4 py-1.5 rounded-full mb-6">
                Ils en parlent mieux que nous
              </span>
              <h2 className="font-serif text-3xl md:text-5xl font-bold tracking-tight text-[#1C1917]">
                Des milliers de couples, zéro dispute.
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
              {TESTIMONIAL_CARDS.map((t) => (
                <div
                  key={t.name}
                  className="bg-white rounded-2xl border border-border-light p-6 hover-lift fade-up"
                >
                  {/* Stars */}
                  <div className="flex gap-1 mb-4">
                    {Array.from({ length: t.stars }).map((_, i) => (
                      <span key={i} className="text-amber-400 text-sm">
                        ★
                      </span>
                    ))}
                  </div>
                  <p className="text-[#1C1917] text-sm leading-relaxed mb-6">
                    &ldquo;{t.text}&rdquo;
                  </p>
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-10 h-10 rounded-full ${t.color} flex items-center justify-center text-white text-xs font-bold`}
                    >
                      {t.initials}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-[#1C1917]">{t.name}</p>
                      <p className="text-xs text-text-muted">
                        {t.city} · {t.duration}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── HOW IT WORKS ── */}
        <section className="py-24 md:py-32 bg-white">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center mb-16 fade-up">
              <span className="inline-block bg-blue-100 text-blue-800 text-xs font-semibold px-4 py-1.5 rounded-full mb-6">
                Simple comme bonjour
              </span>
              <h2 className="font-serif text-3xl md:text-5xl font-bold tracking-tight text-[#1C1917]">
                Prêts en 2 minutes
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-12 max-w-4xl mx-auto text-center">
              {[
                {
                  num: "01",
                  title: "Importez vos relevés",
                  desc: "Glissez vos fichiers bancaires. CSV, XLSX, PDF — toutes les banques sont reconnues.",
                },
                {
                  num: "02",
                  title: "Invitez votre partenaire",
                  desc: "Un simple lien suffit. Votre partenaire rejoint l'espace couple en 10 secondes.",
                },
                {
                  num: "03",
                  title: "Respirez",
                  desc: "La balance se met à jour automatiquement. L'IA vous guide. Zéro stress.",
                },
              ].map((step) => (
                <div key={step.num} className="fade-up">
                  <span className="text-5xl font-bold text-primary/15 block mb-4">
                    {step.num}
                  </span>
                  <h3 className="text-lg font-bold text-[#1C1917] mb-2">
                    {step.title}
                  </h3>
                  <p className="text-sm text-text-muted leading-relaxed">
                    {step.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── TRUST BAR ── */}
        <section className="py-12 fade-up">
          <div className="max-w-5xl mx-auto px-6">
            <div className="flex flex-wrap justify-center gap-8">
              {TRUST_ITEMS.map((item) => (
                <div key={item} className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" />
                  <span className="text-sm font-medium text-[#1C1917]">{item}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── FAQ ── */}
        <section className="py-24 md:py-32 bg-white">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center mb-16 fade-up">
              <span className="inline-block bg-emerald-100 text-emerald-800 text-xs font-semibold px-4 py-1.5 rounded-full mb-6">
                Vos questions, nos réponses
              </span>
              <h2 className="font-serif text-3xl md:text-5xl font-bold tracking-tight text-[#1C1917]">
                Questions fréquentes
              </h2>
            </div>
            <div className="max-w-2xl mx-auto fade-up">
              <FaqAccordion items={HOME_FAQ_ITEMS} />
            </div>
          </div>
        </section>

        {/* ── CTA ── */}
        <section className="py-24 px-6 fade-up">
          <div className="max-w-5xl mx-auto bg-primary rounded-[2rem] p-12 md:p-20 text-center">
            <h2 className="font-serif text-3xl md:text-5xl font-bold text-white mb-6 tracking-tight">
              Prêts à gérer vos finances à deux ?
            </h2>
            <p className="text-white/80 text-lg mb-10 max-w-xl mx-auto">
              Essai Pro gratuit 14 jours. Aucune carte requise.
              Invitez votre partenaire en 10 secondes.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/inscription"
                className="bg-white text-primary font-semibold py-3.5 px-8 rounded-full text-center hover:bg-white/90 transition-colors"
              >
                Commencer gratuitement
              </Link>
              <Link
                href="/tarifs"
                className="border border-white/40 text-white font-semibold py-3.5 px-8 rounded-full text-center hover:bg-white/10 transition-colors"
              >
                Voir les tarifs
              </Link>
            </div>
          </div>
        </section>
      </div>
    </ScrollRevealSection>
  );
}
