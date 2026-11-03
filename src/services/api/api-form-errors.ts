import type { FieldValues, Path, UseFormReturn } from "react-hook-form";
import { ApiError } from "./api-errors";

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

export function apiErrorMessage(cause: unknown, fallback: string): string {
  return cause instanceof Error ? cause.message : fallback;
}
