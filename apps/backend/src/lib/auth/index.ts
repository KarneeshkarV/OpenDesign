import { betterAuth } from "better-auth";
import type { Env } from "../env";
import { createAuthOptions } from "./options";

function getRequiredValue(value: string | undefined, key: string) {
  const trimmedValue = value?.trim();

  if (!trimmedValue) {
    throw new Error(`${key} is not configured.`);
  }

  return trimmedValue;
}

function parseTrustedOrigins(value: string | undefined) {
  if (!value?.trim()) {
    return [];
  }

  return value
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);
}

export function getAuth(env: Env) {
  return betterAuth(
    createAuthOptions({
      baseUrl: getRequiredValue(env.BETTER_AUTH_URL, "BETTER_AUTH_URL"),
      secret: getRequiredValue(env.BETTER_AUTH_SECRET, "BETTER_AUTH_SECRET"),
      databaseUrl: getRequiredValue(env.DATABASE_URL, "DATABASE_URL"),
      betterAuthApiKey: env.BETTER_AUTH_API_KEY,
      trustedOrigins: parseTrustedOrigins(env.BETTER_AUTH_TRUSTED_ORIGINS)
    })
  );
}

export async function getAuthSession(request: Request, env: Env) {
  return getAuth(env).api.getSession({
    headers: request.headers
  });
}
