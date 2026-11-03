# Instalación en MegaLink (Plesk)

El sitio corre en la extensión **Node.js** de Plesk como un servidor autosuficiente de Next.js
(`output: "standalone"`). El hosting **no instala dependencias ni compila**: GitHub arma el paquete
en Linux y en Plesk solo se sube y se descomprime. No hace falta el botón *NPM install* ni SSH (el
plan no lo permite).

**El servidor** (revisado el 3 de noviembre de 2026): panel en `https://h22.megalink.com:8443`,
Node.js 26 (la 22 y la 24 no están), MariaDB 10.3.39, 4 GB de disco sin sobreuso y hasta
10 bases de datos. GitHub prueba cada paquete con esas mismas versiones.

MegaLink pide que todo lo del sitio esté **dentro de `httpdocs`**:

```
httpdocs/
├─ (el sitio anterior en Joomla, sin tocar: el respaldo para volver atrás)
├─ metrica-web/        el paquete: server.js, .next, node_modules, public
└─ metrica-archivos/   las imágenes y fichas que sube el área comercial
```

Al publicar, la raíz de documentos del dominio pasa a `httpdocs/metrica-web/public`: desde internet
solo se ve esa carpeta, no el código del servidor, ni las subidas, ni el Joomla.

## 1. Descargar el paquete

Cada push a `main` ejecuta el flujo **Paquete para Plesk** (`.github/workflows/paquete-plesk.yml`):
revisa el código, compila y deja el archivo `metrica-web.zip` (unos 35 MB). Antes de comprimirlo,
arranca el paquete contra una MariaDB 10.3.39 de prueba: si sale en verde, el sitio arranca. El paquete
trae las imágenes ya optimizadas (AVIF, en `.next/cache/images`): el servidor no las codifica al
primer visitante.

1. En GitHub: **Actions → Paquete para Plesk** → la ejecución más reciente en verde.
2. En **Artifacts**, descargue `metrica-web.zip`. Se guarda 30 días; para generarlo de nuevo:
   **Run workflow**.

El paquete no contiene credenciales: las variables se cargan en el panel (paso 3). Trae las
migraciones de la base (`drizzle/`) y el catálogo inicial (`seed/`): el sitio prepara su propia base
al arrancar.

## 2. Subirlo

1. En Plesk, **Archivos** → `httpdocs`: cree la carpeta `metrica-web`.
2. Suba `metrica-web.zip` a esa carpeta y use **Extraer archivos**. Debe quedar `server.js`
   directamente en `httpdocs/metrica-web/`, junto a las carpetas `.next`, `node_modules` y
   `public`. Después borre el zip: el plan tiene poco espacio.

Los archivos del Joomla en `httpdocs` no se tocan.

## 2.1. Base de datos y carpeta de archivos (una sola vez)

El catálogo de productos y las cuentas del panel del área comercial (`/panel`) viven en una base
MariaDB; las imágenes y fichas que suben, en una carpeta propia.

1. **Bases de datos → Añadir base de datos**: nombre `metrica_catalogo`, con un usuario nuevo y una
   contraseña generada, y en *Control de acceso* **Solo permitir conexiones locales**. Anote el
   usuario y la contraseña. El servidor es `localhost:3306`. No hay que elegir la codificación: el
   sitio deja sus tablas en utf8mb4 al arrancar.
2. **Archivos** → `httpdocs`: cree la carpeta `metrica-archivos`, **al lado de `metrica-web`, no
   adentro**: las actualizaciones reemplazan `metrica-web` y esta carpeta debe sobrevivirlas. Su ruta
   completa es `/var/www/vhosts/metrica.com.bo/httpdocs/metrica-archivos`.

**Backups:** programe uno diario de la base y los archivos en **Backup y restauración**, guardado en
un **almacenamiento remoto** (FTP o la nube). En el almacenamiento del servidor ocupa el mismo
espacio de 4 GB del plan, que no admite sobreuso: si se llena, el panel ya no puede guardar fotos.

## 2.2. Cerrar las carpetas mientras el Joomla siga en línea

Mientras www muestre el Joomla desde `httpdocs`, las dos carpetas nuevas se podrían abrir desde el
navegador (`www.metrica.com.bo/metrica-web/…`). No contienen contraseñas, pero no deben quedar a la
vista. En **Archivos** → `httpdocs`, edite `.htaccess` (el del Joomla) y agregue esta línea al
principio:

```apache
RedirectMatch 404 ^/metrica-(web|archivos)(/|$)
```

