"use client";

import { useForm } from "react-hook-form";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/Button";
import { Mail, Phone, MapPin, Send } from "lucide-react";
import { cn } from "@/lib/utils";

type FormData = {
  name: string;
  email: string;
  phone: string;
  type: string;
  message: string;
};

export function Contact() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<FormData>();

  const onSubmit = async (data: FormData) => {
    // Mock submission
    await new Promise((resolve) => setTimeout(resolve, 2000));
    console.log(data);
    alert("Mensaje enviado con éxito!");
    reset();
  };

  return (
    <section id="contacto" className="py-24 relative overflow-hidden bg-white dark:bg-slate-950">
      <div className="absolute inset-0 bg-grid-slate-100 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.6))] dark:bg-grid-slate-800/20" />
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="grid lg:grid-cols-2 gap-16">
          
          {/* Contact Info */}
          <div className="space-y-8">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-4xl lg:text-5xl font-bold text-slate-900 dark:text-white mb-6">
                Hablemos de su proyecto
              </h2>
              <p className="text-xl text-slate-600 dark:text-slate-300">
                Estamos listos para brindarle la mejor asesoría en pesaje industrial.
              </p>
            </motion.div>

            <div className="space-y-6">
              {[ 
                { icon: Phone, text: "+57 (1) 234 5678", label: "Llámanos" },
                { icon: Mail, text: "contacto@metrica.com", label: "Escríbenos" },
                { icon: MapPin, text: "Zona Industrial, Bogotá D.C.", label: "Visítanos" },
              ].map((item, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.2 + index * 0.1 }}
                  className="flex items-center gap-4 bg-slate-50 dark:bg-slate-900 p-4 rounded-lg border border-slate-100 dark:border-slate-800"
                >
                  <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center text-blue-600 dark:text-blue-400">
                    <item.icon className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-sm text-slate-500 dark:text-slate-400">{item.label}</p>
                    <p className="text-lg font-semibold text-slate-900 dark:text-white">{item.text}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Form */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="bg-white dark:bg-slate-900 p-8 rounded-3xl shadow-xl border border-slate-100 dark:border-slate-800"
          >
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Nombre</label>
                  <input
                    {...register("name", { required: true })}
                    className={cn(
                      "w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border focus:ring-2 focus:ring-blue-500 outline-none transition-all",
                      errors.name ? "border-red-500" : "border-slate-200 dark:border-slate-700"
                    )}
                    placeholder="Su nombre"
                  />
                  {errors.name && <span className="text-xs text-red-500">Este campo es requerido</span>}
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Email</label>
                  <input
                    {...register("email", { required: true, pattern: /^\S+@\S+$/i })}
                    className={cn(
                      "w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border focus:ring-2 focus:ring-blue-500 outline-none transition-all",
                      errors.email ? "border-red-500" : "border-slate-200 dark:border-slate-700"
                    )}
                    placeholder="email@empresa.com"
                  />
                  {errors.email && <span className="text-xs text-red-500">Email inválido</span>}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Tipo de Consulta</label>
                <select
                  {...register("type", { required: true })}
                  className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                >
                  <option value="">Seleccione una opción</option>
                  <option value="cotizacion">Cotización de Equipos</option>
                  <option value="calibracion">Servicio de Calibración</option>
                  <option value="soporte">Soporte Técnico</option>
                  <option value="otro">Otro</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Mensaje</label>
                <textarea
                  {...register("message", { required: true })}
                  className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-blue-500 outline-none transition-all h-32 resize-none"
                  placeholder="Describa su requerimiento..."
                />
                {errors.message && <span className="text-xs text-red-500">Este campo es requerido</span>}
              </div>

              <Button
                type="submit"
                className="w-full text-lg py-6 shadow-lg shadow-blue-500/20"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Enviando..." : "Enviar Mensaje"}
                {!isSubmitting && <Send className="ml-2 w-5 h-5" />}
              </Button>
            </form>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
