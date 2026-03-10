# STORY-145 : Endpoints settings et règles de catégorisation pour le mobile

**Sprint :** v18 — Parité Web/Mobile
**Priorité :** P1
**Complexité :** S (3 pts)
**Epic :** parite-endpoints
**Bloqué par :** STORY-139

---

## Contexte

Le mobile a un écran de règles de catégorisation (categorization-rules.tsx) mais fonctionne en local state uniquement. Les règles ne sont pas persistées côté serveur. De même, les paramètres utilisateur (thème, devise, préférences email) n'ont pas d'endpoint dédié.

## Fichiers impactés

**Projet web (track-my-cash) :**
- `src/app/api/mobile/settings/route.ts` (NOUVEAU) — GET/PUT settings
- `src/app/api/mobile/categorization-rules/route.ts` (NOUVEAU) — GET/POST
- `src/app/api/mobile/categorization-rules/[id]/route.ts` (NOUVEAU) — DELETE

## Acceptance Criteria

### AC-1 : Lecture des settings

```gherkin
Given un utilisateur authentifié
When GET /api/mobile/settings
Then la réponse contient toutes les paires clé/valeur de la table settings
And le format est { settings: { theme: "dark", currency: "EUR", ... } }
```

### AC-2 : Modification des settings

```gherkin
Given un utilisateur authentifié
When PUT /api/mobile/settings avec { key: "theme", value: "dark" }
Then le setting est upsert dans la per-user DB
And la réponse est 200 { success: true }
```

### AC-3 : Liste des règles de catégorisation

```gherkin
Given un utilisateur avec des règles existantes
When GET /api/mobile/categorization-rules
Then la réponse contient { rules: [{ id, pattern, category, priority }] }
And les règles sont triées par priority DESC
```

### AC-4 : Création d'une règle

```gherkin
Given un utilisateur authentifié
When POST /api/mobile/categorization-rules avec { pattern: "CARREFOUR", category: "Alimentation", priority: 10 }
Then la règle est créée dans la per-user DB
And la réponse est 201 avec la règle créée
```

### AC-5 : Suppression d'une règle

```gherkin
Given une règle existante avec id=5
When DELETE /api/mobile/categorization-rules/5
Then la règle est supprimée
And la réponse est 204
```

## Spécifications de tests

**Fichier :** `tests/unit/api-mobile-settings.test.ts`

| ID | Test | Assertion |
|----|------|-----------|
| TU-1 | GET settings retourne les paires clé/valeur | JSON avec settings object |
| TU-2 | PUT settings upsert une valeur | setSetting appelé |
| TU-3 | GET rules retourne les règles triées | Tableau trié par priority |
| TU-4 | POST rules crée une règle | Status 201, règle retournée |
| TU-5 | DELETE rules/[id] supprime la règle | Status 204 |
| TU-6 | Auth requise sur tous les endpoints | Status 401 sans JWT |
