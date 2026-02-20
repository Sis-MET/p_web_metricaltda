"use client";

import { useState, useMemo, useEffect } from "react";
import { useForm } from "react-hook-form";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/Button";
import {
  Mail,
  Phone,
  MapPin,
  Send,
  ChevronLeft,
  ChevronRight,
  ClipboardCheck,
  Wrench,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";

/* ─── Types ─────────────────────────────────────────────────────────────── */

type FormData = {
  nombre: string;
  apellido: string;
  email: string;
  empresa: string;
  cargo: string;
  ciudad: string;
  type: string;
  message: string;
};

type ServiceEvent = {
  type: "calibracion" | "soporte";
  location: string;
  description: string;
};

/* ─── Mock service data (key = "YYYY-MM-DD") ────────────────────────────── */

const MOCK_EVENTS: Record<string, ServiceEvent[]> = {
  "2026-02-04": [{ type: "calibracion", location: "Potosí",     description: "Calibración de balanzas industriales" }],
  "2026-02-06": [{ type: "soporte",     location: "La Paz",     description: "Mantenimiento preventivo de básculas" }],
  "2026-02-10": [
    { type: "calibracion", location: "Cochabamba", description: "Calibración de pesas patrón" },
    { type: "soporte",     location: "Cochabamba", description: "Soporte técnico en planta" },
  ],
  "2026-02-13": [{ type: "soporte",     location: "Oruro",      description: "Diagnóstico báscula de camión" }],
  "2026-02-17": [{ type: "calibracion", location: "Santa Cruz", description: "Calibración certificada ISO/IEC 17025" }],
  "2026-02-20": [{ type: "calibracion", location: "La Paz",     description: "Calibración de instrumentos de pesaje" }],
  "2026-02-24": [{ type: "soporte",     location: "Sucre",      description: "Mantenimiento correctivo de balanzas" }],
  "2026-02-27": [
    { type: "soporte",     location: "La Paz", description: "Visita técnica y diagnóstico" },
    { type: "calibracion", location: "La Paz", description: "Calibración de emergencia" },
  ],
  "2026-03-03": [{ type: "calibracion", location: "Potosí",     description: "Calibración anual, pesas patrón" }],
  "2026-03-06": [{ type: "soporte",     location: "Oruro",      description: "Mantenimiento preventivo" }],
  "2026-03-10": [{ type: "calibracion", location: "Santa Cruz", description: "Calibración de balanzas" }],
  "2026-03-17": [{ type: "soporte",     location: "Cochabamba", description: "Soporte en campo" }],
  "2026-03-20": [{ type: "calibracion", location: "La Paz",     description: "Calibración ISO/IEC 17025" }],
  "2026-03-25": [{ type: "soporte",     location: "Sucre",      description: "Revisión técnica" }],
};

/* ─── Calendar constants ────────────────────────────────────────────────── */

const MONTH_NAMES = [
  "Enero","Febrero","Marzo","Abril","Mayo","Junio",
  "Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre",
];
const DAY_NAMES = ["Lu", "Ma", "Mi", "Ju", "Vi", "Sa", "Do"];

/* ─── ServiceCalendar ───────────────────────────────────────────────────── */

function ServiceCalendar() {
  const today = new Date();
  const [viewDate, setViewDate] = useState(
    new Date(today.getFullYear(), today.getMonth(), 1)
  );
  const [selectedKey, setSelectedKey] = useState<string | null>(null);

  const year  = viewDate.getFullYear();
  const month = viewDate.getMonth();

  const firstDow    = new Date(year, month, 1).getDay();
  const startOffset = (firstDow + 6) % 7;
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const cells = useMemo<(number | null)[]>(() => {
    const arr: (number | null)[] = Array(startOffset).fill(null);
    for (let d = 1; d <= daysInMonth; d++) arr.push(d);
    return arr;
  }, [startOffset, daysInMonth]);

  const getKey = (d: number) =>
    `${year}-${String(month + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;

  const todayKey = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
  const selectedEvents = selectedKey ? (MOCK_EVENTS[selectedKey] ?? []) : [];

  return (
    /* layout en el contenedor raíz hace que framer-motion anime
       suavemente la altura cuando el resumen aparece/desaparece */
    <motion.div layout className="flex flex-col gap-4" transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}>

      {/* Month nav */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => { setViewDate(new Date(year, month - 1, 1)); setSelectedKey(null); }}
          className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
        >
          <ChevronLeft className="w-4 h-4 text-slate-500 dark:text-slate-400" />
        </button>
        <span className="font-heading font-bold text-slate-900 dark:text-white">
          {MONTH_NAMES[month]} {year}
        </span>
        <button
          onClick={() => { setViewDate(new Date(year, month + 1, 1)); setSelectedKey(null); }}
          className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
        >
          <ChevronRight className="w-4 h-4 text-slate-500 dark:text-slate-400" />
        </button>
      </div>

      {/* Day-name header */}
      <div className="grid grid-cols-7">
        {DAY_NAMES.map((d) => (
          <div key={d} className="text-center text-xs font-semibold text-slate-400 dark:text-slate-500 py-1">
            {d}
          </div>
        ))}
      </div>

      {/* Day cells */}
      <div className="grid grid-cols-7 gap-1">
        {cells.map((day, i) => {
          if (day === null) return <div key={`e-${i}`} />;

          const key     = getKey(day);
          const events  = MOCK_EVENTS[key] ?? [];
          const hasCal  = events.some((e) => e.type === "calibracion");
          const hasSop  = events.some((e) => e.type === "soporte");
          const isToday    = key === todayKey;
          const isSelected = key === selectedKey;

          return (
            <button
              key={key}
              onClick={() => setSelectedKey(isSelected ? null : key)}
              className={cn(
                "relative aspect-square flex flex-col items-center justify-center rounded-xl text-sm font-medium transition-all duration-200 select-none",
                events.length > 0 ? "cursor-pointer hover:scale-110" : "cursor-default",
                isSelected ? "ring-2 ring-offset-1 ring-blue-500 dark:ring-offset-slate-900" : "",
                isToday && !isSelected ? "ring-1 ring-slate-300 dark:ring-slate-600" : "",
                hasCal && hasSop
                  ? "bg-gradient-to-br from-blue-100 to-yellow-100 dark:from-blue-900/40 dark:to-yellow-900/20 text-slate-800 dark:text-white"
                  : hasCal
                  ? "bg-blue-100 dark:bg-blue-900/40 text-blue-900 dark:text-blue-200"
                  : hasSop
                  ? "bg-[#f9e300]/25 dark:bg-[#f9e300]/15 text-slate-800 dark:text-slate-100"
                  : "text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60"
              )}
            >
              <span>{day}</span>
              {events.length > 0 && (
                <div className="flex gap-0.5 mt-0.5">
                  {hasCal && <span className="w-1 h-1 rounded-full bg-blue-500" />}
                  {hasSop && <span className="w-1 h-1 rounded-full bg-[#f9e300]" />}
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Legend */}
      <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 dark:text-slate-400 pt-1 border-t border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded bg-blue-200 dark:bg-blue-800/60 border border-blue-400/60" />
          Calibración
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded bg-[#f9e300]/40 border border-[#f9e300]/60" />
          Soporte Técnico
        </div>
        <span className="ml-auto italic text-slate-400 dark:text-slate-500 hidden sm:block">
          Días con servicio programado
        </span>
      </div>

      {/* Day summary — layout-animated para transición suave */}
      <AnimatePresence mode="wait">
        {selectedKey && (
          <motion.div
            key={selectedKey}
            layout
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="overflow-hidden"
          >
            <div className="border-t border-slate-100 dark:border-slate-800 pt-4 space-y-2">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                {selectedEvents.length > 0 ? "Servicios programados" : "Sin servicios este día"}
              </p>

              {selectedEvents.map((ev, i) => {
                const Icon = ev.type === "calibracion" ? ClipboardCheck : Wrench;
                return (
                  <div
                    key={i}
                    className={cn(
                      "flex items-start gap-3 p-3 rounded-xl border",
                      ev.type === "calibracion"
                        ? "bg-blue-50 dark:bg-blue-950/40 border-blue-200 dark:border-blue-800/60"
                        : "bg-[#f9e300]/10 dark:bg-[#f9e300]/5 border-[#f9e300]/40"
                    )}
                  >
                    <div className={cn(
                      "p-1.5 rounded-lg shrink-0",
                      ev.type === "calibracion"
                        ? "bg-blue-500/15 text-blue-600 dark:text-blue-400"
                        : "bg-[#f9e300]/25 text-amber-600 dark:text-[#f9e300]"
                    )}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">{ev.location}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">{ev.description}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

/* ─── Input helper ───────────────────────────────────────────────────────── */

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">{label}</label>
      {children}
      {error && <span className="text-xs text-red-500">Este campo es requerido</span>}
    </div>
  );
}

const inputCls = (hasError?: boolean) =>
  cn(
    "w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:ring-2 focus:ring-blue-500 outline-none transition-all",
    hasError ? "border-red-500" : "border-slate-200 dark:border-slate-700"
  );

/* ─── Contact ────────────────────────────────────────────────────────────── */

export function Contact() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    setValue,
  } = useForm<FormData>();

  // Auto-detect city via free IP geolocation
  useEffect(() => {
    fetch("https://ipapi.co/json/")
      .then((r) => r.json())
      .then((data) => {
        if (data?.city) setValue("ciudad", data.city);
      })
      .catch(() => {}); // silently fail
  }, [setValue]);

  const onSubmit = async (data: FormData) => {
    await new Promise((r) => setTimeout(r, 2000));
    console.log(data);
    alert("¡Mensaje enviado con éxito!");
    reset();
  };

  return (
    <section
      id="contacto"
      className="py-24 relative overflow-hidden bg-white dark:bg-slate-950"
    >
      <div className="absolute inset-0 bg-grid-slate-100 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.6))] dark:bg-grid-slate-800/20" />

      <div className="container mx-auto px-6 lg:px-16 relative z-10 flex flex-col gap-14">

        {/* ── Header ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="space-y-4"
        >
          <h2 className="font-heading text-4xl lg:text-5xl font-extrabold text-slate-900 dark:text-white leading-tight">
            Hablemos de su proyecto
          </h2>
          <p className="font-body text-lg text-slate-600 dark:text-slate-400 max-w-xl leading-relaxed">
            Estamos listos para brindarle la mejor asesoría en pesaje industrial.
          </p>
          <div className="flex flex-wrap gap-4 pt-2">
            {[
              { icon: Phone,  text: "+591 2 2422060" },
              { icon: Mail,   text: "info@metrica.com.bo" },
              { icon: MapPin, text: "La Paz · Santa Cruz, Bolivia" },
            ].map(({ icon: Icon, text }) => (
              <div
                key={text}
                className="flex items-center gap-2 px-4 py-2 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 text-sm text-slate-700 dark:text-slate-300"
              >
                <Icon className="w-4 h-4 text-blue-500 shrink-0" />
                {text}
              </div>
            ))}
          </div>
        </motion.div>

        {/* ── Two columns: Form + Calendar ── */}
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-start">

          {/* ── Form ── */}
          <motion.div
            initial={{ opacity: 0, x: -24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="bg-white dark:bg-slate-900 p-8 rounded-3xl shadow-xl border border-slate-100 dark:border-slate-800"
          >
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">

              {/* Nombre + Apellido */}
              <div className="grid md:grid-cols-2 gap-5">
                <Field label="Nombre" error={!!errors.nombre}>
                  <input
                    {...register("nombre", { required: true })}
                    className={inputCls(!!errors.nombre)}
                    placeholder="Su nombre"
                  />
                </Field>
                <Field label="Apellido" error={!!errors.apellido}>
                  <input
                    {...register("apellido", { required: true })}
                    className={inputCls(!!errors.apellido)}
                    placeholder="Su apellido"
                  />
                </Field>
              </div>

              {/* Email */}
              <Field label="Email" error={!!errors.email}>
                <input
                  {...register("email", { required: true, pattern: /^\S+@\S+$/i })}
                  type="email"
                  className={inputCls(!!errors.email)}
                  placeholder="email@empresa.com"
                />
                {errors.email?.type === "pattern" && (
                  <span className="text-xs text-red-500">Email inválido</span>
                )}
              </Field>

              {/* Empresa + Cargo */}
              <div className="grid md:grid-cols-2 gap-5">
                <Field label="Empresa" error={!!errors.empresa}>
                  <input
                    {...register("empresa", { required: true })}
                    className={inputCls(!!errors.empresa)}
                    placeholder="Nombre de la empresa"
                  />
                </Field>
                <Field label="Cargo" error={!!errors.cargo}>
                  <input
                    {...register("cargo", { required: true })}
                    className={inputCls(!!errors.cargo)}
                    placeholder="Su cargo o rol"
                  />
                </Field>
              </div>

              {/* Ciudad (auto-detectada) */}
              <Field label="Ciudad">
                <div className="relative">
                  <input
                    {...register("ciudad")}
                    className={cn(inputCls(), "pr-10")}
                    placeholder="Detectando ciudad…"
                  />
                  <MapPin className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                </div>
                <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1">
                  Ciudad detectada automáticamente · puede editarla
                </p>
              </Field>

              {/* Tipo de consulta */}
              <Field label="Tipo de Consulta">
                <select
                  {...register("type", { required: true })}
                  className={inputCls(!!errors.type)}
                >
                  <option value="">Seleccione una opción</option>
                  <option value="cotizacion">Cotización de Equipos</option>
                  <option value="calibracion">Servicio de Calibración</option>
                  <option value="soporte">Soporte Técnico</option>
                  <option value="otro">Otro</option>
                </select>
              </Field>

              {/* Mensaje */}
              <Field label="Mensaje" error={!!errors.message}>
                <textarea
                  {...register("message", { required: true })}
                  className={cn(inputCls(!!errors.message), "h-28 resize-none")}
                  placeholder="Describa su requerimiento..."
                />
              </Field>

              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-5 rounded-2xl font-body font-bold text-base bg-[#f9e300] text-slate-900 hover:bg-[#f9e300]/90 hover:scale-[1.02] transition-all duration-300 shadow-[0_0_24px_rgba(249,227,0,0.3)]"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 w-4 h-4 animate-spin" /> Enviando…
                  </>
                ) : (
                  <>
                    Enviar Mensaje <Send className="ml-2 w-4 h-4" />
                  </>
                )}
              </Button>
            </form>
          </motion.div>

          {/* ── Calendar ── */}
          <motion.div
            layout
            initial={{ opacity: 0, x: 24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
            className="bg-white dark:bg-slate-900 p-8 rounded-3xl shadow-xl border border-slate-100 dark:border-slate-800"
          >
            <div className="mb-5">
              <h3 className="font-heading font-bold text-lg text-slate-900 dark:text-white">
                Agenda de Servicios
              </h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                Seleccione un día con servicio para ver el detalle.
              </p>
            </div>
            <ServiceCalendar />
          </motion.div>

        </div>
      </div>
    </section>
  );
}
