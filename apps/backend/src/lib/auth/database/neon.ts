import { Pool, neonConfig } from "@neondatabase/serverless";

// In Cloudflare Workers, cached Pool instances can retain request-bound I/O.
// Force one-shot fetch-based queries and construct the pool per request.
neonConfig.poolQueryViaFetch = true;

export function createNeonAuthDatabase(connectionString: string) {
  return new Pool({ connectionString });
}
