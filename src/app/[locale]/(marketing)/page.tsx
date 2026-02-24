import type { Metadata } from "next";
import { Link } from "@/i18n/navigation";
import { PLANS } from "@/lib/stripe-plans";

export const DESCRIPTIONS: Record<string, string> = {
  fr: "Gérez vos finances de couple : suivez vos dépenses communes, équilibrez qui doit quoi et atteignez vos objectifs ensemble. Gratuit, sécurisé, sans publicité.",
  en: "Manage your couple's finances: track shared expenses, balance who owes what, and reach your goals together. Free, secure, no ads.",
  es: "Gestiona las finanzas en pareja: gastos comunes, saldo equilibrado y objetivos compartidos. Gratis, seguro, sin anuncios.",
  it: "Gestite le finanze di coppia: spese comuni, chi deve cosa, obiettivi condivisi. Gratuito, sicuro, senza pubblicità.",
  de: "Paarverwaltung Ihrer Finanzen: gemeinsame Ausgaben, Ausgleich, Sparziele. Kostenlos, sicher, werbefrei.",
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://trackmycash.com";
  const description = DESCRIPTIONS[locale] ?? DESCRIPTIONS.fr;

  return {
    title: "TrackMyCash — Gérez vos finances personnelles",
    description,
    openGraph: {
      title: "TrackMyCash — Gérez vos finances personnelles",
      description,
      url: `${baseUrl}/${locale}`,
      type: "website",
    },
  };
}

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

