import { useEffect, useRef, useState } from "react";
import { Input } from "@/components/ui/input";
import { supabase } from "../lib/supabase";

export type Place = {
  id: string;
  name: string;
  address: string;
  lat: number;
  lng: number;
};

type Props = {
  placeholder?: string;
  onSelect: (place: Place) => void;
};

export default function PlaceSearch({ placeholder, onSelect }: Props) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Place[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const skipNext = useRef(false);

  useEffect(() => {
    // Don't re-search when we just filled the box from a selection
    if (skipNext.current) {
      skipNext.current = false;
      return;
    }

    const text = query.trim();
    if (text.length < 2) {
      setResults([]);
      setLoading(false);
      return;
    }

    let cancelled = false;
    const timer = setTimeout(async () => {
      setLoading(true);
      setError("");
      const { data, error } = await supabase.functions.invoke("search-places", {
        body: { text },
      });
      if (cancelled) return; // a newer keystroke replaced this request
      setLoading(false);
      if (error) {
        setError("Search failed");
        setResults([]);
        return;
      }
      setResults(data.results ?? []);
      setOpen(true);
    }, 300); // wait 300 ms after the last keystroke

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [query]);

  function handleSelect(place: Place) {
    const label = place.name;
    if (label !== query) skipNext.current = true;
    setQuery(label);
    setOpen(false);
    onSelect(place);
  }

  return (
    <div className="relative">
      <Input
        value={query}
        placeholder={placeholder}
        onChange={(e) => setQuery(e.target.value)}
        onFocus={() => results.length > 0 && setOpen(true)}
        onBlur={() => setOpen(false)}
        className="mx-1 outline-none bg-white p-2 text-black rounded-xl"
      />

      {open && (results.length > 0 || error) && (
        <ul className="absolute left-0 right-0 z-20 mt-1 overflow-hidden rounded-xl bg-white text-black shadow-lg">
          {error && <li className="p-2 text-sm text-red-600">{error}</li>}
          {results.map((place) => (
            <li
              key={place.id}
              // onMouseDown fires before the input's onBlur closes the list
              onMouseDown={() => handleSelect(place)}
              className="cursor-pointer p-2 hover:bg-amber-100"
            >
              <div className="font-semibold">{place.name}</div>
              <div className="truncate text-xs text-gray-600">{place.address}</div>
            </li>
          ))}
        </ul>
      )}

      {loading && <p className="mx-1 mt-1 text-xs text-white">Searching…</p>}
    </div>
  );
}