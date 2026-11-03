import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Servidor autosuficiente (.next/standalone/server.js) para la extensión Node.js de Plesk:
  // el hosting no instala dependencias ni compila (ver docs/despliegue.md)
  output: "standalone",
  images: {
    formats: ["image/avif", "image/webp"],
  },
  experimental: {
    // Formularios con adjuntos: cada formulario del sitio limita sus archivos a 4 MB; el panel sube
    // imágenes de hasta 8 MB y fichas técnicas en PDF de hasta 20 MB
    serverActions: { bodySizeLimit: "30mb" },
  },
  async redirects() {
    // Direcciones del sitio anterior: conservan los enlaces guardados y el posicionamiento en buscadores
    return [
      { source: "/index.php", destination: "/", permanent: true },
      { source: "/inicio/nosotros", destination: "/nosotros", permanent: true },
      { source: "/productos/industrial/:path*", destination: "/productos/balanzas-industriales", permanent: true },
      { source: "/contacto/contactanos", destination: "/contacto", permanent: true },
      { source: "/contacto/reclamo-o-sugerencia", destination: "/contacto/reclamos-y-sugerencias", permanent: true },
      { source: "/contacto/trabaja-con-nostros", destination: "/contacto/trabaja-con-nosotros", permanent: true },
      // La acreditación pertenece solo al laboratorio de calibración
      { source: "/certificaciones", destination: "/servicios/calibracion", permanent: true },
      // La báscula de camiones se publicó primero con el nombre de sus celdas
      {
        source: "/productos/basculas-de-camiones/powercell-pdx",
        destination: "/productos/basculas-de-camiones/vts200",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
