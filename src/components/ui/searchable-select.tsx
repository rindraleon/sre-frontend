import { useEffect, useId, useMemo, useRef, useState } from "react";
import { Check, ChevronDown, Search, X } from "lucide-react";
import { CoreSpinLoader } from "./core-spin-loader";

export interface SelectOption {
  value: string;
  label: string;
  description?: string;
}

function normalize(text: string) {
  return text.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
}

/** Local filtering insensitive to accents and case. */
export function filterSelectOptions(options: SelectOption[], search: string): SelectOption[] {
  const request = normalize(search.trim());
  if (!request) return options;
  return options.filter((option) =>
    normalize(`${option.label} ${option.description ?? ""}`).includes(request),
  );
}

interface SearchableSelectProps {
  id?: string;
  value: string;
  options: SelectOption[];
  onChoose: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  loading?: boolean;
  loadingError?: string;
  "aria-invalid"?: boolean;
  "aria-describedby"?: string;
}

/**
 * Select with local search, for long lists (e.g. taxpayers).
 * Keyboard navigation: arrows, Enter, Escape; close on outside click;
 * selection clearing; explicit loading / empty / error states.
 * Remote search is not offered by the current API: filtering is
 * therefore local, over options already loaded by the calling screen.
 */
export function SearchableSelect({
  id,
  value,
  options,
  onChoose,
  placeholder = "Rechercher…",
  disabled = false,
  loading = false,
  loadingError,
  "aria-invalid": ariaInvalid,
  "aria-describedby": ariaDescribedby,
}: Readonly<SearchableSelectProps>) {
  const generateId = useId().replaceAll(":", "");
  const effectiveId = id ?? `select-${generateId}`;
  const listId = `${effectiveId}-liste`;
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [activeIndex, setActiveIndex] = useState(-1);
  const refRoot = useRef<HTMLDivElement | null>(null);
  const refField = useRef<HTMLInputElement | null>(null);

  const selection = options.find((option) => option.value === value);
  const filteredOptions = useMemo(
    () => filterSelectOptions(options, search),
    [options, search],
  );

  useEffect(() => {
    if (!open) return;
    const handleOutsideClick = (event: MouseEvent) => {
      if (refRoot.current && !refRoot.current.contains(event.target as Node))
        setOpen(false);
    };
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, [open]);

  const choose = (option: SelectOption) => {
    onChoose(option.value);
    setOpen(false);
    setSearch("");
    setActiveIndex(-1);
    refField.current?.focus();
  };

  const handleKeyboard = (event: React.KeyboardEvent) => {
    if (event.key === "Escape") {
      setOpen(false);
      return;
    }
    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      if (!open) {
        setOpen(true);
        return;
      }
      const delta = event.key === "ArrowDown" ? 1 : -1;
      setActiveIndex((current) => {
        const next = current + delta;
        if (next < 0) return filteredOptions.length - 1;
        if (next >= filteredOptions.length) return 0;
        return next;
      });
      return;
    }
    if (event.key === "Enter" && open && activeIndex >= 0 && filteredOptions[activeIndex]) {
      event.preventDefault();
      choose(filteredOptions[activeIndex]);
    }
  };

  return (
    <div className="searchable-select-sre" ref={refRoot}>
      <div className="searchable-select-sre__field">
        <Search size={15} aria-hidden="true" />
        <input
          ref={refField}
          id={effectiveId}
          type="text"
          role="combobox"
          aria-expanded={open}
          aria-controls={listId}
          aria-activedescendant={
            open && activeIndex >= 0 ? `${effectiveId}-option-${activeIndex}` : undefined
          }
          aria-invalid={ariaInvalid}
          aria-describedby={ariaDescribedby}
          disabled={disabled || loading}
          placeholder={selection ? selection.label : placeholder}
          value={open ? search : (selection?.label ?? "")}
          onFocus={() => {
            setOpen(true);
            setSearch("");
          }}
          onChange={(event) => {
            setSearch(event.target.value);
            setOpen(true);
            setActiveIndex(-1);
          }}
          onKeyDown={handleKeyboard}
        />
        {loading ? (
          <CoreSpinLoader label="Chargement des options…" size={15} />
        ) : selection && !disabled ? (
          <button
            type="button"
            aria-label="Effacer la sélection"
            onClick={() => {
              onChoose("");
              setSearch("");
              refField.current?.focus();
            }}
          >
            <X size={14} />
          </button>
        ) : null}
        <button
          type="button"
          tabIndex={-1}
          aria-hidden="true"
          disabled={disabled}
          onClick={() => {
            setOpen((current) => !current);
            refField.current?.focus();
          }}
        >
          <ChevronDown size={15} />
        </button>
      </div>
      {open && (
        <ul className="searchable-select-sre__list" role="listbox" id={listId}>
          {loadingError ? (
            <li className="searchable-select-sre__empty" role="alert">
              {loadingError}
            </li>
          ) : filteredOptions.length === 0 ? (
            <li className="searchable-select-sre__empty">Aucun résultat pour cette recherche.</li>
          ) : (
            filteredOptions.map((option, index) => (
              <li
                key={option.value}
                id={`${effectiveId}-option-${index}`}
                role="option"
                aria-selected={option.value === value}
                className={
                  index === activeIndex ? "searchable-select-sre__option--active" : undefined
                }
                onMouseEnter={() => setActiveIndex(index)}
                onMouseDown={(event) => {
                  event.preventDefault();
                  choose(option);
                }}
              >
                <span>
                  <strong>{option.label}</strong>
                  {option.description && <small>{option.description}</small>}
                </span>
                {option.value === value && <Check size={14} aria-hidden="true" />}
              </li>
            ))
          )}
        </ul>
      )}
    </div>
  );
}
