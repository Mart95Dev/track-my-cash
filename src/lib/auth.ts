import { betterAuth } from "better-auth";
import { LibsqlDialect } from "@libsql/kysely-libsql";
import { Kysely } from "kysely";

const db = new Kysely({
  dialect: new LibsqlDialect({
    // Fallback to local file for build/dev when env vars are not set
    url: process.env.DATABASE_URL_TURSO ?? "file:./dev-auth.db",
    authToken: process.env.API_KEY_TURSO,
  }),
});

export const auth = betterAuth({
  database: db,
  emailAndPassword: {
    enabled: true,
  },
  secret: process.env.BETTER_AUTH_SECRET ?? "dev-secret-change-in-production-32c",
  baseURL: process.env.BETTER_AUTH_URL ?? "http://localhost:3000",
  trustedOrigins: [process.env.BETTER_AUTH_URL ?? "http://localhost:3000"],
});
