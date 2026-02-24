# STORY-081 — Modale urgence trial ≤ 3 jours

**Sprint :** Conversion & Monétisation (v11)
**Épique :** conversion
**Priorité :** P1 — MUST HAVE
**Complexité :** S (2 points)
**Statut :** pending
**Bloqué par :** aucune

---

## Description

Afficher une modale d'urgence dans l'application quand l'essai Pro expire dans ≤ 3 jours. Le `PlanBanner` existant (bandeau orange en haut) est discret — un utilisateur peut l'ignorer. La modale est plus intrusive : elle apparaît au centre de l'écran au chargement de l'app, une seule fois par jour (localStorage), et propose un CTA direct vers `/tarifs`.

**Comportement :**
- S'affiche uniquement si `status === "trialing"` ET `daysRemaining <= 3`
- Se souvient de sa dernière apparition via `localStorage.getItem("trial_modal_shown_date")`
- Si déjà affiché aujourd'hui (date ISO `YYYY-MM-DD`) → ne s'affiche pas
- Dismiss ("Plus tard") ou CTA → enregistre la date et ferme

**Design system Stitch :**
- Overlay `fixed inset-0 bg-black/50 z-50`
- Card `bg-white rounded-2xl max-w-sm` centrée
- Icône `hourglass_empty` (Material Symbols FILL=1, warning color)
- CTA `bg-primary text-white rounded-xl`
- Bouton secondaire `text-text-muted`

---

## Acceptance Criteria

- **AC-1 :** La modale s'affiche si `daysRemaining <= 3` ET `status === "trialing"`
- **AC-2 :** La modale ne s'affiche PAS si déjà montrée aujourd'hui (localStorage `trial_modal_shown_date` = date ISO du jour)
- **AC-3 :** Le CTA "Souscrire maintenant" redirige vers `/tarifs`
- **AC-4 :** Le bouton "Plus tard" ferme la modale et enregistre `trial_modal_shown_date = today`
- **AC-5 :** La modale ne s'affiche PAS si `daysRemaining > 3`
- **AC-6 :** La modale ne s'affiche PAS si `status !== "trialing"` (plan free, actif ou premium)
- **AC-7 :** La modale affiche ≥ 3 features Pro sous forme de bullets
- **AC-8 :** `npm run build` et `npm run lint` passent

---

## Fichiers à créer / modifier

| Fichier | Action | Détail |
|---------|--------|--------|
| `src/components/trial-urgency-modal.tsx` | CRÉER | Composant client modal |
| `src/app/[locale]/(app)/layout.tsx` | MODIFIER | Intégrer `<TrialUrgencyModal>` avec les données subscription |

---

## Composant cible

```tsx
// src/components/trial-urgency-modal.tsx
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

type TrialUrgencyModalProps = {
  daysRemaining: number;
  status: string;
};

const MODAL_KEY = "trial_modal_shown_date";

export function TrialUrgencyModal({ daysRemaining, status }: TrialUrgencyModalProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (status !== "trialing" || daysRemaining > 3) return;

    const today = new Date().toISOString().slice(0, 10);
    const lastShown = localStorage.getItem(MODAL_KEY);
    if (lastShown === today) return;

    setVisible(true);
  }, [daysRemaining, status]);

  function handleDismiss() {
    const today = new Date().toISOString().slice(0, 10);
    localStorage.setItem(MODAL_KEY, today);
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl p-6 max-w-sm w-full flex flex-col gap-5 shadow-xl">

        {/* Icône + Titre */}
        <div className="flex flex-col items-center gap-3 text-center">
          <div className="flex items-center justify-center size-16 rounded-full bg-warning/10">
            <span
              className="material-symbols-outlined text-warning"
              style={{ fontSize: "36px", fontVariationSettings: "'FILL' 1" }}
            >
              hourglass_empty
            </span>
          </div>
          <div>
            <h2 className="text-xl font-extrabold text-text-main">
              Votre essai expire bientôt
            </h2>
            <p className="text-text-muted text-sm mt-1">
              {daysRemaining === 1
                ? "Dernier jour de votre essai Pro"
                : `Plus que ${daysRemaining} jours`}
            </p>
          </div>
        </div>

        {/* Features */}
        <ul className="flex flex-col gap-2">
          {[
            "Import PDF & Excel toutes banques",
            "Conseiller IA financier",
            "5 comptes bancaires",
          ].map((f) => (
            <li key={f} className="flex items-center gap-2 text-sm text-text-main">
              <span
                className="material-symbols-outlined text-success text-[18px]"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                check_circle
              </span>
              {f}
            </li>
          ))}
        </ul>

        {/* CTA */}
        <div className="flex flex-col gap-2">
          <Link
            href="/tarifs"
            onClick={handleDismiss}
            className="w-full bg-primary hover:bg-primary/90 text-white font-bold py-3.5 rounded-xl flex items-center justify-center gap-2"
          >
            Souscrire maintenant
            <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
          </Link>
          <button
            onClick={handleDismiss}
            className="w-full text-text-muted text-sm py-2 hover:text-text-main"
          >
            Plus tard
          </button>
        </div>
      </div>
    </div>
  );
}
```

