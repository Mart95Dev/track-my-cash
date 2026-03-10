import type { Metadata } from "next";
import { Link } from "@/i18n/navigation";
import { ScrollRevealSection } from "@/components/marketing/scroll-reveal";

export const metadata: Metadata = {
  title: "À propos — TrackMyCash",
  description:
    "L'histoire de TrackMyCash : pourquoi et comment nous avons créé l'outil de gestion financière de couple.",
  openGraph: {
    title: "À propos — TrackMyCash",
    description:
      "L'histoire de TrackMyCash : pourquoi et comment nous avons créé l'outil de gestion financière de couple.",
    type: "website",
  },
};

/* ── Data ─────────────────────────────────────────────────────────────── */

const CONVICTIONS = [
  {
    title: "Transparence, pas surveillance",
    desc: "Partager ses finances ne veut pas dire espionner l\u2019autre. Chaque donnée partagée l\u2019est par choix, jamais par défaut. Vous gardez le contrôle total sur ce que votre partenaire voit.",
  },
  {
    title: "Vos données vous appartiennent",
    desc: "Pas de revente, pas de pub ciblée, pas de profiling. Vos données financières restent les vôtres. Vous pouvez les exporter ou les supprimer à tout moment.",
  },
  {
    title: "La simplicité avant tout",
    desc: "Un outil financier ne doit pas nécessiter un diplôme en comptabilité. Chaque fonctionnalité est pensée pour être comprise en moins de 5 secondes.",
  },
];

const STATS = [
  { value: "12 000+", label: "Couples actifs" },
  { value: "2M+", label: "Transactions importées" },
  { value: "4,8/5", label: "Note moyenne" },
  { value: "97%", label: "Taux de satisfaction" },
];

/* ── Page ─────────────────────────────────────────────────────────────── */

export default function AProposPage() {
  return (
    <ScrollRevealSection>
      <div className="min-h-screen">
        {/* ── Hero ──────────────────────────────────────────────────────── */}
        <section className="bg-[#F5F3FF] py-24 md:py-32">
          <div className="max-w-3xl mx-auto px-6 text-center fade-up">
            <h1 className="font-serif text-4xl md:text-6xl leading-[1.1] tracking-tight mb-6 text-slate-900">
              On est passés par là{" "}
              <em className="text-primary italic">aussi.</em>
            </h1>
            <p className="text-text-muted text-lg md:text-xl leading-relaxed max-w-2xl mx-auto">
              TrackMyCash est né d&apos;un constat simple&nbsp;: gérer
              l&apos;argent à deux, c&apos;est compliqué. Et aucun outil
              n&apos;était vraiment fait pour ça.
            </p>
          </div>
        </section>

        {/* ── Notre histoire ───────────────────────────────────────────── */}
        <section className="bg-white py-24 md:py-32">
          <div className="max-w-3xl mx-auto px-6 fade-up">
            <span className="inline-block px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide bg-[#FCE7F3] text-pink-600 mb-6">
              Notre histoire
            </span>
            <h2 className="font-serif text-3xl md:text-5xl leading-tight text-slate-900 mb-10">
              Tout a commencé par une dispute sur les courses.
            </h2>
            <div className="space-y-6 text-text-muted text-lg leading-relaxed">
              <p>
                Un soir, après une énième discussion sur «&nbsp;qui avait payé
                quoi&nbsp;» ce mois-ci, on s&apos;est rendu compte que le
                problème n&apos;était pas l&apos;argent. C&apos;était le manque
                de visibilité. Chacun avait l&apos;impression de payer plus que
                l&apos;autre, sans aucun moyen de le vérifier objectivement.
              </p>
              <p>
                On a essayé les tableurs partagés, les apps de budget solo, les
                notes sur le frigo. Rien ne collait. Soit c&apos;était trop
                complexe, soit ça ne prenait pas en compte la réalité d&apos;un
                couple&nbsp;: des comptes séparés, des dépenses communes, des
                revenus différents et des règles de partage qui changent selon
                la situation.
              </p>
              <p>
                Alors on a construit TrackMyCash. Un outil pensé dès le départ
                pour les couples. Pas un outil solo avec un mode
                «&nbsp;partage&nbsp;» ajouté après coup. Un outil où la
                transparence financière n&apos;est pas synonyme de surveillance,
                mais de sérénité.
              </p>
            </div>
          </div>
        </section>

        {/* ── Nos convictions ──────────────────────────────────────────── */}
        <section className="bg-white py-24 md:py-32">
          <div className="max-w-5xl mx-auto px-6">
            <div className="text-center mb-16 fade-up">
              <h2 className="font-serif text-3xl md:text-4xl text-slate-900 mb-4">
                Nos convictions
              </h2>
              <p className="text-text-muted text-lg">
                Les principes qui guident chaque décision produit.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {CONVICTIONS.map((c) => (
                <div
                  key={c.title}
                  className="fade-up hover-lift rounded-2xl border border-border-light bg-white p-8 transition-all"
                >
                  <h3 className="text-lg font-bold text-slate-900 mb-3">
                    {c.title}
                  </h3>
                  <p className="text-text-muted text-sm leading-relaxed">
                    {c.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── En chiffres ──────────────────────────────────────────────── */}
        <section className="bg-[#FAFAF9] py-24 md:py-32">
          <div className="max-w-5xl mx-auto px-6">
            <div className="text-center mb-16 fade-up">
              <h2 className="font-serif text-3xl md:text-4xl text-slate-900 mb-4">
                En chiffres
              </h2>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 fade-up">
              {STATS.map((s) => (
                <div key={s.label} className="text-center">
                  <span className="block text-4xl md:text-5xl font-bold text-primary mb-2">
                    {s.value}
                  </span>
                  <span className="text-text-muted text-sm">{s.label}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── CTA ──────────────────────────────────────────────────────── */}
        <section className="max-w-4xl mx-auto px-6 py-24 md:py-32">
          <div className="bg-primary rounded-3xl p-12 md:p-20 text-center fade-up">
            <h2 className="font-serif text-3xl md:text-5xl text-white mb-4 tracking-tight">
              Envie de nous rejoindre&nbsp;?
            </h2>
            <p className="text-white/80 text-lg mb-8">
              12&nbsp;000 couples nous font confiance. Et vous&nbsp;?
            </p>
            <Link
              href="/inscription"
              className="inline-flex items-center justify-center bg-white text-primary font-bold py-4 px-10 rounded-2xl hover:bg-slate-50 transition-colors text-lg shadow-lg"
            >
              Essayer gratuitement
            </Link>
          </div>
        </section>
      </div>
    </ScrollRevealSection>
  );
}
