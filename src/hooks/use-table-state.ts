import { useState } from "react";

export function useTableState(initialPerPage = 10) {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(initialPerPage);

  return {
    search,
    page,
    perPage,
    changeSearch: (value: string) => {
      setSearch(value);
      setPage(1);
    },
    changePage: setPage,
    changePerPage: (count: number) => {
      setPerPage(count);
      setPage(1);
    },
    resetPage: () => setPage(1),
  };
}
