# STORY-083 — Page succès post-paiement

**Sprint :** Conversion & Monétisation (v11)
**Épique :** conversion
**Priorité :** P2 — SHOULD HAVE
**Complexité :** S (2 points)
**Statut :** pending
**Bloqué par :** STORY-079 (success_url doit pointer vers `/bienvenue`)

---

## Description

Créer une page dédiée `/bienvenue` affichée après un paiement Stripe réussi. Actuellement, Stripe redirige vers `/parametres?tab=billing&success=true` — une page technique peu engageante.

La page `/bienvenue` doit :
- Confirmer l'achat avec enthousiasme
- Récapituler les features débloquées du plan souscrit
- Guider l'utilisateur vers sa première action utile (import, IA, dashboard)

**Impact UX :** C'est la première impression post-achat. Une bonne page de succès renforce la décision d'achat (réduction de la dissonance cognitive) et augmente l'activation.

---

## Acceptance Criteria

- **AC-1 :** La page `/bienvenue` affiche l'icône `check_circle` (Material Symbols FILL=1, success color) et un titre de confirmation
- **AC-2 :** Le nom du plan souscrit est affiché (depuis `searchParams.plan`)
- **AC-3 :** Les features du plan sont listées (depuis `PLANS[planId].features`)
- **AC-4 :** Au moins 3 boutons d'action sont présents : vers `/transactions`, vers `/ia`, vers `/dashboard`
- **AC-5 :** La page est accessible même sans session active (redirection Stripe possible sans session) — affiche une version générique
- **AC-6 :** La route checkout `success_url` pointe désormais vers `/${locale}/bienvenue?plan=${planId}`
- **AC-7 :** Un lien discret "Gérer mon abonnement" pointe vers `/parametres?tab=billing`
- **AC-8 :** `npm run build` et `npm run lint` passent

---

## Fichiers à créer / modifier

| Fichier | Action | Détail |
|---------|--------|--------|
| `src/app/[locale]/(app)/bienvenue/page.tsx` | CRÉER | Page Server Component |
| `src/app/api/stripe/checkout/route.ts` | MODIFIER | `success_url` → `/bienvenue?plan=${planId}` |

---

## Page cible

```tsx
// src/app/[locale]/(app)/bienvenue/page.tsx
import type { Metadata } from "next";
import Link from "next/link";
import { PLANS } from "@/lib/stripe-plans";
import type { PlanId } from "@/lib/stripe-plans";
import { getSession } from "@/lib/auth-utils";

export const metadata: Metadata = {
  title: "Bienvenue — TrackMyCash",
  description: "Votre abonnement est actif. Commencez à suivre vos finances.",
};

type Props = {
  searchParams: Promise<{ plan?: string }>;
};

export default async function BienvenueePage({ searchParams }: Props) {
  const { plan } = await searchParams;
  const planId = (plan && plan in PLANS ? plan : "pro") as PlanId;
  const planData = PLANS[planId];

  // Session optionnelle — ne bloque pas si absent
  let userName = "";
  try {
    const session = await getSession();
    userName = session?.user?.name ?? "";
  } catch {
    // Page accessible sans session (redirect Stripe)
  }

  const actions = [
    { href: "/transactions", icon: "upload_file", label: "Importer mes transactions" },
    { href: "/ia",           icon: "smart_toy",   label: "Essayer le Conseiller IA" },
    { href: "/dashboard",    icon: "dashboard",   label: "Voir mon dashboard" },
  ];

  return (
    <div className="min-h-screen bg-background-light flex items-center justify-center p-6">
      <div className="w-full max-w-md flex flex-col items-center gap-8">

        {/* Icône succès */}
        <div className="flex items-center justify-center size-24 rounded-full bg-success/10">
          <span
            className="material-symbols-outlined text-success"
            style={{ fontSize: "56px", fontVariationSettings: "'FILL' 1" }}
          >
            check_circle
          </span>
        </div>

        {/* Titre */}
        <div className="text-center">
          <h1 className="text-3xl font-extrabold text-text-main tracking-tight">
            {userName ? `Bienvenue, ${userName} !` : "Paiement confirmé !"}
          </h1>
          <p className="text-text-muted text-base mt-2">
            Votre abonnement <span className="font-bold text-text-main">{planData.name}</span> est actif.
          </p>
        </div>

        {/* Features débloquées */}
        <div className="w-full bg-white rounded-2xl p-5 flex flex-col gap-4 border border-slate-100">
          <p className="text-xs uppercase tracking-widest font-bold text-text-muted">
            Ce que vous venez de débloquer
          </p>
          <ul className="flex flex-col gap-3">
            {planData.features.map((feature) => (
              <li key={feature} className="flex items-center gap-3 text-sm text-text-main">
                <span
                  className="material-symbols-outlined text-primary text-[18px] shrink-0"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  check_circle
                </span>
                {feature}
              </li>
            ))}
          </ul>
        </div>

        {/* Actions */}
        <div className="w-full flex flex-col gap-3">
          <p className="text-xs uppercase tracking-widest font-bold text-text-muted text-center">
            Par où commencer ?
          </p>
          {actions.map((action) => (
            <Link
              key={action.href}
              href={action.href}
              className="w-full bg-white border border-slate-200 hover:border-primary/30 hover:bg-primary/5 rounded-xl px-4 py-3.5 flex items-center gap-3 text-text-main font-medium transition-colors"
            >
              <span
                className="material-symbols-outlined text-primary text-[22px]"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                {action.icon}
              </span>
              {action.label}
              <span className="material-symbols-outlined text-text-muted text-[18px] ml-auto">
                chevron_right
              </span>
            </Link>
          ))}
        </div>

        {/* Lien discret gestion */}
        <Link
          href="/parametres?tab=billing"
          className="text-text-muted text-sm hover:text-text-main"
        >
          Gérer mon abonnement →
        </Link>
      </div>
    </div>
  );
}
```

