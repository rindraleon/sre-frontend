import { FIELD_INPUT_CLASS, FIELD_SELECT_CLASS, FIELD_TEXTAREA_CLASS } from "@/components";
import type { InputHTMLAttributes, SelectHTMLAttributes, TextareaHTMLAttributes } from "react";
import type { FieldError, UseFormRegisterReturn } from "react-hook-form";
import { FormField } from "./form-field";

interface BaseFieldProps {
  label: string;
  error?: FieldError;
  help?: string;
  required?: boolean;
  className?: string;
}

export type TextFieldProps = BaseFieldProps &
  Omit<InputHTMLAttributes<HTMLInputElement>, "id" | "name"> & {
    registration: UseFormRegisterReturn;
  };

export function TextField({
  label,
  error,
  help,
  required = false,
  className,
  registration,
  type = "text",
  ...inputProps
}: Readonly<TextFieldProps>) {
  return (
    <FormField label={label} error={error} help={help} required={required} className={className}>
      {(field) => (
        <input
          {...field}
          type={type}
          className={FIELD_INPUT_CLASS}
          {...registration}
          {...inputProps}
        />
      )}
    </FormField>
  );
}

export interface FormSelectOption {
  value: string | number;
  label: string;
  disabled?: boolean;
}

export type SelectFieldProps = BaseFieldProps &
  Omit<SelectHTMLAttributes<HTMLSelectElement>, "id" | "name" | "children"> & {
    registration: UseFormRegisterReturn;
    options: readonly FormSelectOption[];
    placeholder?: string;
  };

export function SelectField({
  label,
  error,
  help,
  required = false,
  className,
  registration,
  options,
  placeholder,
  ...selectProps
}: Readonly<SelectFieldProps>) {
  return (
    <FormField label={label} error={error} help={help} required={required} className={className}>
      {(field) => (
        <select {...field} className={FIELD_SELECT_CLASS} {...registration} {...selectProps}>
          {placeholder !== undefined && <option value="">{placeholder}</option>}
          {options.map((option) => (
            <option key={option.value} value={option.value} disabled={option.disabled}>
              {option.label}
            </option>
          ))}
        </select>
      )}
    </FormField>
  );
}

export type TextareaFieldProps = BaseFieldProps &
  Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, "id" | "name"> & {
    registration: UseFormRegisterReturn;
  };

export function TextareaField({
  label,
  error,
  help,
  required = false,
  className,
  registration,
  ...textareaProps
}: Readonly<TextareaFieldProps>) {
  return (
    <FormField label={label} error={error} help={help} required={required} className={className}>
      {(field) => (
        <textarea
          {...field}
          className={FIELD_TEXTAREA_CLASS}
          {...registration}
          {...textareaProps}
        />
      )}
    </FormField>
  );
}
