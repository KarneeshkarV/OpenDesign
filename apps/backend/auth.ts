import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { betterAuth } from "better-auth";
import { createAuthOptions } from "./src/lib/auth/options";

const authConfigDir = dirname(fileURLToPath(import.meta.url));

function stripWrappedQuotes(value: string) {
  if (
    (value.startsWith('"') && value.endsWith('"')) ||
    (value.startsWith("'") && value.endsWith("'"))
  ) {
    return value.slice(1, -1);
  }

  return value;
}

function loadLocalDevVars() {
  const devVarsPath = join(authConfigDir, ".dev.vars");

  if (!existsSync(devVarsPath)) {
    return;
  }

  const fileContents = readFileSync(devVarsPath, "utf8");

  for (const rawLine of fileContents.split(/\r?\n/)) {
    const line = rawLine.trim();

    if (!line || line.startsWith("#")) {
      continue;
    }

    const separatorIndex = line.indexOf("=");

    if (separatorIndex <= 0) {
      continue;
    }

    const key = line.slice(0, separatorIndex).trim();
    const value = stripWrappedQuotes(line.slice(separatorIndex + 1).trim());

    if (!key || process.env[key] !== undefined) {
      continue;
    }

    process.env[key] = value;
  }
}

loadLocalDevVars();

function getRequiredEnv(key: string) {
  const value = process.env[key]?.trim();

  if (!value) {
    throw new Error(`${key} is not configured.`);
  }

  return value;
}

export const auth = betterAuth(
  createAuthOptions({
    baseUrl: getRequiredEnv("BETTER_AUTH_URL"),
    secret: getRequiredEnv("BETTER_AUTH_SECRET"),
    databaseUrl: getRequiredEnv("DATABASE_URL"),
    betterAuthApiKey: process.env.BETTER_AUTH_API_KEY,
    trustedOrigins: process.env.BETTER_AUTH_TRUSTED_ORIGINS
      ?.split(",")
      .map((origin) => origin.trim())
      .filter(Boolean),
    includeInfra: false
  })
);
