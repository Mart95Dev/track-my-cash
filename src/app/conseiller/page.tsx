import { getAllAccounts, getSetting } from "@/lib/queries";
import { AiChat } from "@/components/ai-chat";

export const dynamic = "force-dynamic";

export default async function ConseillerPage() {
  const [accounts, apiKey] = await Promise.all([
    getAllAccounts(),
    getSetting("openrouter_api_key"),
  ]);

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Conseiller IA</h2>
      <AiChat accounts={accounts} hasApiKey={!!apiKey} />
    </div>
  );
}
