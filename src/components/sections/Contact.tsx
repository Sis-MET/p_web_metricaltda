"use client";

import { useEffect, useState, type ReactNode } from "react";
import { useForm } from "react-hook-form";
import { motion, AnimatePresence } from "framer-motion";
import {
  Mail,
  Phone,
  MapPin,
  Send,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ClipboardCheck,
  Wrench,
  Loader2,
  CircleCheck,
  CalendarDays,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Reveal } from "@/components/animations/Reveal";
import { CONSULTA_EVENT, type Consulta } from "@/lib/navigation";
import { EASE_OUT } from "@/lib/motion";
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

/* ─── Contact data ──────────────────────────────────────────────────────── */

const CONTACT_LINKS = [
  { icon: Phone, label: "Teléfono La Paz", value: "+591 2 2422060", href: "tel:+59122422060" },
  { icon: Phone, label: "Área comercial", value: "+591 71538792", href: "tel:+59171538792" },
  { icon: Mail, label: "Correo", value: "info@metrica.com.bo", href: "mailto:info@metrica.com.bo" },
  { icon: MapPin, label: "Oficinas", value: "La Paz · Santa Cruz, Bolivia" },
];

/* ─── Calendar constants ────────────────────────────────────────────────── */

const MONTH_NAMES = [
  "Enero","Febrero","Marzo","Abril","Mayo","Junio",
  "Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre",
];
const DAY_NAMES = ["Lu", "Ma", "Mi", "Ju", "Vi", "Sa", "Do"];

