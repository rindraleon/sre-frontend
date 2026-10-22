import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";

const classesAction =
  "inline-flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50";

/**
 * Table action icon with tooltip (title + aria-label): view,
 * edit, delete or any allowed operation. Size and style harmonized
 * across all "Actions" columns.
 */
export function ActionIcon({
  title,
  onClick,
  children,
  danger = false,
  disabled = false,
  href,
}: Readonly<{
  /** Tooltip and screen-reader label (e.g. "View the record"). */
  title: string;
  onClick?: () => void;
  children: ReactNode;
  danger?: boolean;
  disabled?: boolean;
  /** When provided, renders a navigation link instead of a button. */
  href?: string;
}>) {
  const className = cn(classesAction, danger && "hover:bg-destructive/10 hover:text-destructive");
  const content = (
    <>
      {children}
      <span className="sr-only">{title}</span>
    </>
  );
  if (href) {
    return (
      <Link className={className} to={href} title={title} aria-label={title}>
        {content}
      </Link>
    );
  }
  return (
    <button
      type="button"
      className={className}
      onClick={onClick}
      title={title}
      aria-label={title}
      disabled={disabled}
    >
      {content}
    </button>
  );
}

/** Group of actions aligned in the "Actions" column. */
export function ActionGroup({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <fieldset className="flex items-center justify-end gap-1">
      <legend className="sr-only">Actions</legend>
      {children}
    </fieldset>
  );
}