export const STEPS = [
  {
    num: 1,
    icon: "person_add",
    title: "Créez votre compte",
    desc: "Inscription gratuite en 30 secondes, sans carte bancaire requise.",
  },
  {
    num: 2,
    icon: "group_add",
    title: "Invitez votre partenaire",
    desc: "Partagez un code d'invitation unique. Votre partenaire rejoint en quelques secondes.",
  },
  {
    num: 3,
    icon: "insights",
    title: "Analysez ensemble",
    desc: "Visualisez votre balance couple, vos dépenses communes et atteignez vos objectifs ensemble.",
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

type PlanId = "free" | "pro" | "premium";

const PRICING_PLANS: Array<{
  id: PlanId;
  highlighted: boolean;
  badge?: string;
  cta: string;
  href: string;
}> = [
  { id: "free",    highlighted: false, cta: "Démarrer",       href: "/inscription" },
  { id: "pro",     highlighted: true,  badge: "Populaire", cta: "Choisir Pro",     href: "/tarifs" },
  { id: "premium", highlighted: false, cta: "Choisir Premium", href: "/tarifs" },
];

export default function HomePage() {
  return (
    <div className="bg-background-light">

      {/* ── HERO ── */}
      <section className="max-w-5xl mx-auto px-4 pt-16 pb-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">

          {/* Texte */}
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 text-primary px-3 py-1 text-xs font-bold mb-6">
              <span className="material-symbols-outlined text-[14px]">favorite</span>
              Dédié aux couples · Essai 14 jours · Sans carte
            </div>
            <h1 className="text-4xl sm:text-5xl font-extrabold text-text-main tracking-tight leading-tight mb-4">
              Vos finances de couple,<br />
              <span className="text-primary">enfin maîtrisées</span>
            </h1>
            <p className="text-text-muted text-lg font-medium mb-8 leading-relaxed">
              Suivez vos dépenses communes, équilibrez qui doit quoi,
              atteignez vos objectifs ensemble.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <Link
                href="/inscription"
                className="flex items-center justify-center h-12 px-6 bg-primary text-white font-bold rounded-xl shadow-lg shadow-primary/20 hover:bg-primary/90 transition-colors"
              >
                Commencer gratuitement
              </Link>
              <Link
                href="/tarifs"
                className="flex items-center justify-center h-12 px-6 border-2 border-slate-200 text-text-main font-bold rounded-xl hover:border-primary hover:text-primary transition-colors"
              >
                Voir les tarifs
              </Link>
            </div>
          </div>

          {/* Illustration décorative — icônes couple */}
          <div className="hidden lg:flex items-center justify-center">
            <div className="relative w-80 h-72">
              {/* Icône centrale */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="flex items-center justify-center size-24 rounded-3xl bg-primary/10 text-primary shadow-soft">
                  <span
                    className="material-symbols-outlined"
                    style={{ fontSize: "52px", fontVariationSettings: "'FILL' 1" }}
                  >
                    favorite
                  </span>
                </div>
              </div>
              {/* Icônes satellites */}
              <div className="absolute top-2 left-10 flex items-center justify-center size-14 rounded-2xl bg-white border border-slate-100 shadow-soft text-success">
                <span className="material-symbols-outlined" style={{ fontSize: "26px", fontVariationSettings: "'FILL' 1" }}>balance</span>
              </div>
              <div className="absolute top-2 right-10 flex items-center justify-center size-14 rounded-2xl bg-white border border-slate-100 shadow-soft text-primary">
                <span className="material-symbols-outlined" style={{ fontSize: "26px", fontVariationSettings: "'FILL' 1" }}>auto_awesome</span>
              </div>
              <div className="absolute bottom-2 left-10 flex items-center justify-center size-14 rounded-2xl bg-white border border-slate-100 shadow-soft text-warning">
                <span className="material-symbols-outlined" style={{ fontSize: "26px", fontVariationSettings: "'FILL' 1" }}>savings</span>
              </div>
              <div className="absolute bottom-2 right-10 flex items-center justify-center size-14 rounded-2xl bg-white border border-slate-100 shadow-soft text-primary">
                <span className="material-symbols-outlined" style={{ fontSize: "26px", fontVariationSettings: "'FILL' 1" }}>group</span>
              </div>
              <div className="absolute top-1/2 -translate-y-1/2 -left-2 flex items-center justify-center size-14 rounded-2xl bg-white border border-slate-100 shadow-soft text-text-muted">
                <span className="material-symbols-outlined" style={{ fontSize: "26px", fontVariationSettings: "'FILL' 1" }}>account_balance_wallet</span>
              </div>
              <div className="absolute top-1/2 -translate-y-1/2 -right-2 flex items-center justify-center size-14 rounded-2xl bg-white border border-slate-100 shadow-soft text-success">
                <span className="material-symbols-outlined" style={{ fontSize: "26px", fontVariationSettings: "'FILL' 1" }}>trending_up</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-5xl mx-auto px-4">

        {/* ── FEATURES ALTERNÉES ── */}
        <section className="py-12 border-t border-slate-100">
          <div className="text-center mb-12">
            <h2 className="text-2xl font-bold text-text-main mb-2">Conçu pour les couples</h2>
            <p className="text-text-muted">Gérez vos finances communes sans friction, en toute transparence.</p>
          </div>
          <div className="flex flex-col gap-16">
            {FEATURES.map((feature, index) => (
              <div
                key={feature.icon}
                className={`flex flex-col gap-8 items-center lg:items-start ${
                  index % 2 === 0 ? "lg:flex-row" : "lg:flex-row-reverse"
                }`}
              >
                {/* Icône */}
                <div className="flex-shrink-0 flex items-center justify-center size-32 rounded-3xl bg-primary/10 text-primary">
                  <span
                    className="material-symbols-outlined"
                    style={{ fontSize: "60px", fontVariationSettings: "'FILL' 1" }}
                  >
                    {feature.icon}
                  </span>
                </div>
                {/* Texte */}
                <div className="flex-1 text-center lg:text-left">
                  <h3 className="text-xl font-bold text-text-main mb-3">{feature.title}</h3>
                  <p className="text-text-muted mb-4 leading-relaxed">{feature.desc}</p>
                  <ul className="flex flex-col gap-2 items-center lg:items-start">
                    {feature.bullets.map((bullet) => (
                      <li key={bullet} className="flex items-center gap-2 text-sm text-text-main">
                        <span
                          className="material-symbols-outlined text-success"
                          style={{ fontSize: "18px", fontVariationSettings: "'FILL' 1" }}
                        >
                          check_circle
                        </span>
                        {bullet}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── COMMENT ÇA MARCHE ── */}
        <section className="py-12 border-t border-slate-100">
          <div className="text-center mb-12">
            <h2 className="text-2xl font-bold text-text-main mb-2">Prêt en 3 étapes</h2>
            <p className="text-text-muted">Créez votre couple financier en quelques minutes.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
            {STEPS.map((step) => (
              <div key={step.num} className="flex flex-col items-center text-center gap-4">
                <div className="relative flex items-center justify-center size-16 rounded-2xl bg-primary/10 text-primary">
                  <span
                    className="material-symbols-outlined"
                    style={{ fontSize: "32px", fontVariationSettings: "'FILL' 1" }}
                  >
                    {step.icon}
                  </span>
                  <span className="absolute -top-2 -right-2 flex items-center justify-center size-6 rounded-full bg-primary text-white text-xs font-bold">
                    {step.num}
                  </span>
                </div>
                <div>
                  <h3 className="font-bold text-text-main mb-1">{step.title}</h3>
                  <p className="text-text-muted text-sm">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── TARIFS ── */}
        <section className="py-12 border-t border-slate-100">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-text-main mb-2">Tarifs transparents</h2>
            <p className="text-text-muted">Commencez gratuitement, évoluez selon vos besoins.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-start">
            {PRICING_PLANS.map((planDef) => {
              const plan = PLANS[planDef.id];
              const priceStr =
                plan.price === 0
                  ? "0€"
                  : `${plan.price.toString().replace(".", ",")}€`;

              if (planDef.highlighted) {
                return (
                  <div
                    key={planDef.id}
                    className="relative p-6 bg-white rounded-2xl border-2 border-primary shadow-xl shadow-primary/10"
                  >
                    {planDef.badge && (
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-white text-xs font-bold px-3 py-1 rounded-full uppercase">
                        {planDef.badge}
                      </div>
                    )}
                    <h3 className="font-bold text-primary text-lg mb-1">{plan.name}</h3>
                    <div className="flex items-baseline gap-1 mb-4">
                      <span className="text-3xl font-extrabold text-text-main">{priceStr}</span>
                      <span className="text-text-muted">/mois</span>
                    </div>
                    <Link
                      href={planDef.href}
                      className="w-full flex items-center justify-center h-10 bg-primary text-white font-bold rounded-xl shadow-lg shadow-primary/20 text-sm"
                    >
                      {planDef.cta}
                    </Link>
                    <ul className="flex flex-col gap-2 mt-4">
                      {plan.features.map((feature) => (
                        <li key={feature} className="flex items-center gap-2 text-sm text-text-main">
                          <span
                            className="material-symbols-outlined text-success text-[16px] shrink-0"
                            style={{ fontVariationSettings: "'FILL' 1" }}
                          >
                            check
                          </span>
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>
                );
              }

              return (
                <div
                  key={planDef.id}
                  className="p-6 bg-white rounded-2xl border border-slate-100 shadow-soft"
                >
                  <h3 className="font-bold text-text-main text-lg mb-1">{plan.name}</h3>
                  <div className="flex items-baseline gap-1 mb-4">
                    <span className="text-3xl font-extrabold text-text-main">{priceStr}</span>
                    <span className="text-text-muted">/mois</span>
                  </div>
                  <Link
                    href={planDef.href}
                    className="w-full flex items-center justify-center h-10 border-2 border-slate-200 text-text-main font-bold rounded-xl hover:border-primary hover:text-primary transition-colors text-sm"
                  >
                    {planDef.cta}
                  </Link>
                  <ul className="flex flex-col gap-2 mt-4">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-center gap-2 text-sm text-text-main">
                        <span
                          className="material-symbols-outlined text-success text-[16px] shrink-0"
                          style={{ fontVariationSettings: "'FILL' 1" }}
                        >
                          check
                        </span>
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>
          <p className="text-center text-sm text-text-muted mt-6">
            <Link href="/tarifs" className="text-primary hover:underline font-medium">
              Voir la comparaison détaillée →
            </Link>
          </p>
        </section>

        {/* ── TÉMOIGNAGES ── */}
        <section className="py-12 border-t border-slate-100">
          <div className="text-center mb-10">
            <h2 className="text-2xl font-bold text-text-main mb-2">Ce que disent les couples</h2>
            <p className="text-text-muted">Ils ont transformé leur gestion financière ensemble.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {TESTIMONIALS.map((t) => (
              <div key={t.author} className="bg-white rounded-2xl border border-slate-100 shadow-soft p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="flex items-center justify-center size-10 rounded-full bg-primary/10 text-primary">
                    <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>{t.icon}</span>
                  </div>
                  <div>
                    <p className="text-sm font-bold text-text-main">{t.author}</p>
                    <p className="text-xs text-text-muted">{t.role}</p>
                  </div>
                </div>
                <p className="text-text-muted text-sm leading-relaxed">&ldquo;{t.text}&rdquo;</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── CTA FINAL ── */}
        <section className="py-12 pb-16">
          <div className="bg-primary rounded-2xl p-10 text-center">
            <h2 className="text-2xl font-bold text-white mb-3">
              Prêts à gérer votre argent ensemble ?
            </h2>
            <p className="text-white/80 mb-8">
              Essai gratuit de 14 jours · Aucune carte requise · Invitez votre partenaire en 30 secondes
            </p>
            <Link
              href="/inscription"
              className="inline-flex items-center justify-center h-12 px-8 bg-white text-primary font-bold rounded-xl hover:bg-white/90 transition-colors"
            >
              Créer notre compte gratuitement
            </Link>
          </div>
        </section>

      </div>
    </div>
  );
}
