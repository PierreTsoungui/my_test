import {
  ArrowUpDown,
  Eye,
  Pencil,
  Trash2,
  ShieldAlert,
} from "lucide-react";

import {
  lifecycleColors,
  lifecycleLabels,
  severityColors,
  severityLabels,
  type Severity,
} from "../../config/statusConfig";

import type {
  MatrixComponent,
  MatrixProductVersion,
} from "../../types/productVersionMatrix";

interface ProductVersionMatrixTableProps {
  productVersions: MatrixProductVersion[];
  components: MatrixComponent[];
  selectedProductVersionId: string;
  onView: (component: MatrixComponent) => void;
  onEdit: (component: MatrixComponent) => void;
  onDelete: (component: MatrixComponent) => void;
  onSort?: (column: "name" | "category") => void;
}

const severityOrder = Object.keys(
  severityColors,
) as Severity[];

export function ProductVersionMatrixTable({
  productVersions,
  components,
  selectedProductVersionId,
  onView,
  onEdit,
  onDelete,
  onSort,
}: ProductVersionMatrixTableProps) {
  const visibleVersions =
    selectedProductVersionId === "ALL"
      ? productVersions
      : productVersions.filter(
          (version) => version.id === selectedProductVersionId,
        );

  return (
    <section className="overflow-hidden rounded-lg border border-slate-200 bg-white">
      <div className="border-b border-slate-200 px-4 py-3">
        <h2 className="font-semibold text-slate-900">
          Komponentenmatrix
        </h2>

        <p className="mt-1 text-xs text-slate-500">
          {components.length} Komponenten
          <span className="mx-2">•</span>
          {visibleVersions.length} Produktversionen
        </p>
      </div>

      {visibleVersions.length === 0 ? (
        <p className="p-8 text-center text-sm text-slate-500">
          Keine passende Produktversion gefunden.
        </p>
      ) : components.length === 0 ? (
        <p className="p-8 text-center text-sm text-slate-500">
          Keine Komponenten gefunden.
        </p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[850px] border-collapse text-left text-sm">
            <thead className="text-xs text-slate-700">
              <tr className="bg-slate-50">
                <th
                  scope="col"
                  rowSpan={2}
                  className="border-b border-r border-slate-200 px-4 py-3"
                >
                  <button
                    type="button"
                    onClick={() => onSort?.("name")}
                    className="inline-flex items-center gap-1 rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                  >
                    Komponente
                    <ArrowUpDown size={14} aria-hidden="true" />
                  </button>
                </th>

                <th
                  scope="col"
                  rowSpan={2}
                  className="border-b border-r border-slate-200 px-4 py-3"
                >
                  <button
                    type="button"
                    onClick={() => onSort?.("category")}
                    className="inline-flex items-center gap-1 rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                  >
                    Kategorie
                    <ArrowUpDown size={14} aria-hidden="true" />
                  </button>
                </th>

                <th
                  scope="colgroup"
                  colSpan={visibleVersions.length}
                  className="border-b border-slate-200 px-4 py-2 text-center font-semibold"
                >
                  Produktversionen
                </th>

                <th
                  scope="col"
                  rowSpan={2}
                  className="border-b border-l border-slate-200 px-3 py-3 text-center"
                >
                  Aktionen
                </th>
              </tr>

              <tr className="bg-slate-50">
                {visibleVersions.map((version) => (
                  <th
                    key={version.id}
                    scope="col"
                    className="min-w-44 border-b border-l border-slate-200 px-3 py-3"
                  >
                    <span className="block font-semibold text-slate-800">
                      {version.name}
                    </span>

                    {version.releaseDate && (
                      <span className="mt-1 block font-normal text-slate-500">
                        Veröffentlicht: {version.releaseDate}
                      </span>
                    )}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {components.map((component) => (
                <tr
                  key={component.id}
                  className="hover:bg-slate-50"
                >
                  <th
                    scope="row"
                    className="px-4 py-3 font-medium text-slate-900"
                  >
                    <span>{component.name}</span>
                  </th>

                  <td className="border-r border-slate-100 px-4 py-3 text-slate-600">
                    {component.category}
                  </td>

                  {visibleVersions.map((productVersion) => {
                    const data =
                      component.productVersions[productVersion.id];

                    return (
                      <td
                        key={productVersion.id}
                        className="border-l border-slate-100 px-3 py-3"
                      >
                        {data ? (
                          <div className="flex min-w-36 flex-col items-start gap-2">
                            <div className="flex flex-wrap items-center gap-2">
                            <span className="text-xs text-slate-500">
                              Version:{" "}
                              <span className="font-medium text-slate-700">
                                {data.version ?? "Unbekannt"}
                              </span>
                            </span>
                                 <span className="text-xs text-slate-500">
                                 EOL-Status:
                             </span>

                            <span
                              className="inline-flex rounded-full px-2.5 py-1 text-xs font-medium"
                              style={{
                                color: lifecycleColors[data.lifecycleStatus],
                                backgroundColor:
                                  `${lifecycleColors[data.lifecycleStatus]}18`,
                              }}
                            >
                              {lifecycleLabels[data.lifecycleStatus]}
                            </span>
                            </div>

                             <span className="text-xs text-slate-500">
                                    Supportende: {data.supportEndDate ?? "Unbekannt"}
                            </span>

                            {data.vulnerabilities === null ? (
                              <span className="text-xs text-slate-500"
                              title="Für diese Komponente liegen keine Schwachstellendaten vor."
                              >
                                 Keine Schwachstellendaten
                              </span>
                            ) : data.vulnerabilities.total === 0 ? (
                              <span className="text-xs text-slate-500">
                                Keine bekannten Schwachstellen
                              </span>
                            ) : (
                              <div className="flex flex-col items-start gap-1">
                                <span className="inline-flex items-center gap-1 text-xs font-medium text-red-700">
                                  <ShieldAlert
                                    size={13}
                                    aria-hidden="true"
                                  />
                                  {data.vulnerabilities.total}{" "}
                                  {data.vulnerabilities.total === 1
                                    ? "Schwachstelle"
                                    : "Schwachstellen"}
                                </span>

                                <div className="flex flex-wrap gap-1">
                                  {severityOrder.map((severity) => {
                                    const count =
                                      data.vulnerabilities!
                                        .bySeverity[severity] ?? 0;

                                    if (count === 0) return null;

                                    return (
                                      <span
                                        key={severity}
                                        className="rounded px-1.5 py-0.5 text-[11px]"
                                        style={{
                                          color: severityColors[severity],
                                          backgroundColor:
                                            `${severityColors[severity]}18`,
                                        }}
                                        title={severityLabels[severity]}
                                      >
                                        {severityLabels[severity]}: {count}
                                      </span>
                                    );
                                  })}
                                </div>
                              </div>
                            )}
                          </div>
                        ) : (
                          <span className="text-xs text-slate-400">
                            Nicht enthalten
                          </span>
                        )}
                      </td>
                    );
                  })}

                  <td className="border-l border-slate-100 px-2 py-3">
                    <div className="flex items-center justify-center gap-1">
                      <button
                        type="button"
                        onClick={() => onView(component)}
                        aria-label={`${component.name} ansehen`}
                        title="Ansehen"
                        className="rounded p-1.5 text-slate-600 hover:bg-blue-50 hover:text-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                      >
                        <Eye size={15} aria-hidden="true" />
                      </button>

                      <button
                        type="button"
                        onClick={() => onEdit(component)}
                        aria-label={`${component.name} bearbeiten`}
                        title="Bearbeiten"
                        className="rounded p-1.5 text-slate-600 hover:bg-blue-50 hover:text-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                      >
                        <Pencil size={15} aria-hidden="true" />
                      </button>

                      <button
                        type="button"
                        onClick={() => onDelete(component)}
                        aria-label={`${component.name} löschen`}
                        title="Löschen"
                        className="rounded p-1.5 text-slate-600 hover:bg-red-50 hover:text-red-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500"
                      >
                        <Trash2 size={15} aria-hidden="true" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}