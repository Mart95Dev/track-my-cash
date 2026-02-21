# STORY-010 — Page d'accueil publique (Landing Page)

**Epic :** Landing Page Marketing
**Priorité :** P0
**Complexité :** M
**Statut :** pending
**Bloquée par :** STORY-009 (navbar dans le layout)

---

## User Story

En tant que visiteur qui découvre TrackMyCash,
je veux voir une page d'accueil claire et convaincante,
afin de comprendre la valeur du produit et décider de m'inscrire.

---

## Contexte technique

- Route : `/src/app/[locale]/(marketing)/page.tsx` — à créer dans le groupe `(marketing)`
- La page `/tarifs` existe déjà dans `(marketing)/tarifs/` — la réutiliser pour la section prix compacte
- Les plans Stripe sont dans `src/lib/stripe-plans.ts` (Free 0€, Pro 4.90€, Premium 7.90€)
- i18n : les traductions seront dans les messages existants, namespace `"landing"` à créer
- Icônes : lucide-react (déjà installé)
- Composants shadcn/ui : Card, Button, Badge

---

## Structure de la page

```
1. HERO
   - H1 : accroche principale
   - Sous-titre : bénéfice secondaire
   - CTA primaire : "Commencer gratuitement" → /inscription
   - CTA secondaire : "Voir les tarifs" → /tarifs

2. FONCTIONNALITÉS (6 cartes)
   - Comptes multiples (icône: Wallet)
   - Import CSV/Excel/PDF (icône: FileUp)
   - Paiements récurrents (icône: RefreshCw)
   - Prévisions (icône: TrendingUp)
   - Conseiller IA (icône: Bot)
   - Multi-devises (icône: Globe)

3. TARIFS COMPACTS (3 colonnes depuis PLANS)
   - Titre, prix, 3 features max, CTA

4. CTA FINAL
   - Titre d'accroche
   - Bouton "Créer mon compte gratuit"
```

---

## Acceptance Criteria

- [ ] AC-1 : La page est accessible sans authentification à `/` (routes `/fr/`, `/en/`, `/es/`, `/it/`, `/de/`)
- [ ] AC-2 : La page contient un `<h1>` (obligatoire pour SEO)
- [ ] AC-3 : Les 6 fonctionnalités sont présentées avec icône + titre + description courte
- [ ] AC-4 : La section Tarifs affiche les 3 plans depuis `PLANS` de `stripe-plans.ts` (vérité unique)
- [ ] AC-5 : Le CTA "Commencer gratuitement" redirige vers `/inscription`
- [ ] AC-6 : La page est responsive (mobile-first, grid md:grid-cols-X)
- [ ] AC-7 : Les textes sont fournis via `getTranslations("landing")` (namespace à créer si absent)
- [ ] AC-8 : Aucune couleur hardcodée — utilise les tokens sémantiques (`text-income`, `text-expense`, etc.)

---

## Fichiers à créer / modifier

| Fichier | Action |
|---------|--------|
| `src/app/[locale]/(marketing)/page.tsx` | Créer — landing page Server Component |
| `src/components/marketing/feature-card.tsx` | Créer — composant carte fonctionnalité |
| `messages/fr.json` | Modifier — ajouter namespace `"landing"` |
| `messages/en.json` | Modifier — ajouter traductions anglaises |
| `messages/es.json` | Modifier — espagnol |
| `messages/it.json` | Modifier — italien |
| `messages/de.json` | Modifier — allemand |

---

## Tests unitaires

### TU-1 : FeatureCard — rendu
**Fichier :** `tests/unit/marketing/feature-card.test.tsx`

```
TU-1-1 : FeatureCard affiche le titre passé en props
TU-1-2 : FeatureCard affiche la description passée en props
TU-1-3 : FeatureCard affiche l'icône (aria-label ou data-testid)
```

### TU-2 : Section tarifs — données depuis PLANS
**Fichier :** `tests/unit/marketing/landing-plans.test.ts`

```
TU-2-1 : PLANS.free.price === 0
TU-2-2 : PLANS.pro.price === 4.9
TU-2-3 : PLANS.premium.price === 7.9
TU-2-4 : Chaque plan a au moins 3 features
TU-2-5 : stripePriceId est null pour free, non-null pour pro et premium (si env configuré)
```

---

## Fixtures / données de test

```typescript
// fixture feature-cards
const FEATURES = [
  { icon: "Wallet", title: "Comptes multiples", description: "..." },
  // ... 6 features
];
```

---

## Estimation

**Points :** 5
**Durée estimée :** 3-4h
