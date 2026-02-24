# STORY-082 — Modale upgrade contextuelle

**Sprint :** Conversion & Monétisation (v11)
**Épique :** conversion
**Priorité :** P2 — SHOULD HAVE
**Complexité :** M (3 points)
**Statut :** pending
**Bloqué par :** aucune

---

## Description

Remplacer les messages d'erreur silencieux (toasts texte) par une modale d'upgrade contextuelle quand un utilisateur tente d'utiliser une feature réservée à un plan supérieur.

**Problème actuel :** Quand un utilisateur Free tente d'importer un PDF ou d'utiliser l'IA, il reçoit une erreur textuelle peu visible qui ne lui explique pas clairement quel plan il faut et combien ça coûte. Le moment de friction est une opportunité de conversion non exploitée.

**Solution :** Un hook `useUpgradeModal` + composant `UpgradeModal` qui remplace ces erreurs par une modale engageante montrant : le plan cible, le prix, les features débloquées, et un CTA direct checkout Stripe.

---

## Acceptance Criteria

- **AC-1 :** Tentative d'import PDF sur plan free → `UpgradeModal` (reason="import_pdf") au lieu de toast
- **AC-2 :** Tentative d'utilisation de l'IA sur plan free → `UpgradeModal` (reason="ai")
- **AC-3 :** Tentative de création de compte au-delà de la limite → `UpgradeModal` (reason="accounts_limit")
- **AC-4 :** La modale affiche le nom du plan cible, le prix mensuel et ≥ 3 features débloquées
- **AC-5 :** Le CTA "Passer au plan [X]" déclenche le checkout Stripe (appel POST `/api/stripe/checkout`)
- **AC-6 :** Le bouton "Fermer" ferme la modale sans navigation
- **AC-7 :** `useUpgradeModal()` expose `showUpgradeModal(reason)` et `upgradeReason` (ou `null`)
- **AC-8 :** `npm run build` et `npm run lint` passent

---

## Fichiers à créer / modifier

| Fichier | Action | Détail |
|---------|--------|--------|
| `src/hooks/use-upgrade-modal.ts` | CRÉER | Hook client avec état de la modale |
| `src/components/upgrade-modal.tsx` | CRÉER | Composant modal contextuel |
| `src/components/import-dialog.tsx` | MODIFIER | Remplacer les toasts d'erreur plan par `showUpgradeModal` |
| `src/app/[locale]/(app)/ia/page.tsx` (ou composant IA) | MODIFIER | Remplacer erreur plan IA par `showUpgradeModal` |

---

## Types

```ts
// src/hooks/use-upgrade-modal.ts
export type UpgradeReason =
  | "ai"
  | "accounts_limit"
  | "import_pdf"
  | "import_xlsx"
  | "export_pdf"
  | "history";

export type UpgradeConfig = {
  targetPlan: "pro" | "premium";
  title: string;
  description: string;
  features: string[];
};

export const UPGRADE_CONFIGS: Record<UpgradeReason, UpgradeConfig> = {
  ai: {
    targetPlan: "pro",
    title: "Débloquez le Conseiller IA",
    description: "Posez vos questions financières à notre assistant IA.",
    features: ["10 requêtes IA par mois", "Analyse de vos dépenses", "Conseils personnalisés"],
  },
  accounts_limit: {
    targetPlan: "pro",
    title: "Ajoutez plus de comptes",
    description: "Le plan Gratuit est limité à 2 comptes bancaires.",
    features: ["Jusqu'à 5 comptes", "Multi-devises", "Vue agrégée"],
  },
  import_pdf: {
    targetPlan: "pro",
    title: "Importez vos relevés PDF",
    description: "L'import PDF est disponible à partir du plan Pro.",
    features: ["Import PDF & Excel", "Toutes les banques françaises", "Détection auto des doublons"],
  },
  import_xlsx: {
    targetPlan: "pro",
    title: "Importez vos relevés Excel",
    description: "L'import Excel (.xlsx) est disponible à partir du plan Pro.",
    features: ["Import PDF & Excel", "Parsers ING, Boursorama, Revolut", "Détection auto des doublons"],
  },
  export_pdf: {
    targetPlan: "pro",
    title: "Exportez en PDF",
    description: "L'export de rapports PDF mensuel est disponible en Pro.",
    features: ["Rapport mensuel PDF", "Historique complet", "Multi-devises"],
  },
  history: {
    targetPlan: "pro",
    title: "Accédez à tout votre historique",
    description: "Le plan Gratuit limite l'historique à 3 mois.",
    features: ["Historique illimité", "Comparaisons YoY", "Tendances long terme"],
  },
};
```

## Hook

```ts
// src/hooks/use-upgrade-modal.ts
"use client";

import { useState } from "react";
import type { UpgradeReason } from "./use-upgrade-modal";

export function useUpgradeModal() {
  const [upgradeReason, setUpgradeReason] = useState<UpgradeReason | null>(null);

  const showUpgradeModal = (reason: UpgradeReason) => setUpgradeReason(reason);
  const closeUpgradeModal = () => setUpgradeReason(null);

  return { upgradeReason, showUpgradeModal, closeUpgradeModal };
}
```

## Composant

