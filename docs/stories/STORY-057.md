# STORY-057 — Pages d'erreur 404/500 personnalisées

**Sprint :** Production SaaS & Croissance (v8)
**Épique :** ux-polish
**Priorité :** P2
**Complexité :** S (2 points)
**Statut :** pending
**Bloqué par :** —

---

## Description

Next.js affiche des pages génériques pour les erreurs 404 et 500. Un SaaS professionnel doit avoir des pages d'erreur cohérentes avec son design. Cette story crée une page `not-found.tsx` avec lien retour dashboard, et une `error.tsx` (boundary) avec bouton "Réessayer". Les textes sont traduits via next-intl.

---

## Acceptance Criteria

- **AC-1 :** `src/app/[locale]/not-found.tsx` — page 404 avec icône, message, lien dashboard et lien accueil
- **AC-2 :** `src/app/[locale]/(app)/error.tsx` — boundary d'erreur avec bouton `reset()` ("Réessayer")
- **AC-3 :** Les 2 pages utilisent le design shadcn/ui sans CSS custom (Card, Button)
- **AC-4 :** Les textes passent par `useTranslations("errors")` (nouvelles clés à ajouter dans `messages/fr.json`)
- **AC-5 :** `src/app/not-found.tsx` créé comme fallback global (hors locale, redirige vers `/fr/not-found`)

---

## Fichiers à créer / modifier

| Fichier | Action |
|---------|--------|
| `src/app/[locale]/not-found.tsx` | CRÉER — page 404 avec locale |
| `src/app/[locale]/(app)/error.tsx` | CRÉER — error boundary app |
| `src/app/not-found.tsx` | CRÉER — fallback global |
| `messages/fr.json` | MODIFIER — ajouter clé `"errors": { "404_title": ..., "404_desc": ..., "500_title": ..., "retry": ... }` |
| `messages/en.json` | MODIFIER — traduction anglaise des clés errors |
| `tests/unit/components/error-pages.test.tsx` | CRÉER — tests unitaires |

---

## Tests unitaires (TU-x)

**Fichier :** `tests/unit/components/error-pages.test.tsx`

### Cas de test

| ID | Description | Résultat attendu |
|----|-------------|-----------------|
| TU-57-1 | `<NotFoundPage />` rend sans erreur | Pas de throw |
| TU-57-2 | `<NotFoundPage />` contient un lien vers `/` | `getByRole("link", { name: /accueil/i })` présent |
| TU-57-3 | `<ErrorPage error={new Error("test")} reset={mockReset} />` rend sans erreur | Pas de throw |
| TU-57-4 | Clic sur "Réessayer" dans `<ErrorPage />` appelle `reset()` | `mockReset` appelé 1 fois |

---

## Mapping AC → Tests

| AC | Tests couvrant |
|----|---------------|
| AC-1 | TU-57-1 + TU-57-2 |
| AC-2 | TU-57-3 + TU-57-4 |
| AC-3 | Revue design |
| AC-4 | Intégration next-intl (useTranslations mock) |
| AC-5 | Structure fichiers |

---

## Interface TypeScript

```typescript
// src/app/[locale]/(app)/error.tsx — interface Next.js obligatoire
"use client";

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}): JSX.Element
```

---

## Notes d'implémentation

- `not-found.tsx` : Server Component (pas de `"use client"`)
- `error.tsx` : doit être un Client Component (`"use client"`) — c'est une exigence Next.js
- Icônes recommandées : `SearchX` (404) et `AlertTriangle` (500) de lucide-react
- Structure 404 :
  ```tsx
  <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-4 text-center">
    <SearchX className="h-16 w-16 text-muted-foreground" />
    <h1 className="text-4xl font-bold">404</h1>
    <p className="text-muted-foreground">{t("404_desc")}</p>
    <div className="flex gap-4">
      <Button asChild><Link href="/">{t("home")}</Link></Button>
    </div>
  </div>
  ```
- Le fallback `src/app/not-found.tsx` peut simplement rediriger vers `/fr` (page 404 locale par défaut)
- Nouvelles clés i18n à ajouter dans fr.json + en.json (les 3 autres langues peuvent utiliser en.json par défaut)
