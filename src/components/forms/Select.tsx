"use client";

import { useEffect, useId, useRef, useState, type KeyboardEvent } from "react";
import { AnimatePresence, m } from "framer-motion";
import { Check, ChevronDown } from "lucide-react";
import { EASE_OUT } from "@/lib/motion";
import type { Option } from "@/lib/forms/schema";
import { cn } from "@/lib/utils";

type SelectProps = {
  /** Del botón: lo usa la etiqueta del campo */
  id: string;
  name: string;
  options: Option[];
  placeholder: string;
  className?: string;
  describedBy?: string;
  invalid: boolean;
};

/** Alto que necesita la lista para abrirse hacia abajo; si no cabe, se abre hacia arriba */
const LIST_SPACE_PX = 280;
const TYPEAHEAD_MS = 600;

const normalize = (text: string) => text.normalize("NFD").replace(/\p{Diacritic}/gu, "").toLowerCase();

/**
 * Lista desplegable con el estilo del sitio, con el patrón de WAI-ARIA "combobox de solo selección":
 * el foco queda en el botón y el teclado funciona como en un <select> (flechas, Inicio, Fin, Enter,
 * Escape y escribir para saltar a una opción). El valor viaja en un <select> nativo oculto: el
 * formulario lo lee, lo valida y limpia su error como el de cualquier otro campo.
 */
export function Select({ id, name, options, placeholder, className, describedBy, invalid }: SelectProps) {
  const [value, setValue] = useState("");
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const [upward, setUpward] = useState(false);
  const button = useRef<HTMLButtonElement>(null);
  const native = useRef<HTMLSelectElement>(null);
  const typed = useRef({ text: "", at: 0 });
  const listId = useId();
  const optionId = (index: number) => `${listId}-${index}`;

  const selectedIndex = options.findIndex((option) => option.value === value);
  const selected = options[selectedIndex];

  // La opción activa siempre a la vista, también al moverse con el teclado
  useEffect(() => {
    if (open) document.getElementById(`${listId}-${active}`)?.scrollIntoView({ block: "nearest" });
  }, [open, active, listId]);

  const show = () => {
    const rect = button.current?.getBoundingClientRect();
    const below = rect ? window.innerHeight - rect.bottom : LIST_SPACE_PX;
    setUpward(rect !== undefined && below < LIST_SPACE_PX && rect.top > below);
    setActive(Math.max(0, selectedIndex));
    setOpen(true);
  };

  const choose = (index: number) => {
    const option = options[index];
    setOpen(false);
    if (!option || option.value === value) return;
    setValue(option.value);
    // El cambio llega al formulario como el de un campo nativo
    if (native.current) {
      native.current.value = option.value;
      native.current.dispatchEvent(new Event("change", { bubbles: true }));
    }
  };

  /** Escribir "co" salta a Cochabamba, como en un <select> */
  const matchTyped = (key: string) => {
    const now = Date.now();
    const text = now - typed.current.at < TYPEAHEAD_MS ? typed.current.text + key : key;
    typed.current = { text, at: now };
    return options.findIndex((option) => normalize(option.label).startsWith(normalize(text)));
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    const last = options.length - 1;
    const move = (index: number) => {
      event.preventDefault();
      setActive(Math.min(last, Math.max(0, index)));
    };

    if (!open) {
      if (["ArrowDown", "ArrowUp", "Enter", " "].includes(event.key)) {
        event.preventDefault();
        show();
      } else if (event.key.length === 1 && !event.ctrlKey && !event.metaKey && !event.altKey) {
        const index = matchTyped(event.key);
        if (index >= 0) choose(index);
      }
      return;
    }

    switch (event.key) {
      case "ArrowDown":
        return move(active + 1);
      case "ArrowUp":
        return move(active - 1);
      case "Home":
        return move(0);
      case "End":
        return move(last);
      case "Enter":
      case " ":
        event.preventDefault();
        return choose(active);
      case "Escape":
        event.preventDefault();
        event.stopPropagation();
        return setOpen(false);
      case "Tab":
        return setOpen(false);
      default:
        if (event.key.length === 1 && !event.ctrlKey && !event.metaKey && !event.altKey) {
          const index = matchTyped(event.key);
          if (index >= 0) setActive(index);
        }
    }
  };

  return (
    <div className="relative">
      <button
        ref={button}
        id={id}
        type="button"
        role="combobox"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listId}
        aria-activedescendant={open ? optionId(active) : undefined}
        aria-invalid={invalid || undefined}
        aria-describedby={describedBy}
        onClick={() => (open ? setOpen(false) : show())}
        onKeyDown={handleKeyDown}
        onBlur={() => setOpen(false)}
        className={cn(className, "flex items-center pr-10 text-left")}
      >
        <span className={cn("truncate", !selected && "text-neutral-400")}>{selected?.label ?? placeholder}</span>
        <ChevronDown
          aria-hidden
          className={cn(
            "pointer-events-none absolute right-3.5 top-1/2 size-4 -translate-y-1/2 text-neutral-400 transition-transform duration-200",
            open && "rotate-180"
          )}
        />
      </button>

      <AnimatePresence>
        {open && (
          <m.ul
            id={listId}
            role="listbox"
            aria-labelledby={id}
            initial={{ opacity: 0, y: upward ? 6 : -6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, transition: { duration: 0.12 } }}
            transition={{ duration: 0.2, ease: EASE_OUT }}
            style={{ transformOrigin: upward ? "bottom" : "top" }}
            // El foco se queda en el botón: elegir con el mouse no debe quitárselo
            onMouseDown={(event) => event.preventDefault()}
            className={cn(
              "absolute inset-x-0 z-30 max-h-64 overflow-y-auto overscroll-contain rounded-xl border border-neutral-200 bg-white p-1.5 shadow-[0_24px_48px_-20px_rgba(0,0,0,0.35)]",
              upward ? "bottom-full mb-1.5" : "top-full mt-1.5"
            )}
          >
            {options.map((option, index) => {
              const isSelected = index === selectedIndex;
              return (
                <li
                  key={option.value}
                  id={optionId(index)}
                  role="option"
                  aria-selected={isSelected}
                  onMouseEnter={() => setActive(index)}
                  onClick={() => choose(index)}
                  className={cn(
                    "flex cursor-pointer items-center justify-between gap-3 rounded-lg px-3 py-2 text-[15px] transition-colors",
                    index === active ? "bg-mt-50 text-ink-950" : "text-ink-800",
                    isSelected && "font-semibold"
                  )}
                >
                  {option.label}
                  {isSelected && <Check className="size-4 shrink-0 text-mt-700" aria-hidden />}
                </li>
              );
            })}
          </m.ul>
        )}
      </AnimatePresence>

      {/* Valor real del campo, para el formulario. Si el formulario lo enfoca (error), el foco pasa al botón */}
      <select
        ref={native}
        name={name}
        defaultValue=""
        tabIndex={-1}
        aria-hidden
        onFocus={() => button.current?.focus()}
        className="sr-only"
      >
        <option value="" />
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}
