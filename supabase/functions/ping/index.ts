const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

Deno.serve((req) => {
  // Browsers send a preflight request first; answer it
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  const body = {
    message: "pong",
    time: new Date().toISOString(),
    // Proves the secret is readable server-side without exposing its value
    secretConfigured: Boolean(Deno.env.get("TEST_SECRET")),
  };

  return new Response(JSON.stringify(body), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
});