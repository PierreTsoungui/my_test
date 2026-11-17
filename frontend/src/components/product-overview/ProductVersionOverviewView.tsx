import { useEffect, useId, useRef, useState, type MouseEvent } from "react";
import {
  AlertCircle,
  Archive,
  ArrowDown,
  ArrowDownUp,
  ArrowUp,
  CheckCircle2,
  CircleHelp,
  Eye,
  MoreHorizontal,
  Plus,
  RefreshCw,
  RotateCcw,
  Search,
  ShieldAlert,
  Trash2,
} from "lucide-react";
import { Link } from "react-router-dom";

import {
  AddProductVersionModal,
  type CreateProductVersionPayload,
} from "../product-version-matrix/AddProductVersionModal";
import { Pagination } from "../ui/Pagination";
import type {
  ProductVersionArchiveState,
  ProductVersionHealthStatus,
  ProductVersionOverview,
  ProductVersionOverviewAction,
  ProductVersionOverviewPage,
  ProductVersionOverviewQuery,
  ProductVersionSortBy,
} from "../../types/productVersionOverview";

interface ProductVersionOverviewViewProps {
  query: ProductVersionOverviewQuery;
  data: ProductVersionOverviewPage | null;
  isLoading: boolean;
  isMutationRunning?: boolean;
  error: string | null;
  actionError: string | null;
  notice: string | null;
  onQueryChange: (next: Partial<ProductVersionOverviewQuery>) => void;
  onRetry: () => void;
  onAction: (
    item: ProductVersionOverview,
    action: ProductVersionOverviewAction,
  ) => void | boolean | Promise<void | boolean>;
  onCreate: (payload: CreateProductVersionPayload) => Promise<void>;
}

const statusPresentation: Record<
  ProductVersionHealthStatus,
  {
    label: string;
    className: string;
    description: string;
    Icon: typeof ShieldAlert;
  }
> = {
  ACTION_REQUIRED: {
    label: "Handlungsbedarf",
    className: "bg-red-50 text-red-900 ring-red-300",
    description:
      "Es wurden kritische oder hohe Schwachstellen oder bereits abgelaufene Komponenten erkannt.",
    Icon: ShieldAlert,
  },
 
  NOT_ASSESSED: {
    label: "Nicht bewertet",
    className: "bg-slate-100 text-slate-900 ring-slate-300",
    description: "Es liegt noch keine ausreichende Risikobewertung vor.",
    Icon: CircleHelp,
  },
  HEALTHY: {
    label: "Unauffällig",
    className: "bg-green-50 text-green-900 ring-green-300",
    description:
      "Alle erforderlichen Prüfungen sind abgeschlossen und es liegen keine priorisierten Befunde vor.",
    Icon: CheckCircle2,
  },
};

