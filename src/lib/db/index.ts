import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";
import * as schema from "./schema";

/**
 * Conexión a la base del catálogo (MariaDB en Plesk; en desarrollo, la de esta PC). DATABASE_URL:
 * mysql://usuario:contraseña@host:3306/base. El pool se crea al primer uso (nunca al compilar) y
 * se conserva entre recargas en desarrollo.
 */

const globalForDb = globalThis as unknown as { metricaPool?: mysql.Pool };

function pool() {
  if (globalForDb.metricaPool) return globalForDb.metricaPool;
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("Falta DATABASE_URL: la conexión a la base del catálogo");
  globalForDb.metricaPool = mysql.createPool({ uri: url, connectionLimit: 5, charset: "utf8mb4", timezone: "Z" });
  return globalForDb.metricaPool;
}

let instance: ReturnType<typeof create> | undefined;
const create = () => drizzle(pool(), { schema, mode: "default" });

export function db() {
  instance ??= create();
  return instance;
}

export { schema };
