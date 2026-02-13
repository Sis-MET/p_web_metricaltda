"use client";

import { motion } from "framer-motion";
import { ArrowRight, Scale, Truck, Cog, Calculator } from "lucide-react";
import { Button } from "@/components/ui/Button";

const products = [
  {
    id: 1,
    title: "Básculas de Camiones",
    description: "Sistemas de pesaje de alto tonelaje para control de carga y logística.",
    icon: Truck,
    gradient: "from-blue-600 to-indigo-600",
  },
  {
    id: 2,
    title: "Balanzas Industriales",
    description: "Equipos robustos para ambientes exigentes y procesos de manufactura.",
    icon: Scale,
    gradient: "from-cyan-500 to-blue-500",
  },
  {
    id: 3,
    title: "Pesaje de Precisión",
    description: "Balanzas analíticas y de laboratorio para mediciones exactas.",
    icon: Calculator,
    gradient: "from-emerald-500 to-teal-500",
  },
  {
    id: 4,
    title: "Sistemas Automatizados",
    description: "Integración de pesaje en líneas de producción y control automático.",
    icon: Cog,
    gradient: "from-orange-500 to-red-500",
  },
];

export function Products() {
  return (
    <section id="productos" className="py-24 bg-slate-50 dark:bg-slate-900 relative overflow-hidden">
      {/* Background Decorative Elements */}
      <div className="absolute top-0 right-0 w-1/3 h-full bg-blue-50/50 dark:bg-blue-900/10 skew-x-12 translate-x-32" />
      <div className="absolute bottom-0 left-0 w-1/3 h-full bg-cyan-50/50 dark:bg-cyan-900/10 -skew-x-12 -translate-x-32" />

      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center mb-16 space-y-4">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-4xl lg:text-5xl font-bold text-slate-900 dark:text-white"
          >
            Soluciones de Pesaje
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-xl text-slate-600 dark:text-slate-300 max-w-2xl mx-auto"
          >
            Tecnología de vanguardia adaptada a las necesidades específicas de su industria.
          </motion.p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {products.map((product, index) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ y: -10 }}
              className="group relative bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-xl hover:shadow-2xl transition-all duration-300 border border-slate-100 dark:border-slate-700"
            >
              <div
                className={`absolute inset-0 bg-gradient-to-br ${product.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-300 rounded-2xl`}
              />
              
              <div
                className={`w-14 h-14 rounded-xl bg-gradient-to-br ${product.gradient} flex items-center justify-center text-white mb-6 shadow-lg group-hover:scale-110 transition-transform duration-300`}
              >
                <product.icon className="w-7 h-7" />
              </div>

              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                {product.title}
              </h3>
              
              <p className="text-slate-600 dark:text-slate-400 mb-6 leading-relaxed">
                {product.description}
              </p>

              <div className="flex items-center text-blue-600 dark:text-blue-400 font-semibold group/btn cursor-pointer">
                Ver Detalles
                <ArrowRight className="w-4 h-4 ml-2 group-hover/btn:translate-x-1 transition-transform" />
              </div>
            </motion.div>
          ))}
        </div>

        <div className="mt-16 text-center">
            <Button size="lg" variant="outline" className="rounded-full px-8 border-blue-200 dark:border-blue-800 hover:bg-blue-50 dark:hover:bg-blue-900/50">
                Ver Catálogo Completo
            </Button>
        </div>
      </div>
    </section>
  );
}
