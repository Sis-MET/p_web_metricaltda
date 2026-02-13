"use client";

import { motion } from "framer-motion";
import { CheckCircle2, Wrench, GraduationCap, ClipboardCheck } from "lucide-react";
import { cn } from "@/lib/utils";

const services = [
  {
    title: "Calibración Certificada",
    description: "Servicio de calibración acreditado bajo normas ISO/IEC 17025. Emitimos certificados válidos para auditorías de calidad, asegurando la trazabilidad y exactitud de sus instrumentos.",
    icon: ClipboardCheck,
    image: "/calibration.jpg", // Placeholder
    color: "text-blue-600",
    bgColor: "bg-blue-100 dark:bg-blue-900/30",
  },
  {
    title: "Mantenimiento Integral",
    description: "Programas preventivos y correctivos para maximizar la vida útil de sus equipos. Diagnóstico rápido, repuestos originales y técnicos especializados para minimizar tiempos de inactividad.",
    icon: Wrench,
    image: "/maintenance.jpg", // Placeholder
    color: "text-cyan-600",
    bgColor: "bg-cyan-100 dark:bg-cyan-900/30",
  },
  {
    title: "Asesoría y Capacitación",
    description: "Formamos a su personal en el uso correcto y cuidado de las balanzas. Además, le asesoramos en la selección del equipo ideal para sus procesos productivos.",
    icon: GraduationCap,
    image: "/training.jpg", // Placeholder
    color: "text-emerald-600",
    bgColor: "bg-emerald-100 dark:bg-emerald-900/30",
  },
];

export function Services() {
  return (
    <section id="servicios" className="py-24 bg-white dark:bg-slate-950">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-4xl lg:text-5xl font-bold text-slate-900 dark:text-white mb-6"
          >
            Servicios Especializados
          </motion.h2>
          <p className="text-xl text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
            Más que vender equipos, garantizamos su funcionamiento óptimo y cumplimiento normativo.
          </p>
        </div>

        <div className="space-y-24">
          {services.map((service, index) => (
            <motion.div
              key={service.title}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.6 }}
              className={cn(
                "flex flex-col lg:flex-row items-center gap-12 lg:gap-20",
                index % 2 === 1 ? "lg:flex-row-reverse" : ""
              )}
            >
              {/* Image Placeholder / Visual */}
              <div className="w-full lg:w-1/2 relative group">
                <div className="absolute inset-0 bg-gradient-to-tr from-slate-200 to-slate-100 dark:from-slate-800 dark:to-slate-700 rounded-3xl transform rotate-3 group-hover:rotate-2 transition-transform duration-500" />
                <div className="relative h-[300px] lg:h-[400px] w-full bg-slate-200 dark:bg-slate-800 rounded-2xl overflow-hidden shadow-xl flex items-center justify-center">
                    {/* Replaced Image with Icon for now since we don't have images */}
                    <service.icon className={cn("w-32 h-32 opacity-20", service.color)} />
                </div>
              </div>

              {/* Content */}
              <div className="w-full lg:w-1/2 space-y-6">
                <div className={cn("w-16 h-16 rounded-2xl flex items-center justify-center mb-6", service.bgColor)}>
                  <service.icon className={cn("w-8 h-8", service.color)} />
                </div>
                
                <h3 className="text-3xl font-bold text-slate-900 dark:text-white">
                  {service.title}
                </h3>
                
                <p className="text-lg text-slate-600 dark:text-slate-400 leading-relaxed">
                  {service.description}
                </p>

                <ul className="space-y-3 pt-4">
                    {[1,2,3].map((_, i) => (
                         <li key={i} className="flex items-center gap-3 text-slate-700 dark:text-slate-300">
                            <CheckCircle2 className={cn("w-5 h-5", service.color)} />
                            <span>Característica clave del servicio {i + 1}</span>
                         </li>
                    ))}
                </ul>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
