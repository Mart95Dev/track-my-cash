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

// ── Features alternées (STORY-092, préservées pour non-régression) ─────────
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

// ── Étapes "Comment ça marche" — STORY-108 ───────────────────────────────
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

// ── Bento features — STORY-108 ────────────────────────────────────────────
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

export default function HomePage() {
  return (
    <div className="bg-[#FAFAFA]">

      {/* ── HERO ── */}
      <section className="relative pt-28 pb-20 md:pt-40 md:pb-28 overflow-hidden">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col lg:flex-row items-center gap-16 lg:gap-24">

            {/* Texte hero */}
            <div className="flex-1 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 border border-slate-200 bg-white px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider text-slate-500 mb-8 shadow-sm">
                <span className="w-2 h-2 rounded-full bg-primary inline-block" />
                Nouvelle version 2.0
              </div>
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold leading-[1.05] tracking-tighter mb-8 text-slate-900">
                L&apos;argent à deux,<br className="hidden lg:block" />
                <span className="text-slate-400"> en toute transparence.</span>
              </h1>
              <p className="text-slate-600 text-lg md:text-xl mb-12 leading-relaxed max-w-xl mx-auto lg:mx-0 font-medium">
                Une interface épurée pour synchroniser vos comptes, partager les dépenses et atteindre vos objectifs de vie commune.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <Link
                  href="/inscription"
                  className="btn-premium text-white font-semibold py-4 px-8 rounded-full text-center tracking-tight min-w-[180px]"
                >
                  Commencer
                </Link>
                <Link
                  href="/fonctionnalites"
                  className="bg-white border border-slate-200 text-slate-900 font-semibold py-4 px-8 rounded-full hover:bg-slate-50 transition-colors text-center tracking-tight shadow-sm min-w-[180px]"
                >
                  Découvrir
                </Link>
              </div>
              <div className="mt-8 flex items-center justify-center lg:justify-start gap-4 text-xs font-semibold text-slate-400 uppercase tracking-widest">
                <span>iOS</span>
                <span className="w-1 h-1 bg-slate-300 rounded-full inline-block" />
                <span>Android</span>
                <span className="w-1 h-1 bg-slate-300 rounded-full inline-block" />
                <span>Web</span>
              </div>
            </div>

            {/* Maquette phone flottante */}
            <div className="flex-1 w-full max-w-sm lg:max-w-md relative hidden lg:block">
              <div className="relative bg-slate-900 rounded-[3rem] p-3 shadow-2xl border-4 border-slate-800 rotate-[-2deg] hover:rotate-0 transition-all duration-700 ease-out">
                <div className="bg-white rounded-[2.5rem] overflow-hidden h-[480px] relative">
                  <div className="px-6 pt-8 pb-4 flex justify-between items-center">
                    <div className="text-xs font-bold text-slate-400 uppercase tracking-widest">Aperçu</div>
                    <div className="w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center text-xs font-bold text-slate-600">LM</div>
                  </div>
                  <div className="px-6 mb-8 text-center">
                    <div className="text-slate-400 text-sm font-medium mb-1">Couple Balance</div>
                    <div className="text-4xl font-bold tracking-tight text-slate-900">2 850,00 €</div>
                    <div className="text-emerald-500 text-xs font-bold mt-2 flex items-center justify-center gap-1">
                      <span className="material-symbols-outlined text-sm">trending_up</span>
                      +12% ce mois
                    </div>
                  </div>
                  <div className="absolute bottom-6 left-6 right-6 glass-panel rounded-3xl p-5 shadow-soft">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-sm font-bold text-slate-800">Dernières dépenses</h3>
                      <span className="text-[10px] bg-slate-100 px-2 py-1 rounded text-slate-500 font-bold">Auj.</span>
                    </div>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center text-sm">🛒</div>
                          <div className="flex flex-col">
                            <span className="text-xs font-bold text-slate-700">Monoprix</span>
                            <span className="text-[10px] text-slate-400">Courses</span>
                          </div>
                        </div>
                        <span className="text-xs font-bold text-slate-900">-42,50€</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center text-sm">🎬</div>
                          <div className="flex flex-col">
                            <span className="text-xs font-bold text-slate-700">Netflix</span>
                            <span className="text-[10px] text-slate-400">Abonnement</span>
                          </div>
                        </div>
                        <span className="text-xs font-bold text-slate-900">-17,99€</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ── COMMENT ÇA MARCHE ── */}
      <section className="py-24 md:py-32 bg-white" id="how-it-works">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-end mb-20 gap-8">
            <div className="max-w-lg">
              <h2 className="text-3xl md:text-4xl font-bold tracking-tighter mb-4 text-slate-900">
                Synchronisation fluide
              </h2>
              <p className="text-slate-500 font-medium">
                Trois étapes pour ne plus jamais parler d&apos;argent avec friction.
              </p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 border-t border-slate-100 pt-12">
            {STEPS.map((step) => (
              <div key={step.num}>
                <span className="text-6xl font-bold text-slate-100 block mb-6 -ml-1">{step.num}</span>
                <h3 className="font-bold text-lg mb-3 tracking-tight text-slate-900">{step.title}</h3>
                <p className="text-slate-500 text-sm leading-relaxed pr-4">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURES BENTO GRID ── */}
      <section className="py-24 md:py-32 bg-[#FAFAFA]" id="features">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-20">
            <h2 className="text-3xl md:text-5xl font-bold tracking-tighter mb-6 text-slate-900">
              Pensé pour le couple moderne
            </h2>
            <p className="text-slate-500 text-lg max-w-2xl mx-auto font-medium">
              Une suite d&apos;outils financiers conçue pour la transparence et la sérénité.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 auto-rows-[300px]">

            {/* Espace Couple — md:col-span-2 row-span-2 */}
            <div className="md:col-span-2 md:row-span-2 bg-white rounded-3xl p-8 shadow-sm border border-slate-200/60 relative overflow-hidden group">
              <div className="relative z-10 h-full flex flex-col justify-between">
                <div>
                  <h3 className="text-2xl font-bold mb-2 tracking-tight text-slate-900">Espace Couple</h3>
                  <p className="text-slate-500 max-w-sm">Un tableau de bord unifié où tout est clair. Fini les fichiers Excel obscurs.</p>
                </div>
                <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 w-full max-w-xs self-end translate-y-4 group-hover:translate-y-2 transition-transform duration-500">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Ce mois</span>
                    <span className="text-xs font-bold text-emerald-600">+450€ épargnés</span>
                  </div>
                  <div className="h-2 w-full bg-slate-200 rounded-full overflow-hidden">
                    <div className="h-full bg-slate-900 w-3/4 rounded-full" />
                  </div>
                </div>
              </div>
            </div>

            {/* Balance 0€ — dark */}
            <div className="md:col-span-1 bg-slate-900 text-white rounded-3xl p-8 flex flex-col justify-end relative overflow-hidden">
              <span
                className="material-symbols-outlined absolute top-6 right-6 text-white/20"
                style={{ fontSize: "36px", fontVariationSettings: "'FILL' 1" }}
              >
                balance
              </span>
              <div className="relative z-10">
                <h3 className="text-4xl font-bold mb-1 tracking-tighter">0€</h3>
                <p className="text-slate-400 text-sm font-medium">Écart de balance</p>
              </div>
            </div>

            {/* Budgets */}
            <div className="md:col-span-1 bg-white rounded-3xl p-8 shadow-sm border border-slate-200/60 flex flex-col justify-between">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary mb-4">
                <span className="material-symbols-outlined text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>pie_chart</span>
              </div>
              <div>
                <h3 className="font-bold text-lg mb-2 text-slate-900">Budgets</h3>
                <p className="text-slate-500 text-sm leading-relaxed">Limites intelligentes pour les courses et les sorties.</p>
              </div>
            </div>

            {/* IA Assistant */}
            <div className="md:col-span-1 bg-white rounded-3xl p-8 shadow-sm border border-slate-200/60 flex flex-col">
              <h3 className="font-bold text-lg mb-2 text-slate-900">IA Assistant</h3>
              <p className="text-slate-500 text-sm leading-relaxed mb-6">Conseils personnalisés basés sur vos habitudes.</p>
              <div className="mt-auto bg-slate-50 p-3 rounded-xl border border-slate-100 text-xs text-slate-600 italic">
                &ldquo;Vous pouvez épargner 50€ de plus ce mois…&rdquo;
              </div>
            </div>

            {/* Multi-Import — md:col-span-3 */}
            <div className="md:col-span-3 bg-white rounded-3xl p-8 shadow-sm border border-slate-200/60 flex flex-col md:flex-row items-center gap-8">
              <div className="flex-1">
                <h3 className="text-2xl font-bold mb-3 tracking-tight text-slate-900">Multi-Import</h3>
                <p className="text-slate-500 mb-6">Importez tous vos relevés. CSV, XLSX et PDF supportés — toutes les banques françaises.</p>
                <div className="flex gap-3 flex-wrap">
                  <span className="px-3 py-1 rounded-full border border-slate-200 text-xs font-bold text-slate-600">Revolut</span>
                  <span className="px-3 py-1 rounded-full border border-slate-200 text-xs font-bold text-slate-600">BoursoBank</span>
                  <span className="px-3 py-1 rounded-full border border-slate-200 text-xs font-bold text-slate-600">BNP Paribas</span>
                  <span className="px-3 py-1 rounded-full border border-slate-200 text-xs font-bold text-slate-400">+10 formats</span>
                </div>
              </div>
              <div className="w-full md:w-1/3 bg-slate-50 rounded-2xl h-32 flex items-center justify-center border border-slate-100 border-dashed">
                <div className="text-center">
                  <span
                    className="material-symbols-outlined text-slate-300 block mb-1"
                    style={{ fontSize: "32px", fontVariationSettings: "'FILL' 0" }}
                  >
                    upload_file
                  </span>
                  <span className="text-slate-400 text-xs font-bold tracking-widest uppercase">CSV · XLSX · PDF</span>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ── TARIFS ── */}
      <section className="py-24 md:py-32 bg-white border-t border-slate-100" id="pricing">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-end mb-16">
            <h2 className="text-4xl md:text-5xl font-bold tracking-tighter text-slate-900">
              Tarification simple
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {PRICING_DISPLAY.map((plan) => {
              const planData = PLANS[plan.id];
              if (plan.highlighted) {
                return (
                  <div
                    key={plan.id}
                    className="p-8 bg-slate-50 rounded-3xl border border-slate-200 relative"
                  >
                    {plan.badge && (
                      <div className="absolute top-0 right-0 bg-slate-900 text-white text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-bl-xl rounded-tr-2xl">
                        {plan.badge}
                      </div>
                    )}
                    <h3 className="text-lg font-bold text-slate-900 mb-2">{plan.name}</h3>
                    <div className="text-4xl font-bold tracking-tighter mb-1 text-primary">
                      {plan.price}
                      {plan.id !== "free" && (
                        <span className="text-lg text-slate-400 font-medium">/mois</span>
                      )}
                    </div>
                    <p className="text-sm text-slate-500 mb-6 mt-2">{plan.desc}</p>
                    <ul className="space-y-3 mb-8">
                      {planData.features.map((feature) => (
                        <li key={feature} className="text-sm text-slate-900 font-medium flex items-center gap-3">
                          <span className="w-1.5 h-1.5 bg-primary rounded-full inline-block shrink-0" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                    <Link
                      href={plan.href}
                      className="btn-premium w-full flex items-center justify-center py-3 rounded-lg text-white text-sm font-bold"
                    >
                      {plan.cta}
                    </Link>
                  </div>
                );
              }
              return (
                <div
                  key={plan.id}
                  className="p-8 border-t border-slate-200 pt-8"
                >
                  <h3 className="text-lg font-bold text-slate-900 mb-2">{plan.name}</h3>
                  <div className="text-4xl font-bold tracking-tighter mb-1 text-slate-900">
                    {plan.price}
                    {plan.id !== "free" && (
                      <span className="text-lg text-slate-400 font-medium">/mois</span>
                    )}
                  </div>
                  <p className="text-sm text-slate-500 mb-6 mt-2">{plan.desc}</p>
                  <ul className="space-y-3 mb-8">
                    {planData.features.map((feature) => (
                      <li key={feature} className="text-sm text-slate-700 flex items-center gap-3">
                        <span className="w-1.5 h-1.5 bg-slate-400 rounded-full inline-block shrink-0" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                  <Link
                    href={plan.href}
                    className="w-full flex items-center justify-center py-3 rounded-lg border border-slate-200 text-sm font-bold hover:bg-slate-50 transition-colors text-slate-900"
                  >
                    {plan.cta}
                  </Link>
                </div>
              );
            })}
          </div>
          <p className="text-center text-sm text-slate-500 mt-8">
            <Link href="/tarifs" className="text-primary hover:underline font-medium">
              Voir la comparaison détaillée →
            </Link>
          </p>
        </div>
      </section>

      {/* ── TÉMOIGNAGES ── */}
      <section className="py-20 bg-[#FAFAFA]">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-2xl font-bold text-slate-900 mb-2">Ce que disent les couples</h2>
            <p className="text-slate-500">Ils ont transformé leur gestion financière ensemble.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-3xl mx-auto">
            {TESTIMONIALS.map((t) => (
              <div key={t.author} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="flex items-center justify-center size-10 rounded-full bg-primary/10 text-primary">
                    <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>{t.icon}</span>
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-900">{t.author}</p>
                    <p className="text-xs text-slate-500">{t.role}</p>
                  </div>
                </div>
                <p className="text-slate-500 text-sm leading-relaxed">&ldquo;{t.text}&rdquo;</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA DARK ── */}
      <section className="py-24 px-6">
        <div className="max-w-5xl mx-auto bg-slate-900 rounded-[3rem] p-12 md:p-24 text-center relative overflow-hidden shadow-2xl">
          <div className="relative z-10">
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-6 tracking-tighter">
              Votre sérénité financière commence ici.
            </h2>
            <p className="text-slate-400 text-lg mb-10 max-w-xl mx-auto font-medium">
              Rejoignez les couples qui ont choisi la transparence.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link
                href="/inscription"
                className="btn-premium text-white font-bold py-4 px-10 rounded-full text-lg tracking-tight"
              >
                Essayer gratuitement
              </Link>
            </div>
            <p className="mt-6 text-slate-500 text-xs uppercase tracking-widest font-bold">
              14 jours offerts · Sans engagement
            </p>
          </div>
        </div>
      </section>

    </div>
  );
}
