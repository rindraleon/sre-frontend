import { forwardRef, useId, useState, type InputHTMLAttributes, type ReactNode } from "react";
import { Eye, EyeOff } from "lucide-react";
import type { FieldError } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { CoreSpinLoader } from "@/components/ui/core-spin-loader";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface FormFieldProps {
  label: string;
  error?: FieldError;
  help?: string;
  required?: boolean;
  className?: string;
  children: (props: {
    id: string;
    "aria-invalid": boolean;
    "aria-describedby"?: string;
  }) => ReactNode;
}

/** Form field with label, help and error message. */
export function FormField({
  label,
  error,
  help,
  required = false,
  className = "",
  children,
}: Readonly<FormFieldProps>) {
  const generateId = useId();
  const id = `field-${generateId.replaceAll(":", "")}`;
  const helpId = help ? `${id}-aide` : undefined;
  const errorId = error ? `${id}-erreur` : undefined;
  const describedBy = [helpId, errorId].filter(Boolean).join(" ") || undefined;
  return (
    <div className={`field-form-sre ${className}`}>
      <Label htmlFor={id}>
        <span className="field-label-sre">
          {label}
          {required && (
            <span aria-hidden="true" className="field-mandatory-sre">
              *
            </span>
          )}
        </span>
      </Label>
      {children({ id, "aria-invalid": Boolean(error), "aria-describedby": describedBy })}
      {help && (
        <small id={helpId} className="field-help-sre">
          {help}
        </small>
      )}
      {error && (
        <p id={errorId} className="field-error-sre" role="alert">
          {error.message}
        </p>
      )}
    </div>
  );
}

type PasswordFieldProps = Omit<InputHTMLAttributes<HTMLInputElement>, "type"> & {
  label: string;
  error?: FieldError;
  help?: string;
  required?: boolean;
};

export const PasswordField = forwardRef<HTMLInputElement, Readonly<PasswordFieldProps>>(
  function PasswordField({ label, error, help, required, ...input }, ref) {
    const [visible, setVisible] = useState(false);
    return (
      <FormField label={label} error={error} help={help} required={required}>
        {(props) => (
          <span className="password-field-sre">
            <Input {...input} {...props} ref={ref} type={visible ? "text" : "password"} />
            <button
              type="button"
              aria-label={visible ? "Masquer le mot de passe" : "Afficher le mot de passe"}
              aria-pressed={visible}
              onClick={() => setVisible((current) => !current)}
            >
              {visible ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </span>
        )}
      </FormField>
    );
  },
);

export function SubmitButton({
  inProgress,
  pendingLabel,
  children,
  variant,
  className,
  form,
  disabled = false,
}: Readonly<{
  inProgress: boolean;
  pendingLabel: string;
  children: ReactNode;
  variant?: "primary" | "secondary" | "outline" | "danger" | "ghost";
  className?: string;
  form?: string;
  disabled?: boolean;
}>) {
  return (
    <Button
      type="submit"
      variant={variant}
      className={className}
      form={form}
      disabled={inProgress || disabled}
      aria-busy={inProgress}
    >
      {inProgress ? (
        <>
          <CoreSpinLoader label={pendingLabel} size={14} compact />
          {pendingLabel}
        </>
      ) : (
        children
      )}
    </Button>
  );
}

export function FormError({ message }: Readonly<{ message?: string | null }>) {
  if (!message) return null;
  return (
    <p className="error-message-sre" role="alert">
      {message}
    </p>
  );
}
