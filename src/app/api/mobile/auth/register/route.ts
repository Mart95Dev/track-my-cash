/**
 * POST /api/mobile/auth/register
 * STORY-057 — AC-2
 *
 * Crée un nouveau compte utilisateur via Better-Auth,
 * puis retourne un JWT mobile signé.
 */
import { auth } from "@/lib/auth";
import { signMobileToken, jsonCreated, jsonError, handleCors } from "@/lib/mobile-auth";

export const dynamic = "force-dynamic";

export function OPTIONS() {
  return handleCors();
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, password, name } = body as {
      email?: string;
      password?: string;
      name?: string;
    };

    if (!email || !password) {
      return jsonError(400, "Email et mot de passe requis");
    }

    // Utilise Better-Auth pour créer le compte
    const signUpUrl = new URL("/api/auth/sign-up/email", req.url);
    const internalReq = new Request(signUpUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password, name: name ?? email.split("@")[0] }),
    });

    const authResponse = await auth.handler(internalReq);

    if (!authResponse.ok) {
      const text = await authResponse.text();

      // Détection email déjà pris
      if (authResponse.status === 422 || text.includes("already exists")) {
        return jsonError(409, "Un compte avec cet email existe déjà");
      }

      return jsonError(authResponse.status, text || "Erreur lors de l'inscription");
    }

    const authData = await authResponse.json();
    const user = authData.user;

    if (!user?.id) {
      return jsonError(500, "Erreur lors de la création du compte");
    }

    // Signer un JWT mobile
    const token = await signMobileToken(user.id, user.email);

    return jsonCreated({
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
