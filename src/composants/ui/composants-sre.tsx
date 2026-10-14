import { useMemo, useState, type ReactNode } from "react";
import {
  ArrowDown,
  ArrowUp,
  ChevronLeft,
  ChevronRight,
  Search,
  type LucideIcon,
} from "lucide-react";
import { utiliserSre } from "@/contexte/contexte-sre";
import { formaterStatut } from "@/utilitaires/formatage";

export function EntetePageSre({
  titre,
  description,
  filAriane = [],
  actions,
}: Readonly<{
  titre: string;
  description?: string;
  filAriane?: string[];
  actions?: ReactNode;
}>) {
  return (
    <header className="entete-sre-page">
      <nav className="fil-ariane-sre" aria-label="Fil d’Ariane">
        {filAriane.map((element, index) => (
          <span key={`${element}-${index}`}>
            {index > 0 && <i>/</i>}
            {element}
          </span>
        ))}
      </nav>
      <div className="entete-sre-page__ligne">
        <div>
          <h1>{titre}</h1>
          {description && <p>{description}</p>}
        </div>
        {actions && <div className="entete-sre-page__actions">{actions}</div>}
      </div>
    </header>
  );
}

export function BoutonSre({
  children,
  onClick,
  type = "button",
  variante = "primaire",
  taille = "normal",
  disabled = false,
  className = "",
  form,
}: Readonly<{
  children: ReactNode;
  onClick?: () => void;
  type?: "button" | "submit";
  variante?: "primaire" | "secondaire" | "contour" | "danger" | "fantome";
  taille?: "normal" | "petit";
  disabled?: boolean;
  className?: string;
  form?: string;
}>) {
  return (
    <button
      type={type}
      form={form}
      className={`bouton-sre bouton-sre--${variante} ${taille === "petit" ? "bouton-sre--petit" : ""} ${className}`}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  );
}

const classeParStatut: Record<string, string> = {
  A_PAYER: "neutre",
  PAIEMENT_EN_COURS: "attention",
  EN_VERIFICATION: "attention",
  PAYE: "succes",
  CONFIRME: "succes",
  ACTIF: "succes",
  ACTIF_ADMIN: "succes",
  REJETE: "erreur",
  CORRECTION_DEMANDEE: "avertissement",
  EN_RETARD: "erreur",
  INACTIF: "neutre",
  EN_ATTENTE: "attention",
  SUSPENDU: "erreur",
  TERMINE: "succes",
  PARTIEL: "avertissement",
  ERREUR: "erreur",
  ENTREPRISE: "bleu",
  PARTICULIER: "violet",
  ADMIN: "violet",
  CLIENT: "bleu",
};

const libellesSre: Record<string, string> = {
  A_PAYER: "À payer",
  PAIEMENT_EN_COURS: "Paiement en cours",
  EN_VERIFICATION: "En vérification",
  PAYE: "Décision validée en interne",
  CONFIRME: "Confirmé en interne",
  REJETE: "Rejeté",
  CORRECTION_DEMANDEE: "Correction demandée",
  EN_RETARD: "En retard",
  ACTIF: "Actif",
  INACTIF: "Inactif",
  EN_ATTENTE: "En attente",
  SUSPENDU: "Suspendu",
  TERMINE: "Terminé",
  PARTIEL: "Partiel",
  ERREUR: "Erreur",
  ENTREPRISE: "Entreprise",
  PARTICULIER: "Particulier",
  ADMIN: "Administrateur",
  CLIENT: "Contribuable",
  MOBILE_MONEY: "Mobile Money",
  VIREMENT_BANCAIRE: "Virement bancaire",
};

export function BadgeSre({ statut }: { statut: string }) {
  return (
    <span className={`badge-sre badge-sre--${classeParStatut[statut] ?? "neutre"}`}>
      <i />
      {libellesSre[statut] ?? formaterStatut(statut)}
    </span>
  );
}

export function CarteStatistiqueSre({
  titre,
  valeur,
  note,
  icone: Icone,
  couleur = "bleu",
}: Readonly<{
  titre: string;
  valeur: string | number;
  note?: string;
  icone: LucideIcon;
  couleur?: "bleu" | "vert" | "orange" | "violet" | "rouge";
}>) {
  return (
    <article className="carte-stat-sre">
      <span className={`carte-stat-sre__icone carte-stat-sre__icone--${couleur}`}>
        <Icone size={18} />
      </span>
      <div>
        <span>{titre}</span>
        <strong>{valeur}</strong>
        {note && <small>{note}</small>}
      </div>
    </article>
  );
}

