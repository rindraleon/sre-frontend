export function ConfirmDialog({
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
    <Modal
      ouvert={ouvert}
      titre={titre}
      fermer={fermer}
      pied={
        <>
          <Button variante="contour" onClick={fermer} disabled={chargement}>
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
      <p className="confirmation-sre__texte">{description}</p>
    </Modal>
  );
}

import { Button } from "./Button";
import { Modal } from "./Modal";
