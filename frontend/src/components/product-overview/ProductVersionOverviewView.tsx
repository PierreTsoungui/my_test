
import {
  useEffect,
  useId,
  useRef,
  useState,
  type SyntheticEvent,
  type MouseEvent,
} from "react";
import {
  AlertCircle,
  Archive,
  CircleHelp,
  Eye,
  MoreHorizontal,
  Plus,
  RotateCcw,
  Search,
  Trash2,
} from "lucide-react";
import { Link } from "react-router-dom";

import {
  AddProductVersionModal,
  type CreateProductVersionPayload,
} from "../product-version-matrix/AddProductVersionModal";
import { Pagination } from "../ui/Pagination";

import type {
  ProductVersionAttentionFilter,
  ProductVersionOverview,
  ProductVersionOverviewAction,
  ProductVersionOverviewPage,
  ProductVersionOverviewQuery,
  ProductVersionSortBy,
} from "../../types/productVersionOverview";

// --------------------------------------------------
// Props
// --------------------------------------------------

interface ProductVersionOverviewViewProps {
  query: ProductVersionOverviewQuery;
  data: ProductVersionOverviewPage | null;
  isLoading: boolean;
  isMutationRunning: boolean;
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

// --------------------------------------------------
// Shared styles
// --------------------------------------------------

const controlBase =
  "min-h-10 w-full rounded-lg border border-border bg-surface px-3 font-sans text-sm font-normal text-foreground " +
  "outline-none transition-colors hover:border-slate-400 focus-visible:border-primary-700 " +
  "focus-visible:ring-2 focus-visible:ring-primary-600 focus-visible:ring-offset-1";

const controlActive =
  "border-primary-600 bg-primary-50 text-primary-700";

const selectOptionBase =
  "bg-surface font-sans text-sm font-normal text-foreground";

// --------------------------------------------------
// Helpers
// --------------------------------------------------

function formatArchiveDate(value: string): string {
  // Date-only values must not shift to the previous day due to timezone conversion.
  const dateOnlyMatch = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);

  const date = dateOnlyMatch
    ? new Date(
        Number(dateOnlyMatch[1]),
        Number(dateOnlyMatch[2]) - 1,
        Number(dateOnlyMatch[3]),
      )
    : new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("de-DE", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(date);
}

function hasFindings(item: ProductVersionOverview): boolean {
  return (
    (item.criticalAffectedComponentCount ?? 0) > 0 ||
    (item.highAffectedComponentCount ?? 0) > 0 ||
    (item.eolComponentCount ?? 0) > 0
  );
}

// --------------------------------------------------
// Small UI components
// --------------------------------------------------

function ArchivedBadge({ archiveAt }: { archiveAt: string }) {
  return (
    <span className="mt-1 inline-flex w-fit items-center gap-1.5 rounded-md bg-surface-muted px-2 py-1 text-xs font-medium text-muted">
      <Archive size={13} aria-hidden="true" />

      <time dateTime={archiveAt}>
        Archiviert seit {formatArchiveDate(archiveAt)}
      </time>
    </span>
  );
}

/**
 * Displays Critical and High values in their own table columns.
 *
 * null means that the corresponding OSV assessment was not performed.
 * 0 means that the assessment was performed but no affected components
 * were found.
 */
function OsvComponentsCells({ item }: { item: ProductVersionOverview }) {
  const critical = item.criticalAffectedComponentCount;
  const high = item.highAffectedComponentCount;

  const notAssessed = critical === null && high === null;

  if (notAssessed) {
    return (
      <td
        colSpan={2}
        className="px-5 py-4 text-center text-sm text-muted"
      >
        Nicht bewertet
      </td>
    );
  }

  return (
    <>
      <td className="px-5 py-4 text-center align-middle">
        <span
          className={`font-semibold tabular-nums ${
            critical !== null && critical > 0
              ? "text-critical-700"
              : "text-muted"
          }`}
        >
          {critical === null ? "—" : critical.toLocaleString("de-DE")}
        </span>
      </td>

      <td className="px-5 py-4 text-center align-middle">
        <span
          className={`font-semibold tabular-nums ${
            high !== null && high > 0
              ? "text-high-700"
              : "text-muted"
          }`}
        >
          {high === null ? "—" : high.toLocaleString("de-DE")}
        </span>
      </td>
    </>
  );
}

function EolComponentsCell({ value }: { value: number | null }) {
  if (value === null) {
    return (
      <span className="text-sm text-muted">
        Nicht bewertet
      </span>
    );
  }

  return (
    <span className="text-lg font-semibold tabular-nums text-foreground">
      {value.toLocaleString("de-DE")}
    </span>
  );
}

// --------------------------------------------------
// Filter options
// --------------------------------------------------

const attentionFilterOptions: Array<{
  value: ProductVersionAttentionFilter;
  label: string;
}> = [
  { value: "ALL", label: "Alle" },
  { value: "EOL", label: "Mit EOL-Komponenten" },
  {
    value: "OSV_AFFECTED_COMPONENTS",
    label: "Mit High-/Critical-Komponenten",
  },
  { value: "HEALTHY", label: "Keine Auffälligkeiten" },
  { value: "EOL_NOT_ASSESSED", label: "EOL nicht bewertet" },
  { value: "OSV_NOT_ASSESSED", label: "OSV nicht bewertet" },
];

// --------------------------------------------------
// Main component
// --------------------------------------------------

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
  // Local UI state
  const [searchInput, setSearchInput] = useState(query.search);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [openActionMenuId, setOpenActionMenuId] = useState<number | null>(null);

