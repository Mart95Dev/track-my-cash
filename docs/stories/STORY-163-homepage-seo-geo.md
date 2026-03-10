# STORY-163 — Homepage — Metadata + FAQ + JSON-LD complet

**Epic :** SEO/GEO
**Priorité :** P0 (Must Have)
**Complexité :** L (8 pts)
**Blocked By :** STORY-158

## Description

Transformer la homepage en page SEO/GEO complète :
1. Convertir en `generateMetadata` async avec canonical, alternates, OG image, Twitter
2. Ajouter 3 scripts JSON-LD : WebSite, SoftwareApplication, FAQPage
3. Ajouter une section FAQ visible (7 questions) avec le composant FaqAccordion existant
4. Conserver les descriptions multi-langues et tout le contenu existant

## Fichiers à modifier

- `src/app/[locale]/(marketing)/page.tsx`
- `tests/unit/seo/homepage-seo.test.ts` (nouveau)

## Critères d'acceptation

- **AC-1:** `generateMetadata` async avec canonical, alternates (5 locales), OG (image `/og/home.png`), Twitter
- **AC-2:** 3 scripts JSON-LD injectés : WebSite, SoftwareApplication, FAQPage
- **AC-3:** Schema SoftwareApplication inclut 3 offres (0€, 4.90€, 7.90€) et aggregateRating (4.8/5)
- **AC-4:** Section FAQ visible avec 7 questions, composant FaqAccordion réutilisé
- **AC-5:** Schema FAQPage a exactement 7 mainEntity correspondant aux questions affichées
- **AC-6:** Les descriptions multi-langues (DESCRIPTIONS) et le contenu existant sont inchangés
- **AC-7:** La section FAQ est placée après la section TRUST BAR et avant le CTA final

## FAQ — Contenu des 7 questions

1. **"Qu'est-ce que TrackMyCash ?"**
   → TrackMyCash est une application de gestion financière conçue pour les couples. Elle permet de suivre vos dépenses communes, équilibrer automatiquement qui doit quoi, fixer des objectifs d'épargne partagés et importer vos relevés bancaires en quelques secondes. Disponible en version web (PWA) et Android.

2. **"Comment gérer ses finances en couple ?"**
   → Avec TrackMyCash, c'est simple : importez vos relevés bancaires (18 formats supportés), invitez votre partenaire via un lien, et la balance se calcule automatiquement. Vous pouvez choisir une répartition 50/50, au prorata des revenus, ou personnalisée par dépense.

3. **"Est-ce que TrackMyCash est gratuit ?"**
   → Oui, le plan Découverte est 100 % gratuit et sans engagement. Il inclut 1 compte bancaire et 3 mois d'historique. Les plans Pro (4,90 €/mois) et Premium (7,90 €/mois) offrent un accès illimité, le mode couple, le conseiller IA et les exports. Essai Pro gratuit 14 jours.

4. **"Comment fonctionne la balance couple ?"**
   → Chaque dépense marquée comme partagée est automatiquement répartie selon vos règles. TrackMyCash calcule en temps réel la différence et vous indique qui doit rembourser l'autre, sans calcul ni prise de tête.

5. **"Mes données financières sont-elles sécurisées ?"**
   → Oui. Vos données sont chiffrées en transit (TLS 1.3) et au repos. TrackMyCash n'a jamais accès à vos identifiants bancaires : vous importez vos relevés manuellement. Aucune donnée n'est vendue ni partagée. Conforme RGPD avec suppression sur demande.

6. **"Quelles banques sont compatibles avec TrackMyCash ?"**
   → TrackMyCash supporte 18 formats bancaires : BNP Paribas, Société Générale, Crédit Agricole, Caisse d'Épargne, Banque Populaire, Boursorama, ING, N26, Revolut, Wise, Monzo, HSBC, MCB Madagascar, ainsi que les formats universels CAMT.053, MT940, OFX/QFX, CFONB 120 et CSV générique.

7. **"TrackMyCash est-il disponible sur mobile ?"**
   → Oui. TrackMyCash est disponible en tant que PWA installable sur tous les navigateurs et en application native Android. Vous retrouvez toutes les fonctionnalités (import, balance, objectifs, conseiller IA) sur mobile.

## Spécifications de tests

### Tests unitaires — `tests/unit/seo/homepage-seo.test.ts`

| ID | Test | Assertion |
|----|------|-----------|
| TU-1 | HOME_FAQ_ITEMS contient 7 questions | `HOME_FAQ_ITEMS.length === 7` |
| TU-2 | Chaque FAQ item a question et answer non vides | Toutes les propriétés sont des strings non vides |
| TU-3 | WebSite schema a SearchAction | `potentialAction.@type === "SearchAction"` |
| TU-4 | SoftwareApplication a 3 offers | `offers.length === 3` |
| TU-5 | SoftwareApplication a aggregateRating 4.8 | `aggregateRating.ratingValue === "4.8"` |
| TU-6 | FAQPage schema a 7 mainEntity | `mainEntity.length === 7` |
| TU-7 | Les questions FAQ matchent le schema | `HOME_FAQ_ITEMS[i].question === faqSchema.mainEntity[i].name` |
| TU-8 | Les descriptions multi-langues sont préservées | `DESCRIPTIONS.fr`, `DESCRIPTIONS.en`, etc. existent |
| TU-9 | generateMetadata retourne les alternates | 5 locales dans alternates.languages |
| TU-10 | generateMetadata retourne OG image | openGraph.images inclut `/og/home.png` |
