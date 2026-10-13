/**
 * Agenda de visitas técnicas (clave "AAAA-MM-DD").
 * Datos de ejemplo: reemplazar por la agenda real o retirar el calendario antes de publicar.
 */

export type ServiceVisit = {
  type: "calibracion" | "soporte";
  location: string;
  description: string;
};

export const SCHEDULE: Record<string, ServiceVisit[]> = {
  "2026-02-04": [{ type: "calibracion", location: "Potosí",     description: "Calibración de balanzas industriales" }],
  "2026-02-06": [{ type: "soporte",     location: "La Paz",     description: "Mantenimiento preventivo de básculas" }],
  "2026-02-10": [
    { type: "calibracion", location: "Cochabamba", description: "Calibración de pesas patrón" },
    { type: "soporte",     location: "Cochabamba", description: "Soporte técnico en planta" },
  ],
  "2026-02-13": [{ type: "soporte",     location: "Oruro",      description: "Diagnóstico báscula de camión" }],
  "2026-02-17": [{ type: "calibracion", location: "Santa Cruz", description: "Calibración certificada ISO/IEC 17025" }],
  "2026-02-20": [{ type: "calibracion", location: "La Paz",     description: "Calibración de instrumentos de pesaje" }],
  "2026-02-24": [{ type: "soporte",     location: "Sucre",      description: "Mantenimiento correctivo de balanzas" }],
  "2026-02-27": [
    { type: "soporte",     location: "La Paz", description: "Visita técnica y diagnóstico" },
    { type: "calibracion", location: "La Paz", description: "Calibración de emergencia" },
  ],
  "2026-03-03": [{ type: "calibracion", location: "Potosí",     description: "Calibración anual, pesas patrón" }],
  "2026-03-06": [{ type: "soporte",     location: "Oruro",      description: "Mantenimiento preventivo" }],
  "2026-03-10": [{ type: "calibracion", location: "Santa Cruz", description: "Calibración de balanzas" }],
  "2026-03-17": [{ type: "soporte",     location: "Cochabamba", description: "Soporte en campo" }],
  "2026-03-20": [{ type: "calibracion", location: "La Paz",     description: "Calibración ISO/IEC 17025" }],
  "2026-03-25": [{ type: "soporte",     location: "Sucre",      description: "Revisión técnica" }],
};

