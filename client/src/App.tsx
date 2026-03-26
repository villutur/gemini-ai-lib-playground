import { useEffect, useState } from "react";

interface HelloResponse {
  message: string;
  time: string;
  supportedTextModels: string[];
}

export function App() {
  const [data, setData] = useState<HelloResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadHello() {
      try {
        const response = await fetch("/api/hello");
        if (!response.ok) {
          throw new Error(`Request failed with status ${response.status}`);
        }

        const payload = (await response.json()) as HelloResponse;
        if (!cancelled) {
          setData(payload);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Unknown error");
        }
      }
    }

    void loadHello();

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <main className="app-shell">
      <section className="hero-card">
        <p className="eyebrow">Gemini Playground</p>
        <h1>Hello world</h1>
        <p className="lede">
          This is a minimal React + Vite client connected to an Express server, ready for the next
          playground step.
        </p>

        {error ? <p className="error">API error: {error}</p> : null}

        {data ? (
          <div className="api-card">
            <p>
              <strong>Server says:</strong> {data.message}
            </p>
            <p>
              <strong>Time:</strong> {new Date(data.time).toLocaleString()}
            </p>
            <div>
              <strong>Example models from @villutur/gemini-ai-lib:</strong>
              <ul>
                {data.supportedTextModels.map((model) => (
                  <li key={model}>{model}</li>
                ))}
              </ul>
            </div>
          </div>
        ) : (
          <p className="muted">Loading `/api/hello`...</p>
        )}
      </section>
    </main>
  );
}
