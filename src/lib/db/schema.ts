import {
  boolean,
  customType,
  datetime,
  double,
  int,
  mysqlTable,
  text,
  timestamp,
  uniqueIndex,
  varchar,
} from "drizzle-orm/mysql-core";

/*
 * Catálogo de productos. Lo administra el área comercial desde /panel; el sitio lo lee publicado.
 * Compatible con MariaDB desde la 10.3 (la del servidor de Plesk) y MySQL. Todas las fechas, en UTC
 * (ver src/lib/db/index.ts).
 */

/**
 * JSON guardado como texto. MariaDB trata JSON como LONGTEXT y lo devuelve como cadena (MySQL, ya
 * convertido): se acepta cualquiera de los dos.
 */
const json = <T>(name: string) =>
  customType<{ data: T; driverData: string }>({
    dataType: () => "json",
    toDriver: (value) => JSON.stringify(value),
    fromDriver: (value) => (typeof value === "string" ? JSON.parse(value) : value) as T,
  })(name);

/**
 * Archivo subido: su clave dentro de la carpeta de archivos (UPLOADS_DIR). En una imagen, `opaque`
 * indica que no tiene transparencia (una foto); un equipo recortado sobre fondo transparente no lo es.
 */
export type StoredImage = { key: string; width: number; height: number; opaque?: boolean };
export type StoredFile = { key: string; size: number; language?: "en" };

/**
 * Fecha que fija la aplicación (vencimientos). DATETIME y no TIMESTAMP: en MariaDB 10.3 un TIMESTAMP
 * sin valor por defecto se crea NOT NULL y la base lo reescribe con la hora actual en cada UPDATE.
 */
const moment = (name: string) => datetime(name, { mode: "date" });

/** Quién y cuándo: cada fila guarda su último cambio */
const audit = {
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow().onUpdateNow(),
  updatedBy: varchar("updated_by", { length: 36 }),
};

export const categories = mysqlTable(
  "categories",
  {
    id: int("id").autoincrement().primaryKey(),
    slug: varchar("slug", { length: 80 }).notNull(),
    name: varchar("name", { length: 120 }).notNull(),
    /** Una línea para menús y tarjetas */
    short: varchar("short", { length: 200 }).notNull(),
    description: text("description").notNull(),
    image: json<StoredImage | null>("image"),
    /** Por qué elegir esta categoría: { title, text }[] */
    highlights: json<{ title: string; text: string }[]>("highlights").notNull(),
    /** Demo 3D programado que se enlaza desde la categoría (clave de CATEGORY_DEMOS) */
    demo: varchar("demo", { length: 40 }),
    position: int("position").notNull().default(0),
    published: boolean("published").notNull().default(false),
    ...audit,
  },
  (table) => [uniqueIndex("categories_slug").on(table.slug)]
);

/** Líneas dentro de una categoría ("Sobremesa y compactas", "Plataformas de pesaje"…) */
export const productLines = mysqlTable(
  "product_lines",
  {
    id: int("id").autoincrement().primaryKey(),
    categoryId: int("category_id")
      .notNull()
      .references(() => categories.id, { onDelete: "cascade" }),
    slug: varchar("slug", { length: 80 }).notNull(),
    name: varchar("name", { length: 120 }).notNull(),
    position: int("position").notNull().default(0),
    ...audit,
  },
  (table) => [uniqueIndex("product_lines_category_slug").on(table.categoryId, table.slug)]
);

export const products = mysqlTable(
  "products",
  {
    id: int("id").autoincrement().primaryKey(),
    categoryId: int("category_id")
      .notNull()
      .references(() => categories.id, { onDelete: "restrict" }),
    lineId: int("line_id").references(() => productLines.id, { onDelete: "set null" }),
    /** Único en todo el catálogo: la lista de cotización guarda solo el slug */
    slug: varchar("slug", { length: 80 }).notNull(),
    model: varchar("model", { length: 120 }).notNull(),
    /** Tipo de equipo: "Báscula compacta", "Plataforma de pesaje"… */
    type: varchar("type", { length: 120 }).notNull(),
    summary: varchar("summary", { length: 300 }).notNull(),
    description: text("description").notNull(),
    /** Rango en kg; vacío si depende del modelo */
    capacityMin: double("capacity_min"),
    capacityMax: double("capacity_max"),
    protection: varchar("protection", { length: 60 }),
    /** Claves de ENVIRONMENTS */
    environments: json<string[]>("environments").notNull(),
    features: json<string[]>("features").notNull(),
    specs: json<{ label: string; value: string }[]>("specs").notNull(),
    image: json<StoredImage | null>("image"),
    /** Ficha técnica en PDF */
    brochure: json<StoredFile | null>("brochure"),
    /** Demo 3D programado en la ficha (clave de PRODUCT_DEMOS) */
    demo: varchar("demo", { length: 40 }),
    position: int("position").notNull().default(0),
    published: boolean("published").notNull().default(false),
    ...audit,
  },
  (table) => [uniqueIndex("products_slug").on(table.slug)]
);

/* ─── Usuarios del panel (Better Auth; el plugin admin agrega rol y bloqueo) ─ */

export const users = mysqlTable("users", {
  id: varchar("id", { length: 36 }).primaryKey(),
  name: varchar("name", { length: 120 }).notNull(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  emailVerified: boolean("email_verified").notNull().default(false),
  image: text("image"),
  /** "admin" (usuarios y todo el panel) o "comercial" (catálogo) */
  role: varchar("role", { length: 20 }),
  banned: boolean("banned").default(false),
  banReason: text("ban_reason"),
  banExpires: moment("ban_expires"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow().onUpdateNow(),
});

export const sessions = mysqlTable("sessions", {
  id: varchar("id", { length: 36 }).primaryKey(),
  token: varchar("token", { length: 255 }).notNull().unique(),
  userId: varchar("user_id", { length: 36 })
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  expiresAt: moment("expires_at").notNull(),
  ipAddress: varchar("ip_address", { length: 64 }),
  userAgent: text("user_agent"),
  impersonatedBy: varchar("impersonated_by", { length: 36 }),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow().onUpdateNow(),
});

/** Credenciales: la contraseña (cifrada) vive aquí, con providerId "credential" */
export const accounts = mysqlTable("accounts", {
  id: varchar("id", { length: 36 }).primaryKey(),
  userId: varchar("user_id", { length: 36 })
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  accountId: varchar("account_id", { length: 255 }).notNull(),
  providerId: varchar("provider_id", { length: 64 }).notNull(),
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  idToken: text("id_token"),
  accessTokenExpiresAt: moment("access_token_expires_at"),
  refreshTokenExpiresAt: moment("refresh_token_expires_at"),
  scope: text("scope"),
  password: text("password"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow().onUpdateNow(),
});

/** Códigos de un solo uso (restablecer la contraseña) */
export const verifications = mysqlTable("verifications", {
  id: varchar("id", { length: 36 }).primaryKey(),
  identifier: varchar("identifier", { length: 255 }).notNull(),
  value: text("value").notNull(),
  expiresAt: moment("expires_at").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow().onUpdateNow(),
});
