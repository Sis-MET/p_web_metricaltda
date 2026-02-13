"use client";

import { motion } from "framer-motion";
import { Award, ShieldCheck, FileCheck } from "lucide-react";

const certifications = [
  { name: "ISO 9001:2015", icon: Award, color: "text-blue-500" },
  { name: "ISO/IEC 17025", icon: ShieldCheck, color: "text-emerald-500" },
  { name: "Metrología Legal", icon: FileCheck, color: "text-purple-500" },
  { name: "Certificación ONAC", icon: Award, color: "text-amber-500" },
];

export function Certifications() {
  return (
    <section id="certificaciones" className="py-20 bg-slate-50 dark:bg-slate-900 border-y border-slate-200 dark:border-slate-800">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl font-bold text-slate-900 dark:text-white mb-4"
          >
            Calidad Certificada
          </motion.h2>
          <p className="text-slate-600 dark:text-slate-400">
             Cumplimos con los más altos estándares nacionales e internacionales.
          </p>
        </div>

        <div className="flex flex-wrap justify-center gap-8 lg:gap-16 items-center opacity-80 hover:opacity-100 transition-opacity">
          {certifications.map((cert, index) => (
            <motion.div
              key={cert.name}
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="group flex flex-col items-center gap-3 p-6 bg-white dark:bg-slate-800 rounded-xl shadow-sm hover:shadow-md transition-shadow border border-slate-100 dark:border-slate-700 w-40 h-40 justify-center"
            >
              <cert.icon className={`w-12 h-12 ${cert.color} group-hover:scale-110 transition-transform duration-300`} />
              <span className="font-semibold text-sm text-center text-slate-700 dark:text-slate-300">
                {cert.name}
              </span>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
