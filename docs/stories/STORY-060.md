# STORY-060 — Bannière upgrade freemium + page tarifs enrichie

**Sprint :** Production SaaS & Croissance (v8)
**Épique :** monetization
**Priorité :** P1
**Complexité :** S (2 points)
**Statut :** pending
**Bloqué par :** STORY-054

---

## Description

Les utilisateurs Free et en essai ne voient aucune incitation visuelle à upgrader. Cette story crée un composant `<PlanBanner />` contextuel dans le layout app et enrichit la page `/tarifs` avec un tableau comparatif détaillé des fonctionnalités par plan. La bannière s'adapte selon le plan courant.

**Comportements :**
- **Free** : bannière info "Passez Pro — Accès à [la fonctionnalité bloquée]" + lien tarifs
- **Trialing** : bannière countdown "Essai Pro — X jours restants. [Souscrire]"
- **Pro/Premium** : pas de bannière (ou petite info du plan dans la nav)

---

## Acceptance Criteria

- **AC-1 :** `<PlanBanner />` Server Component affiché dans `src/app/[locale]/(app)/layout.tsx`
- **AC-2 :** Plan Free → bannière info (couleur blue/muted) avec lien `/tarifs`
- **AC-3 :** Plan trialing → bannière warning (couleur orange) avec countdown jours restants + bouton "Souscrire"
- **AC-4 :** Plan Pro ou Premium → null (aucune bannière rendue)
- **AC-5 :** Page `/[locale]/(marketing)/tarifs/page.tsx` affiche un tableau comparatif avec toutes les fonctionnalités Free/Pro/Premium
- **AC-6 :** Boutons "Choisir Pro" et "Choisir Premium" dans le tableau → lien `/api/stripe/checkout` (existant)

---

## Fichiers à créer / modifier

| Fichier | Action |
|---------|--------|
| `src/components/plan-banner.tsx` | CRÉER — composant adaptatif selon le plan |
| `src/app/[locale]/(app)/layout.tsx` | MODIFIER — intégrer `<PlanBanner />` |
| `src/app/[locale]/(marketing)/tarifs/page.tsx` | MODIFIER — tableau comparatif features |
| `tests/unit/components/plan-banner.test.tsx` | CRÉER — tests unitaires |

---

## Tests unitaires (TU-x)

**Fichier :** `tests/unit/components/plan-banner.test.tsx`

### Cas de test

| ID | Description | Résultat attendu |
|----|-------------|-----------------|
| TU-60-1 | `<PlanBanner plan="free" />` affiche le message d'upgrade | `getByText(/passez pro/i)` présent |
| TU-60-2 | `<PlanBanner plan="free" />` contient un lien vers `/tarifs` | lien href `/tarifs` présent |
| TU-60-3 | `<PlanBanner plan="pro" status="trialing" daysRemaining={5} />` affiche le compte à rebours | `getByText(/5 jours/i)` présent |
| TU-60-4 | `<PlanBanner plan="pro" status="trialing" daysRemaining={5} />` contient bouton "Souscrire" | bouton présent |
| TU-60-5 | `<PlanBanner plan="premium" />` retourne null | `container.firstChild === null` |
| TU-60-6 | `<PlanBanner plan="pro" status="active" />` retourne null | `container.firstChild === null` |

---

## Mapping AC → Tests

| AC | Tests couvrant |
|----|---------------|
| AC-1 | Intégration layout |
| AC-2 | TU-60-1 + TU-60-2 |
| AC-3 | TU-60-3 + TU-60-4 |
| AC-4 | TU-60-5 + TU-60-6 |
| AC-5 | Intégration page tarifs |
| AC-6 | Intégration liens Stripe |

---

## Interface TypeScript

```typescript
// src/components/plan-banner.tsx

type PlanBannerProps = {
  plan: "free" | "pro" | "premium";
  status?: "inactive" | "active" | "trialing" | "canceled" | "expired";
  daysRemaining?: number;  // seulement si status === "trialing"
};

export function PlanBanner({ plan, status, daysRemaining }: PlanBannerProps): JSX.Element | null
```

---

## Tableau comparatif tarifs (structure)

```
| Fonctionnalité              | Gratuit | Pro    | Premium  |
|-----------------------------|---------|--------|----------|
| Comptes bancaires           | 1       | ∞      | ∞        |
| Historique transactions     | 3 mois  | ∞      | ∞        |
| Import CSV/XLSX/PDF         | Basique | Complet| Complet  |
| Catégorisation auto (IA)    | —       | ✓      | ✓        |
| Export CSV                  | —       | ✓      | ✓        |
| Conseiller IA               | —       | 10/mois| Illimité |
| IA multi-modèles (consensus)| —       | —      | ✓        |
| Export PDF mensuel          | —       | ✓      | ✓        |
| Notifications email         | —       | ✓      | ✓        |
| Objectifs d'épargne         | —       | ✓      | ✓        |
| Support prioritaire         | —       | —      | ✓        |
```

---

## Notes d'implémentation

- `<PlanBanner />` est un **Server Component** (reçoit les props depuis le layout qui lit la subscription)
- Le layout `(app)/layout.tsx` récupère `getSubscription(userId)` → passe les props à `<PlanBanner />`
- Couleurs bannière : Free → `bg-blue-50 border-blue-200`, Trialing → `bg-orange-50 border-orange-200`
- Le tableau comparatif utilise `<Table>` shadcn/ui avec icônes `Check` (vert) et `Minus` (gris) de lucide-react
- Bouton "Choisir Pro" → formulaire POST vers `/api/stripe/checkout?plan=pro`
- Le composant `<PlanBanner />` se positionne juste en dessous de la `<Navigation />` dans le layout
