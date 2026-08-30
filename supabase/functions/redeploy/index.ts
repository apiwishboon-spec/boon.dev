// Redeploy Edge Function
// Triggers a Cloudflare Pages production deployment so the static site,
// sitemap and RSS feed are rebuilt right after content edits.
//
// Requires these Supabase edge function secrets:
//   CF_API_TOKEN     Cloudflare API token with Pages:Edit permission
//   CF_ACCOUNT_ID    e.g. lhsuugjzxzuweqpcrtlr
//   CF_PROJECT_NAME  e.g. boon-profile
//
// Only signed-in admin users (role = authenticated) may trigger a deploy.

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "Authorization, Content-Type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

function decodeJwt(token: string): any {
  const parts = token.split(".");
  if (parts.length !== 3) return null;
  try {
    return JSON.parse(
      atob(parts[1].replace(/-/g, "+").replace(/_/g, "/"))
    );
  } catch {
    return null;
  }
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);

  const auth = req.headers.get("Authorization") ?? "";
  const token = auth.replace(/^Bearer\s+/i, "");
  let payload: any = null;
  try { payload = decodeJwt(token); } catch {}
  if (!payload || payload.role !== "authenticated" || (payload.exp ?? 0) < Date.now() / 1000) {
    return json({ error: "Unauthorized — admin session required." }, 401);
  }

  const cfToken = Deno.env.get("CF_API_TOKEN");
  const accountId = Deno.env.get("CF_ACCOUNT_ID");
  const project = Deno.env.get("CF_PROJECT_NAME");
  if (!cfToken || !accountId || !project) {
    return json(
      { error: "Redeploy is not configured. Set CF_API_TOKEN, CF_ACCOUNT_ID and CF_PROJECT_NAME secrets (supabase secrets set)." },
      500
    );
  }

  try {
    const res = await fetch(
      `https://api.cloudflare.com/client/v4/accounts/${accountId}/pages/projects/${project}/deployments`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${cfToken}`,
          "Content-Type": "application/json",
        },
        body: "{}",
      }
    );
    const body = await res.json();
    return json(body, res.ok ? 200 : 502);
  } catch (e: any) {
    return json({ error: "Failed to reach Cloudflare API." + (e?.message ? " " + e.message : "") }, 502);
  }
});