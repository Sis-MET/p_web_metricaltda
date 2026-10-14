# Envío de los formularios del sitio

Cada formulario se valida igual en el navegador y en el servidor, y se entrega por correo a
**comercial@metrica.com.bo y asistencia@metrica.com.bo**. Las solicitudes comerciales, además,
entran a **Bitrix24 › CRM › Prospectos** (columna "Sin asignar") con su área asignada:

| Formulario | Bitrix24 · Tipo de oportunidad | Adjuntos en el prospecto |
|---|---|---|
| Cotización (`/cotizacion`) | VENTA (+ CALIBRACIÓN / SOPORTE TECNICO según los servicios pedidos) | — (los equipos van en la pestaña Productos) |
| Calibración | CALIBRACIÓN | Formulario o lista de equipos |
| Soporte técnico | SOPORTE TECNICO | Fotos del equipo |
| Contacto, Trabaja con nosotros, Reclamos y sugerencias | Solo correo | — |

Los canales corren en paralelo: basta con que uno entregue para que el cliente reciba su número
de referencia. Si un canal falla, queda en el registro del servidor
(`[formulario] COT-… · Bitrix24 falló`). Si fallan todos, el visitante ve los canales directos
(WhatsApp, teléfono, correo) y lo que escribió se conserva.

Para que otro formulario cree prospectos, basta con darle `crm` en
`src/lib/forms/definitions.ts`. Para separar buzones por área (laboratorio, soporte, RR. HH.,
calidad) se completan las variables `MAIL_TO_*`; las vacías usan `MAIL_TO_DEFAULT`.

## Variables de entorno

La plantilla es `.env.example`. En local se copian a `.env.local`; en el servidor se cargan en el
panel del hosting. **`.env.local` nunca va a Git** (está en `.gitignore`): tiene la contraseña del
correo y el webhook de Bitrix24.

Sin `SMTP_*` o sin `BITRIX24_WEBHOOK_URL`, en desarrollo el envío se muestra en la consola; en
producción ese canal cuenta como falla.

## Correo: SMTP de MegaLink

El correo de metrica.com.bo está en MegaLink y su registro SPF es estricto
(`v=spf1 a mx include:_spf.megalink.cloud -all`): solo sus servidores pueden enviar correo
"de" @metrica.com.bo. El sitio envía por SMTP con la cuenta comercial@:

```
SMTP_HOST=mail.metrica.com.bo
SMTP_PORT=465
SMTP_SECURE=true
SMTP_TLS_SERVERNAME=h22.megalink.com
SMTP_USER=comercial@metrica.com.bo
SMTP_PASSWORD=…
```

- **Por qué TLS en el 465 y no el puerto 25 "sin seguridad" de Outlook:** el servidor sí cifra
  (TLS 1.3 en 25, 587 y 465), pero presenta el certificado `*.megalink.com` de su nombre real,
  `h22.megalink.com`. Con `SMTP_TLS_SERVERNAME` el sitio valida el certificado con ese nombre:
  la contraseña viaja cifrada y el servidor queda verificado.
- Los correos llegan con *Responder a* = el correo del cliente.
- Verificación: `pnpm mail:check` comprueba la conexión y el usuario sin enviar nada;
  `pnpm mail:check --enviar` manda un correo de prueba a los buzones.
- Si cambia la contraseña de comercial@ en Outlook, hay que actualizar `SMTP_PASSWORD`. Una
  casilla propia para el sitio (p. ej. `web@metrica.com.bo`) evita esa dependencia.

## Bitrix24: prospectos

Usa el webhook entrante de METRICA (permiso `crm`), el mismo enfoque que ServiceMET.

| Dato del sitio | Campo del prospecto |
|---|---|
| Nombre, apellido, empresa, cargo | Nombre, Apellido, Empresa, Cargo |
| Correo y teléfono | Correo y teléfono de trabajo |
| Ciudad | Ciudad del prospecto (obligatorio en Bitrix24) |
| Formulario y servicios pedidos | Tipo de oportunidad |
| Equipos de la lista de cotización | Pestaña **Productos** (cantidad, sin precio) |
| Archivos adjuntos | Archivo adjunto |
| Referencia y el resto del formulario | Comentario |
| — | Fuente "Pagina Web", etapa "Sin asignar", origen `SITIO_WEB` + referencia |

Los IDs de METRICA están en `.env.example` (verificados el 13/10/2026 con `crm.status.list` y
`crm.lead.fields`, y con prospectos de prueba). Si cambian las opciones de "Ciudad del prospecto"
o "Tipo de oportunidad" en Bitrix24, se mantienen: el sitio las busca por el texto.

Para encontrar en Bitrix24 el prospecto de una solicitud, buscar su referencia (COT-…, CAL-…,
SOP-…): está en el comentario y en el campo de origen.

Si el webhook se filtra: en Bitrix24, **Aplicaciones → Recursos para desarrolladores → Webhook
entrante**, regenerar el código y actualizar `BITRIX24_WEBHOOK_URL` en el servidor.

## Servidor (MegaLink)

Los formularios corren en el servidor de Next.js (acciones de servidor), así que el plan debe
ejecutar **aplicaciones Node.js 22 o superior** (lo exige el SDK del Asistente de Métrica; ver
[asesor-virtual.md](asesor-virtual.md)). El hosting de MegaLink usa **Plesk** (Linux,
nginx, PHP 8.3); ahí es la extensión *Node.js* de la suscripción, ya activa en el plan. En el
panel se cargan las mismas variables de `.env.example` con sus valores reales. La instalación paso
a paso está en [despliegue.md](despliegue.md).

**Conexiones salientes:** MegaLink las bloquea salvo que se pidan. Sin ellas no llega nada: hay
que solicitar HTTPS (443) hacia `b24-nxcf6f.bitrix24.es`, SMTP con TLS (465) hacia
`mail.metrica.com.bo` y, para el Asistente de Métrica, HTTPS (443) hacia
`generativelanguage.googleapis.com`.
