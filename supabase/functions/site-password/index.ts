const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: cors });
  const expected = Deno.env.get("SITE_PASSWORD") ?? "";
  let ok = false;
  try {
    const { password } = await req.json();
    ok = !!expected && typeof password === "string" && password === expected;
  } catch { /* ignore */ }
  if (!ok) await new Promise((r) => setTimeout(r, 600));
  return new Response(JSON.stringify({ ok }), {
    headers: { ...cors, "Content-Type": "application/json" },
  });
});
