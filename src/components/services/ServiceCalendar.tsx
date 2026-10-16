"use client";

import { useState } from "react";
import { m, AnimatePresence } from "framer-motion";
import { CalendarDays, ChevronLeft, ChevronRight, ClipboardCheck, Wrench } from "lucide-react";
import { SCHEDULE } from "@/content/schedule";
import { cn } from "@/lib/utils";

/* ─── Calendar constants ────────────────────────────────────────────────── */

const MONTH_NAMES = [
  "Enero","Febrero","Marzo","Abril","Mayo","Junio",
  "Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre",
];
const DAY_NAMES = ["Lu", "Ma", "Mi", "Ju", "Vi", "Sa", "Do"];

const toKey = (y: number, m: number, d: number) =>
  `${y}-${String(m + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;

/* ─── ServiceCalendar ───────────────────────────────────────────────────── */

function Calendar() {
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

  const monthHasEvents = cells.some((d) => d !== null && SCHEDULE[toKey(year, month, d)]);
  const selectedEvents = selectedKey ? (SCHEDULE[selectedKey] ?? []) : [];

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
          const events = SCHEDULE[key] ?? [];
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
          <m.div
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
          </m.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

/** Agenda de visitas técnicas programadas en el país */
export function ServiceCalendar() {
  return (
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
      <Calendar />
    </div>
  );
}
