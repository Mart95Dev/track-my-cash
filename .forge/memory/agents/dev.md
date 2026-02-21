# Contexte Dev Agent — track-my-cash

## Patterns récurrents

- Toujours utiliser des Server Actions pour les mutations
- Appeler `revalidatePath('/')` après chaque mutation
- Kysely pour toutes les requêtes SQL (pas de SQL brut sauf cas spéciaux)
- shadcn/ui pour tous les composants UI
- Tailwind CSS v4 pour le styling (pas de dégradés)

## Fichiers clés

- `src/lib/db.ts` — connexion base de données
- `src/lib/queries.ts` — requêtes Kysely
- `src/lib/format.ts` — formatage monétaire
- `src/app/actions/` — Server Actions par domaine

## Types importants

- Pas de `any` — toujours typer correctement
- Préférer les types inférés de Kysely

## Dernières implémentations

_À remplir par le Dev Agent lors des sessions_
