import { getDb, ensureSchema } from "./db";
import type { Account } from "./queries";

export async function buildFinancialContext(accounts: Account[]): Promise<string> {
  await ensureSchema();
  const db = getDb();
  const sections: string[] = [];

  const now = new Date();
  const threeMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 3, 1)
    .toISOString()
    .split("T")[0];

  for (const account of accounts) {
    const balance = account.calculated_balance ?? account.initial_balance;
    const lines: string[] = [
      `## Compte : ${account.name} (${account.currency})`,
      `- Solde actuel : ${balance.toLocaleString("fr-FR")} ${account.currency}`,
    ];

    if (account.alert_threshold != null) {
      lines.push(`- Seuil d'alerte : ${account.alert_threshold.toLocaleString("fr-FR")} ${account.currency}`);
      if (balance < account.alert_threshold) {
        lines.push(`- ⚠ SOLDE SOUS LE SEUIL D'ALERTE`);
      }
    }

    // Dépenses par catégorie (3 derniers mois)
    const expenses = await db.execute({
      sql: `SELECT category, SUM(amount) as total, COUNT(*) as count
            FROM transactions
            WHERE account_id = ? AND type = 'expense' AND date >= ?
            GROUP BY category ORDER BY total DESC`,
      args: [account.id, threeMonthsAgo],
    });

    if (expenses.rows.length > 0) {
      lines.push(`\n### Dépenses par catégorie (3 derniers mois)`);
      for (const row of expenses.rows) {
        lines.push(`- ${row.category} : ${Number(row.total).toLocaleString("fr-FR")} ${account.currency} (${row.count} transactions)`);
      }
    }

    // Revenus par catégorie (3 derniers mois)
    const incomes = await db.execute({
      sql: `SELECT category, SUM(amount) as total
            FROM transactions
            WHERE account_id = ? AND type = 'income' AND date >= ?
            GROUP BY category ORDER BY total DESC`,
      args: [account.id, threeMonthsAgo],
    });

    if (incomes.rows.length > 0) {
      lines.push(`\n### Revenus par catégorie (3 derniers mois)`);
      for (const row of incomes.rows) {
        lines.push(`- ${row.category} : ${Number(row.total).toLocaleString("fr-FR")} ${account.currency}`);
      }
    }

    // Résumé mensuel (3 derniers mois)
    const monthly = await db.execute({
      sql: `SELECT
              strftime('%Y-%m', date) as month,
              SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END) as income,
              SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END) as expenses
            FROM transactions
            WHERE account_id = ? AND date >= ?
            GROUP BY month ORDER BY month DESC`,
      args: [account.id, threeMonthsAgo],
    });

    if (monthly.rows.length > 0) {
      lines.push(`\n### Résumé mensuel`);
      for (const row of monthly.rows) {
        const income = Number(row.income);
        const exp = Number(row.expenses);
        const net = income - exp;
        const savingsRate = income > 0 ? ((net / income) * 100).toFixed(1) : "N/A";
        lines.push(`- ${row.month} : revenus ${income.toLocaleString("fr-FR")}, dépenses ${exp.toLocaleString("fr-FR")}, net ${net.toLocaleString("fr-FR")} (taux épargne: ${savingsRate}%)`);
      }
    }

    // Charges récurrentes
    const recurring = await db.execute({
      sql: `SELECT name, type, amount, frequency, category
            FROM recurring_payments
            WHERE account_id = ?
            ORDER BY amount DESC`,
      args: [account.id],
    });

    if (recurring.rows.length > 0) {
      lines.push(`\n### Charges récurrentes`);
      for (const row of recurring.rows) {
        const prefix = row.type === "income" ? "+" : "-";
        lines.push(`- ${row.name} : ${prefix}${Number(row.amount).toLocaleString("fr-FR")} ${account.currency} (${row.frequency}, ${row.category})`);
      }
    }

    sections.push(lines.join("\n"));
  }

  return sections.join("\n\n---\n\n");
}

export const SYSTEM_PROMPT = `Tu es un conseiller financier expert, spécialisé en gestion budgétaire, crédit consommation et surendettement.
Tu parles français. Tu es direct, honnête, sans langue de bois. Pas de formules de politesse inutiles.
Tu analyses les données financières fournies et tu donnes des conseils concrets et actionnables.
Tu identifies les dépenses superflues, calcules le reste à vivre après charges fixes, et proposes un plan d'épargne réaliste.
Si la situation est critique (surendettement, découvert chronique), tu le dis clairement et tu orientes vers les solutions adaptées (rachat de crédit, dossier de surendettement Banque de France, etc.).
Tu ne tournes pas autour du pot. Tu donnes des chiffres précis basés sur les données.
Quand tu fais des calculs, montre-les.`;
