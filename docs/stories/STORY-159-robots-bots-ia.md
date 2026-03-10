# STORY-159 — Robots.txt — Autoriser les bots IA

**Epic :** SEO/GEO
**Priorité :** P0 (Must Have)
**Complexité :** S (2 pts)
**Blocked By :** —

## Description

Enrichir `src/app/robots.ts` pour autoriser explicitement les 5 bots IA majeurs (GPTBot, ChatGPT-User, PerplexityBot, ClaudeBot, anthropic-ai, Google-Extended) et bloquer Bytespider. Conserver toutes les règles existantes.

## Fichiers à modifier

- `src/app/robots.ts`
- `tests/unit/seo/robots.test.ts` (mise à jour)

## Critères d'acceptation

- **AC-1:** Règles explicites `Allow: /` pour GPTBot, ChatGPT-User, PerplexityBot, ClaudeBot, anthropic-ai, Google-Extended
- **AC-2:** Bytespider a `Disallow: /`
- **AC-3:** Les règles existantes (wildcard `*`, disallow app pages, disallow `/api/`) sont conservées
- **AC-4:** Le champ `sitemap` pointe vers `{baseUrl}/sitemap.xml`

## Spécifications de tests

### Tests unitaires — `tests/unit/seo/robots.test.ts`

| ID | Test | Assertion |
|----|------|-----------|
| TU-1 | Les bots IA ont des règles Allow | `rules` contient des entrées pour GPTBot, PerplexityBot, ClaudeBot avec `allow: "/"` |
| TU-2 | Bytespider est bloqué | `rules` contient une entrée Bytespider avec `disallow: "/"` |
| TU-3 | Les règles wildcard sont conservées | Règle `userAgent: "*"` avec les disallow existants |
| TU-4 | Le sitemap est référencé | `sitemap` contient `/sitemap.xml` |
| TU-5 | Les pages app sont interdites | Disallow contient `/*/dashboard`, `/*/comptes`, etc. |
