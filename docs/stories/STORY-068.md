# STORY-068 — Foundation : Design tokens Tailwind v4, Manrope, Material Symbols

**Sprint :** Design Stitch (v10)
**Épique :** design-system
**Priorité :** P1
**Complexité :** S (2 points)
**Statut :** pending
**Bloqué par :** aucun

---

## Description

Implémenter le design system complet issu des maquettes Google Stitch. Cette story est le **prérequis bloquant** pour toutes les autres : elle établit les tokens de couleurs dans `globals.css` via la syntaxe CSS-first de Tailwind v4 (`@theme`), charge la police Manrope depuis Google Fonts, et rend Material Symbols Outlined disponible globalement.

**Sources de vérité :** maquettes Stitch (projet 2264243572365741677) — tokens extraits du code HTML généré.

---

## Acceptance Criteria

- **AC-1 :** `npm run build` et `npm run lint` passent sans erreur après les modifications
- **AC-2 :** `text-primary` applique `#4848e5` — visible dans l'inspecteur navigateur
- **AC-3 :** `bg-background-light` applique `#f6f6f8` sur `<body>`
- **AC-4 :** `text-success` / `text-warning` / `text-danger` appliquent les bonnes couleurs sémantiques
- **AC-5 :** La police Manrope est chargée et appliquée sur `<body>` (onglet Network DevTools)
- **AC-6 :** `<span class="material-symbols-outlined">check</span>` affiche l'icône checkmark correctement
- **AC-7 :** Les classes `shadow-soft`, `rounded-xl`, `rounded-2xl` fonctionnent

---

## Fichiers à créer / modifier

| Fichier | Action | Détail |
|---------|--------|--------|
| `src/app/globals.css` | MODIFIER | Remplacer/étendre le bloc `@theme` avec tous les tokens |
| `src/app/layout.tsx` | MODIFIER | Charger Manrope via `next/font/google`, classe sur `<html>` |
| `src/app/[locale]/layout.tsx` | VÉRIFIER | S'assurer que la police est bien propagée |

---

## Implémentation : globals.css

```css
@import "tailwindcss";

@theme {
  /* Couleurs */
  --color-primary: #4848e5;
  --color-background-light: #f6f6f8;
  --color-background-dark: #111121;
  --color-card-light: #ffffff;
  --color-card-dark: #1a1a2e;
  --color-text-main: #0e0e1b;
  --color-text-muted: #505095;
  --color-success: #078841;
  --color-warning: #e7a008;
  --color-danger: #e74008;
  --color-indigo-50: #eef2ff;

  /* Border radius */
  --radius: 0.5rem;
  --radius-lg: 1rem;
  --radius-xl: 1.5rem;
  --radius-2xl: 2rem;

  /* Ombres */
  --shadow-soft: 0 4px 20px -2px rgba(0, 0, 0, 0.05);

  /* Typographie */
  --font-sans: 'Manrope', sans-serif;
  --font-display: 'Manrope', sans-serif;
}

/* Material Symbols global */
@layer base {
  .material-symbols-outlined {
    font-family: 'Material Symbols Outlined';
    font-weight: normal;
    font-style: normal;
    font-size: 24px;
    line-height: 1;
    letter-spacing: normal;
    text-transform: none;
    display: inline-block;
    white-space: nowrap;
    word-wrap: normal;
    direction: ltr;
    -webkit-font-feature-settings: 'liga';
    -webkit-font-smoothing: antialiased;
  }
}
```

## Implémentation : layout.tsx

```typescript
// src/app/layout.tsx
import { Manrope } from "next/font/google";

const manrope = Manrope({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-manrope",
  display: "swap",
});

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" className={manrope.variable}>
      <head>
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&display=swap"
        />
      </head>
      <body className="font-sans antialiased bg-background-light text-text-main">
        {children}
      </body>
    </html>
  );
}
```

---

## Tests unitaires (TU-x)

> Cette story n'a pas de logique métier pure testable via Vitest — les AC sont vérifiés par build + inspection visuelle. On crée néanmoins un test de smoke pour les classes CSS critiques.

**Fichier :** `tests/unit/design-system.test.ts`

| ID | Description | Résultat attendu |
|----|-------------|-----------------|
| TU-68-1 | Le fichier `globals.css` contient `--color-primary: #4848e5` | `readFileSync` contient la chaîne |
| TU-68-2 | Le fichier `globals.css` contient `--color-success: #078841` | présent |
| TU-68-3 | Le fichier `globals.css` contient `--color-warning: #e7a008` | présent |
| TU-68-4 | Le fichier `globals.css` contient `--color-danger: #e74008` | présent |
| TU-68-5 | Le fichier `globals.css` contient `--shadow-soft` | présent |
| TU-68-6 | Le fichier `globals.css` contient `--font-sans` avec Manrope | présent |

---

## Mapping AC → Tests

| AC | Tests couvrant |
|----|---------------|
| AC-1 | `npm run build` (CI) |
| AC-2 | TU-68-1 |
| AC-4 | TU-68-2, TU-68-3, TU-68-4 |
| AC-7 | TU-68-5 |
| AC-5 | TU-68-6 |
| AC-3, AC-6 | Vérification visuelle `npm run dev` |

---

## Données de test / Fixtures

Aucune fixture requise — tests basés sur lecture de fichier statique.

---

## Notes d'implémentation

1. **Tailwind v4 CSS-first** : ne pas utiliser `tailwind.config.ts` pour les tokens — tout passe par `@theme` dans `globals.css`
2. **Material Symbols** : charger via `<link>` dans `<head>` du layout racine (pas via `next/font` — la police d'icônes n'est pas supportée)
3. **Préserver les tokens existants** : ne pas effacer les variables CSS déjà définies qui sont utilisées par shadcn/ui (ex: `--background`, `--foreground`, `--border`)
4. **Tester le build** : `npm run build` doit passer — en cas d'erreur PostCSS, vérifier la syntaxe `@theme`
5. **`--radius-xl` et `--radius-2xl`** : en Tailwind v4, les noms de classes générées suivront `rounded-xl` → `--radius-xl`
