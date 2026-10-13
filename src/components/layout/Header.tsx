"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { SectionLink } from "@/components/navigation/SectionLink";
import { NAV_SECTIONS, PAGE_SECTIONS, type SectionId } from "@/lib/navigation";
import { EASE_OUT } from "@/lib/motion";
import { cn } from "@/lib/utils";

// Altura (px desde arriba) donde se mide qué sección hay detrás de la barra
const HEADER_PROBE_Y = 44;

/** Tono de la barra según la sección que tiene detrás (data-header-theme). */
function useHeaderTone(pathname: string) {
  const [tone, setTone] = useState<"dark" | "light">(pathname === "/" ? "dark" : "light");
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    let frame = 0;

    const update = () => {
      frame = 0;
      setScrolled(window.scrollY > 8);

      let next: "dark" | "light" = "light";
      for (const section of document.querySelectorAll<HTMLElement>("[data-header-theme]")) {
        const rect = section.getBoundingClientRect();
        if (rect.top <= HEADER_PROBE_Y && rect.bottom > HEADER_PROBE_Y) {
          next = section.dataset.headerTheme === "dark" ? "dark" : "light";
          break;
        }
      }
      setTone(next);
    };

    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
    };
  }, [pathname]);

  return { tone, scrolled };
}

/** Sección visible en el home: la que cruza una franja a media pantalla. */
function useActiveSection(enabled: boolean) {
  const [active, setActive] = useState<SectionId>("inicio");

  useEffect(() => {
    if (!enabled) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) setActive(entry.target.id as SectionId);
        }
      },
      { rootMargin: "-45% 0px -50% 0px" }
    );

    for (const { id } of NAV_SECTIONS) {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    }
    return () => observer.disconnect();
  }, [enabled]);

  return active;
}

export function Header() {
  const pathname = usePathname();
  const isHome = pathname === "/";
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { tone, scrolled } = useHeaderTone(pathname);
  const spySection = useActiveSection(isHome);
  const activeSection = isHome ? spySection : PAGE_SECTIONS[pathname];
  const isDark = tone === "dark" && !isMenuOpen;

  // Cerrar el menú con Escape
  useEffect(() => {
    if (!isMenuOpen) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setIsMenuOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isMenuOpen]);

  const closeMenu = () => setIsMenuOpen(false);

  return (
    <header className="fixed inset-x-0 top-0 z-50 px-3 pt-3 sm:px-4 sm:pt-4">
      {/* Fondo para cerrar el menú móvil al tocar fuera */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            key="backdrop"
            aria-hidden
            onClick={closeMenu}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 -z-10 bg-ink-950/40 lg:hidden"
          />
        )}
      </AnimatePresence>

      <div
        className={cn(
          "mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 rounded-2xl border pl-4 pr-2 backdrop-blur-xl backdrop-saturate-150 sm:pl-5",
          "transition-[background-color,border-color,box-shadow] duration-300 ease-out",
          isDark
            ? scrolled
              ? "border-white/10 bg-ink-950/55 shadow-[0_12px_40px_-16px_rgba(0,0,0,0.6)]"
              : "border-white/10 bg-white/[0.06]"
            : "border-ink-950/[0.06] bg-white/80 shadow-[0_12px_40px_-18px_rgba(0,0,0,0.25)]"
        )}
      >
        <SectionLink
          section="inicio"
          onClick={closeMenu}
          aria-label="Métrica, ir al inicio"
          className="shrink-0 rounded-lg"
        >
          <Image
            src="/images/logo/metrica.png"
            alt="Métrica Ltda."
            width={800}
            height={251}
            sizes="128px"
            preload
            className="h-9 w-auto sm:h-10"
          />
        </SectionLink>

        {/* Navegación de escritorio */}
        <nav aria-label="Principal" className="hidden lg:block">
          <ul className="flex items-center gap-0.5">
            {NAV_SECTIONS.map((item) => {
              const isActive = item.id === activeSection;
              return (
                <li key={item.id}>
                  <SectionLink
                    section={item.id}
                    aria-current={isActive ? "location" : undefined}
                    className={cn(
                      "relative isolate block rounded-full px-3.5 py-2 text-sm font-medium transition-colors duration-200",
                      isDark
                        ? isActive
                          ? "text-white"
                          : "text-white/70 hover:text-white"
                        : isActive
                          ? "text-ink-900"
                          : "text-neutral-600 hover:text-ink-900"
                    )}
                  >
                    {isActive && (
                      <motion.span
                        layoutId="nav-pill"
                        aria-hidden
                        className={cn(
                          "absolute inset-0 -z-10 rounded-full",
                          isDark ? "bg-white/15" : "bg-ink-800/[0.08]"
                        )}
                        transition={{ type: "spring", stiffness: 500, damping: 40 }}
                      />
                    )}
                    {item.label}
                  </SectionLink>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="flex items-center gap-2">
          <Button asChild size="sm" variant="brand" className="hidden sm:inline-flex">
            <SectionLink section="contacto" consulta="cotizacion">
              Solicitar cotización
            </SectionLink>
          </Button>

          <button
            type="button"
            onClick={() => setIsMenuOpen((open) => !open)}
            aria-expanded={isMenuOpen}
            aria-controls="menu-movil"
            aria-label={isMenuOpen ? "Cerrar menú" : "Abrir menú"}
            className={cn(
              "flex size-11 items-center justify-center rounded-xl transition-colors lg:hidden",
              isDark ? "text-white hover:bg-white/10" : "text-ink-900 hover:bg-ink-800/[0.06]"
            )}
          >
            {isMenuOpen ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>
      </div>

      {/* Menú móvil */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.nav
            key="menu"
            id="menu-movil"
            aria-label="Principal"
            initial={{ opacity: 0, y: -8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.98 }}
            transition={{ duration: 0.2, ease: EASE_OUT }}
            className="mx-auto mt-2 max-w-7xl origin-top rounded-2xl border border-ink-950/[0.06] bg-white/95 p-2 shadow-[0_24px_60px_-20px_rgba(0,0,0,0.35)] backdrop-blur-xl lg:hidden"
          >
            <ul className="flex flex-col">
              {NAV_SECTIONS.map((item) => {
                const isActive = item.id === activeSection;
                return (
                  <li key={item.id}>
                    <SectionLink
                      section={item.id}
                      onClick={closeMenu}
                      aria-current={isActive ? "location" : undefined}
                      className={cn(
                        "flex items-center justify-between rounded-xl px-4 py-3 text-base font-medium transition-colors",
                        isActive ? "bg-ink-50 text-ink-900" : "text-neutral-700 hover:bg-neutral-50"
                      )}
                    >
                      {item.label}
                      {isActive && <span aria-hidden className="size-1.5 rounded-full bg-sun-400 ring-4 ring-sun-400/25" />}
                    </SectionLink>
                  </li>
                );
              })}
            </ul>
            <Button asChild variant="brand" className="mt-2 w-full">
              <SectionLink section="contacto" consulta="cotizacion" onClick={closeMenu}>
                Solicitar cotización <ArrowRight />
              </SectionLink>
            </Button>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  );
}
