import { useMemo, useState, type ReactNode } from "react";
import { ArrowDown, ArrowUp, ChevronLeft, ChevronRight, Search } from "lucide-react";
import { Card } from "./Card";
import { Input } from "./Input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./Table";

export interface TableColumn<T> {
  id: string;
  titre: string;
  afficher: (ligne: T) => ReactNode;
  valeurTri?: (ligne: T) => string | number;
  classe?: string;
}

export function DataTable<T>({
  lignes,
  colonnes,
  obtenirId,
  recherche,
  rechercher,
  espaceVide,
  messageVide,
  placeholder,
  actionsEntete,
  page,
  parPage,
  changerPage,
  changerParPage,
}: Readonly<{
  lignes: T[];
  colonnes: TableColumn<T>[];
  obtenirId: (ligne: T) => string;
  recherche?: string;
  rechercher?: (valeur: string) => void;
  espaceVide: string;
  messageVide: string;
  placeholder?: string;
  actionsEntete?: ReactNode;
  page: number;
  parPage: number;
  changerPage: (page: number) => void;
  changerParPage: (nombre: number) => void;
}>) {
  const [tri, definirTri] = useState("");
  const [ordre, definirOrdre] = useState<"asc" | "desc">("asc");
  const lignesTriees = useMemo(() => {
    if (!tri) return lignes;
    const colonne = colonnes.find((entree) => entree.id === tri);
    if (!colonne?.valeurTri) return lignes;
    return [...lignes].sort((a, b) => {
      const valeurA = colonne.valeurTri!(a);
      const valeurB = colonne.valeurTri!(b);
      const resultat =
        typeof valeurA === "number" && typeof valeurB === "number"
          ? valeurA - valeurB
          : String(valeurA).localeCompare(String(valeurB), "fr", { numeric: true });
      return ordre === "asc" ? resultat : -resultat;
    });
  }, [lignes, colonnes, tri, ordre]);
  const pages = Math.max(1, Math.ceil(lignesTriees.length / parPage));
  const pageSure = Math.min(page, pages);
  const lignesPage = lignesTriees.slice((pageSure - 1) * parPage, pageSure * parPage);
  const plages = lignesTriees.length
    ? `${(pageSure - 1) * parPage + 1}–${Math.min(pageSure * parPage, lignesTriees.length)} sur ${lignesTriees.length}`
    : "0 résultat";

  return (
    <Card className="overflow-hidden">
      <div className="flex flex-wrap items-center gap-2.5 border-b border-border px-4 py-3">
        {rechercher && (
          <label className="relative block min-w-52 flex-1 sm:max-w-xs">
            <Search
              size={16}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
            />
            <Input
              className="pl-9"
              aria-label="Rechercher dans le tableau"
              value={recherche ?? ""}
              onChange={(event) => {
                rechercher(event.target.value);
                changerPage(1);
              }}
              placeholder={placeholder ?? "Rechercher…"}
            />
          </label>
        )}
        <span className="text-xs font-semibold text-muted-foreground">{plages}</span>
        {actionsEntete}
      </div>
      {lignesPage.length ? (
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                {colonnes.map((colonne) => (
                  <TableHead className={colonne.classe} key={colonne.id}>
                    <button
                      className="inline-flex items-center gap-1 font-bold uppercase tracking-wide disabled:cursor-default"
                      type="button"
                      disabled={!colonne.valeurTri}
                      onClick={() => {
                        if (tri === colonne.id) definirOrdre(ordre === "asc" ? "desc" : "asc");
                        else {
                          definirTri(colonne.id);
                          definirOrdre("asc");
                        }
                      }}
                    >
                      {colonne.titre}
                      {tri === colonne.id &&
                        (ordre === "asc" ? <ArrowUp size={12} /> : <ArrowDown size={12} />)}
                    </button>
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {lignesPage.map((ligne) => (
                <TableRow key={obtenirId(ligne)}>
                  {colonnes.map((colonne) => (
                    <TableCell key={colonne.id} className={colonne.classe}>
                      {colonne.afficher(ligne)}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      ) : (
        <EmptyState titre={espaceVide} description={messageVide} />
      )}
      <div className="flex flex-wrap items-center justify-between gap-2.5 border-t border-border px-4 py-3 text-xs text-muted-foreground">
        <span>{plages}</span>
        <label>
          Lignes par page{" "}
          <select
            value={parPage}
            onChange={(event) => {
              changerParPage(Number(event.target.value));
              changerPage(1);
            }}
          >
            <option value={10}>10</option>
            <option value={20}>20</option>
            <option value={50}>50</option>
          </select>
        </label>
        <div>
          <button
            type="button"
            aria-label="Page précédente"
            onClick={() => changerPage(Math.max(1, pageSure - 1))}
            disabled={pageSure <= 1}
          >
            <ChevronLeft size={15} />
          </button>
          <span>
            Page {pageSure} / {pages}
          </span>
          <button
            type="button"
            aria-label="Page suivante"
            onClick={() => changerPage(Math.min(pages, pageSure + 1))}
            disabled={pageSure >= pages}
          >
            <ChevronRight size={15} />
          </button>
        </div>
      </div>
    </Card>
  );
}

import { EmptyState } from "./EmptyState";
