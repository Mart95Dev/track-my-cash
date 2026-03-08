import type { Client } from "@libsql/client";
import type { CategorizationRule } from "./types";

export async function getCategorizationRules(db: Client): Promise<CategorizationRule[]> {
  const result = await db.execute("SELECT * FROM categorization_rules ORDER BY priority DESC");
  return result.rows.map((row) => ({
    id: Number(row.id),
    pattern: String(row.pattern),
    category: String(row.category),
    priority: Number(row.priority),
  }));
}

export async function createCategorizationRule(
  db: Client,
  pattern: string,
  category: string,
  priority: number
): Promise<void> {
  await db.execute({
    sql: "INSERT INTO categorization_rules (pattern, category, priority) VALUES (?, ?, ?)",
    args: [pattern, category, priority],
  });
}

export async function deleteCategorizationRule(db: Client, id: number): Promise<void> {
  await db.execute({ sql: "DELETE FROM categorization_rules WHERE id = ?", args: [id] });
}

export async function autoCategorize(db: Client, description: string): Promise<string> {
  const rules = await getCategorizationRules(db);
  for (const rule of rules) {
    try {
      const regex = new RegExp(rule.pattern, "i");
      if (regex.test(description)) {
        return rule.category;
      }
    } catch {
      if (description.toLowerCase().includes(rule.pattern.toLowerCase())) {
        return rule.category;
      }
    }
  }
  return "Autre";
}
