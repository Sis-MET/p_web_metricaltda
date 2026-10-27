/**
 * Imágenes de la sección del proyecto VTS200 en el inicio: una por paso, tomadas del propio demo 3D.
 * Con el sitio corriendo (pnpm dev) y Chrome o Edge instalados:
 *
 *   pnpm demo:capture [http://localhost:3000]
 *
 * Abre cada paso en modo captura (?paso=N&captura: imagen fija, sin interfaz) en un navegador sin
 * ventana y guarda src/assets/demos/vts200/paso-N.webp. Vuelva a ejecutarlo si cambia el modelo.
 */
import { spawn } from "node:child_process";
import { existsSync } from "node:fs";
import { mkdir, mkdtemp, rm, writeFile } from "node:fs/promises";
import { createServer, type AddressInfo } from "node:net";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";

const BASE = process.argv[2] ?? "http://localhost:3000";
const OUT = resolve("src/assets/demos/vts200");
const STEPS = 6;
const SIZE = { width: 1600, height: 1000 };

const browserPath = [
  process.env.CHROME_PATH,
  "C:/Program Files/Google/Chrome/Application/chrome.exe",
  "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe",
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  "/usr/bin/google-chrome",
  "/usr/bin/chromium",
].find((path) => path && existsSync(path));
if (!browserPath) throw new Error("No se encontró Chrome ni Edge: indique su ruta en CHROME_PATH");

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

/** Un puerto libre para la depuración remota */
const port = await new Promise<number>((done) => {
  const server = createServer().listen(0, "127.0.0.1", () => {
    const { port } = server.address() as AddressInfo;
    server.close(() => done(port));
  });
});

const profile = await mkdtemp(join(tmpdir(), "metrica-captura-"));
// En Windows el ejecutable puede delegar en otro proceso y cerrarse: se espera al puerto, no al proceso
spawn(
  browserPath,
  [
    "--headless=new",
    `--remote-debugging-port=${port}`,
    `--user-data-dir=${profile}`,
    `--window-size=${SIZE.width},${SIZE.height}`,
    "--hide-scrollbars",
    "--mute-audio",
    // Sin GPU, WebGL corre por software
    "--enable-unsafe-swiftshader",
    "about:blank",
  ],
  { stdio: "ignore" }
).unref();

const DEVTOOLS = `http://127.0.0.1:${port}`;
let version: { webSocketDebuggerUrl: string } | undefined;
for (let i = 0; i < 120 && !version; i++) {
  version = await fetch(`${DEVTOOLS}/json/version`)
    .then((r) => r.json() as Promise<{ webSocketDebuggerUrl: string }>)
    .catch(() => sleep(250).then(() => undefined));
}
if (!version) throw new Error("El navegador no abrió su puerto de depuración en 30 s");

/* ─── Protocolo de depuración (CDP) ─────────────────────────────────────── */

function connect(url: string) {
  const socket = new WebSocket(url);
  const pending = new Map<number, (reply: Reply) => void>();
  let lastId = 0;
  socket.onmessage = (event) => {
    const reply = JSON.parse(String(event.data)) as Reply;
    pending.get(reply.id)?.(reply);
    pending.delete(reply.id);
  };
  const ready = new Promise((done, fail) => {
    socket.onopen = done;
    socket.onerror = fail;
  });
  const send = <T = Record<string, unknown>>(method: string, params: object = {}) => {
    const id = ++lastId;
    socket.send(JSON.stringify({ id, method, params }));
    return new Promise<T>((done, fail) =>
      pending.set(id, (reply) => (reply.error ? fail(new Error(`${method}: ${reply.error.message}`)) : done(reply.result as T)))
    );
  };
  return { ready, send, close: () => socket.close() };
}

type Reply = { id: number; result?: Record<string, unknown>; error?: { message: string } };

const browser = connect(version.webSocketDebuggerUrl);
await browser.ready;
const tab = (await (await fetch(`${DEVTOOLS}/json/new?about:blank`, { method: "PUT" })).json()) as { webSocketDebuggerUrl: string };
const page = connect(tab.webSocketDebuggerUrl);
await page.ready;
const send = page.send;

const evaluate = async (expression: string) =>
  (await send<{ result: { value: unknown } }>("Runtime.evaluate", { expression, returnByValue: true })).result.value;

/* ─── Capturas ──────────────────────────────────────────────────────────── */

try {
  await send("Emulation.setDeviceMetricsOverride", { ...SIZE, deviceScaleFactor: 1, mobile: false });
  await mkdir(OUT, { recursive: true });

  for (let step = 1; step <= STEPS; step++) {
    const query = `?paso=${step}&captura`;
    await send("Page.navigate", { url: `${BASE}/demo/bascula-de-camiones${query}` });

    // La página nueva avisa cuando la escena compiló sus shaders y empezó a dibujar
    const deadline = Date.now() + 120_000;
    while (!(await evaluate(`location.search === "${query}" && !!document.querySelector("[data-demo-ready]")`))) {
      if (Date.now() > deadline) throw new Error(`El paso ${step} no terminó de cargar`);
      await sleep(250);
    }
    // Fuera el botón de cierre y el indicador de desarrollo de Next.js; tiempo para sombras y texturas
    await evaluate(`document.querySelectorAll("[data-demo-close], nextjs-portal").forEach((el) => el.remove())`);
    await sleep(1500);

    const { data } = await send<{ data: string }>("Page.captureScreenshot", { format: "webp", quality: 82 });
    const file = join(OUT, `paso-${step}.webp`);
    await writeFile(file, Buffer.from(data, "base64"));
    console.log(`✓ ${file}`);
  }
} finally {
  page.close();
  // Cierra el navegador con todos sus procesos
  await browser.send("Browser.close").catch(() => {});
  browser.close();
  // Windows libera el perfil unos instantes después
  await sleep(1000);
  await rm(profile, { recursive: true, force: true }).catch(() => {});
}
