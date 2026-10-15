import { forwardRef, useId, useState, type InputHTMLAttributes, type ReactNode } from "react";
import { Eye, EyeOff, LoaderCircle } from "lucide-react";
import type { FieldError } from "react-hook-form";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";

/**
 * Composants de formulaire partagés (React Hook Form + Zod).
 * Chaque champ expose : label visible, aide optionnelle, erreur associée
 * via aria-describedby + aria-invalid, et focus visible (CSS global).
 */

interface ProprietesChamp {
  libelle: string;
  erreur?: FieldError;
  aide?: string;
  requis?: boolean;
  classeSupplementaire?: string;
  children: (proprietes: {
    id: string;
    "aria-invalid": boolean;
    "aria-describedby"?: string;
  }) => ReactNode;
}

/** Enveloppe label + contrôle + aide/erreur. Le contrôle reçoit id et attributs ARIA. */
export function FormField({
  libelle,
  erreur,
  aide,
  requis = false,
  classeSupplementaire = "",
  children,
}: Readonly<ProprietesChamp>) {
  const genereId = useId();
  const id = `champ-${genereId.replaceAll(":", "")}`;
  const idAide = aide ? `${id}-aide` : undefined;
  const idErreur = erreur ? `${id}-erreur` : undefined;
  const decritPar = [idAide, idErreur].filter(Boolean).join(" ") || undefined;
  return (
    <div className={`champ-formulaire-sre ${classeSupplementaire}`}>
      <Label htmlFor={id}>
        {libelle}
        {requis && (
          <span aria-hidden="true" className="text-destructive">
            {" "}
            *
          </span>
        )}
      </Label>
      {children({ id, "aria-invalid": Boolean(erreur), "aria-describedby": decritPar })}
      {aide && (
        <small id={idAide} className="champ-aide-sre">
          {aide}
        </small>
      )}
      {erreur && (
        <p id={idErreur} className="champ-erreur-sre" role="alert">
          {erreur.message}
        </p>
      )}
    </div>
  );
}

type ProprietesMotDePasse = Omit<InputHTMLAttributes<HTMLInputElement>, "type"> & {
  libelle: string;
  erreur?: FieldError;
  aide?: string;
  requis?: boolean;
};

/**
 * Champ mot de passe avec affichage/masquage, utilisable avec {...register(...)} de RHF.
 * `forwardRef` est indispensable : sans lui le `ref` renvoyé par register est avalé
 * par React (fonction composant) et le champ n'est jamais enregistré par RHF.
 */
export const PasswordField = forwardRef<HTMLInputElement, Readonly<ProprietesMotDePasse>>(
  function PasswordField({ libelle, erreur, aide, requis, ...input }, ref) {
    const [visible, definirVisible] = useState(false);
    return (
      <FormField libelle={libelle} erreur={erreur} aide={aide} requis={requis}>
        {(proprietes) => (
          <span className="champ-mot-de-passe-sre">
            <Input {...input} {...proprietes} ref={ref} type={visible ? "text" : "password"} />
            <button
              type="button"
              aria-label={visible ? "Masquer le mot de passe" : "Afficher le mot de passe"}
              aria-pressed={visible}
              onClick={() => definirVisible((courant) => !courant)}
            >
              {visible ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </span>
        )}
      </FormField>
    );
  },
);

/** Bouton de soumission : désactivé + spinner pendant l'envoi, empêche la double soumission. */
export function SubmitButton({
  enCours,
  libelleEnCours,
  children,
  variante,
  className,
  form,
  disabled = false,
}: Readonly<{
  enCours: boolean;
  libelleEnCours: string;
  children: ReactNode;
  variante?: "primaire" | "secondaire" | "contour" | "danger" | "fantome";
  className?: string;
  form?: string;
  disabled?: boolean;
}>) {
  return (
    <Button
      type="submit"
      variante={variante}
      className={className}
      form={form}
      disabled={enCours || disabled}
      aria-busy={enCours}
    >
      {enCours ? (
        <>
          <LoaderCircle size={15} className="icone-chargement-sre" aria-hidden="true" />
          {libelleEnCours}
        </>
      ) : (
        children
      )}
    </Button>
  );
}

/** Erreur globale d'un formulaire (échec API non rattaché à un champ). */
export function FormError({ message }: { message?: string | null }) {
  if (!message) return null;
  return (
    <p className="message-erreur-sre" role="alert">
      {message}
    </p>
  );
}
