import type { Metadata } from "next";
import { Link } from "@/i18n/navigation";
import { ScrollRevealSection } from "@/components/marketing/scroll-reveal";
import { buildPageMetadata } from "@/lib/seo/metadata";
import { breadcrumbSchema } from "@/lib/seo/schemas";
import { SEO_CONFIG } from "@/lib/seo/constants";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  return buildPageMetadata({
    title: "Sécurité — Protection de vos données financières",
    description: "Comment TrackMyCash protège vos données financières : sécurité, vie privée et transparence.",
    path: "securite",
    locale,
    ogImage: "/og/securite.png",
  });
}

/* ── Data ─────────────────────────────────────────────────────────────── */

const SECURITY_CARDS = [
  {
    num: "01",
    title: "Données sécurisées",
    desc: "Toutes vos données sont chiffrées en transit (TLS 1.3) et au repos. Vos informations financières ne sont jamais exposées en clair.",
  },
  {
    num: "02",
    title: "Aucun accès à vos comptes bancaires",
    desc: "TrackMyCash n\u2019a jamais accès à vos identifiants bancaires. Vous importez vos relevés manuellement, c\u2019est vous qui gardez le contrôle.",
  },
  {
    num: "03",
    title: "Vie privée par défaut",
    desc: "Chaque compte est privé par défaut. Vous choisissez explicitement ce que vous partagez avec votre partenaire. Rien n\u2019est visible sans votre accord.",
  },
  {
    num: "04",
    title: "Pas de revente de données",
    desc: "Vos données financières ne sont jamais vendues, partagées ou utilisées à des fins publicitaires. Notre modèle économique repose sur l\u2019abonnement, pas sur vos données.",
  },
  {
    num: "05",
    title: "Suppression instantanée",
    desc: "Vous pouvez supprimer l\u2019intégralité de vos données à tout moment depuis les paramètres. La suppression est immédiate et irréversible.",
  },
  {
    num: "06",
    title: "Export complet",
    desc: "Exportez l\u2019intégralité de vos données en CSV ou PDF à tout moment. Vos données vous appartiennent, vous devez pouvoir les emporter.",
  },
];

const PHILOSOPHY_ITEMS = [
  {
    title: "On ne stocke que le nécessaire",
    desc: "Nous appliquons le principe de minimisation des données. Seules les informations strictement nécessaires au fonctionnement du service sont collectées et conservées.",
  },
  {
    title: "On ne vend rien",
    desc: "Aucune donnée personnelle ou financière n\u2019est partagée avec des tiers. Pas de publicité, pas de tracking, pas de profiling. Jamais.",
  },
  {
    title: "On est transparents",
    desc: "Notre politique de confidentialité est rédigée en langage clair. Si vous avez une question sur la sécurité de vos données, nous y répondons publiquement.",
  },
];

/* ── Page ─────────────────────────────────────────────────────────────── */

export default function SecuritePage() {
  const baseUrl = SEO_CONFIG.baseUrl;
  return (
    <ScrollRevealSection>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema([
        { name: "Accueil", url: `${baseUrl}/fr` },
        { name: "Sécurité", url: `${baseUrl}/fr/securite` },
      ])) }} />
      <div className="min-h-screen">
        {/* ── Hero ──────────────────────────────────────────────────────── */}
        <section className="bg-[#F5F3FF] py-24 md:py-32">
          <div className="max-w-3xl mx-auto px-6 text-center fade-up">
            <h1 className="font-serif text-4xl md:text-6xl leading-[1.1] tracking-tight mb-6 text-slate-900">
              Vos finances méritent d&apos;être{" "}
              <em className="text-primary italic">protégées.</em>
            </h1>
            <p className="text-text-muted text-lg md:text-xl leading-relaxed max-w-2xl mx-auto">
              La sécurité n&apos;est pas une option. C&apos;est le socle sur
              lequel repose chaque fonctionnalité de TrackMyCash.
            </p>
          </div>
        </section>

        {/* ── 6 Security Cards ─────────────────────────────────────────── */}
        <section className="bg-white py-24 md:py-32">
          <div className="max-w-5xl mx-auto px-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {SECURITY_CARDS.map((card) => (
                <div
                  key={card.num}
                  className="fade-up hover-lift rounded-2xl border border-border-light bg-white p-6 transition-all"
                >
                  <span className="flex items-center justify-center w-10 h-10 rounded-full bg-primary text-white text-sm font-bold mb-5">
                    {card.num}
                  </span>
                  <h3 className="text-lg font-bold text-slate-900 mb-2">
                    {card.title}
                  </h3>
                  <p className="text-text-muted text-sm leading-relaxed">
                    {card.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Notre philosophie ────────────────────────────────────────── */}
        <section className="bg-white py-24 md:py-32">
          <div className="max-w-4xl mx-auto px-6">
            <div className="text-center mb-16 fade-up">
              <h2 className="font-serif text-3xl md:text-4xl text-slate-900 mb-4">
                Notre philosophie
              </h2>
              <p className="text-text-muted text-lg">
                Trois engagements simples qui guident notre approche de la
                sécurité.
              </p>
            </div>
            <div className="bg-[#FAFAF9] rounded-2xl p-8 md:p-12 fade-up">
              <div className="space-y-10">
                {PHILOSOPHY_ITEMS.map((item, i) => (
                  <div
                    key={item.title}
                    className="flex items-start gap-4"
                  >
                    <span className="flex items-center justify-center w-8 h-8 rounded-full bg-success text-white text-sm font-bold shrink-0 mt-0.5">
                      {i + 1}
                    </span>
                    <div>
                      <h3 className="text-lg font-bold text-slate-900 mb-1">
                        {item.title}
                      </h3>
                      <p className="text-text-muted text-sm leading-relaxed">
                        {item.desc}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ── Contact ──────────────────────────────────────────────────── */}
        <section className="bg-[#FAFAF9] py-16 md:py-20">
          <div className="max-w-3xl mx-auto px-6 text-center fade-up">
            <p className="text-text-muted text-lg">
              Une question sur notre sécurité&nbsp;?{" "}
              <Link
                href="/contact"
                className="text-primary font-semibold hover:underline"
              >
                Contactez-nous &rarr;
              </Link>
            </p>
          </div>
        </section>
      </div>
    </ScrollRevealSection>
  );
}
