import type { QuoteItem } from "@/lib/quote";
import type { FieldDef, FormDef } from "./schema";

/* ─── Campos comunes ────────────────────────────────────────────────────── */

/** Nombres de los datos de contacto comunes: la entrega los usa para el correo y el CRM */
export const CONTACT = {
  name: "nombre",
  lastName: "apellido",
  company: "empresa",
  position: "cargo",
  email: "email",
  phone: "telefono",
  city: "ciudad",
} as const;

// Nombre y apellido por separado: así llegan ordenados al CRM
const NAME: FieldDef = {
  name: CONTACT.name,
  label: "Nombre",
  type: "text",
  required: true,
  autoComplete: "given-name",
  placeholder: "Su nombre",
};
const LAST_NAME: FieldDef = {
  name: CONTACT.lastName,
  label: "Apellido",
  type: "text",
  required: true,
  autoComplete: "family-name",
  placeholder: "Su apellido",
};
const COMPANY: FieldDef = {
  name: CONTACT.company,
  label: "Empresa",
  type: "text",
  required: true,
  autoComplete: "organization",
  placeholder: "Empresa a la que pertenece",
};
const ROLE: FieldDef = {
  name: CONTACT.position,
  label: "Cargo",
  type: "text",
  autoComplete: "organization-title",
  placeholder: "Su cargo o rol",
};
const EMAIL: FieldDef = {
  name: CONTACT.email,
  label: "Correo electrónico",
  type: "email",
  required: true,
  autoComplete: "email",
  placeholder: "nombre@empresa.com",
};
const PHONE: FieldDef = {
  name: CONTACT.phone,
  label: "Teléfono o celular",
  type: "tel",
  required: true,
  autoComplete: "tel",
  placeholder: "+591 7xxxxxxx",
};
const options = (...labels: string[]) => labels.map((label) => ({ value: label, label }));

// Las mismas opciones de "Ciudad del prospecto" en Bitrix24 (se vinculan por el texto)
const CITY: FieldDef = {
  name: CONTACT.city,
  label: "Ciudad",
  type: "select",
  placeholder: "Seleccione su ciudad",
  options: options("La Paz", "Cochabamba", "Santa Cruz", "Oruro", "Potosí", "Sucre", "Tarija", "Beni", "Pando"),
};

/* ─── Formularios del sitio ─────────────────────────────────────────────── */

