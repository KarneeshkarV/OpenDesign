import { handlePreflight, jsonResponse } from "./lib/cors";
import { getAuth } from "./lib/auth";
import type { Env } from "./lib/env";
import { handleChat } from "./routes/chat";
import { handleHealth } from "./routes/health";

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const { pathname } = new URL(request.url);

    if (request.method === "OPTIONS") {
      return handlePreflight();
    }

    if (pathname === "/api/health") {
      return handleHealth();
    }

    if (
      pathname.startsWith("/api/auth") &&
      (request.method === "GET" || request.method === "POST")
    ) {
      return getAuth(env).handler(request);
    }

    if (pathname === "/api/chat" && request.method === "POST") {
      return handleChat(request, env);
    }

    return jsonResponse(
      {
        message: "OpenDesign backend is running.",
        endpoints: ["/api/health", "/api/auth/*", "/api/chat"]
      },
      { status: 200 }
    );
  }
};
