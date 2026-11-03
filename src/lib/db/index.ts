import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";
import * as schema from "./schema";

/**
 * Conexión a la base del catálogo (MariaDB en Plesk; en desarrollo, la de esta PC). DATABASE_URL:
 * mysql://usuario:contraseña@host:3306/base. El pool se crea al primer uso (nunca al compilar) y
 * se conserva entre recargas en desarrollo.
 *
 * Las fechas viajan en UTC: cada conexión fija también la zona de la base en UTC, para que NOW() y
 * las columnas TIMESTAMP no usen la hora local del servidor (el sitio las leería corridas).
 */

const globalForDb = globalThis as unknown as { metricaPool?: mysql.Pool };

function pool() {
  if (globalForDb.metricaPool) return globalForDb.metricaPool;
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("Falta DATABASE_URL: la conexión a la base del catálogo");
  const created = mysql.createPool({ uri: url, connectionLimit: 5, charset: "utf8mb4", timezone: "Z" });
  // Se encola antes que cualquier consulta de la conexión nueva
  created.pool.on("connection", (connection) =>
    connection.query("SET time_zone = '+00:00'", (error) => {
      if (error) console.error("[base de datos] No se pudo fijar la zona horaria UTC", error);
    })
  );
  globalForDb.metricaPool = created;
  return created;
}

let instance: ReturnType<typeof create> | undefined;
const create = () => drizzle(pool(), { schema, mode: "default" });

export function db() {
  instance ??= create();
  return instance;
}

export { schema };
