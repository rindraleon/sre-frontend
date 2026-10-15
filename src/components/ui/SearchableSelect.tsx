import { useEffect, useId, useMemo, useRef, useState } from "react";
import { Check, ChevronDown, Search, X } from "lucide-react";
import { CoreSpinLoader } from "./CoreSpinLoader";

export interface SelectOption {
  valeur: string;
  libelle: string;
  description?: string;
}

function normaliser(texte: string) {
  return texte.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
}

/** Filtrage local insensible aux accents et à la casse. */
export function filterSelectOptions(options: SelectOption[], recherche: string): SelectOption[] {
  const requete = normaliser(recherche.trim());
  if (!requete) return options;
  return options.filter((option) =>
    normaliser(`${option.libelle} ${option.description ?? ""}`).includes(requete),
  );
}

interface ProprietesSelectRecherchable {
  id?: string;
  valeur: string;
  options: SelectOption[];
  onChoisir: (valeur: string) => void;
  placeholder?: string;
  disabled?: boolean;
  chargement?: boolean;
  erreurChargement?: string;
  "aria-invalid"?: boolean;
  "aria-describedby"?: string;
}

/**
 * Select avec recherche locale, pour les listes longues (ex. contribuables).
 * Navigation clavier : flèches, Entrée, Échap ; fermeture au clic extérieur ;
 * effacement de la sélection ; états chargement / vide / erreur explicites.
 * La recherche distante n'est pas proposée par l'API actuelle : le filtrage
 * est donc local, sur des options déjà chargées par l'écran appelant.
 */
export function SearchableSelect({
  id,
  valeur,
  options,
  onChoisir,
  placeholder = "Rechercher…",
  disabled = false,
  chargement = false,
  erreurChargement,
  "aria-invalid": ariaInvalid,
  "aria-describedby": ariaDescribedby,
}: Readonly<ProprietesSelectRecherchable>) {
  const genereId = useId().replaceAll(":", "");
  const idEffectif = id ?? `select-${genereId}`;
  const idListe = `${idEffectif}-liste`;
  const [ouvert, definirOuvert] = useState(false);
  const [recherche, definirRecherche] = useState("");
  const [indexActif, definirIndexActif] = useState(-1);
  const refRacine = useRef<HTMLDivElement | null>(null);
  const refChamp = useRef<HTMLInputElement | null>(null);

  const selection = options.find((option) => option.valeur === valeur);
  const optionsFiltrees = useMemo(
    () => filterSelectOptions(options, recherche),
    [options, recherche],
  );

  useEffect(() => {
    if (!ouvert) return;
    const gererExterieur = (event: MouseEvent) => {
      if (refRacine.current && !refRacine.current.contains(event.target as Node))
        definirOuvert(false);
    };
    document.addEventListener("mousedown", gererExterieur);
    return () => document.removeEventListener("mousedown", gererExterieur);
  }, [ouvert]);

  const choisir = (option: SelectOption) => {
    onChoisir(option.valeur);
    definirOuvert(false);
    definirRecherche("");
    definirIndexActif(-1);
    refChamp.current?.focus();
  };

  const gererClavier = (event: React.KeyboardEvent) => {
    if (event.key === "Escape") {
      definirOuvert(false);
      return;
    }
    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      if (!ouvert) {
        definirOuvert(true);
        return;
      }
      const delta = event.key === "ArrowDown" ? 1 : -1;
      definirIndexActif((courant) => {
        const suivant = courant + delta;
        if (suivant < 0) return optionsFiltrees.length - 1;
        if (suivant >= optionsFiltrees.length) return 0;
        return suivant;
      });
      return;
    }
    if (event.key === "Enter" && ouvert && indexActif >= 0 && optionsFiltrees[indexActif]) {
      event.preventDefault();
      choisir(optionsFiltrees[indexActif]);
    }
  };

  return (
    <div className="select-recherchable-sre" ref={refRacine}>
      <div className="select-recherchable-sre__champ">
        <Search size={15} aria-hidden="true" />
        <input
          ref={refChamp}
          id={idEffectif}
          type="text"
          role="combobox"
          aria-expanded={ouvert}
          aria-controls={idListe}
          aria-activedescendant={
            ouvert && indexActif >= 0 ? `${idEffectif}-option-${indexActif}` : undefined
          }
          aria-invalid={ariaInvalid}
          aria-describedby={ariaDescribedby}
          disabled={disabled || chargement}
          placeholder={selection ? selection.libelle : placeholder}
          value={ouvert ? recherche : (selection?.libelle ?? "")}
          onFocus={() => {
            definirOuvert(true);
            definirRecherche("");
          }}
          onChange={(event) => {
            definirRecherche(event.target.value);
            definirOuvert(true);
            definirIndexActif(-1);
          }}
          onKeyDown={gererClavier}
        />
        {chargement ? (
          <CoreSpinLoader libelle="Chargement des options…" taille={15} />
        ) : selection && !disabled ? (
          <button
            type="button"
            aria-label="Effacer la sélection"
            onClick={() => {
              onChoisir("");
              definirRecherche("");
              refChamp.current?.focus();
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
            definirOuvert((courant) => !courant);
            refChamp.current?.focus();
          }}
        >
          <ChevronDown size={15} />
        </button>
      </div>
      {ouvert && (
        <ul className="select-recherchable-sre__liste" role="listbox" id={idListe}>
          {erreurChargement ? (
            <li className="select-recherchable-sre__vide" role="alert">
              {erreurChargement}
            </li>
          ) : optionsFiltrees.length === 0 ? (
            <li className="select-recherchable-sre__vide">Aucun résultat pour cette recherche.</li>
          ) : (
            optionsFiltrees.map((option, index) => (
              <li
                key={option.valeur}
                id={`${idEffectif}-option-${index}`}
                role="option"
                aria-selected={option.valeur === valeur}
                className={
                  index === indexActif ? "select-recherchable-sre__option--active" : undefined
                }
                onMouseEnter={() => definirIndexActif(index)}
                onMouseDown={(event) => {
                  event.preventDefault();
                  choisir(option);
                }}
              >
                <span>
                  <strong>{option.libelle}</strong>
                  {option.description && <small>{option.description}</small>}
                </span>
                {option.valeur === valeur && <Check size={14} aria-hidden="true" />}
              </li>
            ))
          )}
        </ul>
      )}
    </div>
  );
}
