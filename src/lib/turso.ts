import { createClient } from "@libsql/client";
import { env } from "@/config/envs";

if (!env.TURSO_DATABASE_URL) {
  throw new Error("TURSO_DATABASE_URL is not defined");
}

if (!env.TURSO_AUTH_TOKEN) {
  throw new Error("TURSO_AUTH_TOKEN is not defined");
}

export const turso = createClient({
  url: env.TURSO_DATABASE_URL,
  authToken: env.TURSO_AUTH_TOKEN,
});
