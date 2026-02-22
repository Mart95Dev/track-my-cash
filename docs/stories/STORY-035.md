# STORY-035 — PWA installable (manifest + install prompt)

**Sprint :** Sprint Objectifs & Intelligence
**Priorité :** P2
**Complexité :** S (2 points)
**Bloquée par :** —
**Statut :** pending

---

## Description

L'application n'est pas installable sur mobile ni sur desktop. Ajouter un fichier `manifest.json` et un composant "installer l'application" permet aux utilisateurs de lancer track-my-cash depuis leur écran d'accueil, améliorant le taux de rétention mobile.

---

## Contexte technique

- Next.js 16 supporte `app/manifest.ts` (API native) ou `/public/manifest.json`
- Utiliser `app/manifest.ts` pour la génération dynamique via Next.js
- Icônes : créer `icon-192.png` et `icon-512.png` dans `/public/icons/`
- Le composant d'install prompt utilise l'événement `beforeinstallprompt`
- L'app doit être servie en HTTPS pour que PWA fonctionne (Vercel = OK)

---

## Acceptance Criteria

**AC-1 :** Un fichier `manifest.webmanifest` est accessible à `/manifest.webmanifest` et contient `name`, `short_name`, `start_url`, `display: "standalone"`, `theme_color`, `background_color`, `icons`

**AC-2 :** Les balises `<link rel="manifest">`, `<meta name="theme-color">` et `<meta name="apple-mobile-web-app-capable">` sont dans le `<head>` de l'app

**AC-3 :** Les icônes 192×192 et 512×512 existent dans `/public/icons/`

**AC-4 :** Un composant `PwaInstallBanner` s'affiche dans la sidebar app après 30 secondes si l'app n'est pas déjà installée (événement `beforeinstallprompt`)

**AC-5 :** Le banner disparaît si l'utilisateur clique "Installer" ou "Plus tard" (localStorage pour mémoriser le refus)

**AC-6 :** Sur iOS Safari, une instruction "Ajouter à l'écran d'accueil" est affichée (détection `navigator.userAgent`)

---

## Spécifications techniques

### `src/app/manifest.ts` — à créer

```typescript
import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "track-my-cash",
    short_name: "TrackMyCash",
    description: "Gérez vos comptes bancaires personnels",
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#0f172a",
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
  };
}
```

### `src/app/[locale]/(app)/layout.tsx` — modifications

Ajouter dans `<head>` via metadata :
```typescript
export const metadata: Metadata = {
  // ...existant
  appleWebApp: { capable: true, statusBarStyle: "default", title: "TrackMyCash" },
};
```

### `src/components/pwa-install-banner.tsx` — à créer

```typescript
"use client";
// Hook usePwaInstall() : détecte beforeinstallprompt, mémorise le prompt
// Affiche après 30s un Banner discret en bas de la sidebar
// Bouton "Installer" → appelle prompt.prompt()
// Bouton "Plus tard" → localStorage.setItem("pwa_dismissed", "true"), disparaît 7j
```

### Icônes

Créer 2 fichiers SVG → PNG dans `/public/icons/` :
- `icon-192.png` — 192×192px, logo track-my-cash simplifié (lettre "T" stylisée)
- `icon-512.png` — 512×512px

---

## Tests unitaires à créer

**Fichier :** `tests/unit/pwa/manifest.test.ts`

**TU-1-1 :** Le manifest contient `display: "standalone"`
**TU-1-2 :** Le manifest contient 2 icônes (192 et 512)
**TU-1-3 :** Le `start_url` est `/`
**TU-1-4 :** `theme_color` est défini et non vide
**TU-1-5 :** Les icônes existent dans `/public/icons/` (test filesystem)

---

## Fichiers à créer/modifier

- `src/app/manifest.ts` — créer
- `src/components/pwa-install-banner.tsx` — créer
- `src/app/[locale]/(app)/layout.tsx` — ajouter metadata PWA + `<PwaInstallBanner />`
- `public/icons/icon-192.png` — créer (SVG inline converti ou placeholder)
- `public/icons/icon-512.png` — créer
- `tests/unit/pwa/manifest.test.ts` — créer (5 tests)
