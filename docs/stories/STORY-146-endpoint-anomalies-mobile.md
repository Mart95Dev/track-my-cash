# STORY-146 : Endpoint détection d'anomalies pour le mobile

**Sprint :** v18 — Parité Web/Mobile
**Priorité :** P2
**Complexité :** S (2 pts)
**Epic :** parite-endpoints
**Bloqué par :** STORY-139

---

## Contexte

Le web détecte les anomalies de dépenses via `anomaly-detector.ts` (lib pure appelée dans les Server Actions). Le mobile a un écran anomalies mais appelle cette logique localement. Il faut un endpoint pour centraliser.

## Fichiers impactés

**Projet web (track-my-cash) :**
- `src/app/api/mobile/anomalies/route.ts` (NOUVEAU)

## Acceptance Criteria

### AC-1 : Détection d'anomalies

```gherkin
Given un utilisateur avec des transactions
When GET /api/mobile/anomalies?months=3
Then la réponse contient { anomalies: [{ date, amount, category, description, score, avgForCategory }] }
And seules les anomalies significatives (score >= 2.0, montant >= 50) sont retournées
```

### AC-2 : Paramètres optionnels

```gherkin
Given le paramètre account_id est fourni
When GET /api/mobile/anomalies?account_id=5
Then seules les transactions du compte 5 sont analysées
```

## Spécifications de tests

**Fichier :** `tests/unit/api-mobile-anomalies.test.ts`

| ID | Test | Assertion |
|----|------|-----------|
| TU-1 | Retourne les anomalies avec score >= 2.0 | Toutes ont score >= 2.0 |
| TU-2 | Filtre par account_id | Seul le compte spécifié |
| TU-3 | Auth requise | Status 401 sans JWT |
| TU-4 | Retourne tableau vide si pas d'anomalie | `{ anomalies: [] }` |
