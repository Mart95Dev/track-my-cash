import { getAllAccounts, getSetting } from "@/lib/queries";
import { AiChat } from "@/components/ai-chat";
import { getTranslations } from "next-intl/server";

export const dynamic = "force-dynamic";

export default async function ConseillerPage() {
  const [accounts, apiKey, t] = await Promise.all([
    getAllAccounts(),
    getSetting("openrouter_api_key"),
    getTranslations("advisor"),
  ]);

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">{t("title")}</h2>
      <AiChat accounts={accounts} hasApiKey={!!apiKey} />
    </div>
  );
}
