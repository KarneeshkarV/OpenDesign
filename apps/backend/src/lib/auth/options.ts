import { dash } from "@better-auth/infra";
import type { BetterAuthOptions } from "better-auth";
import { createAuthDatabase } from "./database";

type AuthOptionInput = {
  baseUrl: string;
  secret: string;
  databaseUrl: string;
  betterAuthApiKey?: string;
  trustedOrigins?: string[];
  includeInfra?: boolean;
};

function normalizeOrigins(origins: string[]) {
  return Array.from(
    new Set(
      origins
        .map((origin) => origin.trim())
        .filter(Boolean)
        .map((origin) => origin.replace(/\/$/, ""))
    )
  );
}

export function createAuthOptions({
  baseUrl,
  secret,
  databaseUrl,
  betterAuthApiKey,
  trustedOrigins = [],
  includeInfra = true
}: AuthOptionInput): BetterAuthOptions {
  const dashOptions = betterAuthApiKey?.trim()
    ? { apiKey: betterAuthApiKey }
    : undefined;

  const plugins = includeInfra ? [dash(dashOptions)] : [];

  return {
    appName: "OpenDesign",
    baseURL: baseUrl,
    secret,
    database: createAuthDatabase(databaseUrl),
    trustedOrigins: normalizeOrigins([
      "http://localhost:3000",
      baseUrl,
      ...trustedOrigins
    ]),
    emailAndPassword: {
      enabled: true
    },
    plugins
  };
}