  const filterId = useId();
  const tableHeadingRef = useRef<HTMLHeadingElement>(null);

  // --------------------------------------------------
  // Search synchronization
  // --------------------------------------------------

  useEffect(() => {
    setSearchInput(query.search);
  }, [query.search]);

  // Close the currently open action disclosure when the user clicks elsewhere.
  useEffect(() => {
    if (openActionMenuId === null) {
      return;
    }

    function handleOutsidePointerDown(event: PointerEvent) {
      const target = event.target;

      if (!(target instanceof Element) || !target.closest("[data-action-menu]")) {
        setOpenActionMenuId(null);
      }
    }

    document.addEventListener("pointerdown", handleOutsidePointerDown);

    return () => {
      document.removeEventListener("pointerdown", handleOutsidePointerDown);
    };
  }, [openActionMenuId]);

  // --------------------------------------------------
  // Derived UI state
  // --------------------------------------------------

  const isSearchActive = searchInput.trim().length > 0;
  const isAttentionFilterActive = query.attentionFilter !== "ALL";
  const isArchiveFilterActive = query.archiveState !== "ACTIVE";
  const isSortActive = query.sortBy !== null;

  const rows = data?.items ?? [];
  const total = data?.total ?? 0;

  const archiveHeading =
    query.archiveState === "ARCHIVED"
      ? "Archivierte Produktversionen"
      : query.archiveState === "ALL"
        ? "Alle Produktversionen"
        : "Aktive Produktversionen";

  function handleSearchSubmit(event: SyntheticEvent<HTMLFormElement>) {
    event.preventDefault();

    const normalizedSearch = searchInput.trim();

    if (normalizedSearch !== query.search) {
      onQueryChange({
        search: normalizedSearch,
        page: 1,
      });
    }
  }