Compruebe que `https://www.metrica.com.bo/metrica-web/server.js` responde «no encontrado» y que el
Joomla sigue funcionando. Al publicar el sitio nuevo (paso 5) esa línea deja de usarse.

## 3. Probar en un subdominio

Antes de reemplazar www, instale en un subdominio de prueba, por ejemplo `nuevo.metrica.com.bo`:

1. **Sitios web y dominios → Añadir subdominio** `nuevo`, con la raíz de documentos
   `httpdocs/metrica-web/public`. Active el certificado SSL gratuito (Let's Encrypt).
2. En el subdominio, **Node.js**:

   | Campo | Valor |
   |---|---|
   | Versión de Node.js | **26.13.0** (versión de soporte largo; la 21, la 20 y la 18 no sirven) |
   | Raíz de la aplicación | `/httpdocs/metrica-web` |
   | Raíz del documento | `/httpdocs/metrica-web/public` |
   | Archivo de inicio de la aplicación | `server.js` |
   | Modo de aplicación | `production` |

3. Pestaña **Entorno**: las variables de `.env.example` con sus valores reales (contraseña SMTP,
   webhook de Bitrix24, clave de Gemini). Los valores van sin comillas, por ejemplo `MAIL_FROM` =
   `Sitio web Métrica <comercial@metrica.com.bo>`. Las del catálogo y el panel:

   | Variable | Valor |
   |---|---|
   | `DATABASE_URL` | `mysql://usuario:contraseña@localhost:3306/metrica_catalogo` (los del paso 2.1). Si la contraseña tiene símbolos como `@`, `#`, `/` o `%`, escríbalos codificados: `%40`, `%23`, `%2F`, `%25` |
   | `UPLOADS_DIR` | `/var/www/vhosts/metrica.com.bo/httpdocs/metrica-archivos` |
   | `BETTER_AUTH_SECRET` | Una cadena aleatoria de al menos 32 caracteres (distinta de la de desarrollo) |
   | `BETTER_AUTH_URL` | `https://nuevo.metrica.com.bo` mientras se prueba; `https://www.metrica.com.bo` al publicar |
   | `PANEL_SETUP_TOKEN` | Un código que solo usted conozca: sirve para crear la primera cuenta |

4. **Activar Node.js** y luego **Reiniciar la aplicación**. En el primer arranque el sitio crea
   las tablas y carga el catálogo inicial (19 productos con sus imágenes y fichas): en **Registros**
   aparece `[base de datos] Catálogo inicial cargado`.
5. Abra `/panel`: pide crear la cuenta del primer administrador con el código `PANEL_SETUP_TOKEN`.
   Después, en **Usuarios**, cree las cuentas del área comercial.

Revise que carguen las páginas, las imágenes y las fichas técnicas en PDF. En el panel, suba una
foto y un PDF de prueba (el antivirus y el firewall del hosting, Imunify, no deben bloquearlos) y
compruebe que el cambio se ve en el sitio.

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
   `httpdocs/metrica-web`, mismas variables, con `BETTER_AUTH_URL` = `https://www.metrica.com.bo`) y
   **Activar Node.js**. La raíz de documentos del dominio pasa de `/httpdocs` a
   `/httpdocs/metrica-web/public`. Se usan la misma base y la misma carpeta de archivos: lo cargado
   en el subdominio sigue ahí.
2. Revise www.metrica.com.bo y las direcciones del sitio anterior (por ejemplo `/index.php` o
   `/contacto/contactanos`): redirigen solas a las páginas nuevas.
3. Elimine el subdominio de prueba (o desactive su Node.js): dos aplicaciones sobre la misma
   carpeta consumen el doble de memoria.

**Volver atrás:** desactive Node.js en el dominio y devuelva la raíz de documentos a `/httpdocs`:
vuelve el Joomla, con la línea del paso 2.2 todavía protegiendo las carpetas nuevas.

## Actualizar el sitio

1. Descargue el `metrica-web.zip` nuevo (paso 1).
2. En `httpdocs/metrica-web/`, borre la carpeta `.next`, suba el zip y extráigalo reemplazando los
   archivos; luego borre el zip. **No toque `httpdocs/metrica-archivos`** ni la base: ahí está lo
   que cargó el área comercial.
3. **Reiniciar la aplicación** en Node.js. Si la versión trae cambios en la base, se aplican solos
   al arrancar.

Guarde el zip anterior fuera del servidor: volver a extraerlo es la forma de deshacer una
actualización (si esa versión cambió la base, restaure también el backup de la base del día).