```tsx
// src/components/upgrade-modal.tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import type { UpgradeReason } from "@/hooks/use-upgrade-modal";
import { UPGRADE_CONFIGS } from "@/hooks/use-upgrade-modal";
import { PLANS } from "@/lib/stripe-plans";

type UpgradeModalProps = {
  reason: UpgradeReason | null;
  onClose: () => void;
};

export function UpgradeModal({ reason, onClose }: UpgradeModalProps) {
  const [loading, setLoading] = useState(false);

  if (!reason) return null;

  const config = UPGRADE_CONFIGS[reason];
  const plan = PLANS[config.targetPlan];

  async function handleCheckout() {
    setLoading(true);
    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planId: config.targetPlan }),
      });
      const { url } = await res.json() as { url: string };
      if (url) window.location.href = url;
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl p-6 max-w-sm w-full flex flex-col gap-5 shadow-xl">

        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center justify-center size-12 rounded-xl bg-primary/10">
            <span
              className="material-symbols-outlined text-primary"
              style={{ fontSize: "24px", fontVariationSettings: "'FILL' 1" }}
            >
              lock_open
            </span>
          </div>
          <button onClick={onClose} className="text-text-muted hover:text-text-main">
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Titre + description */}
        <div>
          <h2 className="text-xl font-extrabold text-text-main">{config.title}</h2>
          <p className="text-text-muted text-sm mt-1">{config.description}</p>
        </div>

        {/* Plan cible */}
        <div className="bg-primary/5 border border-primary/20 rounded-xl p-4">
          <div className="flex items-center justify-between mb-3">
            <span className="font-bold text-text-main">{plan.name}</span>
            <span className="font-extrabold text-primary text-lg">{plan.price}€<span className="text-sm font-normal">/mois</span></span>
          </div>
          <ul className="flex flex-col gap-2">
            {config.features.map((f) => (
              <li key={f} className="flex items-center gap-2 text-sm text-text-main">
                <span
                  className="material-symbols-outlined text-success text-[16px]"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  check_circle
                </span>
                {f}
              </li>
            ))}
          </ul>
        </div>

        {/* CTA */}
        <div className="flex flex-col gap-2">
          <button
            onClick={handleCheckout}
            disabled={loading}
            className="w-full bg-primary hover:bg-primary/90 text-white font-bold py-3.5 rounded-xl flex items-center justify-center gap-2 disabled:opacity-60"
          >
            {loading
              ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              : <>Passer au plan {plan.name} <span className="material-symbols-outlined text-[18px]">arrow_forward</span></>
            }
          </button>
          <Link href="/tarifs" onClick={onClose} className="text-center text-primary text-sm font-medium hover:underline">
            Voir tous les tarifs →
          </Link>
        </div>
      </div>
    </div>
  );
}
```

---

## Tests unitaires

**Fichier :** `tests/unit/components/upgrade-modal.test.tsx`
**Fichier :** `tests/unit/hooks/use-upgrade-modal.test.ts`

| ID | Description | Résultat attendu |
|----|-------------|-----------------|
| TU-82-1 | `<UpgradeModal reason="ai" onClose={fn} />` affiche le titre config AI | `getByText("Débloquez le Conseiller IA")` |
| TU-82-2 | `<UpgradeModal reason="ai" />` affiche le plan Pro et son prix | `getByText("Pro")` + `getByText(/4.9/)` |
| TU-82-3 | `<UpgradeModal reason="import_pdf" />` affiche le bon titre | `getByText(/Importez vos relevés PDF/)` |
| TU-82-4 | `<UpgradeModal reason={null} />` ne rend rien | composant retourne `null` |
| TU-82-5 | Clic "Fermer" (×) appelle `onClose` | `fn` appelé 1 fois |
| TU-82-6 | `useUpgradeModal()` — `showUpgradeModal("ai")` → `upgradeReason === "ai"` | state correct |
| TU-82-7 | `useUpgradeModal()` — `closeUpgradeModal()` → `upgradeReason === null` | state correct |
| TU-82-8 | `UPGRADE_CONFIGS` contient les 6 reasons définies | `Object.keys(UPGRADE_CONFIGS).length === 6` |
| TU-82-9 | Chaque config a ≥ 3 features | Pour chaque reason, `features.length >= 3` |

---

## Mapping AC → Tests

| AC | Tests couvrant |
|----|---------------|
| AC-1 | TU-82-3 (import_pdf) + test intégration composant import |
| AC-2 | TU-82-1 (ai) |
| AC-3 | TU-82-6 + test intégration composant ajout compte |
| AC-4 | TU-82-2, TU-82-9 |
| AC-5 | Test intégration (mock fetch checkout) |
| AC-6 | TU-82-5 |
| AC-7 | TU-82-6, TU-82-7 |
| AC-8 | `npm run build && npm run lint` |

---

## Notes d'implémentation

1. **Intégration import-dialog** : localiser les `toast.error(...)` liés au plan et les remplacer par `showUpgradeModal(reason)`. Le composant parent doit instancier `useUpgradeModal` et rendre `<UpgradeModal>`
2. **Intégration IA** : dans le composant de chat, intercepter les erreurs 403 plan et appeler `showUpgradeModal("ai")`
3. **fetch checkout** : utiliser une URL relative `/api/stripe/checkout` (fonctionne côté client en Next.js)
4. **Pas de `any`** : typer le retour de `fetch` avec `{ url: string }` via assertion `as`
5. **`Link` de `next/link`** : pas de double-préfixe locale car c'est un lien de navigation normale
