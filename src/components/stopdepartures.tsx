import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

type Departure = {
  route: string;
  headsign: string;
  color: string | null;
  textColor: string | null;
  scheduled: string | null;
  estimated: string | null;
  minutes: number | null;
  delay: number | null;
  canceled: boolean;
  live: boolean;
};

// GTFS times can pass 24:00:00 for trips after midnight
function hhmm(t: string | null) {
  if (!t) return "–";
  const [h, m] = t.split(":");
  return `${String(Number(h) % 24).padStart(2, "0")}:${m}`;
}

export default function StopDepartures({ stopId }: { stopId: string }) {
  const [departures, setDepartures] = useState<Departure[]>([]);
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");
  const [tick, setTick] = useState(0); // bump to refetch

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { data, error } = await supabase.functions.invoke("stop-departures", {
        body: { stopId },
      });
      if (cancelled) return; // stop changed or popup closed
      if (error) {
        setStatus("error");
        return;
      }
      setDepartures(data.departures ?? []);
      setStatus("ready");
    })();
    return () => {
      cancelled = true;
    };
  }, [stopId, tick]);

  // Poll every 30 s while this component is mounted
  useEffect(() => {
    const id = window.setInterval(() => setTick((t) => t + 1), 30_000);
    return () => window.clearInterval(id);
  }, []);

  return (
    <div className="mt-2 text-sm">
      {status === "loading" && <p>Loading departures…</p>}
      {status === "error" && <p className="text-red-600">Couldn't load departures</p>}
      {status === "ready" && departures.length === 0 && (
        <p>No departures in the next hour</p>
      )}

      <ul>
        {departures.map((d, i) => (
          <li key={i} className="flex items-center gap-2 py-0.5">
            <span
              className="rounded px-1.5 font-bold"
              style={{
                background: d.color ? `#${d.color}` : "#374151",
                color: d.textColor ? `#${d.textColor}` : "#ffffff",
              }}
            >
              {d.route}
            </span>
            <span className="flex-1 truncate">{d.headsign}</span>
            {d.canceled ? (
              <span className="text-red-600">Cancelled</span>
            ) : (
              <span>
                {d.live ? (d.minutes === 0 ? "Due" : `${d.minutes} min`) : hhmm(d.scheduled)}
                {d.live && <span className="text-green-700"> live</span>}
                {d.delay != null && Math.abs(d.delay) >= 60 && (
                  <span className="text-amber-700">
                    {" "}
                    ({d.delay > 0 ? "+" : ""}
                    {Math.round(d.delay / 60)} min)
                  </span>
                )}
              </span>
            )}
          </li>
        ))}
      </ul>

      <button
        className="mt-1 text-xs text-blue-700 underline"
        onClick={() => setTick((t) => t + 1)}
      >
        Refresh
      </button>
    </div>
  );
}