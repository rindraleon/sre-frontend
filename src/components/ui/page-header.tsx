import { type ReactNode } from "react";

/** Page header (breadcrumb + title + actions), Tailwind utilities. */
export function PageHeader({
  title,
  description,
  breadcrumb = [],
  actions,
}: Readonly<{
  title: string;
  description?: string;
  breadcrumb?: string[];
  actions?: ReactNode;
}>) {
  return (
    <header className="mb-5">
      <nav
        className="mb-1.5 flex flex-wrap items-center gap-1 text-[11px] font-semibold text-muted-foreground"
        aria-label="Fil d’Ariane"
      >
        {breadcrumb.map((element, index) => (
          <span key={`${element}-${index}`} className="inline-flex items-center gap-1">
            {index > 0 && <i aria-hidden="true">/</i>}
            {element}
          </span>
        ))}
      </nav>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <h1 className="text-xl font-extrabold tracking-tight text-foreground">{title}</h1>
          {description && (
            <p className="mt-1 max-w-2xl text-[12.5px] leading-relaxed text-muted-foreground">
              {description}
            </p>
          )}
        </div>
        {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
      </div>
    </header>
  );
}
