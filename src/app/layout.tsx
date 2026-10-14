import type { Metadata, Viewport } from "next";
import { Manrope, Work_Sans } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { AssistantLauncher } from "@/components/assistant/AssistantLauncher";
import { MotionProvider } from "@/components/providers/MotionProvider";
import { JsonLd } from "@/components/seo/JsonLd";
import { COMPANY, EMAILS, OFFICES, SITE_URL } from "@/content/company";

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

const ORGANIZATION = {
  "@type": "Organization",
  name: COMPANY.name,
  url: SITE_URL,
  logo: `${SITE_URL}/images/logo/metrica.png`,
  email: EMAILS.info,
  foundingDate: String(COMPANY.founded),
  address: OFFICES.map((office) => ({
    "@type": "PostalAddress",
    streetAddress: office.address.join(", "),
    addressLocality: office.city,
    addressCountry: "BO",
  })),
  contactPoint: OFFICES.flatMap((office) =>
    office.phones.slice(0, 1).map((phone) => ({
      "@type": "ContactPoint",
      telephone: phone.number,
      contactType: "sales",
      areaServed: "BO",
      availableLanguage: "es",
    }))
  ),
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
          <AssistantLauncher />
        </MotionProvider>
        <JsonLd data={ORGANIZATION} />
      </body>
    </html>
  );
}
