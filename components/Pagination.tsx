import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

type PaginationProps = {
  currentPage: number;
  totalPages: number;
  basePath?: string;
};

function pageHref(basePath: string, page: number) {
  if (page <= 1) return basePath;
  const sep = basePath.includes("?") ? "&" : "?";
  return `${basePath}${sep}page=${page}`;
}

export function Pagination({
  currentPage,
  totalPages,
  basePath = "/",
}: PaginationProps) {
  if (totalPages <= 1) return null;

  const pages = Array.from({ length: totalPages }, (_, i) => i + 1).filter(
    (p) =>
      p === 1 ||
      p === totalPages ||
      (p >= currentPage - 1 && p <= currentPage + 1)
  );

  return (
    <nav
      className="mt-8 flex items-center justify-center gap-1"
      aria-label="페이지네이션"
    >
      <Link
        href={pageHref(basePath, Math.max(1, currentPage - 1))}
        aria-disabled={currentPage <= 1}
        className={cn(
          "inline-flex h-9 w-9 items-center justify-center rounded-lg border border-border transition-colors hover:bg-accent",
          currentPage <= 1 && "pointer-events-none opacity-40"
        )}
      >
        <ChevronLeft className="h-4 w-4" />
      </Link>

      {pages.map((page, index) => {
        const prev = pages[index - 1];
        const showEllipsis = prev !== undefined && page - prev > 1;

        return (
          <span key={page} className="flex items-center gap-1">
            {showEllipsis && (
              <span className="px-2 text-muted-foreground">…</span>
            )}
            <Link
              href={pageHref(basePath, page)}
              className={cn(
                "inline-flex h-9 min-w-9 items-center justify-center rounded-lg border px-3 text-sm transition-colors",
                page === currentPage
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border hover:bg-accent"
              )}
            >
              {page}
            </Link>
          </span>
        );
      })}

      <Link
        href={pageHref(basePath, Math.min(totalPages, currentPage + 1))}
        aria-disabled={currentPage >= totalPages}
        className={cn(
          "inline-flex h-9 w-9 items-center justify-center rounded-lg border border-border transition-colors hover:bg-accent",
          currentPage >= totalPages && "pointer-events-none opacity-40"
        )}
      >
        <ChevronRight className="h-4 w-4" />
      </Link>
    </nav>
  );
}
