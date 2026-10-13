"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { navItem } from "@/lib/routes";
import { cn } from "@/lib/utils";

/** Pestañas con las subpáginas de una sección del menú (Servicios, Contacto…). */
export function SubNav({ section, label }: { section: string; label: string }) {
  const pathname = usePathname();
  const links = navItem(section)?.children ?? [];

  return (
    <nav aria-label={label} className="-mx-4 overflow-x-auto px-4 [scrollbar-width:none] sm:mx-0 sm:px-0">
      <ul className="flex w-max gap-1 rounded-full border border-white/10 bg-white/[0.05] p-1">
        {links.map((link) => {
          const active = pathname === link.href;
          return (
            <li key={link.href}>
              <Link
                href={link.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "block whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium transition-colors duration-200",
                  active ? "bg-white text-ink-950" : "text-white/70 hover:bg-white/10 hover:text-white"
                )}
              >
                {link.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
