# Instalación en MegaLink (Plesk)

El sitio corre en la extensión **Node.js** de Plesk (activa en el plan de MegaLink) como un
servidor autosuficiente de Next.js (`output: "standalone"`). El hosting **no instala dependencias
ni compila**: GitHub arma el paquete en Linux y en Plesk solo se sube y se descomprime. No hace
falta el botón *NPM install* ni SSH.

## 1. Descargar el paquete

Cada push a `main` ejecuta el flujo **Paquete para Plesk** (`.github/workflows/paquete-plesk.yml`):
revisa el código, compila y deja el archivo `metrica-web.zip` (unos 35 MB). El paquete trae las
imágenes ya optimizadas (AVIF, en `.next/cache/images`): el servidor no las codifica al primer
visitante.

1. En GitHub: **Actions → Paquete para Plesk** → la ejecución más reciente en verde.
2. En **Artifacts**, descargue `metrica-web.zip`. Se guarda 30 días; para generarlo de nuevo:
   **Run workflow**.

El paquete no contiene credenciales: las variables se cargan en el panel (paso 3). Trae las
migraciones de la base (`drizzle/`) y el catálogo inicial (`seed/`): el sitio prepara su propia base
al arrancar.

## 2. Subirlo

1. En Plesk, **Archivos**: cree la carpeta `metrica-web` **al mismo nivel que `httpdocs`**, no
   adentro (así el código del servidor nunca queda accesible desde el sitio anterior).
2. Suba `metrica-web.zip` a esa carpeta y use **Extraer archivos**. Debe quedar `server.js`
   directamente en `metrica-web/`, junto a las carpetas `.next`, `node_modules` y `public`.

`httpdocs` (el sitio anterior en Joomla) no se toca: es el respaldo para volver atrás.

## 2.1. Base de datos y carpeta de archivos (una sola vez)

El catálogo de productos y las cuentas del panel del área comercial (`/panel`) viven en una base
MariaDB; las imágenes y fichas que suben, en una carpeta propia.

1. **Bases de datos → Añadir base de datos**: nombre `metrica_catalogo` (o el que permita el plan),
   con un usuario nuevo y una contraseña generada. Anote el usuario, la contraseña y el servidor
   (normalmente `localhost`).
2. **Archivos**: cree la carpeta `metrica-archivos` **al mismo nivel que `metrica-web`**, no
   adentro: los despliegues reemplazan `metrica-web` y esta carpeta debe sobrevivirlos. Su ruta
   completa aparece en el Administrador de archivos (algo como
   `/var/www/vhosts/metrica.com.bo/metrica-archivos`).

Las dos quedan dentro de los **Backups** de Plesk: programe uno diario en
**Backup y restauración** (base y archivos).

## 3. Probar en un subdominio

Antes de reemplazar www, instale en un subdominio de prueba, por ejemplo `nuevo.metrica.com.bo`:

