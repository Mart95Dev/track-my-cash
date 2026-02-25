import { type NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { getUserPlanId } from "@/lib/subscription-utils";
import { getUserDb, getDb } from "@/lib/db";
import { getMonthlySummary, getExpensesByBroadCategory, searchTransactions, getSetting } from "@/lib/queries";
import { generateMonthlyReport, validateMonthParam, type MonthlyReportData, type MonthlyReportCoupleData } from "@/lib/pdf-report";
import { getCoupleByUserId, getCoupleMembers, getCoupleMonthStats, computeCoupleBalanceForPeriod } from "@/lib/couple-queries";

export async function GET(request: NextRequest) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const userId = session.user.id;
  const { searchParams } = new URL(request.url);
  const month = searchParams.get("month");

  // AC-5 : Validation du paramètre month
  if (!validateMonthParam(month)) {
    return NextResponse.json(
      { error: "Paramètre month invalide (format attendu : YYYY-MM)" },
      { status: 400 }
    );
  }

  // AC-4 : Gate Pro/Premium
  const planId = await getUserPlanId(userId);
  if (planId === "free") {
    return NextResponse.json(
      { error: "Fonctionnalité réservée aux abonnés Pro et Premium" },
      { status: 403 }
    );
  }

  const db = await getUserDb(userId);
  const currency = (await getSetting(db, "reference_currency")) ?? "EUR";

  const [allMonthlySummaries, categories, { transactions }] = await Promise.all([
    getMonthlySummary(db),
    getExpensesByBroadCategory(db),
    searchTransactions(db, { page: 1, perPage: 200, sort: "date_desc" }),
  ]);

  const summary = allMonthlySummaries.find((s) => s.month === month);

  const monthTransactions = transactions
    .filter((tx) => tx.date.startsWith(month!))
    .map((tx) => ({
      date: tx.date,
      description: tx.description || tx.category || "—",
      category: tx.category,
      amount: tx.amount,
    }));

  const totalCats = categories.reduce((acc, c) => acc + c.total, 0);

  // AC-8 : Section couple si couple actif
  let coupleData: MonthlyReportCoupleData | undefined;
  try {
    const mainDb = getDb();
    const couple = await getCoupleByUserId(mainDb, userId);
    if (couple) {
      const members = await getCoupleMembers(mainDb, couple.id);
      const otherMember = members.find((m) => m.user_id !== userId && m.status === "active");
      if (otherMember) {
        const partnerDb = await getUserDb(otherMember.user_id);
        const partnerRow = await mainDb.execute({
          sql: "SELECT name, email FROM user WHERE id = ?",
          args: [otherMember.user_id],
        });
        const partnerName = String(
          partnerRow.rows[0]?.name ?? partnerRow.rows[0]?.email ?? "Partenaire"
        );
        const [monthStats, balanceResult] = await Promise.all([
          getCoupleMonthStats(db, partnerDb, month!),
          computeCoupleBalanceForPeriod(db, partnerDb, userId, otherMember.user_id, month!),
        ]);
        coupleData = {
          sharedExpenses: monthStats.totalExpenses,
          balance: balanceResult.diff,
          partnerName,
          topSharedCategory: monthStats.topCategories[0]?.category ?? "",
        };
      }
    }
  } catch {
    // Si erreur couple, on génère le rapport sans section couple
  }

  const data: MonthlyReportData = {
    month: month!,
    revenues: summary?.income ?? 0,
    expenses: summary?.expenses ?? 0,
    net: summary?.net ?? 0,
    topCategories: categories.slice(0, 5).map((c) => ({
      category: c.category,
      amount: c.total,
      pct: totalCats > 0 ? Math.round((c.total / totalCats) * 100) : 0,
    })),
    transactions: monthTransactions,
    currency,
    coupleData,
  };

  const buffer = generateMonthlyReport(data);

  return new NextResponse(buffer.buffer as ArrayBuffer, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="rapport-${month}.pdf"`,
      "Content-Length": String(buffer.length),
    },
  });
}
