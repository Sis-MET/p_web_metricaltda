import type { ReactNode } from "react";
import { Eyebrow } from "@/components/ui/SectionHeading";
import { GridPattern, Glow } from "@/components/ui/Backdrop";
import { Breadcrumbs } from "./Breadcrumbs";
import type { NavLink } from "@/lib/routes";
import { cn } from "@/lib/utils";

type PageHeaderProps = {
  trail: NavLink[];
  eyebrow?: string;
  title: ReactNode;
  description?: ReactNode;
  actions?: ReactNode;
  /** Columna derecha en escritorio: imagen del producto, sello, etc. */
  aside?: ReactNode;
  /** Pestañas de subpáginas, al pie de la cabecera */
  nav?: ReactNode;
  className?: string;
};

/** Cabecera de las páginas internas: azul METTLER, compacta y con la ruta de navegación. */
export function PageHeader({ trail, eyebrow, title, description, actions, aside, nav, className }: PageHeaderProps) {
  return (
    <header
      data-header-theme="dark"
      className={cn("relative isolate overflow-hidden bg-mt-800 pb-12 pt-28 text-white sm:pb-14 sm:pt-32", className)}
    >
      <GridPattern className="[mask-image:radial-gradient(ellipse_at_top_right,black,transparent_70%)]" />
      <Glow className="-right-56 -top-64" />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <Breadcrumbs trail={trail} />
        <div className={cn("mt-8 grid items-center gap-10", aside && "lg:grid-cols-12")}>
          <div className={cn("max-w-3xl", aside && "lg:col-span-7")}>
            {eyebrow && <Eyebrow tone="dark">{eyebrow}</Eyebrow>}
            <h1 className="mt-4 font-heading text-4xl font-extrabold leading-[1.05] tracking-tight sm:text-5xl">{title}</h1>
            {description && <p className="mt-5 max-w-2xl text-base leading-relaxed text-white/70 sm:text-lg">{description}</p>}
            {actions && <div className="mt-8 flex flex-wrap gap-3">{actions}</div>}
          </div>
          {aside && <div className="lg:col-span-5">{aside}</div>}
        </div>
        {nav && <div className="mt-10">{nav}</div>}
      </div>
    </header>
  );
}
