/**
 * Límites de uso del asesor, en la memoria del servidor: protegen la cuota de la IA de abusos y
 * bots. El tope diario es del sitio entero (no depende de la IP, que puede falsearse); el del
 * visitante evita que una sola persona o script lo agote.
 */

const VISITOR_WINDOW_MS = 10 * 60_000;
const VISITOR_LIMIT = 20;
const DAILY_LIMIT = Number(process.env.ASSISTANT_DAILY_LIMIT) || 400;

const BOLIVIA_DAY = new Intl.DateTimeFormat("en-CA", { timeZone: "America/La_Paz" });

const visitors = new Map<string, { count: number; resetAt: number }>();
const day = { key: "", count: 0 };

/** Quién consulta: la IP que informa el proxy del hosting, si la informa */
export function visitorOf(request: Request) {
  const forwarded = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  return forwarded || request.headers.get("x-real-ip") || undefined;
}

/**
 * Registra una consulta; `false` si el visitante o el sitio ya llegaron a su límite. Sin IP solo
 * rige el tope diario: agrupar a todos bajo una misma clave dejaría el chat en 20 mensajes para todos.
 */
export function takeQuota(visitor: string | undefined) {
  const now = Date.now();
  const today = BOLIVIA_DAY.format(now);
  if (day.key !== today) Object.assign(day, { key: today, count: 0 });
  if (day.count >= DAILY_LIMIT) return false;

  if (visitor) {
    let entry = visitors.get(visitor);
    if (!entry || entry.resetAt <= now) {
      entry = { count: 0, resetAt: now + VISITOR_WINDOW_MS };
      visitors.set(visitor, entry);
    }
    if (entry.count >= VISITOR_LIMIT) return false;
    entry.count++;
  }

  day.count++;
  // Las ventanas vencidas se descartan para que el mapa no crezca sin fin
  if (visitors.size > 5_000) {
    for (const [key, { resetAt }] of visitors) if (resetAt <= now) visitors.delete(key);
  }
  return true;
}