1. **Sitios web y dominios → Agregar subdominio** `nuevo`, con la raíz de documentos
   `metrica-web/public`. Active el certificado SSL gratuito (Let's Encrypt).
2. En el subdominio, **Node.js**:

   | Campo | Valor |
   |---|---|
   | Versión de Node.js | **22** (no la 25: es una versión de soporte corto) |
   | Raíz de la aplicación (*Application Root*) | `/metrica-web` |
   | Raíz de documentos (*Document Root*) | `/metrica-web/public` |
   | Archivo de inicio (*Application Startup File*) | `server.js` |
   | Modo de la aplicación | `production` |

3. **Variables de entorno personalizadas:** las de `.env.example` con sus valores reales
   (contraseña SMTP, webhook de Bitrix24, clave de Gemini). Los valores van sin comillas, por
   ejemplo `MAIL_FROM` = `Sitio web Métrica <comercial@metrica.com.bo>`. Las del catálogo y el panel:

   | Variable | Valor |
   |---|---|
   | `DATABASE_URL` | `mysql://usuario:contraseña@localhost:3306/metrica_catalogo` (los del paso 2.1). Si la contraseña tiene símbolos como `@`, `#`, `/` o `%`, escríbalos codificados: `%40`, `%23`, `%2F`, `%25` |
   | `UPLOADS_DIR` | La ruta completa de `metrica-archivos` |
   | `BETTER_AUTH_SECRET` | Una cadena aleatoria de al menos 32 caracteres (distinta de la de desarrollo) |
   | `BETTER_AUTH_URL` | `https://nuevo.metrica.com.bo` mientras se prueba; `https://www.metrica.com.bo` al publicar |
   | `PANEL_SETUP_TOKEN` | Un código que solo usted conozca: sirve para crear la primera cuenta |

4. **Habilitar Node.js** y luego **Reiniciar la aplicación**. En el primer arranque el sitio crea
   las tablas y carga el catálogo inicial (19 productos con sus imágenes y fichas): en **Registros**
   aparece `[base de datos] Catálogo inicial cargado`.
5. Abra `/panel`: pide crear la cuenta del primer administrador con el código `PANEL_SETUP_TOKEN`.
   Después, en **Usuarios**, cree las cuentas del área comercial.

Revise que carguen las páginas, las imágenes y las fichas técnicas en PDF, y que un cambio hecho
en el panel se vea en el sitio.

## 4. Pedir las conexiones salientes

MegaLink bloquea las conexiones del servidor hacia afuera salvo que se soliciten. Con el sitio ya
instalado, pídales:

> Para el sitio de metrica.com.bo (aplicación Node.js en Plesk) necesitamos habilitar estas
> conexiones salientes:
> 1. HTTPS (443) hacia `b24-nxcf6f.bitrix24.es`: nuestro CRM, donde se registran las solicitudes.
> 2. HTTPS (443) hacia `generativelanguage.googleapis.com`: la API de Google Gemini del Asistente de Métrica.
> 3. SMTP con TLS (465) hacia `mail.metrica.com.bo` (h22.megalink.com): los correos de los formularios.
>
> Los dos primeros usan IPs variables: necesitamos la regla por dominio o el 443 saliente en general.

Hasta entonces los formularios muestran el error de envío con los canales directos y el asesor
avisa que no está disponible. Cuando las habiliten, pruebe en el subdominio:

- el Asistente de Métrica (una conversación corta);
- una cotización de prueba: debe llegar el correo a comercial@ y asistencia@ y crearse el
  prospecto en Bitrix24 (bórrelo después).

Si algo falla, el motivo queda en **Registros** del subdominio (`[formulario] … falló` o
`[asesor] …`).

## 5. Publicar en www

1. En el dominio principal, **Node.js** con los mismos valores del paso 3 (misma carpeta
   `metrica-web`, mismas variables, con `BETTER_AUTH_URL` = `https://www.metrica.com.bo`) y
   **Habilitar Node.js**. La raíz de documentos del dominio pasa de `httpdocs` a
   `metrica-web/public`. Se usan la misma base y la misma carpeta de archivos: lo cargado en el
   subdominio sigue ahí.
2. Revise www.metrica.com.bo y las direcciones del sitio anterior (por ejemplo `/index.php` o
   `/contacto/contactanos`): redirigen solas a las páginas nuevas.
3. Elimine el subdominio de prueba (o deshabilite su Node.js): dos aplicaciones sobre la misma
   carpeta consumen el doble de memoria.

**Volver atrás:** deshabilite Node.js en el dominio y devuelva la raíz de documentos a `httpdocs`.

## Actualizar el sitio

1. Descargue el `metrica-web.zip` nuevo (paso 1).
2. En `metrica-web/`, borre la carpeta `.next`, suba el zip y extráigalo reemplazando los archivos.
   **No toque `metrica-archivos`** ni la base: ahí está lo que cargó el área comercial.
3. **Reiniciar la aplicación** en Node.js. Si la versión trae cambios en la base, se aplican solos
   al arrancar.

Guarde el zip anterior: volver a extraerlo es la forma de deshacer una actualización (si esa
versión cambió la base, restaure también el backup de la base del día).
