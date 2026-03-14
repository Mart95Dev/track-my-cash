import { betterAuth } from "better-auth";
import { twoFactor } from "better-auth/plugins";
import { LibsqlDialect } from "@libsql/kysely-libsql";

const dialect = new LibsqlDialect({
  // Fallback to local file for build/dev when env vars are not set
  url: process.env.DATABASE_URL_TURSO ?? "file:./dev-auth.db",
  authToken: process.env.API_KEY_TURSO,
});

export const auth = betterAuth({
  database: {
    dialect,
    type: "sqlite",
  },
  appName: "Track My Cash",
  emailAndPassword: {
    enabled: true,
  },
  plugins: [
    twoFactor({
      issuer: "Track My Cash",
      skipVerificationOnEnable: false,
    }),
  ],
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID ?? "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "",
    },
  },
  secret: process.env.BETTER_AUTH_SECRET ?? "dev-secret-change-in-production-32c",
  baseURL: process.env.BETTER_AUTH_URL ?? "http://localhost:3000",
  trustedOrigins: [
    process.env.BETTER_AUTH_URL ?? "http://localhost:3000",
  ],
});
