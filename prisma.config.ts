import { defineConfig, env } from "prisma/config";

try {
  await import("dotenv/config");
} catch {
  // Runtime container injects env vars directly, so dotenv is optional there.
}

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url: env("DIRECT_URL"),
  },
});
