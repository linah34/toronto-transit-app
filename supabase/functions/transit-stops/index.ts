
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
    const { bbox } = await req.json();

    // bbox = [west, south, east, north]
    if (
      !Array.isArray(bbox) ||
      bbox.length !== 4 ||
      !bbox.every((n) => typeof n === "number" && Number.isFinite(n))
    ) {
      return json({ error: "bbox must be 4 numbers" }, 400);
    }
    const [west, south, east, north] = bbox;

    // Refuse huge areas so one request can't pull thousands of stops
    if (east - west > 0.1 || north - south > 0.1) {
      return json({ error: "Area too large, zoom in" }, 400);
    }

    const key = Deno.env.get("TRANSITLAND_KEY");
    if (!key) return json({ error: "TRANSITLAND_KEY not set" }, 500);

    const url = new URL("https://transit.land/api/v2/rest/stops");
    url.searchParams.set("bbox", `${west},${south},${east},${north}`);
    url.searchParams.set("limit", "100");

    const res = await fetch(url, { headers: { apikey: key } });
    if (!res.ok) return json({ error: "Transitland request failed" }, 502);

    const data = await res.json();
    const stops = (data.stops ?? []).map((s: any) => {
      const coords = s.geometry?.coordinates ?? []; // GeoJSON: [lng, lat]
      const routes = new Set<string>();
      for (const rs of s.route_stops ?? []) {
        const name = rs.route?.route_short_name || rs.route?.route_long_name;
        if (name) routes.add(name);
      }
      return {
        id: s.onestop_id ?? s.id,
        name: s.stop_name,
        lat: coords[1],
        lng: coords[0],
        routes: [...routes],
      };
    }).filter((s: any) => typeof s.lat === "number" && typeof s.lng === "number");

    return json({ stops });
  } catch {
    return json({ error: "Bad request" }, 400);
  }
});