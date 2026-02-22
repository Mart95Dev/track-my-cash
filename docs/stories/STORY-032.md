# STORY-032 — Cache devises persisté en base

**Epic :** Technique
**Priorité :** P2
**Complexité :** S
**Statut :** pending
**Bloquée par :** ["STORY-031"]

## User Story

En tant qu'utilisateur, je veux que les taux de change soient persistés en base de données afin que l'application dispose toujours d'un fallback précis même si l'API externe est indisponible au redémarrage du serveur.

## Contexte technique

- `src/lib/currency.ts` : cache in-memory `_ratesCache` (1h) — perdu au redémarrage Vercel
- En cas d'échec API, fallback = valeurs codées en dur (MGA: 5000, USD: 1.08, etc.)
- `getSetting(db, "exchange_rate_eur_mga")` existe déjà pour MGA
- À étendre : persister TOUS les taux supportés sous forme `exchange_rates_cache` (JSON)
- `setSetting(db, key, value)` existe dans `src/lib/queries.ts`

## Fichiers à modifier

- `src/lib/currency.ts` — après fetch réussi, persister les taux en DB
- `src/lib/queries.ts` — vérifier/ajouter `setSetting(db, key, value)` si absent

## Logique

```typescript
// Dans getAllRates(), après fetch réussi :
if (db && Object.keys(rates).length > 0) {
  try {
    await setSetting(db, "exchange_rates_cache", JSON.stringify({
      rates,
      cachedAt: new Date().toISOString(),
    }));
  } catch { /* ignore — non critique */ }
}

// Dans le fallback (catch), avant les valeurs codées en dur :
if (db) {
  const cached = await getSetting(db, "exchange_rates_cache");
  if (cached) {
    const parsed = JSON.parse(cached) as { rates: Record<string, number> };
    if (parsed.rates) return parsed.rates;
  }
}
```

## Acceptance Criteria

- AC-1 : Après un fetch réussi, les taux sont sauvegardés dans `settings` (clé `exchange_rates_cache`)
- AC-2 : Si l'API échoue et que la DB contient des taux sauvegardés → utiliser les taux DB
- AC-3 : Si ni API ni DB ne répondent → fallback sur les valeurs codées en dur
- AC-4 : La sauvegarde en DB est fire-and-forget (erreur silencieuse)
- AC-5 : Les taux MGA spécifiques (`exchange_rate_eur_mga`) restent rétro-compatibles

## Tests à créer

`tests/unit/lib/currency-cache.test.ts` (5 tests) :
- TU-1-1 : Fetch réussi + db fourni → `setSetting` appelé avec `exchange_rates_cache`
- TU-1-2 : Fetch réussi sans db → `setSetting` non appelé (pas d'erreur)
- TU-1-3 : Fetch échoue + db avec cache → retourne les taux du cache DB
- TU-1-4 : Fetch échoue + db sans cache → retourne les valeurs codées en dur
- TU-1-5 : `setSetting` qui échoue → erreur silencieuse, getAllRates retourne quand même les taux

## Estimation : 2 points / 1-2h

