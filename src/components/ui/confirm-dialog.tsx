import { Button } from "./button";
import { Modal } from "./modal";

/** Confirmation pour mutations sensibles; les commandes restent bloquées pendant l'envoi. */
export function ConfirmDialog({
  ouvert,
  titre,
  description,
  fermer,
  confirmer,
  libelleConfirmer = "Confirmer",
  danger = false,
  chargement = false,
  erreur,
}: Readonly<{
  ouvert: boolean;
  titre: string;
  description: string;
  fermer: () => void;
  confirmer: () => void;
  libelleConfirmer?: string;
  danger?: boolean;
  chargement?: boolean;
  erreur?: string | null;
}>) {
  const fermerSiDisponible = () => {
    if (!chargement) fermer();
  };

  return (
    <Modal
      ouvert={ouvert}
      titre={titre}
      description={description}
      fermer={fermerSiDisponible}
      pied={
        <>
          <Button variante="contour" onClick={fermerSiDisponible} disabled={chargement}>
            Annuler
          </Button>
          <Button
            variante={danger ? "danger" : "primaire"}
            onClick={confirmer}
            chargement={chargement}
          >
            {chargement ? "Traitement…" : libelleConfirmer}
          </Button>
        </>
      }
    >
      {erreur && (
        <p className="message-erreur-sre" role="alert" aria-live="assertive">
          {erreur}
        </p>
      )}
    </Modal>
  );
}
