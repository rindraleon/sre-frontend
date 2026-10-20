import { useState, type FormEvent } from "react";
import { BadgeCheck, MailCheck, Send } from "lucide-react";
import { useSre } from "@/context/SreContext";
import { callApi } from "@/services/api-client";
import { Button, StatusBadge } from "@/components/ui";

/**
 * Vérification de l'adresse e-mail par code à usage unique :
 * demande d'envoi (réponse générique côté serveur) puis validation du code.
 * L'état est piloté localement ; le serveur reste la source de vérité.
 */
export function EmailVerificationCard({
  courriel,
  courrielVerifie,
}: Readonly<{ courriel: string; courrielVerifie: boolean }>) {
  const { notifier } = useSre();
  const [verifie, definirVerifie] = useState(courrielVerifie);
  const [code, definirCode] = useState("");
  const [envoiEnCours, definirEnvoiEnCours] = useState(false);
  const [validationEnCours, definirValidationEnCours] = useState(false);

  const demanderCode = async () => {
    definirEnvoiEnCours(true);
    try {
      const reponse = await callApi<{ message: string }>("auth/verification-courriel", {
        method: "POST",
        body: { courriel },
      });
      notifier(reponse.message ?? "Demande de vérification envoyée.", "info");
    } catch (cause) {
      notifier(
        cause instanceof Error ? cause.message : "Impossible d’envoyer le code de vérification.",
        "erreur",
      );
    } finally {
      definirEnvoiEnCours(false);
    }
  };

  const validerCode = async (evenement: FormEvent) => {
    evenement.preventDefault();
    if (!/^[0-9]{6}$/.test(code.trim())) {
      notifier("Saisissez le code à 6 chiffres reçu par courriel.", "avertissement");
      return;
    }
    definirValidationEnCours(true);
    try {
      await callApi<{ message: string }>("auth/verification-courriel/confirmer", {
        method: "POST",
        body: { courriel, code: code.trim() },
      });
      definirVerifie(true);
      definirCode("");
      notifier("Adresse e-mail vérifiée.", "succes");
    } catch (cause) {
      notifier(
        cause instanceof Error ? cause.message : "Code de vérification invalide.",
        "erreur",
      );
    } finally {
      definirValidationEnCours(false);
    }
  };

  return (
    <section className="carte-sre parametre-ligne-sre">
      <span>{verifie ? <MailCheck size={18} /> : <BadgeCheck size={18} />}</span>
      <div className="flex-1">
        <h2>Vérification de l’adresse e-mail</h2>
        <p>
          {verifie
            ? "Votre adresse e-mail est vérifiée."
            : "Confirmez votre adresse par un code à usage unique reçu par courriel."}
        </p>
        {!verifie && (
          <form className="mt-2 flex flex-wrap items-end gap-2" onSubmit={validerCode}>
            <Button
              type="button"
              variante="contour"
              taille="petit"
              onClick={() => void demanderCode()}
              chargement={envoiEnCours}
              disabled={envoiEnCours || validationEnCours}
            >
              <Send size={13} /> {envoiEnCours ? "Envoi…" : "Envoyer un code"}
            </Button>
            <label className="flex flex-col gap-1 text-[11px] font-semibold text-muted-foreground">
              Code reçu
              <input
                className="champ-simple-sre w-36"
                inputMode="numeric"
                autoComplete="one-time-code"
                maxLength={6}
                placeholder="123456"
                value={code}
                onChange={(evenement) => definirCode(evenement.target.value)}
                aria-label="Code de vérification à 6 chiffres"
              />
            </label>
            <Button
              type="submit"
              taille="petit"
              chargement={validationEnCours}
              disabled={validationEnCours || envoiEnCours}
            >
              {validationEnCours ? "Vérification…" : "Valider"}
            </Button>
          </form>
        )}
      </div>
      <StatusBadge statut={verifie ? "VERIFIE" : "NON_VERIFIE"} />
    </section>
  );
}
