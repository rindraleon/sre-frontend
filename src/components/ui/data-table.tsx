import type { ReactNode } from "react";
import type { ColumnDef } from "@tanstack/react-table";

/** Définition historique des colonnes SRE, convertie vers TanStack Table. */
export interface TableColumn<T> {
  id: string;
  titre: string;
  afficher: (ligne: T) => ReactNode;
  valeurTri?: (ligne: T) => string | number;
  classe?: string;
}

/** Convertit les colonnes de rendu SRE en ColumnDef TanStack sans changer les contrats métier. */
export function convertirColonnesTanstack<T>(colonnes: TableColumn<T>[]): ColumnDef<T, unknown>[] {
  return colonnes.map((colonne) => ({
    id: colonne.id,
    header: colonne.titre,
    accessorFn: (ligne) => colonne.valeurTri?.(ligne) ?? "",
    cell: ({ row }) => colonne.afficher(row.original),
    enableSorting: Boolean(colonne.valeurTri),
    enableGlobalFilter: false,
    meta: {
      label: colonne.titre,
      ...(colonne.classe?.includes("text-right") ? { align: "right" as const } : {}),
      ...(colonne.classe?.includes("text-center") ? { align: "center" as const } : {}),
    },
  }));
}
