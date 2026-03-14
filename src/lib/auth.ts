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
  appName: "Koupli",
  emailAndPassword: {
    enabled: true,
    async sendResetPassword({ user, url }) {
      const { sendEmail } = await import("./email");
      void sendEmail({
        to: user.email,
        subject: "Réinitialisez votre mot de passe — Koupli",
        html: `
          <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:32px">
            <h2 style="color:#1e293b">Réinitialisation du mot de passe</h2>
            <p style="color:#64748b">Bonjour${user.name ? ` ${user.name}` : ""},</p>
            <p style="color:#64748b">Vous avez demandé à réinitialiser votre mot de passe. Cliquez sur le bouton ci-dessous :</p>
            <a href="${url}" style="display:inline-block;background:#4848e5;color:white;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:600;margin:16px 0">
              Réinitialiser mon mot de passe
            </a>
            <p style="color:#94a3b8;font-size:14px">Ce lien expire dans 1 heure. Si vous n'avez pas fait cette demande, ignorez cet email.</p>
          </div>
        `,
      });
    },
  },
  plugins: [
    twoFactor({
      issuer: "Koupli",
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
