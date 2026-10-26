import { useState, type FormEvent } from "react";
import { BadgeCheck, MailCheck, Send } from "lucide-react";
import { useSre } from "@/context/SreContext";
import { callApi } from "@/services/api-client";
import { Button, StatusBadge } from "@/components/ui";

/** E-mail address verification by single-use code: send request (generic server-side response) then code validation. */
export function EmailVerificationCard({
  email,
  isEmailVerified,
}: Readonly<{ email: string; isEmailVerified: boolean }>) {
  const { notify } = useSre();
  const [verified, setVerified] = useState(isEmailVerified);
  const [code, setCode] = useState("");
  const [dispatchInProgress, setDispatchInProgress] = useState(false);
  const [validationInProgress, setValidationInProgress] = useState(false);

  const requestCode = async () => {
    setDispatchInProgress(true);
    try {
      const response = await callApi<{ message: string }>("auth/verification-courriel", {
        method: "POST",
        body: { courriel: email },
      });
      notify(response.message ?? "Demande de vérification envoyée.", "info");
    } catch (cause) {
      notify(
        cause instanceof Error ? cause.message : "Impossible d’envoyer le code de vérification.",
        "error",
      );
    } finally {
      setDispatchInProgress(false);
    }
  };

  const validateCode = async (event: FormEvent) => {
    event.preventDefault();
    if (!/^[0-9]{6}$/.test(code.trim())) {
      notify("Saisissez le code à 6 chiffres reçu par courriel.", "warning");
      return;
    }
    setValidationInProgress(true);
    try {
      await callApi<{ message: string }>("auth/verification-courriel/confirmer", {
        method: "POST",
        body: { courriel: email, code: code.trim() },
      });
      setVerified(true);
      setCode("");
      notify("Adresse e-mail vérifiée.", "success");
    } catch (cause) {
      notify(
        cause instanceof Error ? cause.message : "Code de vérification invalide.",
        "error",
      );
    } finally {
      setValidationInProgress(false);
    }
  };

  return (
    <section className="card-sre setting-row-sre">
      <span>{verified ? <MailCheck size={18} /> : <BadgeCheck size={18} />}</span>
      <div className="flex-1">
        <h2>Vérification de l’adresse e-mail</h2>
        <p>
          {verified
            ? "Votre adresse e-mail est vérifiée."
            : "Confirmez votre adresse par un code à usage unique reçu par courriel."}
        </p>
        {!verified && (
          <form className="mt-2 flex flex-wrap items-end gap-2" onSubmit={validateCode}>
            <Button
              type="button"
              variant="outline"
              size="small"
              onClick={() => void requestCode()}
              loading={dispatchInProgress}
              disabled={dispatchInProgress || validationInProgress}
            >
              <Send size={13} /> {dispatchInProgress ? "Envoi…" : "Envoyer un code"}
            </Button>
            <label className="flex flex-col gap-1 text-[11px] font-semibold text-muted-foreground">
              Code reçu
              <input
                className="field-simple-sre w-36"
                inputMode="numeric"
                autoComplete="one-time-code"
                maxLength={6}
                placeholder="123456"
                value={code}
                onChange={(event) => setCode(event.target.value)}
                aria-label="Code de vérification à 6 chiffres"
              />
            </label>
            <Button
              type="submit"
              size="small"
              loading={validationInProgress}
              disabled={validationInProgress || dispatchInProgress}
            >
              {validationInProgress ? "Vérification…" : "Valider"}
            </Button>
          </form>
        )}
      </div>
      <StatusBadge status={verified ? "VERIFIE" : "NON_VERIFIE"} />
    </section>
  );
}