const toKey = (y: number, m: number, d: number) =>
  `${y}-${String(m + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;

/* ─── ServiceCalendar ───────────────────────────────────────────────────── */

function ServiceCalendar() {
  const today = new Date();
  const [viewDate, setViewDate] = useState(new Date(today.getFullYear(), today.getMonth(), 1));
  const [selectedKey, setSelectedKey] = useState<string | null>(null);

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const startOffset = (new Date(year, month, 1).getDay() + 6) % 7;
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const todayKey = toKey(today.getFullYear(), today.getMonth(), today.getDate());

  const cells: (number | null)[] = Array(startOffset).fill(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  const monthHasEvents = cells.some((d) => d !== null && MOCK_EVENTS[toKey(year, month, d)]);
  const selectedEvents = selectedKey ? (MOCK_EVENTS[selectedKey] ?? []) : [];

  const changeMonth = (delta: number) => {
    setViewDate(new Date(year, month + delta, 1));
    setSelectedKey(null);
  };

  return (
    <div>
      {/* Month nav */}
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={() => changeMonth(-1)}
          aria-label="Mes anterior"
          className="flex size-9 items-center justify-center rounded-lg text-neutral-500 transition-colors hover:bg-neutral-100 hover:text-ink-900"
        >
          <ChevronLeft className="size-4" />
        </button>
        <span className="font-heading text-sm font-bold text-ink-950" aria-live="polite">
          {MONTH_NAMES[month]} {year}
        </span>
        <button
          type="button"
          onClick={() => changeMonth(1)}
          aria-label="Mes siguiente"
          className="flex size-9 items-center justify-center rounded-lg text-neutral-500 transition-colors hover:bg-neutral-100 hover:text-ink-900"
        >
          <ChevronRight className="size-4" />
        </button>
      </div>

      {/* Day-name header */}
      <div className="mt-3 grid grid-cols-7">
        {DAY_NAMES.map((d) => (
          <div key={d} className="py-1 text-center text-[11px] font-semibold uppercase text-neutral-400">
            {d}
          </div>
        ))}
      </div>

      {/* Day cells */}
      <div className="grid grid-cols-7 gap-1">
        {cells.map((day, i) => {
          if (day === null) return <div key={`e-${i}`} />;

          const key = toKey(year, month, day);
          const events = MOCK_EVENTS[key] ?? [];
          const hasCal = events.some((e) => e.type === "calibracion");
          const hasSop = events.some((e) => e.type === "soporte");
          const isToday = key === todayKey;
          const isSelected = key === selectedKey;

          const base = "relative flex h-9 flex-col items-center justify-center rounded-lg text-sm tabular-nums";

          if (events.length === 0) {
            return (
              <div
                key={key}
                className={cn(base, "text-neutral-400", isToday && "font-semibold text-ink-900 ring-1 ring-inset ring-neutral-300")}
              >
                {day}
              </div>
            );
          }

          return (
            <button
              key={key}
              type="button"
              onClick={() => setSelectedKey(isSelected ? null : key)}
              aria-pressed={isSelected}
              aria-label={`${day} de ${MONTH_NAMES[month]}: ${events.length} servicio${events.length > 1 ? "s" : ""}`}
              className={cn(
                base,
                "font-semibold transition-colors duration-150",
                isSelected
                  ? "bg-ink-800 text-white"
                  : hasCal && hasSop
                    ? "bg-gradient-to-br from-ink-100 to-sun-200 text-ink-950 hover:from-ink-200 hover:to-sun-300"
                    : hasCal
                      ? "bg-ink-100 text-ink-900 hover:bg-ink-200"
                      : "bg-sun-200 text-ink-950 hover:bg-sun-300"
              )}
            >
              {day}
              <span className="absolute bottom-1 flex gap-0.5">
                {hasCal && <span className={cn("size-1 rounded-full", isSelected ? "bg-white" : "bg-ink-600")} />}
                {hasSop && <span className={cn("size-1 rounded-full", isSelected ? "bg-sun-400" : "bg-sun-600")} />}
              </span>
            </button>
          );
        })}
      </div>

      {/* Legend */}
      <div className="mt-4 flex flex-wrap items-center gap-4 border-t border-neutral-100 pt-4 text-xs text-neutral-500">
        <span className="inline-flex items-center gap-1.5">
          <span className="size-2.5 rounded-sm bg-ink-200" /> Calibración
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="size-2.5 rounded-sm bg-sun-300" /> Soporte técnico
        </span>
      </div>

      {/* Day summary */}
      <div className="mt-3 min-h-14">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={selectedKey ?? (monthHasEvents ? "hint" : "empty")}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1, transition: { duration: 0.2 } }}
            exit={{ opacity: 0, transition: { duration: 0.1 } }}
          >
            {selectedKey ? (
              <ul className="space-y-2">
                {selectedEvents.map((ev, i) => {
                  const Icon = ev.type === "calibracion" ? ClipboardCheck : Wrench;
                  return (
                    <li
                      key={i}
                      className={cn(
                        "flex items-start gap-3 rounded-xl border p-3",
                        ev.type === "calibracion" ? "border-ink-100 bg-ink-50" : "border-sun-200 bg-sun-200/40"
                      )}
                    >
                      <span
                        className={cn(
                          "flex size-7 shrink-0 items-center justify-center rounded-lg",
                          ev.type === "calibracion" ? "bg-ink-100 text-ink-700" : "bg-sun-200 text-ink-800"
                        )}
                      >
                        <Icon className="size-3.5" aria-hidden />
                      </span>
                      <div>
                        <p className="text-sm font-semibold text-ink-950">{ev.location}</p>
                        <p className="text-xs text-neutral-600">{ev.description}</p>
                      </div>
                    </li>
                  );
                })}
              </ul>
            ) : (
              <p className="text-sm text-neutral-500">
                {monthHasEvents
                  ? "Seleccione un día marcado para ver el detalle."
                  : "No hay servicios programados este mes."}
              </p>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

/* ─── Input helpers ──────────────────────────────────────────────────────── */

function Field({
  id,
  label,
  error,
  hint,
  children,
}: {
  id: string;
  label: string;
  error?: string;
  hint?: string;
  children: ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <label htmlFor={id} className="block text-sm font-medium text-ink-950">
        {label}
      </label>
      {children}
      {error ? (
        <p id={`${id}-error`} role="alert" className="text-xs font-medium text-red-600">
          {error}
        </p>
      ) : (
        hint && <p className="text-xs text-neutral-400">{hint}</p>
      )}
    </div>
  );
}

const inputCls = (hasError?: boolean) =>
  cn(
    "block h-11 w-full rounded-xl border bg-white px-3.5 text-[15px] text-ink-950 shadow-[0_1px_2px_rgba(0,0,0,0.04)] outline-none transition-[border-color,box-shadow] duration-150 placeholder:text-neutral-400",
    "focus:border-ink-500 focus:ring-4 focus:ring-ink-500/15",
    hasError ? "border-red-400 focus:border-red-500 focus:ring-red-500/15" : "border-neutral-200 hover:border-neutral-300"
  );

const REQUIRED = "Este campo es requerido";

/* ─── Contact ────────────────────────────────────────────────────────────── */

export function Contact() {
  const [sent, setSent] = useState(false);
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

  // Los botones "Cotizar", "Solicitar calibración", etc. preseleccionan el tipo de consulta
  useEffect(() => {
    const onConsulta = (e: Event) => setValue("type", (e as CustomEvent<Consulta>).detail);
    window.addEventListener(CONSULTA_EVENT, onConsulta);
    return () => window.removeEventListener(CONSULTA_EVENT, onConsulta);
  }, [setValue]);

  // Envío simulado: falta conectar con el envío real de correo
  const onSubmit = async () => {
    await new Promise((r) => setTimeout(r, 1200));
    reset();
    setSent(true);
  };

  const a11y = (name: keyof FormData) => ({
    id: `contacto-${name}`,
    "aria-invalid": errors[name] ? true : undefined,
    "aria-describedby": errors[name] ? `contacto-${name}-error` : undefined,
  });

  return (
    <section id="contacto" className="border-t border-neutral-200 bg-neutral-50 py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <Reveal>
          <SectionHeading
            eyebrow="Contacto"
            title="Hablemos de su proyecto"
            description="Estamos listos para brindarle la mejor asesoría en pesaje industrial."
            className="max-w-2xl"
          />
        </Reveal>

        <div className="mt-12 grid items-start gap-6 lg:grid-cols-12 lg:gap-8">
          {/* ── Form ── */}
          <Reveal className="lg:col-span-7">
            <div className="rounded-[2rem] border border-neutral-200 bg-white p-6 shadow-[0_32px_64px_-40px_rgba(0,0,0,0.3)] sm:p-8">
              <AnimatePresence mode="wait" initial={false}>
                {sent ? (
                  <motion.div
                    key="sent"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0, transition: { duration: 0.3, ease: EASE_OUT } }}
                    exit={{ opacity: 0, transition: { duration: 0.15 } }}
                    role="status"
                    className="flex flex-col items-center py-16 text-center"
                  >
                    <span className="flex size-14 items-center justify-center rounded-full bg-ink-50 text-ink-700">
                      <CircleCheck className="size-7" aria-hidden />
                    </span>
                    <h3 className="mt-5 font-heading text-2xl font-bold text-ink-950">¡Mensaje enviado!</h3>
                    <p className="mt-2 max-w-sm text-neutral-600">
                      Gracias por escribirnos. Nuestro equipo se pondrá en contacto con usted a la brevedad.
                    </p>
                    <Button variant="outline" className="mt-8" onClick={() => setSent(false)}>
                      Enviar otro mensaje
                    </Button>
                  </motion.div>
                ) : (
                  <motion.form
                    key="form"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1, transition: { duration: 0.2 } }}
                    exit={{ opacity: 0, transition: { duration: 0.15 } }}
                    onSubmit={handleSubmit(onSubmit)}
                    noValidate
                    className="grid gap-5 sm:grid-cols-2"
                  >
                    <Field id="contacto-nombre" label="Nombre" error={errors.nombre && REQUIRED}>
                      <input
                        {...register("nombre", { required: true })}
                        {...a11y("nombre")}
                        autoComplete="given-name"
                        className={inputCls(!!errors.nombre)}
                        placeholder="Su nombre"
                      />
                    </Field>
                    <Field id="contacto-apellido" label="Apellido" error={errors.apellido && REQUIRED}>
                      <input
                        {...register("apellido", { required: true })}
                        {...a11y("apellido")}
                        autoComplete="family-name"
                        className={inputCls(!!errors.apellido)}
                        placeholder="Su apellido"
                      />
                    </Field>

                    <div className="sm:col-span-2">
                      <Field
                        id="contacto-email"
                        label="Email"
                        error={
                          errors.email?.type === "pattern" ? "Email inválido" : errors.email && REQUIRED
                        }
                      >
                        <input
                          {...register("email", { required: true, pattern: /^\S+@\S+$/i })}
                          {...a11y("email")}
                          type="email"
                          autoComplete="email"
                          className={inputCls(!!errors.email)}
                          placeholder="email@empresa.com"
                        />
                      </Field>
                    </div>

                    <Field id="contacto-empresa" label="Empresa" error={errors.empresa && REQUIRED}>
                      <input
                        {...register("empresa", { required: true })}
                        {...a11y("empresa")}
                        autoComplete="organization"
                        className={inputCls(!!errors.empresa)}
                        placeholder="Nombre de la empresa"
                      />
                    </Field>
                    <Field id="contacto-cargo" label="Cargo" error={errors.cargo && REQUIRED}>
                      <input
                        {...register("cargo", { required: true })}
                        {...a11y("cargo")}
                        autoComplete="organization-title"
                        className={inputCls(!!errors.cargo)}
                        placeholder="Su cargo o rol"
                      />
                    </Field>

                    <Field id="contacto-ciudad" label="Ciudad" hint="Detectada automáticamente · puede editarla">
                      <div className="relative">
                        <input
                          {...register("ciudad")}
                          id="contacto-ciudad"
                          autoComplete="address-level2"
                          className={cn(inputCls(), "pr-10")}
                          placeholder="Su ciudad"
                        />
                        <MapPin className="pointer-events-none absolute right-3.5 top-1/2 size-4 -translate-y-1/2 text-neutral-400" />
                      </div>
                    </Field>
                    <Field id="contacto-type" label="Tipo de consulta" error={errors.type && "Seleccione una opción"}>
                      <div className="relative">
                        <select
                          {...register("type", { required: true })}
                          {...a11y("type")}
                          className={cn(inputCls(!!errors.type), "appearance-none pr-10")}
                        >
                          <option value="">Seleccione una opción</option>
                          <option value="cotizacion">Cotización de equipos</option>
                          <option value="calibracion">Servicio de calibración</option>
                          <option value="soporte">Soporte técnico</option>
                          <option value="otro">Otro</option>
                        </select>
                        <ChevronDown className="pointer-events-none absolute right-3.5 top-1/2 size-4 -translate-y-1/2 text-neutral-400" />
                      </div>
                    </Field>

                    <div className="sm:col-span-2">
                      <Field id="contacto-message" label="Mensaje" error={errors.message && REQUIRED}>
                        <textarea
                          {...register("message", { required: true })}
                          {...a11y("message")}
                          rows={4}
                          className={cn(inputCls(!!errors.message), "h-auto resize-none py-3")}
                          placeholder="Describa su requerimiento..."
                        />
                      </Field>
                    </div>

                    <Button type="submit" size="lg" disabled={isSubmitting} className="w-full sm:col-span-2">
                      {isSubmitting ? (
                        <>
                          <Loader2 className="animate-spin" /> Enviando…
                        </>
                      ) : (
                        <>
                          Enviar mensaje <Send />
                        </>
                      )}
                    </Button>
                  </motion.form>
                )}
              </AnimatePresence>
            </div>
          </Reveal>

          {/* ── Sidebar ── */}
          <div className="flex flex-col gap-6 lg:col-span-5">
            <Reveal delay={0.06}>
              <div className="relative isolate overflow-hidden rounded-[2rem] bg-ink-950 p-6 text-white sm:p-8">
                <div
                  aria-hidden
                  className="absolute -right-24 -top-24 -z-10 size-72 rounded-full bg-[radial-gradient(circle,rgba(249,227,0,0.12),transparent_65%)]"
                />
                <h3 className="font-heading text-lg font-bold">Atención directa</h3>
                <ul className="mt-5 space-y-1">
                  {CONTACT_LINKS.map(({ icon: Icon, label, value, href }) => {
                    const content = (
                      <>
                        <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-white/10 text-sun-400">
                          <Icon className="size-4" aria-hidden />
                        </span>
                        <span className="min-w-0">
                          <span className="block text-xs text-white/55">{label}</span>
                          <span className="block truncate font-medium">{value}</span>
                        </span>
                      </>
                    );
                    return (
                      <li key={label}>
                        {href ? (
                          <a
                            href={href}
                            className="-mx-2 flex items-center gap-3.5 rounded-xl px-2 py-2 transition-colors hover:bg-white/[0.07]"
                          >
                            {content}
                          </a>
                        ) : (
                          <div className="-mx-2 flex items-center gap-3.5 px-2 py-2">{content}</div>
                        )}
                      </li>
                    );
                  })}
                </ul>
              </div>
            </Reveal>

            <Reveal delay={0.12}>
              <div className="rounded-[2rem] border border-neutral-200 bg-white p-6 sm:p-7">
                <div className="mb-4 flex items-center gap-3">
                  <span className="flex size-9 items-center justify-center rounded-xl bg-ink-50 text-ink-700">
                    <CalendarDays className="size-4" aria-hidden />
                  </span>
                  <div>
                    <h3 className="font-heading text-base font-bold text-ink-950">Agenda de servicios</h3>
                    <p className="text-xs text-neutral-500">Visitas técnicas programadas en el país</p>
                  </div>
                </div>
                <ServiceCalendar />
              </div>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  );
}