  function handleSortChange(sortBy: ProductVersionSortBy | null) {
    onQueryChange({
      sortBy,
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

    setOpenActionMenuId(null);

    try {
      const succeeded = await onAction(item, action);

      if (succeeded === false) {
        summary?.focus();
        return;
      }

      // The row may disappear after an archive or delete action.
      // Move focus to a stable heading.
      tableHeadingRef.current?.focus();
    } catch {
      // The caller displays the error in the shared error area.
      summary?.focus();
    }
  }

  // --------------------------------------------------
  // Render
  // --------------------------------------------------

  return (
    <main className="mx-auto min-h-[calc(100vh-4rem)] w-full max-w-[1440px] space-y-6 bg-page px-4 py-6 text-foreground sm:px-6 lg:px-8">

      {/* Page heading */}

      <header>
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-primary-700">
          Software Lifecycle &amp; Security
        </p>

        <h1 className="mt-1 text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
          Produktüberblick
        </h1>

        <p className="mt-1 text-sm text-muted">
          Produktversionen vergleichen und Auffälligkeiten erkennen.
        </p>
      </header>

      {/* Add product version modal */}

      <AddProductVersionModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSubmit={onCreate}
      />

      {/* Product version overview */}

      <section
        aria-labelledby={`${filterId}-section-title`}
        className="overflow-hidden rounded-xl border border-border bg-surface shadow-sm"
      >

        {/* Filters */}

        <div className="p-4 sm:p-5">

          <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">

            <h2
              id={`${filterId}-section-title`}
              className="text-base font-semibold text-foreground"
            >
              Produktversionen
            </h2>

            <button
              type="button"
              onClick={() => setIsAddModalOpen(true)}
              aria-haspopup="dialog"
              className="inline-flex min-h-10 shrink-0 items-center justify-center gap-2 rounded-lg bg-primary-700 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-blue-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-600 focus-visible:ring-offset-2"
            >
              <Plus size={17} aria-hidden="true" />
              Neue Produktversion
            </button>

          </div>

          {/* Search and filter controls */}

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-[minmax(15rem,1.5fr)_minmax(12rem,1fr)_minmax(11rem,0.9fr)_minmax(13rem,1.1fr)_auto] xl:items-end">

            {/* Search */}

            <div>
              <label
                htmlFor={`${filterId}-search`}
                className="mb-1.5 block text-xs font-medium text-muted"
              >
                Suche
              </label>

              <form
                role="search"
                aria-label="Produktversionen suchen"
                onSubmit={handleSearchSubmit}
                className="relative"
              >
                <button
                  type="submit"
                  aria-label="Suche starten"
                  title="Suche starten"
                  className="absolute left-1 top-1/2 flex size-9 -translate-y-1/2 items-center justify-center rounded-md text-muted transition-colors hover:bg-surface-muted hover:text-foreground focus-visible:z-10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-600 focus-visible:ring-offset-1"
                >
                  <Search size={17} aria-hidden="true" />
                </button>

                <input
                  id={`${filterId}-search`}
                  type="search"
                  value={searchInput}
                  onChange={(event) =>
                    setSearchInput(event.currentTarget.value)
                  }
                  placeholder="Produktversion suchen …"
                  autoComplete="off"
                  className={`${controlBase} pl-11 ${
                    isSearchActive ? controlActive : ""
                  }`}
                />
              </form>
            </div>

            {/* Attention filter */}

            <div>
              <label
                htmlFor={`${filterId}-attention`}
                className="mb-1.5 block text-xs font-medium text-muted"
              >
                Auffälligkeit
              </label>

              <select
                id={`${filterId}-attention`}
                value={query.attentionFilter}
                onChange={(event) =>
                  onQueryChange({
                    attentionFilter: event.currentTarget
                      .value as ProductVersionAttentionFilter,
                    page: 1,
                  })
                }
                className={`${controlBase} ${
                  isAttentionFilterActive ? controlActive : ""
                }`}
              >
                {attentionFilterOptions.map((option) => (
                  <option
                    key={option.value}
                    value={option.value}
                    className={selectOptionBase}
                  >
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Archive filter */}

            <div>
              <label
                htmlFor={`${filterId}-archive`}
                className="mb-1.5 block text-xs font-medium text-muted"
              >
                Ansicht
              </label>

              <select
                id={`${filterId}-archive`}
                value={query.archiveState}
                onChange={(event) =>
                  onQueryChange({
                    archiveState: event.currentTarget
                      .value as ProductVersionOverviewQuery["archiveState"],
                    page: 1,
                  })
                }
                className={`${controlBase} ${
                  isArchiveFilterActive ? controlActive : ""
                }`}
              >
                <option value="ACTIVE" className={selectOptionBase}>
                  Aktive Versionen
                </option>
                <option value="ARCHIVED" className={selectOptionBase}>
                  Archivierte Versionen
                </option>
                <option value="ALL" className={selectOptionBase}>
                  Alle Versionen
                </option>
              </select>
            </div>

            {/* Sorting */}

            <div>
              <label
                htmlFor={`${filterId}-sort`}
                className="mb-1.5 block text-xs font-medium text-muted"
              >
                Sortierung
              </label>

              <select
                id={`${filterId}-sort`}
                value={query.sortBy ?? ""}
                onChange={(event) => {
                  const value = event.currentTarget.value;

                  handleSortChange(
                    value === "" ? null : (value as ProductVersionSortBy),
                  );
                }}
                className={`${controlBase} ${
                  isSortActive ? controlActive : ""
                }`}
              >
                <option value="" className={selectOptionBase}>
                  Version (neueste zuerst)
                </option>
                <option value="EOL_COMPONENT_COUNT" className={selectOptionBase}>
                  EOL-Komponenten zuerst
                </option>
                <option
                  value="VULNERABILITY_SEVERITY"
                  className={selectOptionBase}
                >
                  Critical-/High-Komponenten zuerst
                </option>
              </select>
            </div>


          </div>

          {/* Notifications and errors */}

          {(actionError || notice || error) && (
            <div className="mt-4 space-y-2">

              {actionError && (
                <div
                  role="alert"
                  className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-900"
                >
                  <AlertCircle
                    size={17}
                    className="mt-0.5 shrink-0"
                    aria-hidden="true"
                  />

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
                    className="min-h-9 shrink-0 rounded px-2 font-semibold underline underline-offset-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-600"
                  >
                    Erneut versuchen
                  </button>
                </div>
              )}

              {notice && (
                <p
                  role="status"
                  className="rounded-lg border border-green-200 bg-success-50 p-3 text-sm text-success-700"
                >
                  {notice}
                </p>
              )}

            </div>
          )}

        </div>

        {/* Table heading and result count */}

        <div className="flex flex-col gap-1 border-y border-border bg-surface-muted/70 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-5">

          <h3
            id={`${filterId}-table-title`}
            ref={tableHeadingRef}
            tabIndex={-1}
            className="rounded-sm text-sm font-semibold text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-600 focus-visible:ring-offset-2"
          >
            {archiveHeading}
          </h3>

          <div className="flex flex-wrap items-center gap-x-4 gap-y-1">

            <p
              className="text-sm text-muted"
              aria-live="polite"
              aria-atomic="true"
            >
              {!data && isLoading
                ? "Produktversionen werden geladen …"
                : !data && error
                  ? "Ergebnisliste nicht verfügbar"
                  : `${total.toLocaleString("de-DE")} ${
                      total === 1
                        ? "Version gefunden"
                        : "Versionen gefunden"
                    }`}
            </p>

            <span className="inline-flex items-center gap-2 text-xs text-muted">
              <span
                aria-hidden="true"
                className="h-4 w-1 rounded-full bg-slate-400"
              />
              Mindestens eine Auffälligkeit
            </span>

          </div>

        </div>

        {/* Product version table */}

        <div
          className="overflow-x-auto focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary-600"
          role="region"
          aria-label="Produktversionstabelle; bei schmalen Bildschirmen horizontal scrollbar"
          tabIndex={0}
          aria-busy={isLoading}
        >

          <table className="w-full min-w-[900px] border-separate border-spacing-0 text-left">

            <caption className="sr-only">
              Produktversionen mit betroffenen OSV-Komponenten und EOL-Komponenten
            </caption>

            <colgroup>
              <col className="w-[36%]" />
              <col className="w-[12%]" />
              <col className="w-[12%]" />
              <col className="w-[22%]" />
              <col className="w-[18%]" />
            </colgroup>

            {/* One consistent header row */}

            <thead>
              <tr className="bg-surface-muted text-xs font-semibold text-muted">

                <th
                  scope="col"
                  className="whitespace-nowrap border-b border-border px-5 py-4 text-left align-middle"
                >
                  Produktversion
                </th>

                <th
                  scope="col"
                  className="whitespace-nowrap border-b border-border px-5 py-4 text-center align-middle"
                  title="Anzahl betroffener Komponenten mit Critical-Schwachstellen"
                >
                  <span className="text-critical-700">
                    Critical
                  </span>

                  <span className="ml-1 font-normal normal-case text-muted">
                    (OSV)
                  </span>
                </th>

                <th
                  scope="col"
                  className="whitespace-nowrap border-b border-border px-5 py-4 text-center align-middle"
                  title="Anzahl betroffener Komponenten mit High-Schwachstellen"
                >
                  <span className="text-high-700">
                    High
                  </span>

                  <span className="ml-1 font-normal normal-case text-muted">
                    (OSV)
                  </span>
                </th>

                <th
                  scope="col"
                  className="whitespace-nowrap border-b border-border px-5 py-4 text-left align-middle"
                  title="Anzahl der Komponenten, deren Lebenszyklusende erreicht wurde"
                >
                  EOL-Komponenten
                </th>

                <th
                  scope="col"
                  className="whitespace-nowrap border-b border-border px-5 py-4 text-right align-middle"
                >
                  Aktionen
                </th>

              </tr>
            </thead>

            {/* Table body */}

            <tbody className="divide-y divide-slate-100">

              {/* Loading */}

              {isLoading && rows.length === 0 && (
                <tr>
                  <td
                    colSpan={5}
                    className="px-5 py-14 text-center text-sm text-muted"
                  >
                    Produktversionen werden geladen …
                  </td>
                </tr>
              )}

              {/* Empty result */}

              {!isLoading && !error && rows.length === 0 && (
                <tr>
                  <td
                    colSpan={5}
                    className="px-5 py-14 text-center"
                  >
                    <div className="mx-auto flex max-w-md flex-col items-center">

                      <CircleHelp
                        size={27}
                        className="text-slate-400"
                        aria-hidden="true"
                      />

                      <p className="mt-3 text-sm font-medium text-foreground">
                        {query.archiveState === "ARCHIVED"
                          ? "Keine archivierten Produktversionen vorhanden."
                          : "Keine passenden Produktversionen gefunden."}
                      </p>

                    </div>
                  </td>
                </tr>
              )}

              {/* Product version rows */}

              {rows.map((item) => {
                const itemHasFindings = hasFindings(item);
                const isArchived = Boolean(item.archivedAt);

                return (
                  <tr
                    key={item.id}
                    className="bg-surface transition-colors hover:bg-surface-muted/70"
                  >

                    {/* Product version */}

                    <td className="px-5 py-4 align-middle">

                      <div className="flex items-center gap-3">

                        <span
                          aria-hidden="true"
                          className={`h-8 w-1 shrink-0 rounded-full ${
                            itemHasFindings
                              ? "bg-slate-400"
                              : "bg-transparent"
                          }`}
                        />

                        <div className="min-w-0">

                          <Link
                            to={`/dashboard?productVersionId=${item.id}`}
                            className="rounded-sm font-semibold text-primary-700 underline-offset-4 hover:text-blue-950 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-600 focus-visible:ring-offset-2"
                          >
                            {item.label}
                          </Link>

                          {isArchived && item.archivedAt && (
                            <ArchivedBadge archiveAt={item.archivedAt} />
                          )}

                        </div>

                      </div>

                    </td>

                    {/* Critical and High OSV components */}

                    <OsvComponentsCells item={item} />

                    {/* EOL components */}

                    <td className="px-5 py-4 align-middle">
                      <EolComponentsCell value={item.eolComponentCount} />
                    </td>

                    {/* Actions */}

                    <td className="px-5 py-4 text-right align-middle">

                      <details
                        open={openActionMenuId === item.id}
                        data-action-menu
                        className="group relative inline-block text-left"
                        onBlur={(event) => {
                          const nextTarget = event.relatedTarget;

                          if (
                            !(nextTarget instanceof Node) ||
                            !event.currentTarget.contains(nextTarget)
                          ) {
                            setOpenActionMenuId((currentId) =>
                              currentId === item.id ? null : currentId,
                            );
                          }
                        }}
                        onKeyDown={(event) => {
                          if (
                            event.key !== "Escape" ||
                            !event.currentTarget.open
                          ) {
                            return;
                          }

                          event.preventDefault();
                          setOpenActionMenuId(null);
                          event.currentTarget.querySelector("summary")?.focus();
                        }}
                      >

                        <summary
                          aria-label={`Aktionen für Produktversion ${item.label}`}
                          aria-controls={`${filterId}-actions-${item.id}`}
                          onClick={(event) => {
                            event.preventDefault();
                            setOpenActionMenuId((currentId) =>
                              currentId === item.id ? null : item.id,
                            );
                          }}
                          className="flex size-9 cursor-pointer list-none items-center justify-center rounded-md border border-border text-muted transition-colors hover:bg-surface-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-600 focus-visible:ring-offset-2 [&::-webkit-details-marker]:hidden"
                        >
                          <MoreHorizontal
                            size={18}
                            aria-hidden="true"
                          />
                        </summary>

                        <div
                          id={`${filterId}-actions-${item.id}`}
                          className="absolute right-0 z-20 mt-2 w-52 rounded-lg border border-border bg-surface p-1.5 text-left shadow-lg"
                        >

                          {/* Details */}

                          <Link
                            to={`/dashboard?productVersionId=${item.id}`}
                            onClick={() => setOpenActionMenuId(null)}
                            className="flex min-h-10 items-center gap-2 rounded-md px-3 text-sm text-foreground hover:bg-surface-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary-600"
                          >
                            <Eye size={15} aria-hidden="true" />
                            Details ansehen
                          </Link>

                          {/* Restore or archive */}

                          {isArchived ? (
                            <button
                              type="button"
                              disabled={isMutationRunning}
                              onClick={(event) =>
                                void handleMenuAction(
                                  item,
                                  "restore",
                                  event,
                                )
                              }
                              className="flex min-h-10 w-full items-center gap-2 rounded-md px-3 text-left text-sm text-foreground hover:bg-surface-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary-600 disabled:opacity-50"
                            >
                              <RotateCcw size={15} aria-hidden="true" />
                              Wiederherstellen
                            </button>
                          ) : (
                            <button
                              type="button"
                              disabled={isMutationRunning}
                              onClick={(event) =>
                                void handleMenuAction(
                                  item,
                                  "archive",
                                  event,
                                )
                              }
                              className="flex min-h-10 w-full items-center gap-2 rounded-md px-3 text-left text-sm text-foreground hover:bg-surface-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary-600 disabled:opacity-50"
                            >
                              <Archive size={15} aria-hidden="true" />
                              Archivieren
                            </button>
                          )}

                          {/* Delete */}

                          {isArchived && (
                            <button
                              type="button"
                              disabled={isMutationRunning}
                              onClick={(event) =>
                                void handleMenuAction(
                                  item,
                                  "delete",
                                  event,
                                )
                              }
                              className="flex min-h-10 w-full items-center gap-2 rounded-md px-3 text-left text-sm text-red-700 hover:bg-red-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-red-700 disabled:opacity-50"
                            >
                              <Trash2 size={15} aria-hidden="true" />
                              Löschen
                            </button>
                          )}

                        </div>

                      </details>

                    </td>

                  </tr>
                );
              })}

            </tbody>

          </table>

        </div>

        {/* Loading indicator when existing rows are being refreshed */}

        {isLoading && rows.length > 0 && (
          <p
            className="px-5 pt-2 text-xs text-muted"
            role="status"
          >
            Ergebnisse werden aktualisiert …
          </p>
        )}

        {/* Pagination */}

        <div className="border-t border-border px-4 py-3 sm:px-5">
          <Pagination
            currentPage={data?.page ?? query.page}
            totalItems={total}
            pageSize={data?.pageSize ?? query.pageSize}
            onPageChange={(page) => onQueryChange({ page })}
            onPageSizeChange={(pageSize) =>
              onQueryChange({
                pageSize,
                page: 1,
              })
            }
            ariaLabel="Produktversionsseiten"
            itemLabel="Produktversionen"
          />
        </div>

      </section>

    </main>
  );
}
