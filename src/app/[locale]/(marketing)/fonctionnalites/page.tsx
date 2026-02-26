import type { Metadata } from "next";
import { Link } from "@/i18n/navigation";

export const metadata: Metadata = {
  title: "Fonctionnalités — TrackMyCash",
  description:
    "Gestion financière de couple : balance automatique, import CSV/XLSX/PDF, conseiller IA et objectifs communs. Tout ce dont votre couple a besoin.",
  openGraph: {
    title: "Fonctionnalités — TrackMyCash",
    description:
      "Gestion financière de couple : balance automatique, import CSV/XLSX/PDF, conseiller IA et objectifs communs.",
    type: "website",
  },
};

// AC-4 : formats d'import supportés par les parsers (banque-populaire, mcb, revolut, etc.)
export const IMPORT_FORMATS = ["CSV", "XLSX", "PDF"] as const;

// AC-2 : fonctionnalités couple
export const COUPLE_FEATURES = [
  {
    title: "Balance en temps réel",
    desc: "Sachez toujours qui doit combien à l'autre, sans stress.",
  },
  {
    title: "Règlement simplifié",
    desc: "Un bouton \"Régler la dette\" remet les compteurs à zéro.",
  },
  {
    title: "Règles de partage flexibles",
    desc: "50/50, au prorata des revenus ou personnalisé dépense par dépense.",
  },
  {
    title: "Confidentialité préservée",
    desc: "Vos comptes perso restent privés. Seul ce que vous partagez est visible.",
  },
];

// Banques et parsers documentés (AC-7 — src/lib/parsers/registry.ts)
const SUPPORTED_BANKS = [
  { name: "Banque Populaire", format: "CSV" },
  { name: "Revolut", format: "XLSX" },
  { name: "MCB", format: "PDF" },
  { name: "ING Direct", format: "CSV" },
  { name: "Boursorama", format: "CSV" },
  { name: "BNP Paribas", format: "CSV" },
  { name: "Crédit Agricole", format: "CSV" },
  { name: "Société Générale", format: "CSV" },
];

const MORE_FEATURES = [
  {
    color: "bg-primary",
    title: "Export RGPD & Données",
    desc: "Vos données vous appartiennent. Exportez l'intégralité de votre historique en CSV ou PDF à tout moment. Conforme Article 20 RGPD.",
  },
  {
    color: "bg-couple-pink",
    title: "Objectifs Communs",
    desc: "Vacances, mariage, immobilier. Créez des cagnottes virtuelles et suivez la progression de l'épargne de chacun vers le but final.",
  },
  {
    color: "bg-success",
    title: "Prévisions Cash-flow",
    desc: "Un simulateur qui projette votre solde sur 12 mois en fonction de vos dépenses récurrentes et revenus prévus.",
  },
  {
    color: "bg-primary",
    title: "Confidentialité Maximale",
    desc: "Chaque compte est privé par défaut. Vous activez explicitement le partage pour que votre partenaire le voie.",
  },
  {
    color: "bg-warning",
    title: "Paiements Récurrents",
    desc: "Détectez et suivez vos abonnements, loyers et prélèvements. Alertes avant chaque échéance.",
  },
  {
    color: "bg-danger",
    title: "Budgets par Catégorie",
    desc: "Définissez des budgets mensuels et suivez votre consommation en temps réel avec indicateur vert / orange / rouge.",
  },
];

