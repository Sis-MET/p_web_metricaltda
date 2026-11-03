import type { Metadata, Viewport } from "next";
import { Manrope, Work_Sans } from "next/font/google";
import "./globals.css";
import { MotionProvider } from "@/components/providers/MotionProvider";
import { COMPANY, SITE_URL } from "@/content/company";

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
});

const workSans = Work_Sans({
  variable: "--font-work-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Métrica | Balanzas industriales y calibración acreditada en Bolivia",
    template: "%s | Métrica Ltda.",
  },
  description: COMPANY.description,
  openGraph: {
    type: "website",
    locale: "es_BO",
    siteName: COMPANY.name,
  },
};

export const viewport: Viewport = {
  themeColor: "#0d0d0c",
};

/** Documento, fuentes y animaciones. El sitio público agrega su marco en app/(sitio); el panel, el suyo. */
export default function RootLayout({
  children,
  modal,
}: Readonly<{
  children: React.ReactNode;
  /** Demo 3D abierto sobre la página (ver app/@modal) */
  modal: React.ReactNode;
}>) {
  return (
    // Las variables de fuente van en <html>: Tailwind resuelve --font-heading/--font-body en :root
    <html lang="es" data-scroll-behavior="smooth" className={`${manrope.variable} ${workSans.variable}`}>
      <body className="antialiased">
        <MotionProvider>
          {children}
          {modal}
        </MotionProvider>
      </body>
    </html>
  );
}
