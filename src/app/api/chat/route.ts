import { streamText, convertToModelMessages, type UIMessage } from "ai";
import { createOpenAI } from "@ai-sdk/openai";
import { getSetting, getAllAccounts } from "@/lib/queries";
import { getUserDb } from "@/lib/db";
import { getRequiredUserId } from "@/lib/auth-utils";
import { buildFinancialContext, SYSTEM_PROMPT } from "@/lib/ai-context";

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

  const result = streamText({
    model: openrouter(selectedModel),
    system: systemMessage,
    messages: await convertToModelMessages(messages),
  });

  return result.toUIMessageStreamResponse();
}
