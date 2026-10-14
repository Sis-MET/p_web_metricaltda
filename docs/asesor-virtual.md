# Asesor virtual (IA)

El botón **Asesor virtual** (abajo a la derecha, en todas las páginas, y en el bloque
"¿Necesita asesoría para elegir su equipo?") abre un chat que:

1. Pregunta por el proceso del cliente: qué pesa, peso máximo, ambiente, pesadas al día.
2. Recomienda de 1 a 3 equipos **del catálogo del sitio**, como tarjetas con foto, motivo,
   "Cotizar" y "Ver ficha".
3. Explica cómo la calibración acreditada o el soporte técnico ayudan en su caso.
4. Cierra con el botón **Siguiente paso**: abre el formulario de cotización, calibración o
   soporte con el resumen de la conversación ya escrito y, en la cotización, los equipos con sus
   cantidades en la lista. El cliente completa sus datos y envía; de ahí sigue el camino normal
   (correo y prospecto en Bitrix24, ver [formularios.md](formularios.md)).

## Cómo funciona

| Pieza | Archivo |
|---|---|
| Chat (se descarga recién al abrirlo) | `src/components/assistant/` |
| API (streaming, valida y limita) | `src/app/api/asesor/route.ts` |
| Instrucciones del modelo | `src/lib/assistant/instructions.ts` |
| Herramientas: tarjetas y siguiente paso | `src/lib/assistant/tools.ts` |
| Límites de uso | `src/lib/assistant/limits.ts` |

- **No inventa equipos.** Las instrucciones se arman con el catálogo, los servicios y los datos de
  la empresa del sitio (`src/content/`). Las tarjetas solo aceptan modelos que existen: si se agrega
  o cambia un producto, el asesor lo sabe sin tocar nada más.
- **Reglas:** no da precios, plazos ni stock; no inventa certificaciones; la acreditación es solo
  del laboratorio de calibración; solo habla de pesaje y de Métrica; deriva a WhatsApp si el
  cliente quiere hablar con una persona.
- **Contexto de la página:** en la ficha de un equipo, el asesor sabe cuál está viendo el cliente.
- **Sin base de datos:** la conversación vive en el navegador del visitante mientras dura su
  visita (sessionStorage) y se envía completa en cada consulta. El servidor no guarda nada.
- **La clave nunca llega al navegador:** el chat habla con `/api/asesor`, que llama a Gemini.

## Configuración

| Variable | Uso |
|---|---|
| `GOOGLE_GENERATIVE_AI_API_KEY` | Clave de [Google AI Studio](https://aistudio.google.com). Es una credencial: solo en `.env.local` y en el hosting. |
| `ASSISTANT_MODEL` | Modelo de Gemini. Por defecto `gemini-3.5-flash-lite`. |
| `ASSISTANT_DAILY_LIMIT` | Consultas por día de todo el sitio. Por defecto 400. |

Sin clave, el chat se abre igual pero avisa que no está disponible y ofrece WhatsApp.

## Cuota y costos

- **Capa gratuita de Gemini:** sirve para el desarrollo y una prueba piloto. Sus límites diarios
  los fija Google por proyecto y cambian sin mucho aviso: se ven en AI Studio, en *Usage* o
  *Rate limits*. En esa capa **Google puede usar las conversaciones para mejorar sus productos**;
  por eso el chat avisa que no se compartan datos sensibles.
- **Para publicar:** se recomienda activar la facturación del proyecto en AI Studio (misma clave,
  sin cambios de código). En la capa de pago Google no usa los datos para entrenar, y una
  conversación típica cuesta del orden de un centavo de dólar o menos con Flash-Lite.
- **Consumo:** cada mensaje del cliente es una consulta al modelo; la respuesta que muestra
  tarjetas sin texto puede usar una segunda.

## Protección contra abusos

- Solo responde a pedidos del propio sitio (encabezado `Origin`).
- Por visitante (IP): 20 mensajes cada 10 minutos.
- Del sitio entero: `ASSISTANT_DAILY_LIMIT` consultas por día (hora de Bolivia).
- Por conversación: 40 mensajes y 1500 caracteres por mensaje. Después, el chat deriva a un asesor.
- Si se agota la cuota (del sitio o de Google), el chat lo dice y ofrece WhatsApp.

Los límites viven en la memoria del servidor: si el hosting levanta varios procesos de Node.js,
cada uno cuenta por separado.

## Servidor

El SDK de IA (AI SDK 7) exige **Node.js 22 o superior** en el hosting.