export function EtatVideSre({
  titre,
  description,
  action,
}: Readonly<{
  titre: string;
  description: string;
  action?: ReactNode;
}>) {
  return (
    <div className="etat-vide-sre">
      <div className="etat-vide-sre__icone">⌕</div>
      <strong>{titre}</strong>
      <p>{description}</p>
      {action}
    </div>
  );
}

export interface ColonneTableauSre<T> {
  id: string;
  titre: string;
  afficher: (ligne: T) => ReactNode;
  valeurTri?: (ligne: T) => string | number;
  classe?: string;
}

export function TableauSre<T>({
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
  colonnes: ColonneTableauSre<T>[];
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
    <section className="carte-tableau-sre">
      <div className="outils-tableau-sre">
        {rechercher && (
          <label className="recherche-sre">
            <Search size={16} />
            <input
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
        <span className="compteur-tableau-sre">{plages}</span>
        {actionsEntete}
      </div>
      {lignesPage.length ? (
        <div className="tableau-defilement-sre">
          <table className="tableau-sre">
            <thead>
              <tr>
                {colonnes.map((colonne) => (
                  <th className={colonne.classe} key={colonne.id}>
                    <button
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
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {lignesPage.map((ligne) => (
                <tr key={obtenirId(ligne)}>
                  {colonnes.map((colonne) => (
                    <td key={colonne.id} className={colonne.classe}>
                      {colonne.afficher(ligne)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <EtatVideSre titre={espaceVide} description={messageVide} />
      )}
      <div className="pagination-sre">
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
    </section>
  );
}

export function ModalSre({
  ouvert,
  titre,
  description,
  fermer,
  children,
  pied,
  largeur = "standard",
}: Readonly<{
  ouvert: boolean;
  titre: string;
  description?: string;
  fermer: () => void;
  children: ReactNode;
  pied?: ReactNode;
  largeur?: "standard" | "large";
}>) {
  if (!ouvert) return null;
  return (
    <div
      className="voile-modal-sre"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) fermer();
      }}
    >
      <section
        className={`modal-sre ${largeur === "large" ? "modal-sre--large" : ""}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="titre-modal-sre"
      >
        <header>
          <div>
            <h2 id="titre-modal-sre">{titre}</h2>
            {description && <p>{description}</p>}
          </div>
          <button type="button" aria-label="Fermer la fenêtre" onClick={fermer}>
            ×
          </button>
        </header>
        <div className="modal-sre__contenu">{children}</div>
        {pied && <footer>{pied}</footer>}
      </section>
    </div>
  );
}

export function ConfirmationSre({
  ouvert,
  titre,
  description,
  fermer,
  confirmer,
  libelleConfirmer = "Confirmer",
  danger = false,
  chargement = false,
}: Readonly<{
  ouvert: boolean;
  titre: string;
  description: string;
  fermer: () => void;
  confirmer: () => void;
  libelleConfirmer?: string;
  danger?: boolean;
  chargement?: boolean;
}>) {
  return (
    <ModalSre
      ouvert={ouvert}
      titre={titre}
      fermer={fermer}
      pied={
        <>
          <BoutonSre variante="contour" onClick={fermer} disabled={chargement}>
            Annuler
          </BoutonSre>
          <BoutonSre
            variante={danger ? "danger" : "primaire"}
            onClick={confirmer}
            disabled={chargement}
          >
            {chargement ? "Traitement…" : libelleConfirmer}
          </BoutonSre>
        </>
      }
    >
      <p className="confirmation-sre__texte">{description}</p>
    </ModalSre>
  );
}

export function ZoneToastsSre() {
  const { toasts } = utiliserSre();
  return (
    <div className="zone-toasts-sre" aria-live="polite">
      {toasts.map((toast) => (
        <div className={`toast-sre toast-sre--${toast.type}`} key={toast.id}>
          <span>{toast.type === "succes" ? "✓" : toast.type === "erreur" ? "!" : "i"}</span>
          {toast.message}
        </div>
      ))}
    </div>
  );
}
