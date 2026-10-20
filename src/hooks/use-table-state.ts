import { useState } from "react";

export function useTableState(parPageInitial = 10) {
  const [recherche, setRecherche] = useState("");
  const [page, setPage] = useState(1);
  const [parPage, setParPage] = useState(parPageInitial);

  return {
    recherche,
    page,
    parPage,
    rechercher: (valeur: string) => {
      setRecherche(valeur);
      setPage(1);
    },
    changerPage: setPage,
    changerParPage: (nombre: number) => {
      setParPage(nombre);
      setPage(1);
    },
    reinitialiserPage: () => setPage(1),
  };
}
