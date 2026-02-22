import { getAllAccounts, getBudgets, getBudgetStatus } from "@/lib/queries";
import { getUserDb } from "@/lib/db";
import { getRequiredUserId } from "@/lib/auth-utils";
import { getBudgetSuggestionsAction } from "@/app/actions/budget-suggestion-actions";
import { BudgetForm } from "@/components/budget-form";
import { BudgetProgress } from "@/components/budget-progress";
import { BudgetSuggestions } from "@/components/budget-suggestions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Wallet } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function BudgetsPage({
  searchParams,
}: {
  searchParams: Promise<{ accountId?: string }>;
}) {
  const params = await searchParams;

  const userId = await getRequiredUserId();
  const db = await getUserDb(userId);
  const accounts = await getAllAccounts(db);

  if (accounts.length === 0) {
    return (
      <div className="space-y-6">
        <h2 className="text-2xl font-bold">Budgets</h2>
        <EmptyState
          icon={<Wallet className="h-12 w-12" />}
          title="Aucun compte"
          description="Créez un compte pour configurer des budgets."
          action={{ label: "Créer un compte", href: "/comptes" }}
        />
      </div>
    );
  }

  const rawAccountId = params.accountId ? parseInt(params.accountId) : null;
  const accountId = rawAccountId ?? accounts[0]!.id;
  const selectedAccount = accounts.find((a) => a.id === accountId) ?? accounts[0]!;

  const [budgets, budgetStatus, suggestions] = await Promise.all([
    getBudgets(db, accountId),
    getBudgetStatus(db, accountId),
    getBudgetSuggestionsAction(accountId),
  ]);

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">
        Budgets
        {selectedAccount && (
          <span className="ml-2 text-lg font-normal text-muted-foreground">
            — {selectedAccount.name}
          </span>
        )}
      </h2>

      {/* Suggestions IA */}
      <BudgetSuggestions suggestions={suggestions} accountId={accountId} />

      {/* Statut des budgets en cours */}
      {budgetStatus.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Budgets du mois en cours</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {budgetStatus.map((b) => (
              <BudgetProgress
                key={b.category}
                budget={b}
                currency={selectedAccount.currency}
                accountId={accountId}
              />
            ))}
          </CardContent>
        </Card>
      )}

      {/* Formulaire d'ajout / liste */}
      <Card>
        <CardHeader>
          <CardTitle>Gérer les budgets</CardTitle>
        </CardHeader>
        <CardContent>
          <BudgetForm accountId={accountId} budgets={budgets} />
        </CardContent>
      </Card>
    </div>
  );
}
