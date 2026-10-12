import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    formats: ["image/avif", "image/webp"],
  },
  async redirects() {
    return [
      // La acreditación pertenece solo al laboratorio de calibración: ahora se muestra ahí
      { source: "/certificaciones", destination: "/#calibracion", permanent: false },
    ];
  },
};

export default nextConfig;
