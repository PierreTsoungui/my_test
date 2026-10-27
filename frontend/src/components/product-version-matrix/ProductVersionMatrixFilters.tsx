import { useId, useState } from "react";

import {
  lifecycleLabels,
  severityLabels,
  type ComponentLifecycleStatus,
  type Severity,
} from "../../config/statusConfig";

export interface ProductVersionFilterOption {
  id: string;
  name: string;
}

export interface ComponentCategoryOption {
  id: string;
  name: string;
}

export type VulnerabilityFilter =
  | "ALL"
  | "WITH_VULNERABILITIES"
  | "WITHOUT_VULNERABILITIES"
  | Severity;

export interface ProductVersionMatrixFilterValues {
  search: string;
  productVersionId: string;
  categoryId: string;
  lifecycleStatus: ComponentLifecycleStatus | "ALL";
  vulnerabilityStatus: VulnerabilityFilter;
}

interface ProductVersionMatrixFiltersProps {
  values: ProductVersionMatrixFilterValues;
  productVersions: ProductVersionFilterOption[];
  categories: ComponentCategoryOption[];
  onChange: (values: ProductVersionMatrixFilterValues) => void;
  onReset: () => void;
}

const lifecycleStatuses = Object.keys(
  lifecycleLabels,
) as ComponentLifecycleStatus[];

const severityLevels = (
  Object.keys(severityLabels) as Severity[]
).filter((severity) => severity !== "UNKNOWN");

