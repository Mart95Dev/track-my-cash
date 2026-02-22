# STORY-053 — Suivi utilisation IA (ai_usage + décompte UI)

**Sprint :** Production SaaS & Croissance (v8)
**Épique :** monetization
**Priorité :** P1
**Complexité :** S (2 points)
**Statut :** pending
**Bloqué par :** —

---

## Description

Le plan Pro est limité à 10 conversations IA par mois, mais ce quota n'est pas suivi en base de données. Actuellement, le guard `canUseAI()` vérifie seulement le plan — il faut ajouter le tracking réel. Cette story crée la table `ai_usage` dans la DB principale, incrémente le compteur à chaque appel au chat, et affiche le quota dans `/parametres`.

**Règles métier :**
- Free : 0 conv/mois (IA bloquée)
- Pro : 10 conv/mois (quota suivi)
- Premium : illimité (pas de comptage)

---

## Acceptance Criteria

- **AC-1 :** Table `ai_usage (user_id TEXT, month TEXT, count INTEGER DEFAULT 0, PRIMARY KEY(user_id, month))` créée dans la DB principale via migration
- **AC-2 :** Chaque appel réussi à `/api/chat` incrémente `ai_usage` pour `(userId, YYYY-MM)` courant
- **AC-3 :** `canUseAI(userId)` retourne `{ allowed: false, reason: "Limite 10/mois atteinte" }` si count >= 10 (Pro uniquement)
- **AC-4 :** Dans `/parametres`, section IA affiche "X/10 conversations ce mois" pour Pro, "Illimité" pour Premium
- **AC-5 :** L'incrément est fire-and-forget (n'affecte pas la réponse du chat en cas d'erreur)

---

## Fichiers à créer / modifier

| Fichier | Action |
|---------|--------|
| `src/lib/db.ts` | MODIFIER — migration : `CREATE TABLE IF NOT EXISTS ai_usage` |
| `src/lib/ai-usage.ts` | CRÉER — `incrementAiUsage()`, `getAiUsageCount()`, `checkAiLimit()` |
| `src/app/api/chat/route.ts` | MODIFIER — appel fire-and-forget `incrementAiUsage()` + guard quota |
| `src/app/[locale]/(app)/parametres/page.tsx` | MODIFIER — afficher le compteur IA |
| `tests/unit/lib/ai-usage.test.ts` | CRÉER — tests unitaires |

---

## Tests unitaires (TU-x)

**Fichier :** `tests/unit/lib/ai-usage.test.ts`

### Données de test

```typescript
const mockDb = { execute: vi.fn() } as unknown as import("@libsql/client").Client;

const MONTH_NOW = new Date().toISOString().slice(0, 7); // "YYYY-MM"
```

### Cas de test

| ID | Description | Résultat attendu |
|----|-------------|-----------------|
| TU-53-1 | `getAiUsageCount()` — aucun enregistrement ce mois | retourne 0 |
| TU-53-2 | `getAiUsageCount()` — enregistrement avec count = 7 | retourne 7 |
| TU-53-3 | `checkAiLimit("pro", 9)` — count = 9 < 10 | `{ allowed: true }` |
| TU-53-4 | `checkAiLimit("pro", 10)` — quota atteint | `{ allowed: false, reason: string }` |
| TU-53-5 | `checkAiLimit("premium", 999)` — illimité | `{ allowed: true }` toujours |

---

## Mapping AC → Tests

| AC | Tests couvrant |
|----|---------------|
| AC-1 | Migration DB (vérifiée par TU-53-1 qui utilise le schéma) |
| AC-2 | Intégration `/api/chat` (fire-and-forget) |
| AC-3 | TU-53-4 |
| AC-4 | Intégration UI /parametres |
| AC-5 | Pattern fire-and-forget dans route.ts |

---

## Interface TypeScript

```typescript
// src/lib/ai-usage.ts

export async function incrementAiUsage(
  mainDb: Client,
  userId: string,
  month: string  // "YYYY-MM"
): Promise<void>

export async function getAiUsageCount(
  mainDb: Client,
  userId: string,
  month: string
): Promise<number>

export function checkAiLimit(
  plan: "free" | "pro" | "premium",
  currentCount: number
): { allowed: boolean; reason?: string }
```

---

## Notes d'implémentation

- `ai_usage` est dans la DB **principale** (Turso main, pas user DB)
- SQL upsert : `INSERT INTO ai_usage (user_id, month, count) VALUES (?, ?, 1) ON CONFLICT(user_id, month) DO UPDATE SET count = count + 1`
- Dans `/api/chat` : appeler `incrementAiUsage(mainDb, userId, month).catch(() => {})` après la réponse IA
- Le guard dans `subscription-utils.ts` doit être mis à jour pour appeler `getAiUsageCount` + `checkAiLimit`
- La migration `CREATE TABLE IF NOT EXISTS ai_usage` est ajoutée dans le tableau `migrations[]` de `db.ts`
