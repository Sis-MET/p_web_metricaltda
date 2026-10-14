import { tool, type InferUITools, type UIDataTypes, type UIMessage } from "ai";
import { z } from "zod";
import { formatCapacity, productHref, productTitle, type Product } from "@/content/catalog";
import { PRODUCTS } from "@/content/products";
import { SERVICES } from "@/content/services";
import { FORMS } from "@/lib/forms/definitions";
import { MAX_QTY } from "@/lib/quote";
import { QUOTE_HREF } from "@/lib/routes";
import { compact } from "@/lib/utils";

/**
 * Herramientas del asesor virtual. El modelo conversa; los equipos y los botones que ve el
 * cliente salen siempre del catálogo real, así una recomendación no puede nombrar un modelo
 * que no existe ni llevar a un formulario equivocado.
 */

const SLUGS = PRODUCTS.map((product) => product.slug) as [string, ...string[]];
const productSlug = z.enum(SLUGS);

const BY_SLUG = new Map(PRODUCTS.map((product) => [product.slug, product]));

/** Los equipos pedidos que existen en el catálogo, sin repetir */
const withProducts = <T extends { slug: string }>(items: T[]) =>
  [...new Map(items.map((item) => [item.slug, item])).values()].flatMap((item) => {
    const product = BY_SLUG.get(item.slug);
    return product ? [{ ...item, product }] : [];
  });

/** Lo que la tarjeta del chat muestra de un equipo */
const productCard = (product: Product) => ({
  slug: product.slug,
  model: product.model,
  title: productTitle(product),
  href: productHref(product),
  image: { src: product.image.src, width: product.image.width, height: product.image.height },
  specs: compact([product.capacity && formatCapacity(product.capacity), product.protection]).join(" · "),
});

/** Formularios a los que el asesor deriva, con la página donde están */
const HANDOFFS = {
  cotizacion: QUOTE_HREF,
  calibracion: `${SERVICES.calibracion.href}#solicitar`,
  soporte: `${SERVICES.soporte.href}#solicitar`,
} as const;

export type HandoffForm = keyof typeof HANDOFFS;

export const assistantTools = {
  mostrar_equipos: tool({
    description:
      "Muestra al cliente las tarjetas de 1 a 3 equipos del catálogo que recomiendas, el más adecuado primero. " +
      "Úsala cada vez que recomiendes equipos.",
    inputSchema: z.object({
      equipos: z
        .array(
          z.object({
            slug: productSlug.describe("slug del equipo en el catálogo"),
            motivo: z.string().max(240).describe("Por qué le sirve, en una oración, con los datos que dio el cliente"),
          })
        )
        .min(1)
        .max(3),
    }),
    execute: ({ equipos }) => withProducts(equipos).map(({ product, motivo }) => ({ ...productCard(product), reason: motivo })),
    // El modelo ya conoce el catálogo: basta con confirmarle qué vio el cliente
    toModelOutput: ({ output }) => ({
      type: "text",
      value: `El cliente ve las tarjetas de: ${output.map((product) => product.title).join(", ")}.`,
    }),
  }),

  siguiente_paso: tool({
    description:
      "Muestra al cliente el botón para enviar su solicitud al equipo de Métrica: abre el formulario del sitio " +
      "con el resumen ya escrito y, en la cotización, los equipos agregados a su lista. Úsala siempre que el cliente " +
      "pida cotizar, un precio, calibrar o soporte: sin este botón no puede enviar nada.",
    inputSchema: z.object({
      formulario: z.enum(Object.keys(HANDOFFS) as [HandoffForm, ...HandoffForm[]]),
      resumen: z
        .string()
        .max(700)
        .describe(
          "Notas breves en primera persona, como si las escribiera el cliente: rubro, proceso, pesos, ambiente, " +
            "volumen y lo que necesita (equipos o servicios). Para soporte: equipo y falla."
        ),
      equipos: z
        .array(z.object({ slug: productSlug, cantidad: z.number().int().min(1).max(MAX_QTY) }))
        .max(5)
        .optional()
        .describe("Solo en cotización: equipos para su lista, con la cantidad que pidió el cliente (1 si no la dijo)"),
    }),
    execute: ({ formulario, resumen, equipos = [] }) => ({
      form: formulario,
      href: HANDOFFS[formulario],
      label: FORMS[formulario].submitLabel,
      summary: resumen,
      products:
        formulario === "cotizacion"
          ? withProducts(equipos).map(({ product, cantidad }) => ({ ...productCard(product), qty: cantidad }))
          : [],
    }),
    toModelOutput: ({ output }) => ({
      type: "text",
      value: `El cliente ve el botón «${output.label}» con el resumen.`,
    }),
  }),
};

type AssistantTools = InferUITools<typeof assistantTools>;

export type AssistantMessage = UIMessage<never, UIDataTypes, AssistantTools>;
/** Equipo recomendado, como lo recibe el chat */
export type AssistantSuggestion = AssistantTools["mostrar_equipos"]["output"][number];
export type AssistantHandoff = AssistantTools["siguiente_paso"]["output"];
