import { SiteChrome } from "@/components/layout/SiteChrome";

/** Sitio público: cada página con el header, el footer y el asistente */
export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return <SiteChrome>{children}</SiteChrome>;
}
