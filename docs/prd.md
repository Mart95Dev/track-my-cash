# PRD — Améliorations track-my-cash (Sprint Qualité & Finitions)

**Version :** 1.0
**Date :** 2026-02-21
**Statut :** Validé
**Périmètre :** Post-SaaS — bugs critiques, fonctionnalités incomplètes, qualité

---

## Contexte

Le plan SaaS (phases 0.5→5) a été entièrement implémenté :
- ✅ i18n next-intl (5 langues : FR, EN, ES, IT, DE)
- ✅ Authentification better-auth
- ✅ Multi-tenant Turso DB-per-user
- ✅ Registre de parsers extensible (pdf-parse)
- ✅ Multi-devises généralisé (getAllRates, convertToReference)
- ✅ Conseiller IA multi-modèles (GPT-4o mini, Claude Haiku, Gemini Flash, Llama)
- ✅ Stripe subscriptions (checkout, webhooks, plans Free/Pro/Premium)
- ✅ Guards freemium (canCreateAccount, canUseAI, canImportFormat)
- ✅ Préparation déploiement Vercel

L'analyse post-implémentation a révélé **3 bugs critiques production-bloquants** et **4 fonctionnalités incomplètes** qui dégradent l'expérience utilisateur.

---

## Objectifs de ce sprint

1. **Corriger les bugs critiques** qui cassent l'expérience multilingue et Stripe
2. **Compléter les fonctionnalités incomplètes** qui créent des dead-ends UX
3. **Optimiser les performances** des requêtes N+1 identifiées
4. **Corriger la documentation** erronée dans CLAUDE.md

---

## Périmètre — Stories prioritisées

### P0 — Bugs critiques (bloquants en production)

#### BUG-001 : formatCurrency/formatDate ignorent la locale active

**Problème :** `src/lib/format.ts` est hardcodé `fr-FR` sur toutes ses fonctions, ce qui ignore la locale sélectionnée par l'utilisateur (EN, ES, IT, DE). Un utilisateur anglophone voit les dates et montants en format français.

**Fichiers concernés :**
- `src/lib/format.ts` → `formatCurrency()`, `formatDate()`
- `src/lib/ai-context.ts` → `toLocaleString("fr-FR")`
- `src/lib/queries.ts` lignes 283 et 597 → `toLocaleDateString("fr-FR")`

**Fix attendu :** Accepter un paramètre `locale?: string` optionnel (défaut `"fr-FR"`) pour toutes les fonctions de formatage. Les appelants passent la locale depuis `useLocale()` (client) ou `getLocale()` (server).

---

#### BUG-002 : Redirections Stripe hardcodées `/fr/`

**Problème :**
```typescript
// src/app/api/stripe/checkout/route.ts
success_url: `${origin}/fr/parametres?tab=billing&success=true` // ← hardcodé /fr/
cancel_url: `${origin}/fr/tarifs`

// src/app/actions/billing-actions.ts
return_url: `${origin}/fr/parametres?tab=billing` // ← hardcodé /fr/
```

Un utilisateur avec la locale `/en/` est redirigé vers `/fr/` après paiement → expérience cassée.

**Fix attendu :** Extraire la locale depuis le header `x-forwarded-host` ou la passer en paramètre dans le body de la requête.

---

#### BUG-003 : Dashboard utilise l'ancienne logique EUR/MGA

**Problème :** `src/app/[locale]/(app)/page.tsx` utilise encore `getExchangeRate()` (taux unique EUR→MGA) alors que `getAllRates()` + `convertToReference()` sont disponibles depuis la phase 2.5. Les comptes en USD, GBP, CHF ne sont pas correctement convertis dans le total.

**Fix attendu :** Migrer le dashboard vers `getAllRates()` + `convertToReference()` avec la `reference_currency` de l'utilisateur (depuis `settings`).

---

### P1 — Fonctionnalités incomplètes

#### FEAT-001 : UI Tags dans la page Transactions