## Modification checkout

```ts
// src/app/api/stripe/checkout/route.ts
// AVANT :
success_url: `${baseUrl}/${locale}/parametres?tab=billing&success=true`,
// APRÈS :
success_url: `${baseUrl}/${locale}/bienvenue?plan=${planId}`,
```

---

## Tests unitaires

**Fichier :** `tests/unit/pages/bienvenue.test.tsx`
**Fichier :** `tests/unit/api/stripe-checkout-success-url.test.ts`

| ID | Description | Résultat attendu |
|----|-------------|-----------------|
| TU-83-1 | Page `/bienvenue?plan=pro` rend sans erreur | `render()` sans throw |
| TU-83-2 | Plan Pro → affiche "Pro" dans la page | `getByText(/Pro/)` |
| TU-83-3 | Plan Pro → affiche les features Pro | Features de `PLANS.pro.features` présentes dans le DOM |
| TU-83-4 | Plan Premium → affiche les features Premium | Features de `PLANS.premium.features` présentes |
| TU-83-5 | `?plan=invalid` → fallback vers plan pro (pas de crash) | Rendu sans erreur |
| TU-83-6 | La page contient 3 liens d'action (transactions, ia, dashboard) | `getAllByRole("link").length >= 3` |
| TU-83-7 | `success_url` dans checkout route contient `/bienvenue` | Mock Stripe — paramètre vérifié |
| TU-83-8 | `success_url` contient le `planId` passé | `success_url.includes("plan=pro")` |

---

## Mapping AC → Tests

| AC | Tests couvrant |
|----|---------------|
| AC-1 | TU-83-1 (icône check présente dans rendu) |
| AC-2 | TU-83-2 |
| AC-3 | TU-83-3, TU-83-4 |
| AC-4 | TU-83-6 |
| AC-5 | TU-83-5 (pas de session → pas de crash) |
| AC-6 | TU-83-7, TU-83-8 |
| AC-7 | Présence `href="/parametres?tab=billing"` dans le rendu |
| AC-8 | `npm run build && npm run lint` |

---

## Notes d'implémentation

1. **Server Component** : la page est un Server Component — `searchParams` est un `Promise<>` en Next.js 16 (utiliser `await searchParams`)
2. **`getSession` try/catch** : Stripe peut rediriger vers cette page sans session active — wrapper dans try/catch
3. **Route `(app)`** : placer dans `(app)/bienvenue` pour hériter du layout app (BottomNav) si l'utilisateur est connecté
4. **Pas de `"use client"`** : page statique côté serveur — aucun état interactif nécessaire
5. **`Link` de `next/link`** : utiliser directement `next/link` (pas `@/i18n/navigation`) pour éviter le double-préfixe locale sur les liens internes `/dashboard`, `/tarifs`, etc.
