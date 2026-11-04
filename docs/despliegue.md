# Instalación en MegaLink (Plesk)

El sitio corre en la extensión **Node.js** de Plesk como un servidor autosuficiente de Next.js
(`output: "standalone"`). El hosting **no instala dependencias ni compila**: GitHub arma el paquete
en Linux y en Plesk solo se sube y se descomprime. No hace falta el botón *NPM install* ni SSH (el
plan no lo permite).

**El servidor** (revisado en noviembre de 2026):

- Panel: `https://h22.megalink.com:8443`. Si no abre, la red no resuelve ese nombre: agregue
  `200.75.160.22  h22.megalink.com` al archivo `hosts` de Windows (como administrador).
- Node.js **26** (la 22 y la 24 no están), MariaDB **10.3.39**, 4 GB de disco sin sobreuso, hasta
  10 bases de datos. GitHub prueba cada paquete con esas mismas versiones.
- El DNS de `metrica.com.bo` está en MegaLink con un comodín (`*.metrica.com.bo`): un subdominio
  creado en Plesk funciona al instante.
- Las aplicaciones Node.js corren con Phusion Passenger **dentro de Apache**, detrás de nginx. Por
  eso el `.htaccess` del Joomla (en `httpdocs`) también se aplica a las carpetas del sitio nuevo
  (paso 2).
- Las conexiones salientes (Bitrix24, Gemini y el correo) están abiertas (paso 6).

MegaLink pide que todo lo del sitio esté **dentro de `httpdocs`**:

```
httpdocs/
├─ (el sitio anterior en Joomla, sin tocar: el respaldo para volver atrás)
├─ metrica-web/        el paquete: server.js, .next, node_modules, public (+ su .htaccess)
└─ metrica-archivos/   las imágenes y fichas que sube el área comercial (+ su .htaccess)
```

La raíz de documentos del sitio nuevo es `httpdocs/metrica-web/public`: desde internet solo se ve
esa carpeta, no el código del servidor, ni las subidas, ni el Joomla.

## 1. Descargar el paquete

Cada push a `main` ejecuta el flujo **Paquete para Plesk** (`.github/workflows/paquete-plesk.yml`):
revisa el código, compila y deja el archivo `metrica-web.zip` (unos 40 MB). Antes de comprimirlo,
arranca el paquete contra una MariaDB 10.3.39 de prueba: si sale en verde, el sitio arranca. El
paquete trae las imágenes ya optimizadas (AVIF, en `.next/cache/images`).

1. En GitHub: **Actions → Paquete para Plesk** → la ejecución más reciente en verde.
2. En **Artifacts**, descargue `metrica-web.zip`. Se guarda 30 días; para generarlo de nuevo:
   **Run workflow**.

El paquete no contiene credenciales: las variables se cargan en el panel (paso 4). Trae las
migraciones de la base (`drizzle/`) y el catálogo inicial (`seed/`): el sitio prepara su propia base
al arrancar.

## 2. Carpetas y su protección (una sola vez)

En **Archivos** → `httpdocs`, cree las carpetas `metrica-web` y `metrica-archivos`, una al lado de
la otra (las actualizaciones reemplazan `metrica-web`; `metrica-archivos` debe sobrevivirlas).

Cada una lleva un `.htaccess` propio (**+ → Crear archivo** y luego *Editar en un editor de
texto*). No se toca el `.htaccess` del Joomla.

`httpdocs/metrica-web/.htaccess`:

```apache
# Mientras el Joomla siga en httpdocs, esta carpeta no se abre desde www (/metrica-web/...).
# El subdominio y, al publicar, www usan metrica-web/public como raiz: a ellos no les afecta.
<If "%{REQUEST_URI} =~ m#^/metrica-web(/|$)#">
    Require all denied
</If>

# Las reglas del Joomla (httpdocs/.htaccess) tambien se aplicarian aqui y desvian todo a su index.php
RewriteEngine Off
```

`httpdocs/metrica-archivos/.htaccess`:

```apache
# Imágenes y fichas del panel: las entrega el sitio nuevo (/archivos/...), nunca el servidor web directo
Require all denied
```

