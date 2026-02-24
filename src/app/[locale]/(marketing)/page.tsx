import type { Metadata } from "next";
import { Link } from "@/i18n/navigation";
import { PLANS } from "@/lib/stripe-plans";

const DESCRIPTIONS: Record<string, string> = {
  fr: "Centralisez vos comptes bancaires, suivez vos dépenses et prenez de meilleures décisions financières. Gratuit, sécurisé, sans publicité.",
  en: "Centralize your bank accounts, track your expenses and make better financial decisions. Free, secure, no ads.",
  es: "Centraliza tus cuentas bancarias, controla tus gastos y toma mejores decisiones financieras. Gratis, seguro, sin anuncios.",
  it: "Centralizza i tuoi conti bancari, monitora le spese e prendi decisioni finanziarie migliori. Gratuito, sicuro, senza pubblicità.",
  de: "Zentralisieren Sie Ihre Bankkonten, verfolgen Sie Ihre Ausgaben. Kostenlos, sicher, werbefrei.",
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

const FEATURES = [
  {
    icon: "account_balance_wallet",
    title: "Multi-comptes",
    desc: "Centralisez tous vos comptes bancaires en un seul endroit.",
  },
  {
    icon: "file_download",
    title: "Import CSV/Excel",
    desc: "Importez votre historique depuis n'importe quelle banque.",
  },
  {
    icon: "autorenew",
    title: "Paiements récurrents",
    desc: "Suivez vos abonnements et échéances automatiquement.",
  },
  {
    icon: "trending_up",
    title: "Tendances",
    desc: "Visualisez l'évolution de vos dépenses dans le temps.",
  },
  {
    icon: "auto_awesome",
    title: "IA intégrée",
    desc: "Recevez des conseils financiers personnalisés par l'IA.",
  },
  {
    icon: "language",
    title: "Multilingue",
    desc: "5 langues disponibles : FR, EN, ES, DE, IT.",
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
  {
    id: "free",
    highlighted: false,
    cta: "Démarrer",
    href: "/inscription",
  },
  {
    id: "pro",
    highlighted: true,
    badge: "Populaire",
    cta: "Choisir Pro",
    href: "/tarifs",
  },
  {
    id: "premium",
    highlighted: false,
    cta: "Choisir Premium",
    href: "/tarifs",
  },
];

export default function HomePage() {
  return (
    <div className="bg-background-light">
      <div className="max-w-5xl mx-auto px-4">
        {/* Hero */}
        <header className="py-16 text-center sm:text-left">
          <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 text-primary px-3 py-1 text-xs font-bold mb-6">
            ✨ Nouvelle version 2.0 disponible
          </div>
          <h1 className="text-4xl font-extrabold text-text-main tracking-tight leading-tight mb-4">
            Prenez le contrôle de
            <br />
            vos finances
          </h1>
          <p className="text-text-muted text-lg font-medium mb-8 leading-relaxed max-w-2xl">
            Suivez vos dépenses, planifiez votre budget et atteignez vos
            objectifs financiers avec intelligence.
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
              En savoir plus
            </Link>
          </div>
        </header>

        {/* Feature cards */}
        <section className="py-10">
          <h2 className="text-2xl font-bold text-text-main mb-2">
            Tout ce dont vous avez besoin
          </h2>
          <p className="text-text-muted mb-8">
            Gérez votre argent comme un pro.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {FEATURES.map((f) => (
              <div
                key={f.icon}
                className="flex flex-col gap-4 rounded-2xl border border-slate-100 bg-white p-5 shadow-soft hover:shadow-md transition-shadow"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <span
                    className="material-symbols-outlined"
                    style={{ fontSize: "28px" }}
                  >
                    {f.icon}
                  </span>
                </div>
                <div>
                  <h3 className="text-text-main font-bold">{f.title}</h3>
                  <p className="text-text-muted text-sm mt-1">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Pricing section */}
        <section className="py-10">
          <h2 className="text-2xl font-bold text-text-main mb-2">
            Tarifs transparents
          </h2>
          <p className="text-text-muted mb-8">
            Commencez gratuitement, évoluez selon vos besoins.
          </p>
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
                    <h3 className="font-bold text-primary text-lg mb-1">
                      {plan.name}
                    </h3>
                    <div className="flex items-baseline gap-1 mb-4">
                      <span className="text-3xl font-extrabold text-text-main">
                        {priceStr}
                      </span>
                      <span className="text-text-muted">/mois</span>
                    </div>
                    <Link
                      href={planDef.href}
                      className="w-full flex items-center justify-center h-10 bg-primary text-white font-bold rounded-xl shadow-lg shadow-primary/20 text-sm"
                    >
                      {planDef.cta}
                    </Link>
                  </div>
                );
              }

              return (
                <div
                  key={planDef.id}
                  className="p-6 bg-white rounded-2xl border border-slate-100 shadow-soft"
                >
                  <h3 className="font-bold text-text-main text-lg mb-1">
                    {plan.name}
                  </h3>
                  <div className="flex items-baseline gap-1 mb-4">
                    <span className="text-3xl font-extrabold text-text-main">
                      {priceStr}
                    </span>
                    <span className="text-text-muted">/mois</span>
                  </div>
                  <Link
                    href={planDef.href}
                    className="w-full flex items-center justify-center h-10 border-2 border-slate-200 text-text-main font-bold rounded-xl hover:border-primary hover:text-primary transition-colors text-sm"
                  >
                    {planDef.cta}
                  </Link>
                </div>
              );
            })}
          </div>
        </section>

        {/* CTA final */}
        <section className="py-16 text-center">
          <h2 className="text-2xl font-bold text-text-main mb-3">
            Rejoignez des milliers d&apos;utilisateurs satisfaits
          </h2>
          <p className="text-text-muted mb-8">
            Essai gratuit de 14 jours · Aucune carte requise
          </p>
          <Link
            href="/inscription"
            className="inline-flex items-center justify-center h-12 px-8 bg-primary text-white font-bold rounded-xl shadow-lg shadow-primary/20 hover:bg-primary/90 transition-colors"
          >
            Créer mon compte gratuitement
          </Link>
        </section>
      </div>
    </div>
  );
}
