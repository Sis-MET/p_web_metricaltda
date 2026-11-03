import type { Metadata } from "next";

export const metadata: Metadata = {
  title: { default: "Panel", template: "%s · Panel de Métrica" },
  // Área de trabajo interna: fuera de los buscadores
  robots: { index: false, follow: false },
};

/** Panel del área comercial: sin el marco del sitio público */
export default function PanelRootLayout({ children }: { children: React.ReactNode }) {
  return <div className="min-h-svh bg-neutral-100 text-ink-950">{children}</div>;
}
