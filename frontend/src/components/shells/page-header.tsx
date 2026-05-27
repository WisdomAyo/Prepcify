import type { ReactNode } from "react";
import Link from "next/link";
import { ChevronRight } from "lucide-react";

type Crumb = { label: string; href?: string };

/** Standard page header — breadcrumbs, eyebrow, title, description, actions. */
export function PageHeader({
  eyebrow,
  title,
  description,
  crumbs,
  actions,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  crumbs?: Crumb[];
  actions?: ReactNode;
}) {
  return (
    <header className="mb-8 flex flex-wrap items-end justify-between gap-4">
      <div className="min-w-0">
        {crumbs && crumbs.length > 0 && (
          <nav
            aria-label="Breadcrumb"
            className="mb-3 flex items-center gap-1.5 text-xs text-muted-foreground"
          >
            {crumbs.map((c, i) => (
              <span key={i} className="flex items-center gap-1.5">
                {c.href ? (
                  <Link
                    href={c.href}
                    className="transition-colors hover:text-foreground"
                  >
                    {c.label}
                  </Link>
                ) : (
                  <span>{c.label}</span>
                )}
                {i < crumbs.length - 1 && <ChevronRight className="h-3 w-3" />}
              </span>
            ))}
          </nav>
        )}
        {eyebrow && (
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-accent">
            {eyebrow}
          </p>
        )}
        <h1 className="mt-1 font-display text-3xl font-bold leading-tight tracking-tight lg:text-4xl">
          {title}
        </h1>
        {description && (
          <p className="mt-2 max-w-2xl text-muted-foreground">{description}</p>
        )}
      </div>
      {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
    </header>
  );
}
