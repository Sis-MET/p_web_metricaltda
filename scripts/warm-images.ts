/**
 * Precalienta la caché de imágenes optimizadas de un paquete standalone antes de comprimirlo.
 * Next.js codifica cada tamaño en AVIF la primera vez que alguien lo pide (casi 1 s por foto en
 * una PC de escritorio, más en el hosting) y cada instalación empieza con la caché vacía: así las
 * imágenes ya viajan hechas en el paquete y ningún visitante espera.
 *
 *   pnpm images:warm .next/standalone
 */
import { spawn } from "node:child_process";
import { resolve } from "node:path";

const PORT = 3123;
const BASE = `http://127.0.0.1:${PORT}`;
const CONCURRENCY = 4;
// Lo que envían los navegadores: la caché se guarda por formato
const ACCEPT = "image/avif,image/webp,image/apng,*/*";

const dir = resolve(process.argv[2] ?? ".next/standalone");
const server = spawn(process.execPath, ["server.js"], {
  cwd: dir,
  env: { ...process.env, PORT: String(PORT), HOSTNAME: "127.0.0.1" },
  stdio: ["ignore", "ignore", "inherit"],
});
let exited = false;
server.on("exit", () => (exited = true));

async function waitForServer() {
  for (let i = 0; i < 120; i++) {
    if (exited) throw new Error("El servidor se cerró al arrancar");
    try {
      if ((await fetch(BASE)).ok) return;
    } catch {
      // todavía no escucha
    }
    await new Promise((r) => setTimeout(r, 250));
  }
  throw new Error("El servidor no respondió en 30 s");
}

/** Las páginas del sitio, según su mapa */
async function sitePages() {
  const xml = await (await fetch(`${BASE}/sitemap.xml`)).text();
  return [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map(([, loc]) => new URL(loc).pathname);
}

/** Cada tamaño que la página ofrece (src, srcset y precargas) */
function imageUrls(html: string) {
  return html.match(/\/_next\/image\?[^\s"',]+/g)?.map((url) => url.replaceAll("&amp;", "&")) ?? [];
}

try {
  const started = performance.now();
  await waitForServer();

  const pages = await sitePages();
  const images = new Set<string>();
  for (const page of pages) {
    for (const url of imageUrls(await (await fetch(BASE + page)).text())) images.add(url);
  }

  const queue = [...images];
  const failed: string[] = [];
  await Promise.all(
    Array.from({ length: CONCURRENCY }, async () => {
      for (let url = queue.shift(); url; url = queue.shift()) {
        const response = await fetch(BASE + url, { headers: { Accept: ACCEPT } });
        await response.arrayBuffer();
        if (!response.ok) failed.push(`${response.status} ${url}`);
      }
    })
  );

  const seconds = ((performance.now() - started) / 1000).toFixed(0);
  console.log(`${images.size} tamaños de imagen de ${pages.length} páginas, en ${seconds} s`);
  if (failed.length) throw new Error(`No se pudieron optimizar:\n${failed.join("\n")}`);
} finally {
  server.kill();
}
