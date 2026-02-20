import { createClient, type Client } from "@libsql/client";

// Client pour la DB principale (auth + user_databases mapping)
function getMainDb(): Client {
  return createClient({
    url: process.env.DATABASE_URL_TURSO!,
    authToken: process.env.API_KEY_TURSO!,
  });
}

// Crée une DB Turso pour un nouvel utilisateur via l'API Turso
// Retourne le hostname de la nouvelle DB
export async function createUserDatabase(userId: string): Promise<string> {
  const orgName = process.env.TURSO_ORG_NAME!;
  const apiToken = process.env.TURSO_API_TOKEN!;

  const response = await fetch(
    `https://api.turso.tech/v1/organizations/${orgName}/databases`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: `trackmycash-user-${userId.slice(0, 8)}`,
        group: "default",
      }),
    }
  );

  if (!response.ok) {
    throw new Error(`Failed to create Turso database: ${response.statusText}`);
  }

  const { database } = (await response.json()) as {
    database: { hostname: string };
  };

  // Stocker le mapping dans la DB principale
  const mainDb = getMainDb();
  await mainDb.execute({
    sql: `INSERT OR REPLACE INTO users_databases (user_id, db_hostname) VALUES (?, ?)`,
    args: [userId, database.hostname],
  });

  return database.hostname;
}

// Récupère le client DB d'un utilisateur
export async function getUserDbClient(userId: string): Promise<Client> {
  const mainDb = getMainDb();

  // Chercher le hostname dans le mapping
  const result = await mainDb.execute({
    sql: "SELECT db_hostname FROM users_databases WHERE user_id = ?",
    args: [userId],
  });

  let hostname = result.rows[0]?.db_hostname as string | undefined;

  // Si pas de DB encore, créer une nouvelle
  if (!hostname) {
    hostname = await createUserDatabase(userId);
  }

  return createClient({
    url: `libsql://${hostname}`,
    authToken: process.env.API_KEY_TURSO!,
  });
}
