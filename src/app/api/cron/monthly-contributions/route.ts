import { type NextRequest, NextResponse } from "next/server";
import { getDb, getUserDb } from "@/lib/db";
import { getGoals, updateGoal } from "@/lib/queries";

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("Authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const mainDb = getDb();
  const usersResult = await mainDb.execute("SELECT user_id FROM users_databases");
  const userIds = usersResult.rows.map((r) => String(r.user_id));

  let processed = 0;
  let updated = 0;

  for (const userId of userIds) {
    try {
      const db = await getUserDb(userId);
      const goals = await getGoals(db);
      const goalsWithContrib = goals.filter((g) => g.monthly_contribution > 0);

      for (const goal of goalsWithContrib) {
        if (goal.current_amount >= goal.target_amount) continue;
        const newAmount = Math.min(
          goal.current_amount + goal.monthly_contribution,
          goal.target_amount
        );
        await updateGoal(db, goal.id, { current_amount: newAmount });
        updated++;
      }
      processed++;
    } catch {
      // Skip user on error, continue with next
    }
  }

  return NextResponse.json({ processed, updated });
}
