"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

const navItems = [
  { name: "Inicio", href: "/" },
  { name: "Productos", href: "/productos" },
  { name: "Servicios", href: "/servicios" },
  { name: "Certificaciones", href: "/certificaciones" },
  { name: "Contacto", href: "/contacto" },
];

// IDs of sections with dark backgrounds — header stays white over these
const DARK_SECTION_IDS = ["hero-section", "nosotros"];

export function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isOverDark, setIsOverDark] = useState(true); // starts over Hero (dark)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      const headerBottom = 72; // approx header height

      // Glass effect triggers after 50px
      setIsScrolled(scrollY > 50);

      // Check if header is currently over any dark-background section
      const overDark = DARK_SECTION_IDS.some((id) => {
        const el = document.getElementById(id);
        if (!el) return false;
        const rect = el.getBoundingClientRect();
        // Header is "over" the section if its bottom edge overlaps the section
        return rect.top <= headerBottom && rect.bottom > 0;
      });

      setIsOverDark(overDark);
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Text/icon colors based on whether header is over a dark section
  const lightMode = !isOverDark; // true = show dark text (over light sections)

  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
        isScrolled ? "glass py-3" : "bg-transparent py-5"
      )}
    >
      <div className="container mx-auto px-4 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 group">
          <div className="relative w-40 h-14">
            <Image
              src="/images/logo/logoMetrica2.png"
              alt="Metrica Logo"
              fill
              className="object-contain"
              priority
            />
          </div>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href;

            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "font-body relative px-4 py-2 text-sm font-medium transition-colors rounded-full",
                  !isActive &&
                    (lightMode
                      ? "hover:bg-slate-100 dark:hover:bg-slate-800"
                      : "hover:bg-white/10"),
                  isActive
                    ? lightMode
                      ? "text-slate-900 dark:text-white"
                      : "text-white"
                    : lightMode
                    ? "text-slate-600 dark:text-slate-300"
                    : "text-white/80"
                )}
              >
                {/* Active Pill Background */}
                {isActive && (
                  <motion.span
                    layoutId="active-nav-pill"
                    className={cn(
                      "absolute inset-0 rounded-full -z-10 backdrop-blur-sm",
                      lightMode
                        ? "bg-slate-200/50 dark:bg-slate-700/50"
                        : "bg-white/20"
                    )}
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}
                {item.name}
              </Link>
            );
          })}
          <Link href="/contacto" className="ml-4">
            <Button className="font-body rounded-full text-sm px-6 py-2 bg-[#f9e300] text-slate-900 font-bold hover:bg-[#f9e300]/90 hover:scale-105 transition-all duration-300 shadow-[0_0_20px_rgba(249,227,0,0.3)]">
              Solicitar Cotización
            </Button>
          </Link>
        </nav>

        {/* Mobile Menu Button */}
        <button
          className={cn(
            "md:hidden transition-colors",
            lightMode ? "text-slate-700 dark:text-slate-200" : "text-white"
          )}
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? <X /> : <Menu />}
        </button>
      </div>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="absolute top-full left-0 right-0 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 p-4 md:hidden shadow-xl"
          >
            <nav className="flex flex-col gap-4">
              {navItems.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    "font-body text-lg font-medium py-2 border-b border-slate-100 dark:border-slate-800 last:border-0",
                    pathname === item.href
                      ? "text-blue-600 dark:text-blue-400"
                      : "text-slate-700 dark:text-slate-200"
                  )}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {item.name}
                </Link>
              ))}
              <Link href="/contacto" onClick={() => setIsMobileMenuOpen(false)}>
                <Button className="font-body w-full mt-2 rounded-full bg-[#f9e300] text-slate-900 font-bold hover:bg-[#f9e300]/90 hover:scale-105 transition-all duration-300 shadow-[0_0_20px_rgba(249,227,0,0.3)]">
                  Solicitar Cotización
                </Button>
              </Link>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
