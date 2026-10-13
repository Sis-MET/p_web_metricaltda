import type { FormDef } from "./schema";

export type Submission = {
  subject: string;
  inbox: FormDef["inbox"];
  reference: string;
  replyTo: string;
  /** Campos ya legibles, en el orden del formulario */
  fields: { label: string; value: string }[];
  attachments: File[];
};

/**
 * Entrega de los formularios al equipo de Métrica.
 *
 * Pendiente: conectar el servicio de correo y asignar una dirección a cada buzón.
 * Mientras tanto, en desarrollo el envío se registra en la consola del servidor y en
 * producción falla de forma explícita: el visitante ve los canales directos de contacto
 * en lugar de una confirmación falsa que haría perder la solicitud.
 */
export async function deliver(submission: Submission): Promise<void> {
  if (process.env.NODE_ENV !== "production") {
    console.info(`[formulario] ${submission.reference} → ${submission.inbox}`, {
      ...submission,
      attachments: submission.attachments.map((file) => `${file.name} (${Math.round(file.size / 1024)} KB)`),
    });
    return;
  }
  throw new Error("El envío de formularios todavía no está configurado");
}