Compruebe que `https://www.metrica.com.bo/metrica-web/` y `https://www.metrica.com.bo/metrica-archivos/`
responden 403 y que el Joomla sigue funcionando.

**Backups:** programe uno diario de la base y los archivos en **Backup y restauración**, guardado en
un **almacenamiento remoto** (FTP o la nube). En el almacenamiento del servidor ocupa el mismo
espacio de 4 GB del plan, que no admite sobreuso.

## 3. Base de datos (una sola vez)

**Bases de datos → Añadir base de datos**:

- Nombre `metrica_catalogo`, con un usuario nuevo `metrica_web`.
- Contraseña **solo con letras y números** (unos 20 caracteres): evita problemas al escribirla
  dentro de la dirección de conexión.
- *Control de acceso*: **Solo permitir conexiones locales**.

La dirección de conexión del sitio es entonces
`mysql://metrica_web:CONTRASEÑA@localhost:3306/metrica_catalogo`. **No** es la de `.env.local`: esa
es la base de su PC y en el servidor no existe. No hay que elegir la codificación: el sitio deja sus
tablas en utf8mb4 al arrancar.

## 4. Probar en un subdominio

1. **Sitios web y dominios → Añadir subdominio** `nuevo`, con la raíz de documentos
   `httpdocs/metrica-web/public`. En **Certificados SSL/TLS** del subdominio, **Instalar un
   certificado básico gratuito de Let's Encrypt** (no los de «Comprar»).
2. Plesk deja una página de bienvenida en `httpdocs/metrica-web/public/index.html`: **bórrela**, o
   se mostraría en lugar del sitio.
3. Suba `metrica-web.zip` a `httpdocs/metrica-web` y use **Extraer archivos**: debe quedar
   `server.js` directamente en `metrica-web/`, junto a `.next`, `node_modules` y `public`, y el
   `.htaccess` del paso 2. Luego borre el zip (el plan tiene poco espacio).
4. En el subdominio, **Node.js** (no use *Configurar automáticamente*: intentaría instalar y
   compilar en el servidor):

   | Campo | Valor |
   |---|---|
   | Versión de Node.js | **26.13.0** (versión de soporte largo; la 21, la 20 y la 18 no sirven) |
   | Raíz de la aplicación | `/httpdocs/metrica-web` |
   | Raíz del documento | `/httpdocs/metrica-web/public` |
   | Archivo de inicio de la aplicación | **`server.js`** (Plesk propone `app.js`) |
   | Modo de aplicación | `production` |

5. Pestaña **Entorno**. En **Variables de entorno** (con *Pegado masivo*, una por línea y sin
   comillas) van las de `.env.example` que no son credenciales: `SMTP_HOST`, `SMTP_PORT`,
   `SMTP_SECURE`, `SMTP_TLS_SERVERNAME`, `SMTP_USER`, `MAIL_FROM`, `MAIL_TO_DEFAULT`, las
   `BITRIX24_*` de campos y valores, y:

   | Variable | Valor |
   |---|---|
   | `UPLOADS_DIR` | `/var/www/vhosts/metrica.com.bo/httpdocs/metrica-archivos` |
   | `BETTER_AUTH_URL` | `https://nuevo.metrica.com.bo` mientras se prueba; `https://www.metrica.com.bo` al publicar |

   En **Secretos** (cifrados; Plesk nunca vuelve a mostrarlos) van las credenciales:

   | Secreto | Valor |
   |---|---|
   | `DATABASE_URL` | La dirección del paso 3 |
   | `BETTER_AUTH_SECRET` | Una cadena aleatoria nueva (vea abajo), distinta de la de desarrollo |
   | `PANEL_SETUP_TOKEN` | Un código que solo usted conozca: sirve para crear la primera cuenta |
   | `SMTP_PASSWORD` | La contraseña del buzón de `SMTP_USER` |
   | `BITRIX24_WEBHOOK_URL` | El webhook entrante de Bitrix24 |
   | `GOOGLE_GENERATIVE_AI_API_KEY` | La clave de Google AI Studio |

   Para generar `BETTER_AUTH_SECRET` sin que aparezca en pantalla (queda en el portapapeles):

   ```powershell
   $b = New-Object byte[] 48; [Security.Cryptography.RandomNumberGenerator]::Create().GetBytes($b); [Convert]::ToBase64String($b) | Set-Clipboard
   ```