export default function ProductVersionMatrixFilters({
  values,
  productVersions,
  categories,
  onChange,
  onReset,
}: ProductVersionMatrixFiltersProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const id = useId();

  const searchId = `${id}-search`;
  const versionId = `${id}-version`;
  const categoryId = `${id}-category`;
  const lifecycleId = `${id}-lifecycle`;
  const vulnerabilitiesId = `${id}-vulnerabilities`;
  const filterPanelId = `${id}-filter-panel`;
  const headingId = `${id}-heading`;
  const activeFiltersHeadingId = `${id}-active-filters-heading`;

  function update(changes: Partial<ProductVersionMatrixFilterValues>) {
    onChange({ ...values, ...changes });
  }

  const activeFilters: {
    key: keyof ProductVersionMatrixFilterValues;
    label: string;
  }[] = [];

  if (values.search.trim()) {
    activeFilters.push({
      key: "search",
      label: `Suche: ${values.search.trim()}`,
    });
  }

  if (values.productVersionId !== "ALL") {
    const version = productVersions.find(
      (item) => item.id === values.productVersionId,
    );

    if (version) {
      activeFilters.push({
        key: "productVersionId",
        label: `Produktversion: ${version.name}`,
      });
    }
  }

  if (values.categoryId !== "ALL") {
    const category = categories.find(
      (item) => item.id === values.categoryId,
    );

    if (category) {
      activeFilters.push({
        key: "categoryId",
        label: `Kategorie: ${category.name}`,
      });
    }
  }

  if (values.lifecycleStatus !== "ALL") {
    activeFilters.push({
      key: "lifecycleStatus",
      label: `EOL-Status: ${lifecycleLabels[values.lifecycleStatus]}`,
    });
  }

  if (values.vulnerabilityStatus !== "ALL") {
    let label: string;

    switch (values.vulnerabilityStatus) {
      case "WITH_VULNERABILITIES":
        label = "Mit Schwachstellen";
        break;
      case "WITHOUT_VULNERABILITIES":
        label = "Ohne bekannte Schwachstellen";
        break;
      default:
        label = severityLabels[values.vulnerabilityStatus];
    }

    activeFilters.push({
      key: "vulnerabilityStatus",
      label: `Schwachstellen: ${label}`,
    });
  }

  const hasActiveFilters = activeFilters.length > 0;

  function removeFilter(key: keyof ProductVersionMatrixFilterValues) {
    switch (key) {
      case "search":
        update({ search: "" });
        break;
      case "productVersionId":
        update({ productVersionId: "ALL" });
        break;
      case "categoryId":
        update({ categoryId: "ALL" });
        break;
      case "lifecycleStatus":
        update({ lifecycleStatus: "ALL" });
        break;
      case "vulnerabilityStatus":
        update({ vulnerabilityStatus: "ALL" });
        break;
    }
  }

  return (
    <section
      aria-labelledby={headingId}
      className="rounded-lg border border-slate-200 bg-white"
    >
      <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3">
        <div className="flex items-center gap-2">
          <h2 id={headingId} className="font-semibold text-slate-900">
            Filter
          </h2>

          {hasActiveFilters && (
            <span className="rounded-full bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-700">
              {activeFilters.length} aktiv
            </span>
          )}
        </div>

        <button
          type="button"
          aria-expanded={isExpanded}
          aria-controls={filterPanelId}
          onClick={() => setIsExpanded((expanded) => !expanded)}
          className="inline-flex min-h-10 items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-blue-700 hover:bg-blue-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2"
        >
          {isExpanded ? "Filter ausblenden" : "Filter anzeigen"}
          <span aria-hidden="true">{isExpanded ? "▲" : "▼"}</span>
        </button>
      </div>

      {hasActiveFilters && (
        <div className="border-t border-slate-200 px-4 py-3">
          <h3
            id={activeFiltersHeadingId}
            className="mb-2 text-sm font-semibold text-slate-900"
          >
            Aktive Filter
          </h3>

          <ul
            aria-labelledby={activeFiltersHeadingId}
            className="flex flex-wrap gap-2"
          >
            {activeFilters.map((filter) => (
              <li key={filter.key}>
                <button
                  type="button"
                  onClick={() => removeFilter(filter.key)}
                  aria-label={`${filter.label} entfernen`}
                  className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-3 py-1.5 text-sm text-blue-900 hover:bg-blue-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2"
                >
                  <span>{filter.label}</span>
                  <span aria-hidden="true">×</span>
                </button>
              </li>
            ))}
          </ul>

          <button
            type="button"
            onClick={onReset}
            className="mt-3 rounded-md px-3 py-2 text-sm font-medium text-blue-700 hover:bg-blue-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2"
          >
            Alle Filter zurücksetzen
          </button>
        </div>
      )}

      <div
        id={filterPanelId}
        className={`border-t border-slate-200 p-4 ${
          isExpanded ? "block" : "hidden"
        }`}
      >
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          <div className="min-w-0">
            <label
              htmlFor={searchId}
              className="mb-1.5 block text-xs font-medium text-slate-600"
            >
              Komponente suchen
            </label>

            <input
              id={searchId}
              type="search"
              value={values.search}
              onChange={(event) => update({ search: event.target.value })}
              placeholder="Name eingeben"
              className="h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm text-slate-700 focus:border-blue-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
            />
          </div>

          <div className="min-w-0">
            <label
              htmlFor={versionId}
              className="mb-1.5 block text-xs font-medium text-slate-600"
            >
              Produktversion
            </label>

            <select
              id={versionId}
              value={values.productVersionId}
              onChange={(event) =>
                update({ productVersionId: event.target.value })
              }
              className="h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm text-slate-700 focus:border-blue-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
            >
              <option value="ALL">Alle Produktversionen</option>
              {productVersions.map((version) => (
                <option key={version.id} value={version.id}>
                  {version.name}
                </option>
              ))}
            </select>
          </div>

          <div className="min-w-0">
            <label
              htmlFor={categoryId}
              className="mb-1.5 block text-xs font-medium text-slate-600"
            >
              Kategorie
            </label>

            <select
              id={categoryId}
              value={values.categoryId}
              onChange={(event) =>
                update({ categoryId: event.target.value })
              }
              className="h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm text-slate-700 focus:border-blue-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
            >
              <option value="ALL">Alle Kategorien</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>

          <div className="min-w-0">
            <label
              htmlFor={lifecycleId}
              className="mb-1.5 block text-xs font-medium text-slate-600"
            >
              EOL-Status
            </label>

            <select
              id={lifecycleId}
              value={values.lifecycleStatus}
              onChange={(event) => {
                const value = event.target.value;

                if (
                  value === "ALL" ||
                  lifecycleStatuses.some((status) => status === value)
                ) {
                  update({
                    lifecycleStatus:
                      value as ComponentLifecycleStatus | "ALL",
                  });
                }
              }}
              className="h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm text-slate-700 focus:border-blue-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
            >
              <option value="ALL">Alle Status</option>
              {lifecycleStatuses.map((status) => (
                <option key={status} value={status}>
                  {lifecycleLabels[status]}
                </option>
              ))}
            </select>
          </div>

          <div className="min-w-0">
            <label
              htmlFor={vulnerabilitiesId}
              className="mb-1.5 block text-xs font-medium text-slate-600"
            >
              Schwachstellen
            </label>

            <select
              id={vulnerabilitiesId}
              value={values.vulnerabilityStatus}
              onChange={(event) => {
                const value = event.target.value;

                if (
                  value === "ALL" ||
                  value === "WITH_VULNERABILITIES" ||
                  value === "WITHOUT_VULNERABILITIES" ||
                  (severityLevels as string[]).includes(value)
                ) {
                  update({ vulnerabilityStatus: value as VulnerabilityFilter });
                }
              }}
              className="h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm text-slate-700 focus:border-blue-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
            >
              <option value="ALL">Alle</option>
              <option value="WITH_VULNERABILITIES">
                Mit Schwachstellen
              </option>
              <option value="WITHOUT_VULNERABILITIES">
                Keine bekannten Schwachstellen
              </option>
              {severityLevels.map((severity) => (
                <option key={severity} value={severity}>
                  Schweregrad: {severityLabels[severity]}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="mt-4 flex justify-end border-t border-slate-200 pt-3">
          <button
            type="button"
            onClick={onReset}
            disabled={!hasActiveFilters}
            className="rounded-md px-3 py-2 text-sm font-medium text-blue-700 hover:bg-blue-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:text-slate-400"
          >
            Filter zurücksetzen
          </button>
        </div>
      </div>
    </section>
  );
}