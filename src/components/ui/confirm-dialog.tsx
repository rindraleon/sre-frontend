import { ERROR_MESSAGE_CLASS } from "@/components";
import { Button } from "./button";
import { Modal } from "./modal";

export function ConfirmDialog({
  open,
  title,
  description,
  close,
  confirm,
  confirmLabel = "Confirmer",
  danger = false,
  loading = false,
  error,
}: Readonly<{
  open: boolean;
  title: string;
  description: string;
  close: () => void;
  confirm: () => void;
  confirmLabel?: string;
  danger?: boolean;
  loading?: boolean;
  error?: string | null;
}>) {
  const closeIfAvailable = () => {
    if (!loading) close();
  };

  return (
    <Modal
      open={open}
      title={title}
      description={description}
      close={closeIfAvailable}
      footer={
        <>
          <Button variant="outline" onClick={closeIfAvailable} disabled={loading}>
            Annuler
          </Button>
          <Button variant={danger ? "danger" : "primary"} onClick={confirm} loading={loading}>
            {loading ? "Traitement…" : confirmLabel}
          </Button>
        </>
      }
    >
      {error && (
        <p className={ERROR_MESSAGE_CLASS} role="alert" aria-live="assertive">
          {error}
        </p>
      )}
    </Modal>
  );
}
