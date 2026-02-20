Plan : Agent IA Conseiller Financier pour BankSolo

 Contexte

 BankSolo est fonctionnel avec 16 features. L'utilisateur veut un agent IA expert en gestion de comptes, crédit conso, surendettement — qui
 guide pour réduire les frais inutiles et épargner avec peu de revenus. L'utilisateur choisit quels comptes l'IA peut analyser. Ton direct, sans
  diplomatie. Provider LLM : OpenRouter.

 ---
 Stack

 - ai (Vercel AI SDK) + @ai-sdk/openai (compatible OpenRouter via baseURL custom)
 - react-markdown pour le rendu des réponses
 - OpenRouter API (https://openrouter.ai/api/v1) — clé stockée en table settings

 Fichiers à créer

 ┌────────────────────────────────────────┬─────────────────────────────────────────────────────┐
 │                Fichier                 │                        Rôle                         │
 ├────────────────────────────────────────┼─────────────────────────────────────────────────────┤
 │ src/app/conseiller/page.tsx            │ Page serveur : charge comptes, clé API              │
 ├────────────────────────────────────────┼─────────────────────────────────────────────────────┤
 │ src/components/ai-chat.tsx             │ Client : interface chat useChat + sélection comptes │
 ├────────────────────────────────────────┼─────────────────────────────────────────────────────┤
 │ src/components/ai-account-selector.tsx │ Client : checkboxes comptes à inclure/exclure       │
 ├────────────────────────────────────────┼─────────────────────────────────────────────────────┤
 │ src/app/api/chat/route.ts              │ Route API streaming + contexte financier            │
 ├────────────────────────────────────────┼─────────────────────────────────────────────────────┤
 │ src/lib/ai-context.ts                  │ Construit le system prompt avec données financières │
 └────────────────────────────────────────┴─────────────────────────────────────────────────────┘

 Fichiers à modifier

 ┌─────────────────────────────────────┬───────────────────────────────┐
 │               Fichier               │         Modification          │
 ├─────────────────────────────────────┼───────────────────────────────┤
 │ src/components/navigation.tsx       │ Ajouter lien "Conseiller IA"  │
 ├─────────────────────────────────────┼───────────────────────────────┤
 │ src/app/parametres/page.tsx         │ Section config clé OpenRouter │
 ├─────────────────────────────────────┼───────────────────────────────┤
 │ src/app/actions/settings-actions.ts │ Action save clé API           │
 └─────────────────────────────────────┴───────────────────────────────┘

 Fonctionnement

 1. Config clé API (Paramètres)

 - Input pour saisir la clé OpenRouter
 - Stockée via setSetting("openrouter_api_key", value) (table settings existante)

 2. Sélection des comptes

 - Checkboxes avec nom + solde de chaque compte
 - Envoyé en body avec les messages à la route API

 3. Contexte financier injecté (system prompt)

 Pour chaque compte sélectionné, ai-context.ts agrège :
 - Solde actuel, devise, seuil alerte
 - Dépenses par catégorie (3 derniers mois)
 - Charges récurrentes actives
 - Résumé mensuel (revenus vs dépenses, tendance)
 - Taux d'épargne calculé

 4. System prompt

 Tu es un conseiller financier expert, spécialisé en gestion budgétaire, crédit consommation et surendettement.
 Tu parles français. Tu es direct, honnête, sans langue de bois.
 Tu analyses les données financières fournies et tu donnes des conseils concrets et actionnables.
 Tu identifies les dépenses superflues, calcules le reste à vivre, et proposes un plan d'épargne réaliste.
 Si la situation est critique, tu le dis clairement.

 5. Route API (/api/chat)

 - Récupère clé OpenRouter depuis settings
 - Charge contexte financier des comptes sélectionnés
 - streamText avec createOpenAI({ baseURL: "https://openrouter.ai/api/v1", apiKey })
 - Modèle : openai/gpt-4o-mini (via OpenRouter, pas cher)

 6. Interface chat

 - Messages scrollables avec markdown
 - Input en bas
 - Sidebar/header avec sélection comptes
 - Message d'accueil si pas de clé API configurée

 Installation

 npm install ai @ai-sdk/openai react-markdown

 Vérification

 - npm run build sans erreur
 - Configurer clé OpenRouter dans Paramètres
 - Ouvrir /conseiller, sélectionner des comptes, poser une question
 - Vérifier le streaming des réponses
 - Vérifier que les comptes non sélectionnés ne sont pas envoyés à l'IA