function StatusBadge({ item }: { item: ProductVersionOverview }) {
  const presentation = item.healthStatus
    ? statusPresentation[item.healthStatus]
    : statusPresentation.NOT_ASSESSED;
  const StatusIcon = presentation.Icon;

  return (
    <div className="flex min-w-[175px] flex-col items-start gap-1.5">
      <span
        className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold ring-1 ring-inset ${presentation.className}`}
      >
        <StatusIcon size={15} aria-hidden="true" />
        {presentation.label}
        <span className="sr-only">. {presentation.description}</span>
      </span>

      {item.isArchived && (
        <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-800 ring-1 ring-inset ring-slate-300">
          <Archive size={13} aria-hidden="true" />
          Archiviert
        </span>
      )}
    </div>
  );
}

function CountCell({
  value,
  tone,
}: {
  value: number;
  tone: "critical" | "high" | "eol";
}) {
  if (value === 0) {
    return <span className="tabular-nums text-slate-700">0</span>;
  }

  const dotClass = {
    critical: "bg-red-700",
    high: "bg-orange-600",
    eol: "bg-amber-700",
  }[tone];

  return (
    <span className="inline-flex items-center gap-2 tabular-nums">
      <span className={`size-2 shrink-0 rounded-full ${dotClass}`} aria-hidden="true" />
      {value.toLocaleString("de-DE")}
    </span>
  );
}

const filterControlBase =
  "min-h-11 w-full rounded-lg border px-3 text-sm text-slate-950 " +
  "outline-none transition-colors focus-visible:ring-2 " +
  "focus-visible:ring-blue-700 focus-visible:ring-offset-2";

const filterControlDefault =
  "border-slate-400 bg-white hover:border-slate-600";

const filterControlActive =
  "border-blue-700 bg-blue-50 font-semibold text-blue-950";

export function ProductVersionOverviewView({
  query,
  data,
  isLoading,
  isMutationRunning = false,
  error,
  actionError,
  notice,
  onQueryChange,
  onRetry,
  onAction,
  onCreate,
}: ProductVersionOverviewViewProps) {
  const [searchInput, setSearchInput] = useState(query.search);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const filterId = useId();
  const tableHeadingRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    setSearchInput(query.search);
  }, [query.search]);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      const normalizedSearch = searchInput.trim();
      if (normalizedSearch !== query.search) {
        onQueryChange({ search: normalizedSearch, page: 1 });
      }
    }, 300);

    return () => window.clearTimeout(timeoutId);
  }, [searchInput, query.search, onQueryChange]);

  const isSearchActive = searchInput.trim().length > 0;
  const isStatusActive = query.status !== "ALL";
  const isArchiveActive = query.archiveState !== "ACTIVE";
  const hasActiveFilters =
    isSearchActive || isStatusActive || isArchiveActive;

  function resetFilters() {
    setSearchInput("");
    onQueryChange({
      archiveState: "ACTIVE",
      status: "ALL",
      search: "",
      page: 1,
    });
  }

  async function handleMenuAction(
    item: ProductVersionOverview,
    action: ProductVersionOverviewAction,
    event: MouseEvent<HTMLButtonElement>,
  ) {
    const details = event.currentTarget.closest("details");
    const summary = details?.querySelector("summary");
    if (details) details.open = false;

    try {
      const succeeded = await onAction(item, action);
      if (succeeded === false) {
        summary?.focus();
        return;
      }

      // Die betroffene Zeile kann nach Archivieren/Löschen aus der Tabelle
      // verschwinden. Der Fokus geht deshalb auf die stabile Tabellenüberschrift.
      tableHeadingRef.current?.focus();
    } catch {
      // Der Aufrufer meldet den Fehler über den globalen Fehlerbereich.
      summary?.focus();
    }
  }

  function toggleSort(sortBy: ProductVersionSortBy) {
    const sameColumn = query.sortBy === sortBy;
    const sortOrder = sameColumn
      ? query.sortOrder === "ASC"
        ? "DESC"
        : "ASC"
      : sortBy === "LABEL"
        ? "ASC"
        : "DESC";

    onQueryChange({ sortBy, sortOrder, page: 1 });
  }

  function renderSortButton(
    label: string,
    sortBy: ProductVersionSortBy,
  ) {
    const isCurrentSort = query.sortBy === sortBy;
    const SortIcon = !isCurrentSort
      ? ArrowDownUp
      : query.sortOrder === "ASC"
        ? ArrowUp
        : ArrowDown;
    const sortTooltip = !isCurrentSort
        ? undefined
        : query.sortOrder === "ASC"
        ? "Aufsteigend sortiert"
        : "Absteigend sortiert";
    return (
      <button
        type="button"
        onClick={() => toggleSort(sortBy)}
        aria-label={`${label} sortieren${
          isCurrentSort
            ? query.sortOrder === "ASC"
              ? ", Aufsteigend sortiert"
              : ", Absteigend sortiert"
            : ""
        }`}
        aria-pressed={isCurrentSort}
        className="inline-flex min-h-8 items-center gap-2 rounded text-left font-semibold text-slate-800 hover:text-blue-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-700 focus-visible:ring-offset-2"
      >
        {label}
        <span title={sortTooltip} className="inline-flex">
          <SortIcon
            size={15}
            className={isCurrentSort ? "text-blue-800" : "text-slate-500"}
            aria-hidden="true"
          />
        </span>
      </button>
    );
  }

  const rows = data?.items ?? [];
  const total = data?.total ?? 0;
  const archiveHeading =
    query.archiveState === "ARCHIVED"
      ? "Archivierte Produktversionen"
      : query.archiveState === "ALL"
        ? "Alle Produktversionen"
        : "Aktive Produktversionen";

  return (
    <main className="mx-auto min-h-[calc(100vh-4rem)] w-full max-w-[1600px] space-y-5 bg-slate-50 px-4 py-6 text-slate-900 sm:px-6 lg:px-8">
      <header>
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-blue-800">
          Software Lifecycle &amp; Security
        </p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight text-slate-950 sm:text-3xl">
          Produktüberblick
        </h1>
        <p className="mt-1 text-sm text-slate-700">
          Produktversionen verwalten und technische Risiken erkennen.
        </p>
      </header>

      <AddProductVersionModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSubmit={onCreate}
      />

      <section
        aria-label="Produktversionen filtern"
        className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5"
      >
        {/* Die Überschrift wurde entfernt; die Hauptaktion bleibt rechts oben. */}
        <div className="flex justify-end">
          <button
            type="button"
            onClick={() => setIsAddModalOpen(true)}
            disabled={isMutationRunning}
            aria-haspopup="dialog"
            className="inline-flex min-h-11 shrink-0 items-center justify-center gap-2 rounded-lg border border-blue-700 bg-white px-4 py-2 text-sm font-semibold text-blue-800 transition-colors hover:bg-blue-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-700 focus-visible:ring-offset-2"
          >
            <Plus size={18} aria-hidden="true" />
            Neue Produktversion
          </button>
        </div>

        {/* Ab lg werden alle Filter in einer gemeinsamen Zeile dargestellt. */}
        <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-[minmax(16rem,1.5fr)_minmax(12rem,1fr)_minmax(12rem,1fr)_auto] lg:items-center">
          <div className="sm:col-span-2 lg:col-span-1">
            <label htmlFor={`${filterId}-search`} className="sr-only">
              Nach Produktversion suchen
            </label>
            <div className="relative">
              <Search
                size={17}
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-600"
                aria-hidden="true"
              />
              <input
                id={`${filterId}-search`}
                type="search"
                value={searchInput}
                onChange={(event) => setSearchInput(event.currentTarget.value)}
                placeholder="Suche nach Version …"
                autoComplete="off"
                className={`${filterControlBase} pl-10 pr-3 placeholder:text-slate-600 ${
                  isSearchActive ? filterControlActive : filterControlDefault
                }`}
              />
            </div>
          </div>

          <div className="relative">
            <label htmlFor={`${filterId}-status`} className="sr-only">
              Produktversionen nach Bewertung filtern
            </label>
            <span
              aria-hidden="true"
              className="pointer-events-none absolute left-3 top-1/2 z-10 -translate-y-1/2 text-sm font-medium text-slate-700"
            >
              Status:
            </span>
            <select
              id={`${filterId}-status`}
              value={query.status}
              onChange={(event) =>
                onQueryChange({
                  status: event.currentTarget.value as ProductVersionOverviewQuery["status"],
                  page: 1,
                })
              }
              className={`${filterControlBase} appearance-none pl-[4.5rem] pr-10 ${
                isStatusActive ? filterControlActive : filterControlDefault
              }`}
            >
              <option value="ALL">Alle</option>
              <option value="ACTION_REQUIRED">Handlungsbedarf</option>
              <option value="HEALTHY">Unauffällig</option>
              <option value="NOT_ASSESSED">Nicht bewertet</option>
            </select>
            <span
              aria-hidden="true"
              className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-600"
            >
              ▾
            </span>
          </div>

          <div className="relative">
            <label htmlFor={`${filterId}-archive`} className="sr-only">
               Anzuzeigende Produktversionen auswählen
            </label>
            <span
              aria-hidden="true"
              className="pointer-events-none absolute left-3 top-1/2 z-10 -translate-y-1/2 text-sm font-medium text-slate-700"
            >
              Ansicht:
            </span>
            <select
              id={`${filterId}-archive`}
              value={query.archiveState}
              onChange={(event) =>
                onQueryChange({
                  archiveState: event.currentTarget.value as ProductVersionArchiveState,
                  page: 1,
                })
              }
              className={`${filterControlBase} appearance-none pl-[4.25rem] pr-10 ${
                isArchiveActive ? filterControlActive : filterControlDefault
              }`}
            >
              <option value="ACTIVE">Nur aktive</option>
              <option value="ARCHIVED">Nur archivierte</option>
              <option value="ALL">Alle</option>
            </select>
            <span
              aria-hidden="true"
              className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-600"
            >
              ▾
            </span>
          </div>

          <div className="sm:col-span-2 lg:col-span-1 lg:justify-self-end">
            <button
              type="button"
              onClick={resetFilters}
              disabled={!hasActiveFilters}
              className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-lg px-3 text-sm font-medium text-blue-800 transition-colors hover:bg-blue-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-700 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 lg:w-auto lg:whitespace-nowrap"
            >
              <RefreshCw size={16} aria-hidden="true" />
              Filter zurücksetzen
            </button>
          </div>
        </div>

        {(actionError || notice || error) && (
          <div className="mt-4 space-y-2">
            {actionError && (
              <div
                role="alert"
                className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-900"
              >
                <AlertCircle size={17} className="mt-0.5 shrink-0" aria-hidden="true" />
                <span>{actionError}</span>
              </div>
            )}
            {error && (
              <div
                role="alert"
                className="flex items-center justify-between gap-3 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-900"
              >
                <span>{error}</span>
                <button
                  type="button"
                  onClick={onRetry}
                  className="min-h-9 shrink-0 rounded px-2 font-semibold underline underline-offset-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-700"
                >
                  Erneut versuchen
                </button>
              </div>
            )}
            {notice && (
              <p
                role="status"
                className="rounded-lg border border-green-200 bg-green-50 p-3 text-sm text-green-900"
              >
                {notice}
              </p>
            )}
          </div>
        )}
      </section>

      <section
        aria-labelledby="product-version-table-title"
        aria-busy={isLoading}
        className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm"
      >
        <div className="flex flex-col gap-1 border-b border-slate-200 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-5">
          <h2
            id="product-version-table-title"
            ref={tableHeadingRef}
            tabIndex={-1}
            className="rounded-sm font-semibold text-slate-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-700 focus-visible:ring-offset-2"
          >
            {archiveHeading}
          </h2>
          <p className="text-sm text-slate-600" aria-live="polite" aria-atomic="true">
            {!data && isLoading
              ? "Produktversionen werden geladen …"
              : !data && error
                ? "Ergebnisliste nicht verfügbar"
                : `${total.toLocaleString("de-DE")} ${total === 1 ? "Version gefunden" : "Versionen gefunden"}`}
          </p>
        </div>

        <div
          className="overflow-x-auto focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-blue-700"
          role="region"
          aria-label="Produktversionstabelle; bei schmalen Bildschirmen horizontal scrollbar"
          tabIndex={0}
        >
          <table className="w-full min-w-[900px] border-separate border-spacing-0 text-left">
            <caption className="sr-only">
              Produktversionen mit kritischen und hohen Schwachstellen, EOL-Komponenten, Status und Aktionen.
            </caption>
            <thead>
              <tr className="bg-slate-50 text-xs text-slate-800">
                <th
                  scope="col"
                  aria-sort={query.sortBy === "LABEL" ? (query.sortOrder === "ASC" ? "ascending" : "descending") : "none"}
                  className="border-b border-slate-200 px-4 py-3"
                >
                  {renderSortButton("Produktversion", "LABEL")}
                </th>
                <th
                  scope="col"
                  aria-sort={query.sortBy === "CRITICAL_CVE_COUNT" ? (query.sortOrder === "ASC" ? "ascending" : "descending") : "none"}
                  className="border-b border-slate-200 px-4 py-3"
                >
                  {renderSortButton("Kritische CVEs", "CRITICAL_CVE_COUNT")}
                </th>
                <th
                  scope="col"
                  aria-sort={query.sortBy === "HIGH_CVE_COUNT" ? (query.sortOrder === "ASC" ? "ascending" : "descending") : "none"}
                  className="border-b border-slate-200 px-4 py-3"
                >
                  {renderSortButton("Hohe CVEs", "HIGH_CVE_COUNT")}
                </th>
                <th
                  scope="col"
                  aria-sort={query.sortBy === "EOL_COMPONENT_COUNT" ? (query.sortOrder === "ASC" ? "ascending" : "descending") : "none"}
                  className="border-b border-slate-200 px-4 py-3"
                >
                  {renderSortButton("EOL-Komponenten", "EOL_COMPONENT_COUNT")}
                </th>
                <th scope="col" className="border-b border-slate-200 px-4 py-3">
                  Status
                </th>
                <th scope="col" className="border-b border-slate-200 px-4 py-3 text-right">
                  Aktionen
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading && rows.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center text-sm text-slate-700">
                    Produktversionen werden geladen …
                  </td>
                </tr>
              )}

              {!isLoading && !error && rows.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center">
                    <div className="mx-auto flex max-w-md flex-col items-center">
                      <CircleHelp size={28} className="text-slate-600" aria-hidden="true" />
                      <p className="mt-3 text-sm font-medium text-slate-950">
                        {query.archiveState === "ARCHIVED"
                          ? "Keine archivierten Produktversionen vorhanden."
                          : "Keine passenden Produktversionen gefunden."}
                      </p>
                     
                    </div>
                  </td>
                </tr>
              )}

              {rows.map((item) => (
                <tr key={item.id} className="bg-white transition-colors hover:bg-slate-50">
                  <td className="whitespace-nowrap px-4 py-4">
                    <Link
                      to={`/dashboard?productVersionId=${item.id}`}
                      className="rounded-sm font-semibold text-blue-800 underline-offset-4 hover:text-blue-950 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-700 focus-visible:ring-offset-2"
                    >
                      {item.label}
                    </Link>
                  </td>
                  <td className="px-4 py-4 text-sm text-slate-950">
                    <CountCell value={item.criticalCveCount} tone="critical" />
                  </td>
                  <td className="px-4 py-4 text-sm text-slate-950">
                    <CountCell value={item.highCveCount} tone="high" />
                  </td>
                  <td className="px-4 py-4 text-sm text-slate-950">
                    <CountCell value={item.eolComponentCount} tone="eol" />
                  </td>
                  <td className="px-4 py-4">
                    <StatusBadge item={item} />
                  </td>
                  <td className="px-4 py-4 text-right">
                    <details
                      className="group relative inline-block text-left"
                      onKeyDown={(event) => {
                        if (event.key !== "Escape") return;
                        const details = event.currentTarget;
                        if (!details.open) return;
                        event.preventDefault();
                        details.open = false;
                        details.querySelector("summary")?.focus();
                      }}
                    >
                      <summary
                        aria-label={`Aktionen für Produktversion ${item.label}`}
                        aria-controls={`${filterId}-actions-${item.id}`}
                        className="flex size-10 cursor-pointer list-none items-center justify-center rounded-md border border-slate-400 text-slate-800 hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-700 focus-visible:ring-offset-2 [&::-webkit-details-marker]:hidden"
                      >
                        <MoreHorizontal size={18} aria-hidden="true" />
                      </summary>
                      <div
                        id={`${filterId}-actions-${item.id}`}
                        className="absolute right-0 z-20 mt-2 w-52 rounded-lg border border-slate-200 bg-white p-1.5 text-left shadow-lg"
                      >
                        <Link
                          to={`/dashboard?productVersionId=${item.id}`}
                          className="flex min-h-11 items-center gap-2 rounded-md px-3 text-sm text-slate-800 hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-blue-700"
                        >
                          <Eye size={15} aria-hidden="true" />
                          Details anzeigen
                        </Link>

                        {item.isArchived ? (
                          <button
                            type="button"
                            disabled={isMutationRunning}
                            onClick={(event) => void handleMenuAction(item, "restore", event)}
                            className="flex min-h-11 w-full items-center gap-2 rounded-md px-3 text-left text-sm text-slate-800 hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-blue-700 disabled:opacity-50"
                          >
                            <RotateCcw size={15} aria-hidden="true" />
                            Wiederherstellen
                          </button>
                        ) : (
                          <button
                            type="button"
                            disabled={isMutationRunning}
                            onClick={(event) => void handleMenuAction(item, "archive", event)}
                            className="flex min-h-11 w-full items-center gap-2 rounded-md px-3 text-left text-sm text-slate-800 hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-blue-700 disabled:opacity-50"
                          >
                            <Archive size={15} aria-hidden="true" />
                            Archivieren
                          </button>
                        )}

                        <button
                          type="button"
                          disabled={isMutationRunning}
                          onClick={(event) => void handleMenuAction(item, "delete", event)}
                          className="flex min-h-11 w-full items-center gap-2 rounded-md px-3 text-left text-sm text-red-800 hover:bg-red-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-red-700 disabled:opacity-50"
                        >
                          <Trash2 size={15} aria-hidden="true" />
                          Löschen
                        </button>
                      </div>
                    </details>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {isLoading && rows.length > 0 && (
          <p className="px-4 pt-2 text-xs text-slate-700" role="status">
            Ergebnisse werden aktualisiert …
          </p>
        )}

        <div className="px-4 pb-4 pt-3 sm:px-5">
          <Pagination
            currentPage={data?.page ?? query.page}
            totalItems={total}
            pageSize={data?.pageSize ?? query.pageSize}
            onPageChange={(page) => onQueryChange({ page })}
            onPageSizeChange={(pageSize) => onQueryChange({ pageSize, page: 1 })}
            ariaLabel="Produktversionsseiten"
            itemLabel="Produktversionen"
          />
        </div>
      </section>
    </main>
  );
}
