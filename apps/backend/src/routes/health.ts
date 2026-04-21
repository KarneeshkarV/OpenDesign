import { jsonResponse } from "../lib/cors";

export function handleHealth(): Response {
  return jsonResponse({
    service: "backend",
    status: "ok",
    timestamp: new Date().toISOString()
  });
}