export default function FonctionnalitesPage() {
  return (
    <div className="bg-[#FAFAFA] min-h-screen">
      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <section className="max-w-6xl mx-auto px-6 pt-12 pb-24 md:pt-20 md:pb-32 text-center">
        <div className="inline-flex items-center px-4 py-2 mb-8 rounded-full bg-white border border-slate-200 shadow-sm text-slate-600 text-xs font-bold uppercase tracking-wider">
          <span className="w-2 h-2 rounded-full bg-couple-pink mr-2" />
          Nouvelle mise à jour 3.0
        </div>
        {/* AC-1 : "L'argent dans votre couple, enfin clarifié." */}
        <h1 className="text-4xl md:text-6xl font-extrabold leading-[1.1] tracking-tight mb-8 text-slate-900 max-w-4xl mx-auto">
          L&apos;argent dans votre couple,{" "}
          <span className="text-primary">enfin clarifié.</span>
        </h1>
        <p className="text-slate-500 text-xl leading-relaxed max-w-2xl mx-auto mb-10 font-medium">
          Oubliez les fichiers Excel et les « qui doit quoi ». TrackMyCash synchronise
          vos finances communes tout en préservant votre jardin secret.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href="/inscription"
            className="w-full sm:w-auto px-8 py-4 bg-slate-900 text-white font-bold rounded-2xl hover:bg-slate-800 transition-all shadow-xl shadow-slate-900/10"
          >
            Commencer gratuitement
          </Link>
          <a
            href="#features"
            className="w-full sm:w-auto px-8 py-4 bg-white text-slate-700 font-bold rounded-2xl hover:bg-slate-50 border border-slate-200 transition-all shadow-sm"
          >
            Voir les détails
          </a>
        </div>
      </section>

      {/* ── AC-2 : Section Mode Couple ────────────────────────────────────── */}
      <section className="max-w-6xl mx-auto px-6 mb-24 md:mb-32" id="features">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          {/* Mock UI couple */}
          <div className="relative order-2 lg:order-1">
            <div className="bg-white rounded-[2rem] shadow-soft border border-slate-100 p-8 overflow-hidden">
              <div className="flex items-center justify-between mb-6">
                <h4 className="font-bold text-lg">Dépenses récentes</h4>
                <span className="text-xs font-bold text-slate-400 bg-slate-100 px-2 py-1 rounded">
                  Mars 2024
                </span>
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center">
                      <span className="material-symbols-outlined text-xl">shopping_cart</span>
                    </div>
                    <div>
                      <p className="font-bold text-sm text-slate-900">Courses Carrefour</p>
                      <p className="text-xs text-slate-500">Payé par Julie · 50/50</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-slate-900">-84,50 €</p>
                    <p className="text-xs text-couple-pink">Tu dois 42,25 €</p>
                  </div>
                </div>
                <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center">
                      <span className="material-symbols-outlined text-xl">restaurant</span>
                    </div>
                    <div>
                      <p className="font-bold text-sm text-slate-900">Resto Italien</p>
                      <p className="text-xs text-slate-500">Payé par Toi · 60/40</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-slate-900">-62,00 €</p>
                    <p className="text-xs text-success">Elle doit 24,80 €</p>
                  </div>
                </div>
              </div>
              <div className="mt-6 pt-4 border-t border-slate-100 flex justify-between items-center">
                <span className="text-sm font-medium text-slate-500">Balance actuelle</span>
                <div className="text-right">
                  <span className="block text-xs text-slate-400">Julie te doit</span>
                  <span className="block text-xl font-extrabold text-success">124,50 €</span>
                </div>
              </div>
            </div>
          </div>

          <div className="order-1 lg:order-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-couple-pink/10 text-couple-pink rounded-full text-xs font-bold uppercase mb-6">
              <span
                className="material-symbols-outlined text-sm"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                favorite
              </span>
              Mode Couple
            </div>
            <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 mb-6 leading-tight">
              La fin des « Qui doit quoi ? »
              <br />
              <span className="text-slate-400">Le début de la sérénité.</span>
            </h2>
            <p className="text-lg text-slate-600 mb-8 leading-relaxed">
              Chaque dépense peut être partagée instantanément. Définissez vos règles
              (50/50, au prorata, ou personnalisé) et laissez l&apos;application faire
              les calculs pénibles.
            </p>
            <ul className="space-y-4">
              {COUPLE_FEATURES.map((f) => (
                <li key={f.title} className="flex items-start gap-3">
                  <span
                    className="material-symbols-outlined text-success mt-0.5"
                    style={{ fontVariationSettings: "'FILL' 1" }}
                  >
                    check_circle
                  </span>
                  <div>
                    <strong className="block text-slate-900">{f.title}</strong>
                    <span className="text-slate-500 text-sm">{f.desc}</span>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* ── AC-5 : Section IA Assistant ───────────────────────────────────── */}
      <section className="max-w-6xl mx-auto px-6 mb-24 md:mb-32">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary/10 text-primary rounded-full text-xs font-bold uppercase mb-6">
              <span className="material-symbols-outlined text-sm">auto_awesome</span>
              Intelligence Artificielle
            </div>
            <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 mb-6 leading-tight">
              Un conseiller financier
              <br />
              <span className="text-slate-400">qui ne dort jamais.</span>
            </h2>
            <p className="text-lg text-slate-600 mb-8 leading-relaxed">
              Notre IA analyse vos habitudes de dépenses pour détecter des économies
              potentielles et vous alerter avant que vous ne dépassiez votre budget mensuel.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="border-l-2 border-primary pl-4">
                <h4 className="font-bold text-slate-900 mb-1">Catégorisation Auto</h4>
                <p className="text-sm text-slate-500">
                  L&apos;IA apprend et trie vos dépenses sans erreur.
                </p>
              </div>
              <div className="border-l-2 border-primary pl-4">
                <h4 className="font-bold text-slate-900 mb-1">Insights Hebdo</h4>
                <p className="text-sm text-slate-500">
                  Recevez un résumé clair de votre santé financière.
                </p>
              </div>
              <div className="border-l-2 border-primary pl-4">
                <h4 className="font-bold text-slate-900 mb-1">Conseiller Couple</h4>
                <p className="text-sm text-slate-500">
                  Demandez à l&apos;IA d&apos;analyser vos finances communes (Premium).
                </p>
              </div>
              <div className="border-l-2 border-primary pl-4">
                <h4 className="font-bold text-slate-900 mb-1">Alertes Budget</h4>
                <p className="text-sm text-slate-500">
                  Notifié avant de dépasser votre plafond mensuel.
                </p>
              </div>
            </div>
          </div>

          {/* Mock chat IA */}
          <div className="relative bg-slate-900 rounded-[2rem] shadow-2xl p-8 text-white">
            <div className="flex items-start gap-4 mb-6">
              <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined">smart_toy</span>
              </div>
              <div className="bg-white/10 rounded-2xl rounded-tl-none p-4 text-sm leading-relaxed">
                Bonjour ! J&apos;ai remarqué que vos dépenses « Sorties » sont{" "}
                <strong>20 % plus élevées</strong> que le mois dernier. Voulez-vous
                ajuster le budget pour le reste du mois ?
              </div>
            </div>
            <div className="bg-slate-800 rounded-xl p-4 mb-4 border border-slate-700">
              <div className="flex justify-between text-xs text-slate-400 mb-2">
                <span>Budget Sorties</span>
                <span>380 € / 400 €</span>
              </div>
              <div className="w-full bg-slate-700 rounded-full h-2">
                <div className="bg-danger h-2 rounded-full" style={{ width: "95%" }} />
              </div>
              <p className="text-xs text-danger mt-2 flex items-center gap-1">
                <span className="material-symbols-outlined text-sm">warning</span>
                Attention, plafond proche
              </p>
            </div>
            <div className="flex gap-2">
              <button className="bg-white text-slate-900 text-xs font-bold py-2 px-4 rounded-lg hover:bg-slate-100 transition-colors">
                Voir détails
              </button>
              <button className="bg-white/10 text-white text-xs font-bold py-2 px-4 rounded-lg hover:bg-white/20 transition-colors">
                Ignorer
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ── AC-3/AC-4 : Section Import Multi-Formats (pas d'API bancaire tierce) ── */}
      <section className="max-w-6xl mx-auto px-6 mb-24 md:mb-32">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          {/* Mock import UI */}
          <div className="relative order-2 lg:order-1">
            <div className="bg-white rounded-[2rem] shadow-soft border border-slate-100 p-8">
              <h4 className="font-bold text-center text-slate-900 mb-6">
                Importer vos relevés
              </h4>
              <div className="grid grid-cols-2 gap-3">
                {SUPPORTED_BANKS.slice(0, 3).map((bank) => (
                  <div
                    key={bank.name}
                    className="bg-slate-50 p-4 rounded-xl border border-slate-100 flex items-center gap-3"
                  >
                    <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold">
                      {bank.name.charAt(0)}
                    </div>
                    <div>
                      <p className="font-bold text-xs text-slate-900">{bank.name}</p>
                      <p className="text-[10px] text-text-muted font-medium">
                        {bank.format}
                      </p>
                    </div>
                  </div>
                ))}
                {/* Zone de dépôt */}
                <div className="bg-white border-2 border-dashed border-primary/30 p-4 rounded-xl flex items-center justify-center gap-2 cursor-pointer hover:border-primary/60 transition-colors group">
                  <span className="material-symbols-outlined text-primary/40 group-hover:text-primary transition-colors">
                    upload_file
                  </span>
                  <span className="text-xs font-bold text-primary/40 group-hover:text-primary transition-colors">
                    Importer
                  </span>
                </div>
              </div>
              {/* Badges formats */}
              <div className="mt-4 flex gap-2 justify-center">
                {IMPORT_FORMATS.map((fmt) => (
                  <span
                    key={fmt}
                    className="px-3 py-1 bg-primary/10 text-primary rounded-lg text-xs font-bold"
                  >
                    {fmt}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="order-1 lg:order-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-slate-100 text-slate-600 rounded-full text-xs font-bold uppercase mb-6">
              <span className="material-symbols-outlined text-sm">upload_file</span>
              Import Multi-Formats
            </div>
            <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 mb-6 leading-tight">
              Tous vos relevés,
              <br />
              <span className="text-slate-400">en quelques secondes.</span>
            </h2>
            <p className="text-lg text-slate-600 mb-8 leading-relaxed">
              Téléchargez votre relevé depuis votre espace bancaire en ligne et importez-le
              dans TrackMyCash. Nous supportons les formats CSV, XLSX et PDF des principales
              banques.
            </p>
            {/* AC-4 : Formats supportés */}
            <div className="flex flex-wrap gap-2 mb-6">
              {SUPPORTED_BANKS.map((bank) => (
                <span
                  key={bank.name}
                  className="px-3 py-1 bg-white border border-slate-200 rounded-lg text-xs font-medium text-slate-500"
                >
                  {bank.name}
                </span>
              ))}
              <span className="px-3 py-1 bg-white border border-slate-200 rounded-lg text-xs font-medium text-slate-500">
                + CSV générique
              </span>
            </div>
            <ul className="space-y-3">
              <li className="flex items-start gap-3">
                <span
                  className="material-symbols-outlined text-success mt-0.5"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  check_circle
                </span>
                <div>
                  <strong className="block text-slate-900">CSV, XLSX et PDF</strong>
                  <span className="text-slate-500 text-sm">
                    Tous les formats exportés par votre banque.
                  </span>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <span
                  className="material-symbols-outlined text-success mt-0.5"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  check_circle
                </span>
                <div>
                  <strong className="block text-slate-900">Déduplication automatique</strong>
                  <span className="text-slate-500 text-sm">
                    Jamais de doublon, même en important plusieurs fois.
                  </span>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <span
                  className="material-symbols-outlined text-success mt-0.5"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  check_circle
                </span>
                <div>
                  <strong className="block text-slate-900">Données 100 % locales</strong>
                  <span className="text-slate-500 text-sm">
                    Vos fichiers ne quittent pas votre appareil lors de l&apos;import.
                  </span>
                </div>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* ── Et bien plus encore ───────────────────────────────────────────── */}
      <section className="max-w-6xl mx-auto px-6 mb-24">
        <div className="text-center mb-16">
          <h3 className="text-2xl font-bold mb-4">Et bien plus encore</h3>
          <p className="text-slate-500">Tout ce dont vous avez besoin pour maîtriser votre budget.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {MORE_FEATURES.map((f) => (
            <div key={f.title} className="group">
              <div className={`h-1 w-12 ${f.color} rounded-full mb-6 group-hover:w-20 transition-all`} />
              <h4 className="text-xl font-bold text-slate-900 mb-3">{f.title}</h4>
              <p className="text-slate-500 text-sm leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── AC-6 : CTA Essai gratuit ──────────────────────────────────────── */}
      <section className="max-w-4xl mx-auto px-6 pb-24">
        <div className="bg-slate-900 rounded-[2.5rem] p-12 md:p-20 text-center shadow-2xl">
          <h2 className="text-3xl md:text-5xl font-extrabold text-white mb-6 tracking-tight">
            Prêt à gérer vos finances
            <br /> à deux ?
          </h2>
          <p className="text-slate-400 text-lg mb-10 max-w-lg mx-auto">
            Essai Pro gratuit 14 jours. Aucune carte requise pour commencer. Invitez
            votre partenaire en 10 secondes.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/inscription"
              className="inline-flex items-center justify-center gap-2 bg-white text-slate-900 font-bold py-4 px-8 rounded-2xl hover:bg-slate-100 transition-colors text-lg shadow-lg"
            >
              Commencer gratuitement
            </Link>
            <Link
              href="/tarifs"
              className="inline-flex items-center justify-center gap-2 bg-white/10 text-white font-bold py-4 px-8 rounded-2xl hover:bg-white/20 transition-colors text-lg"
            >
              Voir les tarifs
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
