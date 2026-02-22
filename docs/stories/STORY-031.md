# STORY-031 — Tests server actions

**Epic :** Technique
**Priorité :** P2
**Complexité :** M
**Statut :** pending
**Bloquée par :** ["STORY-030"]

## User Story

En tant que développeur, je veux avoir des tests unitaires pour les server actions critiques afin de détecter les régressions lors des modifications futures.

## Contexte technique

- Les server actions (14 fichiers dans `src/app/actions/`) ne sont pas testées actuellement
- `getUserDb()` et `getRequiredUserId()` doivent être mockés via `vi.mock()`
- Cibler les 2 actions les plus critiques : `account-actions.ts` et `budget-actions.ts`
- Pattern à suivre : `vi.mock("@/lib/db", () => ({ getUserDb: vi.fn() }))` + `vi.mock("@/lib/auth-utils", () => ({ getRequiredUserId: vi.fn() }))`
- Les actions utilisent Kysely → mocker `db.insertInto().values().returningAll().executeTakeFirstOrThrow()`

## Fichiers à créer

- `tests/unit/actions/account-actions.test.ts` — tests createAccount, deleteAccount
- `tests/unit/actions/budget-actions.test.ts` — tests createBudget, updateBudget, deleteBudget

## Patterns de mock

```typescript
// Mock DB Kysely
const mockExecuteTakeFirstOrThrow = vi.fn();
const mockDb = {
  insertInto: vi.fn().mockReturnValue({
    values: vi.fn().mockReturnValue({
      returningAll: vi.fn().mockReturnValue({
        executeTakeFirstOrThrow: mockExecuteTakeFirstOrThrow,
      }),
    }),
  }),
  deleteFrom: vi.fn().mockReturnValue({
    where: vi.fn().mockReturnValue({
      execute: vi.fn(),
    }),
  }),
};

// Mock auth
vi.mock("@/lib/auth-utils", () => ({
  getRequiredUserId: vi.fn().mockResolvedValue("user-123"),
}));
```

## Acceptance Criteria

- AC-1 : `createAccount` : crée un compte et revalide `/comptes`
- AC-2 : `deleteAccount` : supprime et retourne `{ success: true }`
- AC-3 : `createBudget` : insère en DB et revalide `/parametres`
- AC-4 : `updateBudget` : met à jour les champs modifiés
- AC-5 : `deleteBudget` : supprime et retourne `{ success: true }`

## Tests à créer

`tests/unit/actions/account-actions.test.ts` (4 tests) :
- TU-1-1 : `createAccount` avec données valides → retourne le compte créé
- TU-1-2 : `createAccount` sans userId → throw ou retourne erreur
- TU-1-3 : `deleteAccount` → appelle deleteFrom et retourne `{ success: true }`
- TU-1-4 : `deleteAccount` avec compte inexistant → gestion d'erreur gracieuse

`tests/unit/actions/budget-actions.test.ts` (4 tests) :
- TU-2-1 : `createBudget` avec données valides → retourne le budget créé
- TU-2-2 : `updateBudget` → appelle updateTable avec les bons champs
- TU-2-3 : `deleteBudget` → retourne `{ success: true }`
- TU-2-4 : Vérification que `revalidatePath` est appelé après chaque mutation

## Estimation : 3 points / 2-3h

