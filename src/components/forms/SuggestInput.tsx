"use client";

import { useId, useState, type KeyboardEvent } from "react";
import { listboxCls, normalize, optionCls } from "./styles";

const MAX_SUGGESTIONS = 8;

/**
 * Campo de texto libre con sugerencias, con la lista del sitio (patrón WAI-ARIA "combobox con
 * lista"): al escribir se filtran las sugerencias; flechas y Enter eligen, Escape cierra. Reemplaza
 * a <datalist>, que cada navegador muestra a su manera.
 */
export function SuggestInput({
  id,
  name,
  suggestions,
  defaultValue = "",
  required,
  maxLength,
  className,
}: {
  id: string;
  name: string;
  suggestions: string[];
  defaultValue?: string;
  required?: boolean;
  maxLength?: number;
  className?: string;
}) {
  const [value, setValue] = useState(defaultValue);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);
  const listId = useId();

  const query = normalize(value.trim());
  const matches = suggestions.filter((suggestion) => normalize(suggestion).includes(query) && suggestion !== value).slice(0, MAX_SUGGESTIONS);
  const shown = open && matches.length > 0;

  const choose = (suggestion: string) => {
    setValue(suggestion);
    setOpen(false);
    setActive(-1);
  };

  const onKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      setOpen(true);
      const step = event.key === "ArrowDown" ? 1 : -1;
      setActive((index) => (matches.length ? (index + step + matches.length) % matches.length : -1));
    } else if (event.key === "Enter" && shown && active >= 0) {
      event.preventDefault();
      choose(matches[active]);
    } else if (event.key === "Escape" && shown) {
      event.preventDefault();
      setOpen(false);
    }
  };

  return (
    <div className="relative">
      <input
        id={id}
        name={name}
        value={value}
        required={required}
        maxLength={maxLength}
        autoComplete="off"
        role="combobox"
        aria-autocomplete="list"
        aria-expanded={shown}
        aria-controls={listId}
        aria-activedescendant={shown && active >= 0 ? `${listId}-${active}` : undefined}
        onChange={(event) => {
          setValue(event.target.value);
          setOpen(true);
          setActive(-1);
        }}
        onFocus={() => setOpen(true)}
        onBlur={() => setOpen(false)}
        onKeyDown={onKeyDown}
        className={className}
      />
      {shown && (
        <ul
          id={listId}
          role="listbox"
          // El foco se queda en el campo: elegir con el mouse no debe quitárselo
          onMouseDown={(event) => event.preventDefault()}
          className={listboxCls()}
        >
          {matches.map((suggestion, index) => (
            <li
              key={suggestion}
              id={`${listId}-${index}`}
              role="option"
              aria-selected={index === active}
              onMouseEnter={() => setActive(index)}
              onClick={() => choose(suggestion)}
              className={optionCls(index === active)}
            >
              {suggestion}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
