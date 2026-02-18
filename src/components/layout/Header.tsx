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

export function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isPastHero, setIsPastHero] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      const heroHeight = window.innerHeight;

      // 1. Glass effect triggers early (e.g. > 50px)
      setIsScrolled(scrollY > 50);

      // 2. Text color changes ONLY after passing the Hero section
      // Subtracting 100px so it transitions just before the white section starts
      setIsPastHero(scrollY > (heroHeight - 100));
    };
    
    // Initial check
    handleScroll();
    
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
        isScrolled
          ? "glass py-3" // Glass border/background triggers early
          : "bg-transparent py-5"
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
                  "relative px-4 py-2 text-sm font-medium transition-colors rounded-full",
                  // Hover effects
                  !isActive && (isPastHero 
                    ? "hover:bg-slate-100 dark:hover:bg-slate-800"
                    : "hover:bg-white/10"),
                  // Text Color
                  isActive 
                    ? (isPastHero ? "text-slate-900 dark:text-white" : "text-white")
                    : (isPastHero ? "text-slate-600 dark:text-slate-300" : "text-white/80")
                )}
              >
                {/* Active Pill Background */}
                {isActive && (
                  <motion.span
                    layoutId="active-nav-pill"
                    className={cn(
                      "absolute inset-0 rounded-full -z-10 backdrop-blur-sm",
                      isPastHero 
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
            <Button 
              className="bg-[#f9e300] hover:bg-[#f9e300]/90 text-slate-900 font-bold shadow-lg shadow-yellow-500/20 transition-all hover:scale-105"
            >
              Solicitar Cotización
            </Button>
          </Link>
        </nav>

        {/* Mobile Menu Button */}
        <button
          className={cn(
            "md:hidden transition-colors",
            isPastHero ? "text-slate-700 dark:text-slate-200" : "text-white"
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
                    "text-lg font-medium py-2 border-b border-slate-100 dark:border-slate-800 last:border-0",
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
                <Button className="w-full mt-2 bg-[#f9e300] hover:bg-[#f9e300]/90 text-slate-900 font-bold">
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
