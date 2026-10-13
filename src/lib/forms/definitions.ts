import type { QuoteItem } from "@/lib/quote";
import type { FieldDef, FormDef } from "./schema";

/* ─── Campos comunes ────────────────────────────────────────────────────── */

const NAME: FieldDef = {
  name: "nombre",
  label: "Nombre y apellido",
  type: "text",
  required: true,
  autoComplete: "name",
  placeholder: "Su nombre completo",
};
const COMPANY: FieldDef = {
  name: "empresa",
  label: "Empresa",
  type: "text",
  required: true,
  autoComplete: "organization",
  placeholder: "Empresa a la que pertenece",
};
const ROLE: FieldDef = {
  name: "cargo",
  label: "Cargo",
  type: "text",
  autoComplete: "organization-title",
  placeholder: "Su cargo o rol",
};
const EMAIL: FieldDef = {
  name: "email",
  label: "Correo electrónico",
  type: "email",
  required: true,
  autoComplete: "email",
  placeholder: "nombre@empresa.com",
};
const PHONE: FieldDef = {
  name: "telefono",
  label: "Teléfono o celular",
  type: "tel",
  required: true,
  autoComplete: "tel",
  placeholder: "+591 7xxxxxxx",
};
const CITY: FieldDef = {
  name: "ciudad",
  label: "Ciudad",
  type: "text",
  autoComplete: "address-level2",
  placeholder: "Ciudad",
};

const options = (...labels: string[]) => labels.map((label) => ({ value: label, label }));

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
      COMPANY,
      EMAIL,
      PHONE,
      ROLE,
      CITY,
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
      COMPANY,
      EMAIL,
      PHONE,
      CITY,
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
      { ...NAME, label: "Nombre completo" },
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