**Problème :** Les tables `tags` et `transaction_tags` existent, les Server Actions (`tag-actions.ts`) sont complètes, mais aucune UI dans la page `/transactions` ne permet de tagger ou visualiser les tags des transactions. Les tags sont configurables dans Paramètres mais invisibles ailleurs → dead-end UX.

**Fonctionnalité attendue :**
- Afficher les tags d'une transaction dans la colonne Description (badges colorés)
- Permettre d'assigner/retirer des tags via un popover sur chaque ligne
- Filtrer les transactions par tag (filtre additionnel dans la barre de filtres)

**Composants shadcn/ui à utiliser :** Badge, Popover, Command (multi-select), Checkbox

---

#### FEAT-002 : Bouton "Gérer mon abonnement" (Stripe Portal)

**Problème :** `createBillingPortalSession()` est implémenté dans `billing-actions.ts` mais aucun point d'entrée UI n'appelle cette action. L'utilisateur ne peut pas gérer son abonnement (annulation, changement de carte, factures) depuis l'interface.

**Fonctionnalité attendue :**
- Dans `/parametres` (onglet Abonnement) : bouton "Gérer mon abonnement" qui appelle `createBillingPortalSession()` et redirige vers le portail Stripe
- Afficher le plan actuel, la date de renouvellement, et le bouton si l'utilisateur a un abonnement actif

---

#### FEAT-003 : Restauration complète dans importAllData

**Problème :** `importAllData` (backup/restauration JSON) ignore `subcategory` et `reconciled` des transactions lors de l'import. Ces champs sont présents dans l'export mais perdus à la restauration.

**Fix attendu :** Inclure `subcategory` et `reconciled` dans le INSERT de la restauration.

---

#### FEAT-004 : Webhook Stripe — utiliser getDb() au lieu d'une connexion inline

**Problème :**
```typescript
// src/app/api/stripe/webhook/route.ts
// Crée un nouveau client libsql inline au lieu d'utiliser getDb()
const db = createClient({ url: process.env.TURSO_DATABASE_URL!, authToken: process.env.TURSO_AUTH_TOKEN! });
```

Incohérence architecturale et doublon de configuration. Doit utiliser `getDb()` comme partout ailleurs.

---

### P2 — Optimisations qualité

#### PERF-001 : checkDuplicates N+1 → WHERE IN

**Problème :**
```typescript
// N requêtes séquentielles au lieu d'une seule
for (const hash of hashes) {
  await db.execute({ sql: "SELECT ... WHERE import_hash = ?", args: [hash] });
}
```

**Fix attendu :** `SELECT import_hash FROM transactions WHERE import_hash IN (?, ?, ?)` — une seule requête pour N hashes.

---

#### DOC-001 : Corriger CLAUDE.md (informations erronées)

**Problème :** `CLAUDE.md` contient des informations qui ne correspondent plus à la réalité du projet :
- Mentionne `better-sqlite3` → l'app utilise `@libsql/client` (Turso)
- Décrit les fonctions de `queries.ts` comme "synchrones" → elles sont asynchrones
- Mentionne `serverExternalPackages: ["better-sqlite3"]` → c'est `["pdf-parse"]`
- Ne mentionne pas : Kysely, better-auth, Stripe, next-intl

---

## Critères de succès global

- [ ] `formatCurrency("fr")` et `formatCurrency("en")` produisent des sorties différentes
- [ ] Après paiement Stripe depuis `/en/tarifs`, l'utilisateur est redirigé vers `/en/parametres`
- [ ] Le total du dashboard convertit correctement USD, GBP, CHF → devise de référence
- [ ] Un utilisateur peut tagger une transaction et filtrer par tag
- [ ] Un utilisateur Pro peut cliquer "Gérer mon abonnement" et accéder au portail Stripe
- [ ] Restaurer un backup JSON préserve les champs `subcategory` et `reconciled`
- [ ] L'import de 1000 transactions avec doublons fait 1 requête SQL au lieu de N

---

## Hors scope

- Landing page marketing (phase suivante)
- Backoffice admin (phase suivante)
- Emails transactionnels Resend (phase suivante)
- Nouveaux parsers bancaires V2 (roadmap)
- Suppression compte RGPD (phase suivante)
