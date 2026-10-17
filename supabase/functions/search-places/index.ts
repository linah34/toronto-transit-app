const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { text } = await req.json();
    if (typeof text !== "string" || text.trim().length < 2) {
      return json({ results: [] });
    }

    const key = Deno.env.get("GEOAPIFY_KEY");
    if (!key) return json({ error: "GEOAPIFY_KEY not set" }, 500);

    const url = new URL("https://api.geoapify.com/v1/geocode/autocomplete");
    url.searchParams.set("text", text.trim().slice(0, 200));
    url.searchParams.set("bias", "proximity:-79.3832,43.6532"); // favour Toronto
    url.searchParams.set("filter", "countrycode:ca");
    url.searchParams.set("limit", "5");
    url.searchParams.set("lang", "en");
    url.searchParams.set("apiKey", key);

    const res = await fetch(url);
    if (!res.ok) return json({ error: "Geoapify request failed" }, 502);

    const data = await res.json();
    const results = (data.features ?? []).map((f: any) => {
      const p = f.properties;
      return {
        id: p.place_id ?? `${p.lat},${p.lon}`,
        name: p.name ?? p.address_line1 ?? p.formatted,
        address: p.address_line2 ?? p.formatted,
        lat: p.lat,
        lng: p.lon,
      };
    });

    return json({ results });
  } catch {
    return json({ error: "Bad request" }, 400);
  }
});