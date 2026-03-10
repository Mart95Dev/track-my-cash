/**
 * POST /api/mobile/auth/oauth
 * STORY-071 — OAuth login (Google/Apple)
 *
 * Reçoit un idToken du provider, vérifie via Better-Auth,
 * puis retourne un JWT mobile signé.
 */
import { auth } from "@/lib/auth";
import { signMobileToken, jsonOk, jsonError, handleCors } from "@/lib/mobile-auth";
import { getDb } from "@/lib/db";
import { createTrialSubscription } from "@/lib/trial-utils";
import { sendEmail } from "@/lib/email";
import { renderWelcomeEmail } from "@/lib/email-templates";
import { writeAdminLog } from "@/lib/admin-logger";
import { upsertUserPlatform } from "@/lib/platform-tracker";

export const dynamic = "force-dynamic";

export function OPTIONS() {
  return handleCors();
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { provider, idToken } = body as {
      provider?: string;
      idToken?: string;
    };

    if (!provider || !idToken) {
      return jsonError(400, "Provider et idToken requis");
    }

    if (provider !== "google" && provider !== "apple") {
      return jsonError(400, "Provider non supporté");
    }

    // Appel Better-Auth pour vérifier le token OAuth
    const callbackUrl = new URL(
      `/api/auth/sign-in/social`,
      req.url
    );

    const internalReq = new Request(callbackUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        provider,
        idToken,
        callbackURL: "/",
      }),
    });

    const authResponse = await auth.handler(internalReq);

    if (!authResponse.ok) {
      return jsonError(401, "Token OAuth invalide");
    }

    const authData = await authResponse.json();
    const user = authData.user;

    if (!user?.id) {
      return jsonError(401, "Token OAuth invalide");
    }

    const token = await signMobileToken(user.id, user.email);
    const isNewUser = authData.isNewUser ?? false;

    // Side-effects pour les nouveaux utilisateurs OAuth (fire-and-forget)
    if (isNewUser) {
      const db = getDb();
      try {
        await createTrialSubscription(db, user.id);
      } catch {
        // Ne bloque pas l'inscription
      }

      sendEmail({
        to: user.email,
        subject: "Bienvenue sur TrackMyCash !",
        html: renderWelcomeEmail(user.email, new URL(req.url).origin),
      }).catch(() => {});

      writeAdminLog(
        db,
        "trial_started",
        user.id,
        "Trial 14j démarré (mobile OAuth)",
        { trialEndsAt: new Date(Date.now() + 14 * 86400000).toISOString(), platform: "android", provider }
      ).catch(() => {});
    }

    // Track plateforme mobile (pour tous les users, pas seulement les nouveaux)
    upsertUserPlatform(getDb(), user.id, "android", req.headers.get("X-App-Version")).catch(() => {});

    return jsonOk({
      user: {
        id: user.id,
        email: user.email,
        name: user.name ?? "",
      },
      token,
      isNewUser,
    });
  } catch {
    return jsonError(500, "Erreur interne du serveur");
  }
}
