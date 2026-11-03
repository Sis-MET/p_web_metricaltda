import path from "node:path";
import type { RowDataPacket } from "mysql2";
import { migrate } from "drizzle-orm/mysql2/migrator";
import { db } from "@/lib/db";
import { seedCatalog } from "@/lib/db/seed";

/** Hasta cuánto espera un proceso a que otro termine de preparar la base, en segundos */
const LOCK_TIMEOUT = 300;
/** Los bloqueos con nombre valen para todo el servidor: el nombre lleva el de la base */
const LOCK_NAME = "CONCAT(DATABASE(), ':preparar')";

/**
 * Deja la base lista al arrancar el sitio: aplica las migraciones pendientes (carpeta drizzle/, que
 * viaja en el paquete) y, con la base vacía, carga el catálogo inicial. En Plesk no hay consola:
 * así un despliegue nuevo prepara su propia base.
 *
 * Plesk puede arrancar varios procesos del sitio a la vez: uno prepara la base y los demás esperan.
 */
export async function prepareDatabase() {
  const connection = await db().$client.getConnection();
  try {
    const [[{ locked }]] = await connection.query<RowDataPacket[]>(`SELECT GET_LOCK(${LOCK_NAME}, ?) AS locked`, [
      LOCK_TIMEOUT,
    ]);
    if (locked !== 1) throw new Error("Otro proceso del sitio no terminó de preparar la base");
    try {
      // MariaDB crea las bases en latin1 si el servidor no dice otra cosa: las tablas nuevas, en
      // utf8mb4 (cualquier carácter que se pegue en el panel, no solo tildes y eñes)
      const [[{ charset }]] = await connection.query<RowDataPacket[]>("SELECT @@character_set_database AS charset");
      if (charset !== "utf8mb4") await connection.query("ALTER DATABASE CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci");

      await migrate(db(), { migrationsFolder: path.join(process.cwd(), "drizzle") });
      if (await seedCatalog()) console.info("[base de datos] Catálogo inicial cargado");
    } finally {
      await connection.query(`SELECT RELEASE_LOCK(${LOCK_NAME})`);
    }
  } finally {
    connection.release();
  }
}
