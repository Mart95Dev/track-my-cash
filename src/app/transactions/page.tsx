import { getTransactions, getAllAccounts } from "@/lib/queries";
import { formatCurrency, formatDate } from "@/lib/format";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { TransactionForm } from "@/components/transaction-form";
import { DeleteTransactionButton } from "@/components/delete-transaction-button";
import { ImportButton } from "@/components/import-button";
import { TransactionFilters } from "@/components/transaction-filters";

export const dynamic = "force-dynamic";

export default async function TransactionsPage({
  searchParams,
}: {
  searchParams: Promise<{ accountId?: string }>;
}) {
  const params = await searchParams;
  const accountId = params.accountId ? parseInt(params.accountId) : undefined;
  const transactions = await getTransactions(accountId);
  const accounts = await getAllAccounts();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Transactions</h2>
        <ImportButton accounts={accounts} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Nouvelle transaction</CardTitle>
        </CardHeader>
        <CardContent>
          <TransactionForm accounts={accounts} />
        </CardContent>
      </Card>

      <TransactionFilters accounts={accounts} currentAccountId={accountId} />

      <Card>
        <CardContent className="p-0">
          {transactions.length === 0 ? (
            <p className="py-8 text-center text-muted-foreground">
              Aucune transaction
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Compte</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Catégorie</TableHead>
                  <TableHead className="text-right">Montant</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {transactions.map((tx) => (
                  <TableRow key={tx.id}>
                    <TableCell className="whitespace-nowrap">
                      {formatDate(tx.date)}
                    </TableCell>
                    <TableCell>{tx.account_name ?? "—"}</TableCell>
                    <TableCell>{tx.description || "—"}</TableCell>
                    <TableCell>{tx.category}</TableCell>
                    <TableCell
                      className={`text-right font-medium whitespace-nowrap ${
                        tx.type === "income" ? "text-green-600" : "text-red-600"
                      }`}
                    >
                      {tx.type === "income" ? "+" : "-"}
                      {formatCurrency(tx.amount)}
                    </TableCell>
                    <TableCell>
                      <DeleteTransactionButton id={tx.id} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
