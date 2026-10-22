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
  error: string;
  setError: (message: string) => void;
  resetError: () => void;
  handleFailure: (cause: unknown) => void;
  resetForm: (values?: T) => void;
};

export function useApiForm<T extends FieldValues>({
  schema,
  initialValues,
  fallbackMessage,
}: {
  schema: ZodType<T>;
  initialValues: T;
  fallbackMessage: string;
}): UseApiFormResult<T> {
  const [error, setErrorMessage] = useState("");
  const form: UseFormReturn<T> = useForm<T>({
    resolver: zodResolver(schema as never) as Resolver<T>,
    mode: "onTouched",
    defaultValues: initialValues as DefaultValues<T>,
  });

  const setError = (message: string) => setErrorMessage(message);
  const resetError = () => setErrorMessage("");

  const handleFailure = (cause: unknown) => {
    const global = applyApiErrors(form, cause);
    setError(global.length ? global.join(" ") : apiErrorMessage(cause, fallbackMessage));
  };

  const resetForm = (values?: T) => {
    form.reset((values ?? initialValues) as DefaultValues<T>);
    setError("");
  };

  return {
    ...form,
    errors: form.formState.errors,
    isSubmitting: form.formState.isSubmitting,
    error,
    setError,
    resetError,
    handleFailure,
    resetForm,
  };
}