6. **Activar Node.js**. Passenger arranca el sitio con la primera visita: la primera vez tarda unos
   10 segundos porque crea las tablas y carga el catálogo inicial (19 productos con sus imágenes y
   fichas). En **Bases de datos**, `metrica_catalogo` debe pasar de 0 a 8 tablas.
7. Abra `/panel`: pide crear la cuenta del primer administrador con el código `PANEL_SETUP_TOKEN`.
   Después, en **Usuarios**, cree las cuentas del área comercial.

**Cada vez que cambie una variable o un secreto: Reiniciar app.** El sitio solo los lee al arrancar.

Revise que carguen las páginas, las imágenes y las fichas técnicas en PDF. En el panel, suba una
foto y un PDF de prueba (el antivirus y el firewall del hosting, Imunify, no deben bloquearlos) y
compruebe que el cambio se ve en el sitio.

## 5. Si el sitio muestra un error

Plesk **no muestra los mensajes de la aplicación** (su registro de Node.js queda vacío), y la
consola de **Ejecutar comandos Node.js** no recibe las variables del sitio. Para diagnosticar:

- **Error 500 de Apache en todas las páginas menos la portada** (texto «Internal Server Error», en
  inglés): falta el `RewriteEngine Off` del paso 2.
- **Error 500 del sitio en las páginas del catálogo y del panel**, con `metrica_catalogo` en
  0 tablas: el sitio no entra a la base. Pruebe la dirección de conexión en **Ejecutar comandos
  Node.js** con este comando, reemplazando la dirección del final (no cambia nada en la base):

  ```text
  exec -- node -e "const u=new URL(process.argv[1]);const user=decodeURIComponent(u.username),pw=decodeURIComponent(u.password),db=decodeURIComponent(u.pathname.slice(1)),c=require('crypto'),net=require('net');const sha=b=>c.createHash('sha1').update(b).digest();const s=net.connect(+u.port||3306,u.hostname==='localhost'?'127.0.0.1':u.hostname);let buf=Buffer.alloc(0),st=0;const send=(q,b)=>{const h=Buffer.alloc(4);h.writeUIntLE(b.length,0,3);h[3]=q;s.write(Buffer.concat([h,b]))};s.on('data',d=>{buf=Buffer.concat([buf,d]);while(buf.length>=4){const len=buf.readUIntLE(0,3);if(buf.length<4+len)break;const p=buf.subarray(4,4+len),q=buf[3];buf=buf.subarray(4+len);if(st===0){let i=p.indexOf(0,1)+5;const s1=p.subarray(i,i+8);i+=16;i+=11;const salt=Buffer.concat([s1,p.subarray(i,i+12)]);let t=Buffer.alloc(0);if(pw){const a=sha(pw),b=sha(Buffer.concat([salt,sha(a)]));t=a.map((x,k)=>x^b[k])}const h=Buffer.alloc(32);h.writeUInt32LE(0x8209|0x80000,0);h.writeUInt32LE(16777216,4);h[8]=45;send(q+1,Buffer.concat([h,Buffer.from(user+'\0'),Buffer.from([t.length]),t,Buffer.from(db+'\0'),Buffer.from('mysql_native_password\0')]));st=1}else{console.log(p[0]===0?'CONEXION OK: usuario '+user+', base '+db:p[0]===255?'ERROR '+p.readUInt16LE(1)+' '+p.subarray(9).toString():'respuesta tipo '+p[0]);s.destroy()}}});s.on('error',e=>console.log('error de red',e.code));" "mysql://metrica_web:CONTRASEÑA@localhost:3306/metrica_catalogo"
  ```

  `CONEXION OK` → guarde esa misma dirección en el secreto `DATABASE_URL` y **Reiniciar app**.
  `ERROR 1045` → la contraseña no coincide: cámbiela en **Bases de datos → Administración de
  usuarios** y repita.

