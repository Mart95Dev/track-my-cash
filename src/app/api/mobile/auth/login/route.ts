/**
 * POST /api/mobile/auth/login
 * STORY-057 — AC-1
 *
 * Authentifie l'utilisateur avec email/password via Better-Auth,
 * puis retourne un JWT mobile signé.
 */
import { auth } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { upsertUserPlatform } from "@/lib/platform-tracker";
import { signMobileToken, jsonOk, jsonError, handleCors } from "@/lib/mobile-auth";
import { has2FAEnabled, signTempToken } from "@/lib/mobile-2fa";

export const dynamic = "force-dynamic";

export function OPTIONS() {
  return handleCors();
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, password } = body as { email?: string; password?: string };

    if (!email || !password) {
      return jsonError(400, "Email et mot de passe requis");
    }

    // Utilise Better-Auth pour vérifier les credentials
    // On crée une requête interne vers le handler Better-Auth
    const signInUrl = new URL("/api/auth/sign-in/email", req.url);
    const internalReq = new Request(signInUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const authResponse = await auth.handler(internalReq);

    if (!authResponse.ok) {
      return jsonError(401, "Identifiants invalides");
    }

    const authData = await authResponse.json();
    const user = authData.user;

    if (!user?.id) {
      return jsonError(401, "Identifiants invalides");
    }

    // Vérifier si le 2FA est activé
    const twoFAEnabled = await has2FAEnabled(user.id);
    if (twoFAEnabled) {
      const tempToken = await signTempToken(user.id, user.email);
      return jsonOk({ requires2FA: true, tempToken });
    }

    // Signer un JWT mobile
    const token = await signMobileToken(user.id, user.email);

    // Track plateforme mobile
    const appVersion = req.headers.get("X-App-Version");
    const platform = (req.headers.get("X-Platform") ?? "android") as "web" | "android" | "ios";
    upsertUserPlatform(getDb(), user.id, platform, appVersion).catch(() => {});

    return jsonOk({
      user: {
        id: user.id,
        email: user.email,
        name: user.name ?? null,
      },
      token,
    });
  } catch {
    return jsonError(500, "Erreur interne du serveur");
  }
}
