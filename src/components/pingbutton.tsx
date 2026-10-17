import { useState } from "react";
import { supabase } from "../lib/supabase";

export default function PingButton() {
  const [result, setResult] = useState<string>("");

  async function handlePing() {
    setResult("Loading...");
    const { data, error } = await supabase.functions.invoke("ping");
    setResult(error ? `Error: ${error.message}` : JSON.stringify(data, null, 2));
  }

  return (
    <div>
      <button onClick={handlePing}>Ping backend</button>
      <pre>{result}</pre>
    </div>
  );
}