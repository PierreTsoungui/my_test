import { useId } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useMinWidth } from "../../hooks/useMinWidth";

type PageItem = number | "ellipsis";

interface PaginationProps {
  currentPage: number;
  totalItems: number;
  pageSize: number;
  onPageChange: (page: number) => void;

  // Optional: nur Matrix nutzt das
  onPageSizeChange?: (pageSize: number) => void;
  pageSizeOptions?: number[];

  ariaLabel: string;
  itemLabel?: string;
}

const DEFAULT_PAGE_SIZE_OPTIONS = [10, 20, 50, 100];

/**
 * Baut die Liste der anzuzeigenden Seitenzahlen.
 * - Mobile (maxVisible=3): 3 aufeinanderfolgende Zahlen, ohne Ellipsen
 * - Desktop (maxVisible=5): 1 + ggf. Ellipsis + Mitte + ggf. Ellipsis + letzte
 */
function buildPageItems(
  currentPage: number,
  totalPages: number,
  maxVisible: number,
): PageItem[] {
  if (totalPages <= maxVisible) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  // Mobile: einfaches Fenster ohne Ellipsen
  if (maxVisible <= 3) {
    let start = Math.max(1, currentPage - 1);
    const end = Math.min(totalPages, start + maxVisible - 1);
    start = Math.max(1, end - maxVisible + 1);
    return Array.from(
      { length: end - start + 1 },
      (_, i) => start + i,
    );
  }

  // Desktop: 1 … [Fenster] … last
  const half = Math.floor((maxVisible - 2) / 2);
  let start = Math.max(2, currentPage - half);
  let end = Math.min(totalPages - 1, currentPage + half);

  if (start <= 3) {
    start = 2;
    end = maxVisible - 1;
  }
  if (end >= totalPages - 2) {
    end = totalPages - 1;
    start = Math.max(2, totalPages - maxVisible + 2);
  }

  const items: PageItem[] = [1];
  if (start > 2) items.push("ellipsis");
  for (let i = start; i <= end; i++) items.push(i);
  if (end < totalPages - 1) items.push("ellipsis");
  items.push(totalPages);

  return items;
}

export function Pagination({
  currentPage,
  totalItems,
  pageSize,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = DEFAULT_PAGE_SIZE_OPTIONS,
  ariaLabel,
  itemLabel = "Einträge",
}: PaginationProps) {
  const pageSizeId = useId();
  const isDesktop = useMinWidth(640);

  const safePageSize = Math.max(1, pageSize);
  const totalPages = Math.max(
    1,
    Math.ceil(totalItems / safePageSize),
  );
  const safeCurrentPage = Math.min(
    Math.max(1, currentPage),
    totalPages,
  );

  if (totalPages <= 1 && !onPageSizeChange) {
    return null;
  }

  const firstItem = (safeCurrentPage - 1) * safePageSize + 1;
  const lastItem = Math.min(
    safeCurrentPage * safePageSize,
    totalItems,
  );
  const maxVisible = isDesktop ? 5 : 3;
  const pageItems = buildPageItems(
    safeCurrentPage,
    totalPages,
    maxVisible,
  );

  const navButtonClass =
    "inline-flex size-10 sm:size-9 items-center justify-center rounded-md border border-slate-200 text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2";

  const pageButtonClass = (isActive: boolean) =>
    `inline-flex size-10 sm:size-9 items-center justify-center rounded-md border text-sm font-medium tabular-nums transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 ${
      isActive
        ? "border-blue-600 bg-blue-600 text-white"
        : "border-slate-200 text-slate-700 hover:bg-slate-50"
    }`;

  return (
    <div className="mt-5 flex flex-col gap-3 border-t border-slate-200 pt-4 sm:flex-row sm:items-center sm:justify-between">
      {/* Links: Zähler + optionaler Selector */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-4">
        <p className="text-sm tabular-nums text-slate-500">
          Zeige{" "}
          <span className="font-medium text-slate-700">
            {firstItem}–{lastItem}
          </span>{" "}
          von{" "}
          <span className="font-medium text-slate-700">
            {totalItems}
          </span>{" "}
          {itemLabel}
        </p>

        {onPageSizeChange && (
          <div className="flex items-center gap-2">
            <label
              htmlFor={pageSizeId}
              className="text-sm text-slate-500"
            >
              Pro Seite
            </label>
            <select
              id={pageSizeId}
              value={safePageSize}
              onChange={(e) =>
                onPageSizeChange(Number(e.target.value))
              }
              className="min-h-10 rounded-md border border-slate-300 bg-white px-2 py-1 text-sm text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 sm:min-h-9"
            >
              {pageSizeOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Rechts: Navigation */}
      <nav
        aria-label={ariaLabel}
        className="flex flex-wrap items-center justify-end gap-1"
      >
        <button
          type="button"
          onClick={() => onPageChange(safeCurrentPage - 1)}
          disabled={safeCurrentPage === 1}
          aria-label="Vorherige Seite"
          className={navButtonClass}
        >
          <ChevronLeft size={16} aria-hidden="true" />
        </button>

        {pageItems.map((item, index) =>
          item === "ellipsis" ? (
            <span
              key={`ellipsis-${index}`}
              className="inline-flex size-10 select-none items-center justify-center text-sm text-slate-400 sm:size-9"
              aria-hidden="true"
            >
              …
            </span>
          ) : (
            <button
              key={item}
              type="button"
              onClick={() => onPageChange(item)}
              aria-label={`Seite ${item}`}
              aria-current={
                item === safeCurrentPage ? "page" : undefined
              }
              className={pageButtonClass(item === safeCurrentPage)}
            >
              {item}
            </button>
          ),
        )}

        <button
          type="button"
          onClick={() => onPageChange(safeCurrentPage + 1)}
          disabled={safeCurrentPage === totalPages}
          aria-label="Nächste Seite"
          className={navButtonClass}
        >
          <ChevronRight size={16} aria-hidden="true" />
        </button>
      </nav>
    </div>
  );
}