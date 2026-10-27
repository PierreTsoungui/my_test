
import { ChevronLeft, ChevronRight } from "lucide-react";

interface PaginationProps {
  currentPage: number;
  totalItems: number;
  pageSize?: number;
  onPageChange: (page: number) => void;
  ariaLabel: string;
  itemLabel?: string;
}

export function Pagination({
  currentPage,
  totalItems,
  pageSize = 6,
  onPageChange,
  ariaLabel,
  itemLabel = "Einträge",
}: PaginationProps) {
  const safePageSize = Math.max(1, pageSize);
  const totalPages = Math.ceil(totalItems / safePageSize);

  if (totalPages <= 1) {
    return null;
  }

  const safeCurrentPage = Math.min(
    Math.max(1, currentPage),
    totalPages,
  );

  const firstItem = (safeCurrentPage - 1) * safePageSize + 1;
  const lastItem = Math.min(
    safeCurrentPage * safePageSize,
    totalItems,
  );

  const getVisiblePages = () => {
    if (totalPages <= 5) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    if (safeCurrentPage <= 3) {
      return [1, 2, 3, 4, 5];
    }

    if (safeCurrentPage >= totalPages - 2) {
      return Array.from(
        { length: 5 },
        (_, i) => totalPages - 4 + i,
      );
    }

    return [
      safeCurrentPage - 2,
      safeCurrentPage - 1,
      safeCurrentPage,
      safeCurrentPage + 1,
      safeCurrentPage + 2,
    ];
  };

  return (
    <div className="mt-5 flex flex-col gap-3 border-t border-slate-200 pt-4 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-sm text-slate-500">
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

      <nav
        aria-label={ariaLabel}
        className="flex items-center justify-end gap-1"
      >
        <button
          type="button"
          onClick={() => onPageChange(safeCurrentPage - 1)}
          disabled={safeCurrentPage === 1}
          aria-label="Vorherige Seite"
          className="inline-flex size-9 items-center justify-center rounded-md border border-slate-200 text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
        >
          <ChevronLeft size={16} aria-hidden="true" />
        </button>

        {getVisiblePages().map((page) => (
          <button
            key={page}
            type="button"
            onClick={() => onPageChange(page)}
            aria-label={`Seite ${page}`}
            aria-current={
              page === safeCurrentPage ? "page" : undefined
            }
            className={`inline-flex size-9 items-center justify-center rounded-md border text-sm font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${
              page === safeCurrentPage
                ? "border-blue-600 bg-blue-600 text-white"
                : "border-slate-200 text-slate-700 hover:bg-slate-50"
            }`}
          >
            {page}
          </button>
        ))}

        <button
          type="button"
          onClick={() => onPageChange(safeCurrentPage + 1)}
          disabled={safeCurrentPage === totalPages}
          aria-label="Nächste Seite"
          className="inline-flex size-9 items-center justify-center rounded-md border border-slate-200 text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
        >
          <ChevronRight size={16} aria-hidden="true" />
        </button>
      </nav>
    </div>
  );
}
