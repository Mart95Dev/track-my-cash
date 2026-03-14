export const dynamic = "force-dynamic";

export async function GET() {
  return Response.json({
    api_key_turso_length: process.env.API_KEY_TURSO?.length ?? 0,
    api_key_turso_prefix: process.env.API_KEY_TURSO?.slice(0, 20) ?? "MISSING",
    turso_org: process.env.TURSO_ORG_NAME ?? "MISSING",
    turso_api_token_prefix: process.env.TURSO_API_TOKEN?.slice(0, 20) ?? "MISSING",
    better_auth_url: process.env.BETTER_AUTH_URL ?? "MISSING",
    next_public_app_url: process.env.NEXT_PUBLIC_APP_URL ?? "MISSING",
  });
}
