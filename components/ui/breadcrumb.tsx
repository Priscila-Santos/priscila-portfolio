import Link from "next/link";
import { ChevronRight } from "lucide-react";

import { cn } from "@/lib/utils";

export type BreadcrumbItem = {
  label: string;
  /** Omit on the last item — it renders as the current page, not a link. */
  href?: string;
};

type BreadcrumbProps = {
  items: BreadcrumbItem[];
  className?: string;
};

/**
 * Contextual "where am I" trail, e.g. Home / Experiments / Playground.
 *
 * Exists so a visitor arriving directly at a nested page (a shared link,
 * a search result) always has a way back up the hierarchy without
 * depending on browser history. The last item is rendered as plain text
 * with aria-current="page" — it is not a link to itself.
 */
export function Breadcrumb({ items, className }: BreadcrumbProps) {
  return (
    <nav aria-label="Breadcrumb" className={cn("text-sm", className)}>
      <ol className="flex flex-wrap items-center gap-1.5 text-muted-foreground">
        {items.map((item, index) => {
          const isLast = index === items.length - 1;

          return (
            <li key={item.label} className="flex items-center gap-1.5">
              {index > 0 && (
                <ChevronRight aria-hidden="true" className="size-3.5 shrink-0" />
              )}
              {isLast || !item.href ? (
                <span aria-current={isLast ? "page" : undefined} className="font-medium text-foreground">
                  {item.label}
                </span>
              ) : (
                <Link
                  href={item.href}
                  className="rounded-sm underline-offset-4 hover:text-foreground hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  {item.label}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}