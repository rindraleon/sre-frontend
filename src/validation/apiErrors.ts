import type { FieldValues, Path, UseFormReturn } from "react-hook-form";
import { ApiError } from "@/services/api-client";

/** Projects the per-field errors returned by the API ({ errors: { "profil.telephone": [...] } }) onto form fields v. */
export function applyApiErrors<T extends FieldValues>(
  form: UseFormReturn<T, any, any>,
  cause: unknown,
): string[] {
  if (!(cause instanceof ApiError) || !cause.errors) return [];
  const knownFields = new Set(Object.keys(form.getValues()));
  const globalMessages: string[] = [];
  for (const [path, messages] of Object.entries(cause.errors)) {
    const field = path.split(".").pop() ?? path;
    for (const message of messages) {
      if (knownFields.has(field)) {
        form.setError(field as Path<T>, { type: "server", message });
      } else {
        globalMessages.push(message);
      }
    }
  }
  return globalMessages;
}

/** Global message to display when no per-field error could be applied. */
export function apiErrorMessage(cause: unknown, fallback: string): string {
  return cause instanceof Error ? cause.message : fallback;
}
