import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";

const classesAction =
  "inline-flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50";

/**
 * Icône d'action de tableau avec infobulle (title + aria-label) : consulter,
 * modifier, supprimer ou toute opération autorisée. Taille et style harmonisés
 * sur toutes les colonnes « Actions ».
 */
export function ActionIcon({
  titre,
  onClick,
  children,
  danger = false,
  disabled = false,
  href,
}: Readonly<{
  /** Libellé de l'infobulle et du lecteur d'écran (ex. « Voir le dossier »). */
  titre: string;
  onClick?: () => void;
  children: ReactNode;
  danger?: boolean;
  disabled?: boolean;
  /** Si fourni, rend un lien de navigation au lieu d'un bouton. */
  href?: string;
}>) {
  const className = cn(classesAction, danger && "hover:bg-destructive/10 hover:text-destructive");
  const contenu = (
    <>
      {children}
      <span className="sr-only">{titre}</span>
    </>
  );
  if (href) {
    return (
      <Link className={className} to={href} title={titre} aria-label={titre}>
        {contenu}
      </Link>
    );
  }
  return (
    <button
      type="button"
      className={className}
      onClick={onClick}
      title={titre}
      aria-label={titre}
      disabled={disabled}
    >
      {contenu}
    </button>
  );
}

/** Groupe d'actions aligné dans la colonne « Actions ». */
export function ActionGroup({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <div className="flex items-center justify-end gap-1" role="group" aria-label="Actions">
      {children}
    </div>
  );
}