## 6. Conexiones salientes

Los formularios crean el prospecto en Bitrix24 y envían el correo; el asesor consulta a Gemini. Las
tres conexiones estaban abiertas al instalar (noviembre de 2026). Para comprobarlas en **Ejecutar
comandos Node.js**:

```text
exec -- node -e "const https=require('https'),tls=require('tls');const fail=(e)=>e.code||e.message;const get=(n,u)=>new Promise(ok=>{const r=https.get(u,{timeout:8000},s=>{console.log(n,'ABIERTO: HTTP',s.statusCode);s.resume();ok()});r.on('timeout',()=>r.destroy(Object.assign(new Error('sin respuesta en 8 s'),{code:'TIMEOUT'})));r.on('error',e=>{console.log(n,'BLOQUEADO:',fail(e));ok()})});const smtp=()=>new Promise(ok=>{const s=tls.connect({host:'mail.metrica.com.bo',port:465,servername:'h22.megalink.com',timeout:8000},()=>{console.log('Correo SMTP 465 ABIERTO:',s.getProtocol());s.end();ok()});s.on('timeout',()=>{s.destroy();console.log('Correo SMTP 465 BLOQUEADO: TIMEOUT');ok()});s.on('error',e=>{console.log('Correo SMTP 465 BLOQUEADO:',fail(e));ok()})});(async()=>{await get('Bitrix24','https://b24-nxcf6f.bitrix24.es/');await get('Gemini','https://generativelanguage.googleapis.com/');await smtp()})()"
```

Si alguna sale **BLOQUEADO**, pídale a MegaLink que la habilite: el cortafuegos del servidor solo lo
administra el proveedor (el *Firewall para aplicaciones web* de Plesk filtra lo que entra, no lo que
sale).

Pruebe en el subdominio el Asistente de Métrica (una conversación corta) y una cotización de
prueba: debe llegar el correo a comercial@ y asistencia@ y crearse el prospecto en Bitrix24
(bórrelo después).

## 7. Publicar en www

1. En el dominio principal, **Node.js** con los mismos valores del paso 4 (misma carpeta
   `httpdocs/metrica-web`, mismas variables y secretos, con `BETTER_AUTH_URL` =
   `https://www.metrica.com.bo`) y **Activar Node.js**. La raíz de documentos del dominio pasa de
   `/httpdocs` a `/httpdocs/metrica-web/public`. Se usan la misma base y la misma carpeta de
   archivos: lo cargado en el subdominio sigue ahí.
2. Desactive **PHP** en el dominio: si queda activo, atiende las direcciones antiguas que terminan
   en `.php` (como `/index.php`) y responde «File not found» en lugar de redirigir a la página nueva.
3. Revise www.metrica.com.bo y las direcciones del sitio anterior (por ejemplo `/index.php` o
   `/contacto/contactanos`): redirigen solas a las páginas nuevas.
4. Elimine el subdominio de prueba (o desactive su Node.js): dos aplicaciones sobre la misma
   carpeta consumen el doble de memoria.

**Volver atrás:** desactive Node.js en el dominio, vuelva a activar PHP y devuelva la raíz de
documentos a `/httpdocs`: vuelve el Joomla, con las carpetas nuevas todavía protegidas.

## Actualizar el sitio

1. Descargue el `metrica-web.zip` nuevo (paso 1).
2. En `httpdocs/metrica-web/`, borre la carpeta `.next`, suba el zip y extráigalo reemplazando los
   archivos; luego borre el zip. El `.htaccess` de la carpeta se conserva (el zip no lo trae).
   **No toque `httpdocs/metrica-archivos`** ni la base: ahí está lo que cargó el área comercial.
3. **Reiniciar app** en Node.js. Si la versión trae cambios en la base, se aplican solos al
   arrancar.

Guarde el zip anterior fuera del servidor: volver a extraerlo es la forma de deshacer una
actualización (si esa versión cambió la base, restaure también el backup de la base del día).
