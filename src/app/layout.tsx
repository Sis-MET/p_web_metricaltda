import type { Metadata, Viewport } from "next";
import { Manrope, Work_Sans } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { MotionProvider } from "@/components/providers/MotionProvider";

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
  title: "Métrica | Balanzas industriales y calibración acreditada en Bolivia",
  description:
    "Representantes exclusivos de METTLER TOLEDO en Bolivia. Venta de balanzas y básculas, calibración acreditada NB/ISO/IEC 17025 y soporte técnico.",
};

export const viewport: Viewport = {
  themeColor: "#04376e",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    // Las variables de fuente van en <html>: Tailwind resuelve --font-heading/--font-body en :root
    <html lang="es" data-scroll-behavior="smooth" className={`${manrope.variable} ${workSans.variable}`}>
      <body className="antialiased">
        <MotionProvider>
          <Header />
          {children}
          <Footer />
        </MotionProvider>
      </body>
    </html>
  );
}
