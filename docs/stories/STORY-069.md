# STORY-069 — BottomNav + Layout App mobile-first

**Sprint :** Design Stitch (v10)
**Épique :** design-system
**Priorité :** P1
**Complexité :** S (2 points)
**Statut :** pending
**Bloqué par :** STORY-068

---

## Description

Créer le composant `<BottomNav>` (barre de navigation fixe en bas, 5 onglets avec icônes Material Symbols) et adapter le layout de l'application pour le design mobile-first. Remplace la navigation latérale/horizontale existante (`navigation.tsx`) dans les pages app.

Le layout app devient `max-w-md mx-auto` centré, avec `pb-24` pour que le contenu ne soit pas masqué par la BottomNav fixe.

---

## Acceptance Criteria

- **AC-1 :** `<BottomNav>` s'affiche en bas sur toutes les pages `/(app)/`
- **AC-2 :** L'onglet correspondant à la route active est coloré en `text-primary` (icône + label)
- **AC-3 :** Les 5 onglets naviguent vers les bonnes routes (`/dashboard`, `/comptes`, `/transactions`, `/recurrents`, `/conseiller`)
- **AC-4 :** Le contenu des pages est visible sans être masqué par la barre (`pb-24` sur le wrapper)
- **AC-5 :** Le layout est centré avec `max-w-md mx-auto` et fond `bg-background-light`
- **AC-6 :** La `<Navigation>` existante est retirée du layout app (pas de double barre)
- **AC-7 :** `npm run build` passe sans erreur TypeScript

---

## Fichiers à créer / modifier

| Fichier | Action | Détail |
|---------|--------|--------|
| `src/components/bottom-nav.tsx` | CRÉER | Composant client avec usePathname |
| `src/app/[locale]/(app)/layout.tsx` | MODIFIER | Intégrer BottomNav, retirer Navigation, max-w-md |

---

## Implémentation : bottom-nav.tsx

```typescript
"use client";

import Link from "next/link";
import { usePathname, useParams } from "next/navigation";

type NavItem = {
  href: string;
  icon: string;        // Material Symbol name
  label: string;
};

const NAV_ITEMS: NavItem[] = [
  { href: "/dashboard",    icon: "space_dashboard",          label: "Dashboard" },
  { href: "/comptes",      icon: "account_balance_wallet",   label: "Comptes" },
  { href: "/transactions", icon: "receipt_long",             label: "Transactions" },
  { href: "/recurrents",   icon: "autorenew",                label: "Récurrents" },
  { href: "/conseiller",   icon: "smart_toy",                label: "IA" },
];

export function BottomNav() {
  const pathname = usePathname();
  const params = useParams();
  const locale = params.locale as string;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white dark:bg-card-dark border-t border-gray-100 dark:border-gray-800 h-16 pb-safe">
      <div className="max-w-md mx-auto flex h-full items-center justify-around px-2">
        {NAV_ITEMS.map((item) => {
          const fullHref = `/${locale}${item.href}`;
          const isActive = pathname.startsWith(fullHref);
          return (
            <Link
              key={item.href}
              href={fullHref}
              className={`flex flex-col items-center justify-center gap-0.5 px-3 py-1 rounded-xl transition-colors ${
                isActive
                  ? "text-primary"
                  : "text-text-muted hover:text-primary/70"
              }`}
            >
              <span className="material-symbols-outlined text-[22px]" style={{
                fontVariationSettings: isActive ? "'FILL' 1" : "'FILL' 0"
              }}>
                {item.icon}
              </span>
              <span className="text-[10px] font-semibold leading-none">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
```

## Implémentation : layout app

```typescript
// src/app/[locale]/(app)/layout.tsx
import { BottomNav } from "@/components/bottom-nav";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  // ... auth check existant préservé ...
  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark">
      <main className="max-w-md mx-auto pb-24 min-h-screen">
        {children}
      </main>
      <BottomNav />
    </div>
  );
}
```

---

## Tests unitaires (TU-x)

**Fichier :** `tests/unit/components/bottom-nav.test.tsx`

| ID | Description | Résultat attendu |
|----|-------------|-----------------|
| TU-69-1 | Rendu avec pathname `/fr/dashboard` → onglet Dashboard actif | classe `text-primary` sur l'item Dashboard |
| TU-69-2 | Rendu avec pathname `/fr/transactions` → onglet Transactions actif | classe `text-primary` sur Transactions |
| TU-69-3 | Rendu avec pathname `/fr/comptes` → onglet Comptes actif | classe `text-primary` sur Comptes |
| TU-69-4 | Les 5 onglets sont présents dans le DOM | `getAllByRole('link').length === 5` |
| TU-69-5 | Le lien Dashboard pointe vers `/{locale}/dashboard` | `href` correct |
| TU-69-6 | Le lien Conseiller pointe vers `/{locale}/conseiller` | `href` correct |

---

## Mapping AC → Tests

| AC | Tests couvrant |
|----|---------------|
| AC-1 | Intégration layout |
| AC-2 | TU-69-1, TU-69-2, TU-69-3 |
| AC-3 | TU-69-4, TU-69-5, TU-69-6 |
| AC-4 | Inspection CSS (pb-24 sur main) |
| AC-5, AC-6, AC-7 | `npm run build` |

---

## Données de test / Fixtures

```typescript
// Mock next/navigation dans le test
vi.mock("next/navigation", () => ({
  usePathname: vi.fn(() => "/fr/dashboard"),
  useParams: vi.fn(() => ({ locale: "fr" })),
}));
```

---

## Notes d'implémentation

1. **`usePathname` est un hook client** — `BottomNav` doit être `"use client"`. Le layout app reste Server Component et importe `<BottomNav>` directement (Next.js gère l'hydratation)
2. **`font-variation-settings`** : FILL=1 pour l'onglet actif (icône remplie), FILL=0 pour les inactifs (icône outline)
3. **`pb-safe`** : ajouter la gestion du safe-area iOS (`padding-bottom: env(safe-area-inset-bottom)`) via CSS dans `globals.css` : `.pb-safe { padding-bottom: env(safe-area-inset-bottom, 0px); }`
4. **Retirer `<Navigation>`** : dans `(app)/layout.tsx`, supprimer l'import et l'usage du composant `<Navigation>` — vérifier que les fonctionnalités (notifications bell, account selector) sont reportées dans les pages concernées
5. **`PlanBanner` et `TrialBanner`** : ces composants qui étaient positionnés sous la Navigation doivent être déplacés dans les pages individuelles ou gardés en haut de `<main>`