export const FORMS = {
  contacto: {
    prefix: "CON",
    inbox: "comercial",
    subject: "Consulta desde el sitio web",
    submitLabel: "Enviar mensaje",
    success: {
      title: "¡Mensaje enviado!",
      text: "Gracias por escribirnos. Nuestro equipo se pondrá en contacto con usted a la brevedad.",
    },
    fields: [
      NAME,
      LAST_NAME,
      COMPANY,
      EMAIL,
      PHONE,
      CITY,
      {
        name: "motivo",
        label: "Motivo de la consulta",
        type: "select",
        required: true,
        placeholder: "Seleccione una opción",
        options: options("Asesoría comercial", "Calibración", "Soporte técnico", "Otro"),
      },
      {
        name: "mensaje",
        label: "Mensaje",
        type: "textarea",
        required: true,
        full: true,
        placeholder: "Cuéntenos en qué podemos ayudarle",
      },
    ],
  },

  cotizacion: {
    prefix: "COT",
    inbox: "comercial",
    subject: "Solicitud de cotización",
    submitLabel: "Solicitar cotización",
    success: {
      title: "¡Solicitud recibida!",
      text: "Un asesor revisará su lista y le enviará la cotización a su correo a la brevedad.",
    },
    fields: [
      { name: "productos", label: "Productos", type: "quote" },
      NAME,
      LAST_NAME,
      COMPANY,
      EMAIL,
      PHONE,
      ROLE,
      { ...CITY, required: true },
      {
        name: "servicios",
        label: "Incluir en la cotización",
        type: "checkbox",
        full: true,
        options: options("Calibración acreditada", "Instalación y puesta en marcha", "Plan de mantenimiento"),
      },
      {
        name: "comentarios",
        label: "Detalles de su aplicación",
        type: "textarea",
        full: true,
        rows: 3,
        placeholder: "Qué necesita pesar, capacidad requerida, ambiente de trabajo…",
      },
    ],
    check: (values) =>
      (values.productos as QuoteItem[]).length === 0 && !values.comentarios
        ? { field: "comentarios", message: "Agregue productos a su lista o describa lo que necesita" }
        : undefined,
    // Cotizaciones, calibración y soporte entran a CRM › Prospectos con su área (tipo de oportunidad);
    // en la cotización, los servicios pedidos suman su línea comercial
    crm: {
      opportunityTypes: (values) => {
        const services = values.servicios as string[];
        return [
          "VENTA",
          ...(services.includes("Calibración acreditada") ? ["CALIBRACIÓN"] : []),
          ...(services.some((s) => s !== "Calibración acreditada") ? ["SOPORTE TECNICO"] : []),
        ];
      },
    },
    summaryField: "comentarios",
  },

  calibracion: {
    prefix: "CAL",
    inbox: "laboratorio",
    subject: "Solicitud de calibración",
    submitLabel: "Solicitar calibración",
    success: {
      title: "¡Solicitud recibida!",
      text: "El laboratorio revisará sus equipos y se comunicará con usted para coordinar la calibración.",
    },
    fields: [
      NAME,
      LAST_NAME,
      COMPANY,
      EMAIL,
      PHONE,
      { ...CITY, required: true },
      ROLE,
      {
        name: "equipos",
        label: "Equipos a calibrar",
        type: "textarea",
        required: true,
        full: true,
        rows: 3,
        hint: "Cantidad, tipo (balanza o pesas patrón), marca y capacidad de cada equipo.",
        placeholder: "Ej.: 2 balanzas de piso METTLER TOLEDO de 1500 kg",
      },
      {
        name: "adjunto",
        label: "Formulario de calibración o lista de equipos",
        type: "file",
        full: true,
        accept: ["pdf", "sheet", "doc", "image"],
        hint: "Opcional",
      },
    ],
    crm: { opportunityTypes: () => ["CALIBRACIÓN"] },
    summaryField: "equipos",
  },

  soporte: {
    prefix: "SOP",
    inbox: "soporte",
    subject: "Solicitud de soporte técnico",
    submitLabel: "Solicitar soporte",
    success: {
      title: "¡Solicitud recibida!",
      text: "Un técnico revisará el caso y se comunicará con usted para coordinar la atención.",
    },
    fields: [
      NAME,
      LAST_NAME,
      COMPANY,
      EMAIL,
      PHONE,
      { ...CITY, required: true },
      {
        name: "equipo",
        label: "Marca y modelo del equipo",
        type: "text",
        required: true,
        placeholder: "Ej.: METTLER TOLEDO BBA231",
      },
      {
        name: "problema",
        label: "Descripción del problema",
        type: "textarea",
        required: true,
        full: true,
        rows: 4,
        placeholder: "Detalle qué ocurre con su equipo y desde cuándo",
      },
      {
        name: "fotos",
        label: "Fotos del equipo",
        type: "file",
        full: true,
        accept: ["image"],
        maxFiles: 3,
        hint: "Opcional · hasta 3 imágenes",
      },
    ],
    crm: { opportunityTypes: () => ["SOPORTE TECNICO"] },
    summaryField: "problema",
  },

  postulacion: {
    prefix: "POS",
    inbox: "rrhh",
    subject: "Postulación laboral",
    submitLabel: "Enviar postulación",
    success: {
      title: "¡Postulación recibida!",
      text: "Gracias por su interés en Métrica. Revisaremos su perfil y le contactaremos si se ajusta a una vacante.",
    },
    fields: [
      NAME,
      LAST_NAME,
      PHONE,
      EMAIL,
      {
        name: "ciudad",
        label: "Ciudad en la que vive",
        type: "select",
        required: true,
        placeholder: "Seleccione su ciudad",
        options: options("La Paz", "Santa Cruz", "Otra"),
      },
      {
        name: "area",
        label: "Área de interés",
        type: "select",
        required: true,
        placeholder: "Seleccione un área",
        options: options("Laboratorio de calibración", "Soporte técnico y mantenimiento", "Ventas", "Administración", "Pasantía"),
      },
      {
        name: "nivel",
        label: "Nivel de educación",
        type: "select",
        required: true,
        placeholder: "Seleccione su nivel",
        options: options("Técnico medio", "Técnico superior", "Universitario", "Titulado", "Postgrado"),
      },
      {
        name: "especialidad",
        label: "Profesión o especialidad",
        type: "text",
        required: true,
        full: true,
        placeholder: "Ej.: Ingeniería electrónica",
      },
      {
        name: "cv",
        label: "Hoja de vida",
        type: "file",
        required: true,
        full: true,
        accept: ["pdf"],
        hint: "En formato PDF",
      },
    ],
  },

  reclamo: {
    prefix: "REC",
    inbox: "calidad",
    subject: "Reclamo o sugerencia",
    submitLabel: "Enviar",
    success: {
      title: "¡Registramos su mensaje!",
      text: "Guarde su número de seguimiento: lo necesitará para consultar el estado de su reclamo o sugerencia.",
    },
    fields: [
      {
        name: "tipo",
        label: "¿Qué desea registrar?",
        type: "radio",
        required: true,
        options: options("Reclamo", "Sugerencia"),
      },
      {
        name: "area",
        label: "Área relacionada",
        type: "select",
        required: true,
        placeholder: "Seleccione un área",
        options: options("Laboratorio de calibración", "Soporte técnico", "Venta de equipos", "Atención al cliente", "Otra"),
      },
      NAME,
      LAST_NAME,
      COMPANY,
      EMAIL,
      PHONE,
      ROLE,
      {
        name: "referencia",
        label: "N.º de certificado, factura u orden",
        type: "text",
        placeholder: "Opcional",
      },
      {
        name: "mensaje",
        label: "Detalle",
        type: "textarea",
        required: true,
        full: true,
        rows: 5,
        placeholder: "Describa lo ocurrido o su sugerencia",
      },
    ],
  },
} satisfies Record<string, FormDef>;

export type FormId = keyof typeof FORMS;

export const isFormId = (id: string): id is FormId => Object.hasOwn(FORMS, id);
