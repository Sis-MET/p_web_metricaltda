/**
 * Al arrancar el servidor (una vez): prepara la base del catálogo. Si falla, el sitio arranca igual
 * y las páginas que necesitan el catálogo muestran su aviso de error; queda el detalle en el registro.
 */
export async function register() {
  if (process.env.NEXT_RUNTIME !== "nodejs") return;
  if (!process.env.DATABASE_URL) {
    console.warn("[base de datos] Falta DATABASE_URL: el catálogo de productos no estará disponible");
    return;
  }
  try {
    const { prepareDatabase } = await import("@/lib/db/setup");
    await prepareDatabase();
  } catch (error) {
    console.error("[base de datos] No se pudo preparar la base", error);
  }
}
