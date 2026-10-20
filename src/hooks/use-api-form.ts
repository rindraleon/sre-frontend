import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  useForm,
  type DefaultValues,
  type FieldErrors,
  type FieldValues,
  type Resolver,
  type UseFormReturn,
} from "react-hook-form";
import type { ZodType } from "zod";
import { applyApiErrors, apiErrorMessage } from "@/validation/apiErrors";

export type UseApiFormResult<T extends FieldValues> = UseFormReturn<T> & {
  errors: FieldErrors<T>;
  isSubmitting: boolean;
  erreur: string;
  definirErreur: (message: string) => void;
  reinitialiserErreur: () => void;
  traiterEchec: (cause: unknown) => void;
  reinitialiserFormulaire: (valeurs?: T) => void;
};

export function useApiForm<T extends FieldValues>({
  schema,
  valeursInitiales,
  messageRepli,
}: {
  schema: ZodType<T>;
  valeursInitiales: T;
  messageRepli: string;
}): UseApiFormResult<T> {
  const [erreur, setErreur] = useState("");
  const formulaire: UseFormReturn<T> = useForm<T>({
    resolver: zodResolver(schema as never) as Resolver<T>,
    mode: "onTouched",
    defaultValues: valeursInitiales as DefaultValues<T>,
  });

  const definirErreur = (message: string) => setErreur(message);
  const reinitialiserErreur = () => setErreur("");

  const traiterEchec = (cause: unknown) => {
    const globales = applyApiErrors(formulaire, cause);
    setErreur(globales.length ? globales.join(" ") : apiErrorMessage(cause, messageRepli));
  };

  const reinitialiserFormulaire = (valeurs?: T) => {
    formulaire.reset((valeurs ?? valeursInitiales) as DefaultValues<T>);
    setErreur("");
  };

  return {
    ...formulaire,
    errors: formulaire.formState.errors,
    isSubmitting: formulaire.formState.isSubmitting,
    erreur,
    definirErreur,
    reinitialiserErreur,
    traiterEchec,
    reinitialiserFormulaire,
  };
}
