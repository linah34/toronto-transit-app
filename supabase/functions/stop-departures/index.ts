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

const STOP_KEY = /^[\w~:.\-]{1,200}$/;
const RT_URL =
  "https://transit.land/api/v2/rest/feeds/f-dpz8-ttc~surface~rt/download_latest_rt/trip_updates.json";
const clock = new Intl.DateTimeFormat("en-GB", {
  timeZone: "America/Toronto",
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
});

// The feed covers the whole network, so cache it briefly instead of
// downloading it every time a popup opens (best effort; resets on cold start)
let rtCache: { at: number; data: any } | null = null;

async function getRealtime(key: string) {
  if (rtCache && Date.now() - rtCache.at < 30_000) return rtCache.data;
  const res = await fetch(RT_URL, {
    headers: { apikey: key },
    signal: AbortSignal.timeout(8000),
  });
  if (!res.ok) throw new Error(`RT ${res.status}`);
  const data = await res.json();
  rtCache = { at: Date.now(), data };
  return data;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { stopId } = await req.json();
    if (typeof stopId !== "string" || !STOP_KEY.test(stopId)) {
      return json({ error: "Invalid stopId" }, 400);
    }
    const key = Deno.env.get("TRANSITLAND_KEY");
    if (!key) return json({ error: "TRANSITLAND_KEY not set" }, 500);

    // 1. Scheduled departures from Transitland
    const url = new URL(
      `https://transit.land/api/v2/rest/stops/${encodeURIComponent(stopId).replace(/%3A/g, ":")}/departures`,
    );
    url.searchParams.set("next", "3600");
    url.searchParams.set("limit", "12");
    const res = await fetch(url, { headers: { apikey: key } });
    if (!res.ok) return json({ error: "Transitland request failed" }, 502);

    const data = await res.json();
    const stop = data.stops?.[0];

    const scheduled = (stop?.departures ?? []).map((d: any) => {
      const route = d.trip?.route;
      const dep = d.departure ?? {};
      return {
        tripId: d.trip?.trip_id ?? null,
        routeId: route?.route_id != null ? String(route.route_id) : null,
        route: route?.route_short_name || route?.route_long_name || "?",
        headsign: d.stop_headsign || d.trip?.trip_headsign || "",
        color: route?.route_color || null,
        textColor: route?.route_text_color || null,
        scheduled: dep.scheduled ?? d.departure_time ?? null,
        epoch: dep.scheduled_utc ? Date.parse(dep.scheduled_utc) / 1000 : null,
        canceled:
          (d.schedule_relationship ?? d.trip?.schedule_relationship) === "CANCELED",
      };
    });

    // 2. Live predictions for this stop from the TTC feed
    const gtfsStopId = stopId.includes(":")
     ? stopId.slice(stopId.indexOf(":") + 1)
     : String(stop?.stop_id ?? "");
    const live: { tripId: string | null; routeId: string | null; epoch: number; mins: number }[] = [];
    let realtime = "unavailable";

    const scheduledRoutes = new Set(scheduled.map((s: any) => s.route));
    try {
      const rt = await getRealtime(key);
      const nowSec = Date.now() / 1000;
      if (nowSec - Number(rt.header?.timestamp) > 180) {
        realtime = "stale"; // feed hasn't updated in 3+ minutes
      } else {
        realtime = "ok";
        for (const e of rt.entity ?? []) {
          const tu = e.tripUpdate;
          if (!tu) continue;
          if (!scheduledRoutes.has(String(tu.trip?.routeId))) continue;
          for (const u of tu.stopTimeUpdate ?? []) {
            if (u.stopId !== gtfsStopId || u.scheduleRelationship === "SKIPPED") continue;
            const t = Number((u.departure ?? u.arrival)?.time);
            if (!Number.isFinite(t)) continue;
            const mins = Math.round((t - nowSec) / 60);
            if (mins < -1 || mins > 60) continue;
            live.push({
              tripId: tu.trip?.tripId ?? null,
              routeId: tu.trip?.routeId != null ? String(tu.trip.routeId) : null,
              epoch: t,
              mins,
            });
          }
        }
      }
    } catch {
      // Real-time failed: fall back to the schedule only
    }

    // 3. Merge: use live predictions where they exist, schedule for the rest
    const sameRoute = (s: any, routeId: string | null) =>
      routeId != null && (s.routeId === routeId || s.route === routeId);

    const liveRows = live.map((l) => {
      const exact = scheduled.find((s: any) => s.tripId && s.tripId === l.tripId);
      const m = exact ?? scheduled.find((s: any) => sameRoute(s, l.routeId));
      return {
        route: m?.route ?? l.routeId ?? "?",
        headsign: m?.headsign ?? "",
        color: m?.color ?? null,
        textColor: m?.textColor ?? null,
        scheduled: exact?.scheduled ?? null,
        estimated: `${clock.format(new Date(l.epoch * 1000))}:00`,
        minutes: Math.max(0, l.mins),
        delay: exact?.epoch != null ? Math.round(l.epoch - exact.epoch) : null,
        canceled: false,
        live: true,
        sortKey: l.epoch,
      };
    });

    const scheduledRows = scheduled
      .filter((s: any) => !live.some((l) => sameRoute(s, l.routeId)))
      .map((s: any) => ({
        route: s.route,
        headsign: s.headsign,
        color: s.color,
        textColor: s.textColor,
        scheduled: s.scheduled,
        estimated: null,
        minutes: null,
        delay: null,
        canceled: s.canceled,
        live: false,
        sortKey: s.epoch ?? Number.MAX_SAFE_INTEGER,
      }));

    const departures = [...liveRows, ...scheduledRows]
      .sort((a, b) => a.sortKey - b.sortKey)
      .slice(0, 8)
      .map(({ sortKey: _sortKey, ...row }) => row);

    return json({
      stopName: stop?.stop_name ?? null,
      departures,
      realtime, // "ok", "stale" or "unavailable"
      liveCount: live.length,
    });
  } catch {
    return json({ error: "Bad request" }, 400);
  }
});