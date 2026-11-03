import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { cn } from "@/utils";

const classesAction =
  "inline-flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50";

export function ActionIcon({
  title,
  onClick,
  children,
  danger = false,
  disabled = false,
  href,
}: Readonly<{
  title: string;
  onClick?: () => void;
  children: ReactNode;
  danger?: boolean;
  disabled?: boolean;
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

export function ActionGroup({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <fieldset className="flex items-center justify-end gap-1">
      <legend className="sr-only">Actions</legend>
      {children}
    </fieldset>
  );
}
