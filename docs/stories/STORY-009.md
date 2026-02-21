# STORY-009 — Navbar + Footer publics

**Epic :** Landing Page Marketing
**Priorité :** P0
**Complexité :** S
**Statut :** pending
**Bloquée par :** aucune

---

## User Story

En tant que visiteur non authentifié,
je veux trouver une navigation claire sur toutes les pages publiques,
afin de pouvoir naviguer vers les fonctionnalités, les tarifs, et m'inscrire sans me perdre.

---

## Contexte technique

- Le layout `(marketing)/layout.tsx` existe mais est minimal (`min-h-screen bg-background` seulement)
- Aucune navbar ni footer n'est implémenté pour le groupe `(marketing)`
- Les pages `/tarifs`, `/connexion`, `/inscription` existent déjà
- Les liens doivent utiliser `<Link>` de `@/i18n/navigation` pour le routing i18n
- shadcn/ui disponible : `Sheet`, `Button`, `Separator`

---

## Acceptance Criteria

- [ ] AC-1 : La Navbar s'affiche sur toutes les pages du groupe `(marketing)`
- [ ] AC-2 : La Navbar contient : logo "TrackMyCash", liens (Fonctionnalités, Tarifs), bouton Connexion, bouton "Commencer" (CTA primaire vers `/inscription`)
- [ ] AC-3 : Sur mobile (< 768px), un bouton hamburger ouvre un menu lateral (Sheet)
- [ ] AC-4 : Le Footer contient : copyright, liens (CGU, Politique de confidentialité, Contact)
- [ ] AC-5 : Tous les liens utilisent `<Link>` de `@/i18n/navigation` (pas `<a href>` vanilla)
- [ ] AC-6 : La Navbar est sticky (reste visible au scroll)
- [ ] AC-7 : Le bouton Connexion utilise `variant="outline"`, le CTA "Commencer" utilise `variant="default"`

---

## Fichiers à créer / modifier

| Fichier | Action |
|---------|--------|
| `src/components/marketing/navbar.tsx` | Créer — composant Navbar avec `"use client"` (pour state mobile menu) |
| `src/components/marketing/footer.tsx` | Créer — composant Footer (Server Component) |
| `src/app/[locale]/(marketing)/layout.tsx` | Modifier — intégrer Navbar + Footer |

---

## Tests unitaires

### TU-1 : Navbar — structure des liens
**Fichier :** `tests/unit/marketing/navbar.test.tsx`
**Fonction :** Rendu du composant Navbar

```
TU-1-1 : La Navbar contient un lien vers "/tarifs"
TU-1-2 : La Navbar contient un bouton "Commencer" avec lien vers "/inscription"
TU-1-3 : La Navbar contient un bouton "Connexion" avec lien vers "/connexion"
TU-1-4 : Le logo "TrackMyCash" est présent
```

### TU-2 : Footer — structure
**Fichier :** `tests/unit/marketing/footer.test.tsx`

```
TU-2-1 : Le Footer contient "©" et l'année courante
TU-2-2 : Le Footer contient un lien "CGU"
TU-2-3 : Le Footer contient un lien "Politique de confidentialité"
```

---

## Fixtures / données de test

Aucune fixture requise — tests de rendu de composants statiques.

---

## Estimation

**Points :** 2
**Durée estimée :** 1-2h
