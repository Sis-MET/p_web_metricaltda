import path from "node:path";
import { migrate } from "drizzle-orm/mysql2/migrator";
import { db } from "@/lib/db";
import { seedCatalog } from "@/lib/db/seed";

/**
 * Deja la base lista al arrancar el sitio: aplica las migraciones pendientes (carpeta drizzle/, que
 * viaja en el paquete) y, con la base vacía, carga el catálogo inicial. En Plesk no hay consola:
 * así un despliegue nuevo prepara su propia base.
 */
export async function prepareDatabase() {
  await migrate(db(), { migrationsFolder: path.join(process.cwd(), "drizzle") });
  if (await seedCatalog()) console.info("[base de datos] Catálogo inicial cargado");
}
