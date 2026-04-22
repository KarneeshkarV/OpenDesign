import { createNeonAuthDatabase } from "./neon";

export function createAuthDatabase(databaseUrl: string) {
  return createNeonAuthDatabase(databaseUrl);
}