## Intégration layout

```tsx
// src/app/[locale]/(app)/layout.tsx — ajout
import { TrialUrgencyModal } from "@/components/trial-urgency-modal";

// Dans le layout server component, récupérer daysRemaining depuis la subscription
// et passer les props au composant client :
<TrialUrgencyModal daysRemaining={daysRemaining ?? 0} status={status ?? "free"} />
```

---

## Tests unitaires

**Fichier :** `tests/unit/components/trial-urgency-modal.test.tsx`

| ID | Description | Résultat attendu |
|----|-------------|-----------------|
| TU-81-1 | `daysRemaining=3, status="trialing"` → modale visible | `getByRole("dialog")` ou overlay présent |
| TU-81-2 | `daysRemaining=1, status="trialing"` → affiche "Dernier jour" | `getByText(/Dernier jour/)` |
| TU-81-3 | `daysRemaining=4, status="trialing"` → ne rend rien | composant retourne `null` |
| TU-81-4 | `daysRemaining=1, status="active"` → ne rend rien | composant retourne `null` |
| TU-81-5 | Clic "Plus tard" → localStorage contient la date du jour | `localStorage.getItem("trial_modal_shown_date")` = today |
| TU-81-6 | Si localStorage déjà = today → modale non visible | composant retourne `null` |
| TU-81-7 | La modale affiche ≥ 3 features (bullets) | `getAllByRole("listitem").length >= 3` |
| TU-81-8 | Le lien CTA pointe vers `/tarifs` | `getByRole("link").href` contient `/tarifs` |

---

## Mapping AC → Tests

| AC | Tests couvrant |
|----|---------------|
| AC-1 | TU-81-1, TU-81-2 |
| AC-2 | TU-81-6 |
| AC-3 | TU-81-8 |
| AC-4 | TU-81-5 |
| AC-5 | TU-81-3 |
| AC-6 | TU-81-4 |
| AC-7 | TU-81-7 |
| AC-8 | `npm run build && npm run lint` |

---

## Données de test / Fixtures

```tsx
// Mock localStorage pour les tests
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] ?? null,
    setItem: (key: string, value: string) => { store[key] = value; },
    clear: () => { store = {}; },
  };
})();
Object.defineProperty(window, "localStorage", { value: localStorageMock });
```

---

## Notes d'implémentation

1. **SSR-safe** : `useEffect` pour accéder à `localStorage` — le composant rend `null` au premier rendu SSR
2. **`daysRemaining` depuis le layout** : calculer `Math.ceil((trialEndsAt - now) / 86400000)` côté server
3. **z-index** : `z-50` — au-dessus du `BottomNav` (`z-40` selon le design Stitch)
4. **Pas de portail** : le composant est rendu dans le layout directement (pas besoin de `createPortal` avec App Router)
5. **`Link` de `next/link`** : utiliser `next/link` directement (pas `@/i18n/navigation`) pour éviter le double préfixe locale
