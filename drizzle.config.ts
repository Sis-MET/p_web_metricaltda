import { defineConfig } from "drizzle-kit";

// pnpm db:generate crea la migración SQL a partir de src/lib/db/schema.ts. Las migraciones se
// aplican solas al arrancar el sitio (src/instrumentation.ts), también en Plesk.
export default defineConfig({
  dialect: "mysql",
  schema: "./src/lib/db/schema.ts",
  out: "./drizzle",
});
