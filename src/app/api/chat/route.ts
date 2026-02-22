import { streamText, generateText, convertToModelMessages, stepCountIs, type UIMessage } from "ai";
import { createOpenAI } from "@ai-sdk/openai";
import { NextResponse } from "next/server";
import { getAllAccounts } from "@/lib/queries";
import { getUserDb, getDb } from "@/lib/db";
import { getRequiredUserId } from "@/lib/auth-utils";
import { canUseAI, getUserPlanId } from "@/lib/subscription-utils";
import { incrementAiUsage } from "@/lib/ai-usage";
import { buildFinancialContext, SYSTEM_PROMPT } from "@/lib/ai-context";
import { checkRateLimit } from "@/lib/rate-limiter";
import { createAiTools } from "@/lib/ai-tools";
import { buildSynthesisPrompt, synthesizeResponses, type ConsensusSynthesis } from "@/lib/ai-consensus";

const RATE_LIMIT = 30;
const RATE_WINDOW_MS = 60 * 60 * 1000; // 1 heure

export const maxDuration = 30;

const ALLOWED_MODELS = [
  "openai/gpt-4o-mini",
  "anthropic/claude-haiku-20240307",
  "google/gemini-flash-1.5",
  "meta-llama/llama-3.1-8b-instruct:free",
] as const;

const CONSENSUS_MODELS = [
  "anthropic/claude-sonnet-4-6",
  "google/gemini-2.0-flash",
  "openai/gpt-4o-mini",
] as const;

const HAIKU_MODEL = "anthropic/claude-haiku-4-5-20251001";

type AllowedModel = (typeof ALLOWED_MODELS)[number];

export async function POST(req: Request) {
  const {
    messages,
    accountIds,
    modelId,
    consensusMode,
  }: {
    messages: UIMessage[];
    accountIds: number[];
    modelId?: string;
    consensusMode?: boolean;
  } = await req.json();

  const selectedModel: AllowedModel = ALLOWED_MODELS.includes(
    modelId as AllowedModel
  )
    ? (modelId as AllowedModel)
    : "openai/gpt-4o-mini";

  const userId = await getRequiredUserId();

  // Rate limiting : 30 requêtes / heure par userId
  const rateLimit = checkRateLimit(userId, RATE_LIMIT, RATE_WINDOW_MS);
  if (!rateLimit.allowed) {
    const resetInMin = Math.ceil((rateLimit.resetAt - Date.now()) / 60000);
    return new Response(
      JSON.stringify({
        error: `Limite atteinte. Réessayez dans ${resetInMin} minute${resetInMin > 1 ? "s" : ""}.`,
      }),
      {
        status: 429,
        headers: {
          "Content-Type": "application/json",
          "X-RateLimit-Remaining": "0",
        },
      }
    );
  }

  // Guard IA : vérifier que le plan autorise l'accès au conseiller IA
  const aiCheck = await canUseAI(userId);
  if (!aiCheck.allowed) {
    return new Response(JSON.stringify({ error: aiCheck.reason }), {
      status: 403,
      headers: { "Content-Type": "application/json" },
    });
  }

  const apiKey = process.env.API_KEY_OPENROUTER;
  if (!apiKey) {
    return new Response(
      JSON.stringify({ error: "Clé API OpenRouter non configurée" }),
      {
        status: 400,
        headers: { "Content-Type": "application/json" },
      }
    );
  }

  const db = await getUserDb(userId);

  const openrouter = createOpenAI({
    baseURL: "https://openrouter.ai/api/v1",
    apiKey,
  });

  // Charger les comptes sélectionnés
  const allAccounts = await getAllAccounts(db);
  const selectedAccounts = allAccounts.filter((a) =>
    accountIds.includes(a.id)
  );

  // Construire le contexte financier
  let financialContext = "";
  if (selectedAccounts.length > 0) {
    financialContext = await buildFinancialContext(db, selectedAccounts);
  }

  const systemMessage = `${SYSTEM_PROMPT}

${
  financialContext
    ? `# Données financières de l'utilisateur\n\n${financialContext}`
    : "L'utilisateur n'a sélectionné aucun compte à analyser. Demande-lui de sélectionner au moins un compte pour pouvoir l'aider."
}`;

  const accountId = accountIds[0] ?? 0;

  // Fire-and-forget : incrémenter le compteur d'utilisation IA (1 seul incrément même en consensus)
  const mainDb = getDb();
  const month = new Date().toISOString().slice(0, 7);
  incrementAiUsage(mainDb, userId, month).catch(() => {});

  // Mode consensus Premium : 3 modèles en parallèle + synthèse Haiku
  const planId = await getUserPlanId(userId);
  const isPremium = planId === "premium";

  if (isPremium && consensusMode) {
    const coreMessages = await convertToModelMessages(messages);

    // AC-1 : lancer 3 modèles en parallèle via Promise.allSettled
    const results = await Promise.allSettled(
      CONSENSUS_MODELS.map((model) =>
        generateText({
          model: openrouter(model),
          system: systemMessage,
          messages: coreMessages,
        })
      )
    );

    const sources = results.map((result, i) => ({
      model: CONSENSUS_MODELS[i]!,
      text: result.status === "fulfilled" ? result.value.text : null,
    }));

    // flatMap pour filtrer les null et obtenir string[] bien typé
    const successfulTexts: string[] = sources.flatMap((s) =>
      s.text !== null ? [s.text] : []
    );

    let synthesis: ConsensusSynthesis;

    if (successfulTexts.length < 2) {
      // AC-6 : fallback heuristique si < 2 réponses disponibles
      synthesis = await synthesizeResponses(successfulTexts);
    } else {
      // AC-2 : synthèse via Claude Haiku
      const synthesisPrompt = buildSynthesisPrompt(successfulTexts);
      try {
        const haikuResult = await generateText({
          model: openrouter(HAIKU_MODEL),
          messages: [{ role: "user", content: synthesisPrompt }],
        });
        synthesis = JSON.parse(haikuResult.text) as ConsensusSynthesis;
      } catch {
        // Fallback heuristique si JSON invalide
        synthesis = await synthesizeResponses(successfulTexts);
      }
    }

    // AC-3 : réponse JSON { mode: "consensus", synthesis, sources }
    return NextResponse.json({ mode: "consensus", synthesis, sources });
  }

  const result = streamText({
    model: openrouter(selectedModel),
    system: systemMessage,
    messages: await convertToModelMessages(messages),
    tools: createAiTools(db, accountId),
    stopWhen: stepCountIs(3),
  });

  return result.toUIMessageStreamResponse();
}
