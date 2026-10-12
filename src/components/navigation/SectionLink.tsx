"use client";

import Link from "next/link";
import type { ComponentProps, MouseEvent } from "react";
import { goToSection, type Consulta, type SectionId } from "@/lib/navigation";

type SectionLinkProps = Omit<ComponentProps<typeof Link>, "href"> & {
  section: SectionId;
  /** Preselecciona el tipo de consulta del formulario de contacto */
  consulta?: Consulta;
};

export function SectionLink({ section, consulta, onClick, ...props }: SectionLinkProps) {
  const handleClick = (event: MouseEvent<HTMLAnchorElement>) => {
    onClick?.(event);
    if (event.defaultPrevented) return;
    // Ctrl/Cmd + clic o clic central: dejar que el navegador abra otra pestaña
    if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    if (goToSection(section, consulta)) event.preventDefault();
  };

  return <Link href={section === "inicio" ? "/" : `/#${section}`} onClick={handleClick} {...props} />;
}
