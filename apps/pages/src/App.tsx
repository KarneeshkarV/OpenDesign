import { useEffect, useState } from "react";

type HealthResponse = {
  service: string;
  status: string;
  timestamp: string;
};

const apiBaseUrl =
  import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, "") ?? "http://127.0.0.1:8787";

export default function App() {
  const [health, setHealth] = useState<HealthResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    const load = async () => {
      try {
        const response = await fetch(`${apiBaseUrl}/api/health`, {
          signal: controller.signal
        });

        if (!response.ok) {
          throw new Error(`Request failed with ${response.status}`);
        }

        const data = (await response.json()) as HealthResponse;
        setHealth(data);
      } catch (err) {
        if (controller.signal.aborted) {
          return;
        }

        const message = err instanceof Error ? err.message : "Unknown error";
        setError(message);
      }
    };

    void load();

    return () => controller.abort();
  }, []);

  return (
    <main className="shell">
      <section className="panel">
        <p className="eyebrow">Cloudflare + Bun + Turbo</p>
        <h1>OpenDesign Monorepo</h1>
        <p className="lede">
          A starter with a Cloudflare Worker backend and a Cloudflare Pages frontend.
        </p>

        <div className="grid">
          <article className="card">
            <span className="label">Frontend</span>
            <strong>Cloudflare Pages</strong>
            <p>React + Vite app in <code>apps/pages</code>.</p>
          </article>

          <article className="card">
            <span className="label">Backend</span>
            <strong>Cloudflare Worker</strong>
            <p>API entrypoint in <code>apps/backend/src/index.ts</code>.</p>
          </article>
        </div>

        <section className="status">
          <h2>API status</h2>
          {health ? (
            <pre>{JSON.stringify(health, null, 2)}</pre>
          ) : (
            <p>{error ? `Backend unavailable: ${error}` : "Checking backend..."}</p>
          )}
        </section>
      </section>
    </main>
  );
}
