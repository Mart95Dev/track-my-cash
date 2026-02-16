"use client";

import { useState, useTransition, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { formatCurrency, formatDate } from "@/lib/format";
import {
  updateStatementAction,
  toggleReconciledAction,
  getUnreconciledTransactions,
} from "@/app/actions/reconciliation-actions";
import { toast } from "sonner";
import type { Account } from "@/lib/queries";

export function ReconciliationDialog({ account }: { account: Account }) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [statementBalance, setStatementBalance] = useState("");
  const [statementDate, setStatementDate] = useState(new Date().toISOString().split("T")[0]);
  const [transactions, setTransactions] = useState<{
    id: number;
    date: string;
    description: string;
    amount: number;
    type: "income" | "expense";
  }[]>([]);

  useEffect(() => {
    if (open) {
      getUnreconciledTransactions(account.id).then(setTransactions);
    }
  }, [open, account.id]);

  const calculatedBalance = account.calculated_balance ?? account.initial_balance;
  const statementVal = parseFloat(statementBalance);
  const diff = !isNaN(statementVal) ? calculatedBalance - statementVal : null;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">Rapprochement</Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Rapprochement — {account.name}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Solde calculé</p>
              <p className="text-lg font-bold">{formatCurrency(calculatedBalance, account.currency)}</p>
            </div>
            <div className="space-y-2">
              <Label>Solde du relevé</Label>
              <Input
                type="number"
                step="0.01"
                value={statementBalance}
                onChange={(e) => setStatementBalance(e.target.value)}
                placeholder="Solde du relevé bancaire"
              />
              <Input
                type="date"
                value={statementDate}
                onChange={(e) => setStatementDate(e.target.value)}
              />
            </div>
          </div>

          {diff !== null && (
            <div className={`p-3 rounded-lg border ${Math.abs(diff) < 0.01 ? "bg-green-50 dark:bg-green-950" : "bg-orange-50 dark:bg-orange-950"}`}>
              <p className="font-medium">
                Écart : {formatCurrency(Math.abs(diff), account.currency)}
                {Math.abs(diff) < 0.01 ? (
                  <Badge className="ml-2 bg-green-600">Rapproché</Badge>
                ) : (
                  <Badge variant="destructive" className="ml-2">Non rapproché</Badge>
                )}
              </p>
            </div>
          )}

          {transactions.length > 0 && (
            <div className="space-y-2">
              <p className="text-sm font-medium">Transactions non rapprochées :</p>
              <div className="max-h-60 overflow-y-auto space-y-1">
                {transactions.map((tx) => (
                  <div key={tx.id} className="flex items-center gap-3 py-1.5 px-2 rounded border text-sm">
                    <Checkbox
                      onCheckedChange={(checked) => {
                        startTransition(async () => {
                          await toggleReconciledAction(tx.id, !!checked);
                          setTransactions((prev) => prev.filter((t) => t.id !== tx.id));
                        });
                      }}
                    />
                    <span className="text-muted-foreground">{formatDate(tx.date)}</span>
                    <span className="flex-1 truncate">{tx.description || "—"}</span>
                    <span className={tx.type === "income" ? "text-green-600" : "text-red-600"}>
                      {tx.type === "income" ? "+" : "-"}{formatCurrency(tx.amount, account.currency)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setOpen(false)}>Fermer</Button>
            <Button
              disabled={isPending || !statementBalance}
              onClick={() => {
                startTransition(async () => {
                  await updateStatementAction(account.id, parseFloat(statementBalance), statementDate);
                  toast.success("Relevé enregistré");
                  setOpen(false);
                });
              }}
            >
              {isPending ? "..." : "Enregistrer le relevé"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
