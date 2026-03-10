import type { Metadata } from "next";
import { ScrollRevealSection } from "@/components/marketing/scroll-reveal";

export const metadata: Metadata = {
  title: "Politique de cookies — TrackMyCash",
  description:
    "Comment TrackMyCash utilise les cookies pour faire fonctionner le site et améliorer votre expérience.",
  openGraph: {
    title: "Politique de cookies — TrackMyCash",
    description:
      "Comment TrackMyCash utilise les cookies pour faire fonctionner le site et améliorer votre expérience.",
    type: "website",
  },
};

export default function CookiesPage() {
  return (
    <ScrollRevealSection>
      <div className="min-h-screen">
        {/* Hero */}
        <section className="bg-[#F5F3FF] py-24 md:py-32">
          <div className="max-w-3xl mx-auto px-6 fade-up">
            <h1 className="font-serif text-4xl md:text-5xl leading-[1.1] tracking-tight mb-4 text-slate-900">
              Politique de cookies
            </h1>
            <p className="text-text-muted text-lg leading-relaxed">
              Nous utilisons des cookies pour faire fonctionner le site et
              améliorer votre expérience. Voici tout ce que vous devez savoir.
            </p>
            <p className="text-text-light text-sm mt-4">
              Dernière mise à jour : [JJ/MM/AAAA]
            </p>
          </div>
        </section>

        {/* Content */}
        <section className="py-16 md:py-24">
          <div className="legal-content max-w-3xl mx-auto px-6">
            <div className="highlight-box">
              <p>
                <strong>A PERSONNALISER :</strong> Listez vos cookies réels.
                Adaptez les catégories à ce que vous utilisez vraiment. Les
                éléments entre [crochets] sont à compléter.
              </p>
            </div>

            <h2>1. Qu&apos;est-ce qu&apos;un cookie ?</h2>
            <p>
              Un cookie est un petit fichier texte déposé sur votre appareil
              (ordinateur, téléphone, tablette) lorsque vous visitez un site
              web. Il permet au site de mémoriser certaines informations sur
              votre visite, comme vos préférences ou votre statut de connexion.
            </p>

            <h2>2. Les cookies que nous utilisons</h2>

            <h3>Cookies strictement nécessaires</h3>
            <p>
              Ces cookies sont indispensables au fonctionnement du site. Ils ne
              peuvent pas être désactivés.
            </p>
            <table>
              <thead>
                <tr>
                  <th>Cookie</th>
                  <th>Finalité</th>
                  <th>Durée</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>[nom_cookie_session]</td>
                  <td>Maintenir votre session de connexion</td>
                  <td>Session</td>
                </tr>
                <tr>
                  <td>[nom_cookie_csrf]</td>
                  <td>Protection contre les attaques CSRF</td>
                  <td>Session</td>
                </tr>
                <tr>
                  <td>cookie_consent</td>
                  <td>Mémoriser votre choix de cookies</td>
                  <td>13 mois</td>
                </tr>
              </tbody>
            </table>

            <h3>Cookies d&apos;analyse et de performance</h3>
            <p>
              Ces cookies nous permettent de comprendre comment les visiteurs
              utilisent le site (pages vues, parcours de navigation) afin
              d&apos;améliorer le Service. Ces données sont anonymisées et
              agrégées.
            </p>
            <table>
              <thead>
                <tr>
                  <th>Cookie</th>
                  <th>Fournisseur</th>
                  <th>Finalité</th>
                  <th>Durée</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>[_ga, _gid, etc.]</td>
                  <td>[Google Analytics / Plausible / Matomo / autre]</td>
                  <td>Statistiques d&apos;utilisation anonymisées</td>
                  <td>[durée]</td>
                </tr>
              </tbody>
            </table>

            <div className="highlight-box">
              <p>
                <strong>Note :</strong> Si vous utilisez une solution
                respectueuse de la vie privée comme Plausible ou Matomo en mode
                exempt CNIL, ces cookies peuvent ne pas nécessiter de
                consentement. Vérifiez auprès de votre prestataire.
              </p>
            </div>

            <h3>Cookies marketing / publicitaires</h3>
            <p>
              <strong>Nous n&apos;utilisons aucun cookie publicitaire.</strong>{" "}
              TrackMyCash ne diffuse pas de publicité et ne partage aucune
              donnée avec des régies publicitaires.
            </p>

            <h2>3. Comment gérer vos cookies ?</h2>
            <p>
              Lors de votre première visite, un bandeau vous permet
              d&apos;accepter ou de refuser les cookies non essentiels. Vous
              pouvez modifier vos préférences à tout moment :
            </p>
            <ul>
              <li>
                En cliquant sur le lien « Gérer les cookies » disponible en bas
                de chaque page
              </li>
              <li>
                En configurant votre navigateur pour bloquer ou supprimer les
                cookies
              </li>
            </ul>
            <p>
              Voici comment gérer les cookies dans les principaux navigateurs :
            </p>
            <ul>
              <li>
                <strong>Chrome :</strong> Paramètres &rarr; Confidentialité et
                sécurité &rarr; Cookies
              </li>
              <li>
                <strong>Firefox :</strong> Paramètres &rarr; Vie privée et
                sécurité &rarr; Cookies
              </li>
              <li>
                <strong>Safari :</strong> Préférences &rarr; Confidentialité
                &rarr; Cookies
              </li>
              <li>
                <strong>Edge :</strong> Paramètres &rarr; Cookies et
                autorisations de site
              </li>
            </ul>

            <h2>4. Durée de conservation</h2>
            <p>
              Conformément aux recommandations de la CNIL, les cookies ont une
              durée de vie maximale de 13 mois. Votre consentement est redemandé
              à l&apos;expiration de cette période.
            </p>

            <h2>5. Contact</h2>
            <p>
              Pour toute question sur notre utilisation des cookies :
              <br />
              Email : <strong>[email de contact]</strong>
            </p>
          </div>
        </section>
      </div>
    </ScrollRevealSection>
  );
}
