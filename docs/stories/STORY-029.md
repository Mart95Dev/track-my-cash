# STORY-029 — En-têtes sécurité HTTP

**Epic :** Technique
**Priorité :** P1
**Complexité :** XS
**Statut :** pending
**Bloquée par :** []

## User Story

En tant qu'administrateur, je veux que l'application envoie des en-têtes HTTP de sécurité appropriés afin de protéger les utilisateurs contre les attaques XSS, clickjacking et autres vecteurs courants.

## Contexte technique

- `next.config.ts` : pas d'en-têtes HTTP configurés actuellement
- Next.js supporte les headers via `headers()` dans `nextConfig`
- En-têtes à ajouter : `X-Frame-Options`, `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy`, `X-DNS-Prefetch-Control`
- CSP minimal pour éviter de casser l'app (unsafe-inline temporaire pour les styles Tailwind)

## Fichiers à modifier

- `next.config.ts` — ajouter la fonction `headers()` avec les en-têtes de sécurité

## En-têtes à configurer

```typescript
headers: async () => [
  {
    source: "/(.*)",
    headers: [
      { key: "X-Frame-Options", value: "DENY" },
      { key: "X-Content-Type-Options", value: "nosniff" },
      { key: "X-DNS-Prefetch-Control", value: "on" },
      { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
      { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
    ],
  },
]
```

## Acceptance Criteria

- AC-1 : `X-Frame-Options: DENY` présent sur toutes les routes
- AC-2 : `X-Content-Type-Options: nosniff` présent
- AC-3 : `Referrer-Policy: strict-origin-when-cross-origin` présent
- AC-4 : `Permissions-Policy` désactive caméra, micro et géolocalisation
- AC-5 : `X-DNS-Prefetch-Control: on` présent
- AC-6 : L'application fonctionne normalement après ajout des en-têtes (pas de régression)

## Tests à créer

`tests/unit/config/security-headers.test.ts` (3 tests) :
- TU-1-1 : Vérifier que la config next.config exporte bien une fonction `headers`
- TU-1-2 : La liste des headers inclut `X-Frame-Options` avec valeur `DENY`
- TU-1-3 : La liste des headers inclut `X-Content-Type-Options` avec valeur `nosniff`

## Estimation : 1 point / 30min

