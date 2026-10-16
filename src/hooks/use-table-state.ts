import { useState } from "react";

/**
 * État partagé des tableaux (DataTable) : recherche, pagination et remise à zéro
 * automatique de la page quand la recherche ou un filtre externe change.
 */
export function useTableState(parPageInitial = 10) {
  const [recherche, definirRecherche] = useState("");
  const [page, definirPage] = useState(1);
  const [parPage, definirParPage] = useState(parPageInitial);

  return {
    recherche,
    page,
    parPage,
    rechercher: (valeur: string) => {
      definirRecherche(valeur);
      definirPage(1);
    },
    changerPage: definirPage,
    changerParPage: (nombre: number) => {
      definirParPage(nombre);
      definirPage(1);
    },
    reinitialiserPage: () => definirPage(1),
  };
}
