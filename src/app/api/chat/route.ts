import { streamText, convertToModelMessages, stepCountIs, type UIMessage } from "ai";
import { createOpenAI } from "@ai-sdk/openai";
import { getSetting, getAllAccounts } from "@/lib/queries";
import { getUserDb } from "@/lib/db";
import { getRequiredUserId } from "@/lib/auth-utils";
import { canUseAI } from "@/lib/subscription-utils";
import { buildFinancialContext, SYSTEM_PROMPT } from "@/lib/ai-context";
import { checkRateLimit } from "@/lib/rate-limiter";
import { createAiTools } from "@/lib/ai-tools";

const RATE_LIMIT = 30;
const RATE_WINDOW_MS = 60 * 60 * 1000; // 1 heure

export const maxDuration = 30;

const ALLOWED_MODELS = [
  "openai/gpt-4o-mini",
  "anthropic/claude-haiku-20240307",
  "google/gemini-flash-1.5",
  "meta-llama/llama-3.1-8b-instruct:free",
] as const;

type AllowedModel = (typeof ALLOWED_MODELS)[number];

export async function POST(req: Request) {
  const {
    messages,
    accountIds,
    modelId,
  }: {
    messages: UIMessage[];
    accountIds: number[];
    modelId?: string;
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

  const db = await getUserDb(userId);

  const apiKey = await getSetting(db, "openrouter_api_key");
  if (!apiKey) {
    return new Response(
      JSON.stringify({ error: "Clé API OpenRouter non configurée" }),
      {
        status: 400,
        headers: { "Content-Type": "application/json" },
      }
    );
  }

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

  const result = streamText({
    model: openrouter(selectedModel),
    system: systemMessage,
    messages: await convertToModelMessages(messages),
    tools: createAiTools(db, accountId),
    stopWhen: stepCountIs(3),
  });

  return result.toUIMessageStreamResponse();
}
