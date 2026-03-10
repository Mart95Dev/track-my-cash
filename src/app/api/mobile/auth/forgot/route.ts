/**
 * POST /api/mobile/auth/forgot
 * STORY-072 — AC-2
 *
 * Envoie un email de réinitialisation de mot de passe via Better-Auth.
 */
import { auth } from "@/lib/auth";
import { jsonOk, jsonError, handleCors } from "@/lib/mobile-auth";

export const dynamic = "force-dynamic";

export function OPTIONS() {
  return handleCors();
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email } = body as { email?: string };

    if (!email) {
      return jsonError(400, "Email requis");
    }

    // Utilise Better-Auth pour envoyer l'email de reset
    const forgotUrl = new URL("/api/auth/forget-password", req.url);
    const internalReq = new Request(forgotUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email,
        redirectTo: `${new URL(req.url).origin}/reset-password`,
      }),
    });

    // Fire-and-forget : ne pas reveler si l'email existe ou non
    auth.handler(internalReq).catch(() => {});

    // Toujours retourner 200 pour eviter l'enumeration d'utilisateurs
    return jsonOk({ success: true });
  } catch {
    return jsonError(500, "Erreur interne du serveur");
  }
}
