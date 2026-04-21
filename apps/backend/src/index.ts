import { createOpenAI } from "@ai-sdk/openai";
import { streamText } from "ai";

interface Env {
  OPENAI_API_KEY: string;
}

const corsHeaders = {
  "Access-Control-Allow-Headers": "Content-Type",
  "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
  "Access-Control-Allow-Origin": "*"
};

const json = (body: unknown, init?: ResponseInit) =>
  new Response(JSON.stringify(body, null, 2), {
    ...init,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      ...corsHeaders,
      ...init?.headers
    }
  });

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const { pathname } = new URL(request.url);

    if (request.method === "OPTIONS") {
      return new Response(null, {
        status: 204,
        headers: corsHeaders
      });
    }

    if (pathname === "/api/health") {
      return json({
        service: "backend",
        status: "ok",
        timestamp: new Date().toISOString()
      });
    }

    if (pathname === "/api/chat" && request.method === "POST") {
      const { messages } = (await request.json()) as {
        messages: Array<{ role: "user" | "assistant" | "system"; content: string }>;
      };

      const openai = createOpenAI({ apiKey: env.OPENAI_API_KEY });

      const result = streamText({
        model: openai("gpt-4o-mini"),
        messages
      });

      return result.toDataStreamResponse({
        headers: corsHeaders
      });
    }

    return json(
      {
        message: "OpenDesign backend is running.",
        endpoints: ["/api/health", "/api/chat"]
      },
      { status: 200 }
    );
  }
};
