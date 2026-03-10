/**
 * POST /api/mobile/chat — Proxy IA pour l'app mobile (STORY-140)
 * Auth JWT, rate limiting, guard plan, proxy OpenRouter côté serveur
 */
import { generateText, type ModelMessage } from "ai";
import { createOpenAI } from "@ai-sdk/openai";
import {
  getMobileUserId,
  handleCors,
  jsonOk,
  jsonError,
} from "@/lib/mobile-auth";
import { getUserDb, getDb } from "@/lib/db";
import { canUseAI, getUserPlanId } from "@/lib/subscription-utils";
import { incrementAiUsage } from "@/lib/ai-usage";
import { buildFinancialContext, SYSTEM_PROMPT } from "@/lib/ai-context";
import { checkRateLimit } from "@/lib/rate-limiter";
import { getAllAccounts } from "@/lib/queries";

const RATE_LIMIT = 30;
const RATE_WINDOW_MS = 60 * 60 * 1000; // 1 heure

const DEFAULT_MODEL = "openai/gpt-4o-mini";

interface MobileChatBody {
  messages: { role: "user" | "assistant" | "system"; content: string }[];
  accountIds?: number[];
}

export async function POST(req: Request): Promise<Response> {
  // Auth JWT
  const userId = await getMobileUserId(req);

  // Rate limiting
  const rateLimit = checkRateLimit(userId, RATE_LIMIT, RATE_WINDOW_MS);
  if (!rateLimit.allowed) {
    const resetInMin = Math.ceil((rateLimit.resetAt - Date.now()) / 60000);
    return jsonError(
      429,
      `Limite atteinte. Réessayez dans ${resetInMin} minute${resetInMin > 1 ? "s" : ""}.`
    );
  }

  // Guard IA : vérifier le plan
  const aiCheck = await canUseAI(userId);
  if (!aiCheck.allowed) {
    return jsonError(403, aiCheck.reason ?? "Accès refusé");
  }

  const apiKey = process.env.API_KEY_OPENROUTER;
  if (!apiKey) {
    return jsonError(500, "Clé API IA non configurée");
  }

  const { messages, accountIds = [] }: MobileChatBody = await req.json();

  const db = await getUserDb(userId);

  const openrouter = createOpenAI({
    baseURL: "https://openrouter.ai/api/v1",
    apiKey,
  });

  // Construire le contexte financier si des comptes sont sélectionnés
  let financialContext = "";
  if (accountIds.length > 0) {
    const allAccounts = await getAllAccounts(db);
    const selectedAccounts = allAccounts.filter((a) =>
      accountIds.includes(a.id)
    );
    if (selectedAccounts.length > 0) {
      financialContext = await buildFinancialContext(db, selectedAccounts);
    }
  }

  const systemMessage = `${SYSTEM_PROMPT}

${
  financialContext
    ? `# Données financières de l'utilisateur\n\n${financialContext}`
    : "L'utilisateur n'a sélectionné aucun compte à analyser."
}`;

  // Incrémenter l'usage IA (fire-and-forget)
  const mainDb = getDb();
  const month = new Date().toISOString().slice(0, 7);
  incrementAiUsage(mainDb, userId, month).catch(() => {});

  // Convertir les messages au format ModelMessage
  const coreMessages: ModelMessage[] = messages.map((m) => ({
    role: m.role,
    content: m.content,
  }));

  const result = await generateText({
    model: openrouter(DEFAULT_MODEL),
    system: systemMessage,
    messages: coreMessages,
  });

  return jsonOk({ reply: result.text });
}

export function OPTIONS(): Response {
  return handleCors();
}
