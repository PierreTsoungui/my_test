
import { useId } from "react";

import type { ActionRequiredGroup } from "../../types/dashboard";
import { Pagination } from "../ui/Pagination";

import {
  lifecycleColors,
  lifecycleLabels,
  severityColors,
  severityLabels,
} from "../../config/statusConfig";

interface ActionRequiredComponentsProps {
  groups: ActionRequiredGroup[];
  totalItems: number;
  currentPage: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onViewDetails: (group: ActionRequiredGroup) => void;
  isLoading?: boolean;
  error?: string | null;
}

type SeverityKey =
  keyof ActionRequiredGroup["vulnerabilities"]["severityCounts"];

const severityOrder: SeverityKey[] = [
  "CRITICAL",
  "HIGH",
  "MEDIUM",
  "LOW",
  "UNKNOWN",
];

/**
 * Formatiert ein ISO-Datum als deutsches Kalenderdatum.
 * Vermeidet Verschiebungen durch UTC-Zeitzonen.
 */
function formatDate(value: string | null): string | null {
  if (!value) return null;

  const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(value);

  if (!match) return null;

  const [, year, month, day] = match;

  const date = new Date(
    Number(year),
    Number(month) - 1,
    Number(day)
  );

  // Ungültige Kalenderdaten erkennen.
  if (
    date.getFullYear() !== Number(year) ||
    date.getMonth() !== Number(month) - 1 ||
    date.getDate() !== Number(day)
  ) {
    return null;
  }

  return new Intl.DateTimeFormat("de-DE", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(date);
}

/**
 * Verwendet ausschließlich den Lifecycle-Status
 * und das EOL-Datum aus der Backend-Antwort.
 */
function getLifecycleDisplay(
  lifecycle: ActionRequiredGroup["lifecycle"]
) {
  const label = lifecycleLabels[lifecycle.status];
  const color = lifecycleColors[lifecycle.status];
  const formattedDate = formatDate(lifecycle.eolDate);

  let dateLabel = "Kein EOL-Datum bekannt";

  if (formattedDate) {
    dateLabel =
      lifecycle.status === "EOL"
        ? `EOL seit ${formattedDate}`
        : `EOL am ${formattedDate}`;
  }

  return {
    label,
    color,
    dateLabel,
  };
}

function getSeverityEntries(
  severityCounts: ActionRequiredGroup["vulnerabilities"]["severityCounts"]
) {
  return severityOrder
    .map((severity) => ({
      severity,
      count: severityCounts[severity] ?? 0,
    }))
    .filter((entry) => entry.count > 0);
}

function getCountLabel(
  count: number,
  singular: string,
  plural: string
): string {
  return `${count} ${count === 1 ? singular : plural}`;
}

/**
 * Ergänzende Information zur OSV-Prüfabdeckung.
 * Verhindert, dass ungeprüfte Komponenten fälschlich
 * als frei von Schwachstellen dargestellt werden.
 */
function getCheckSummary(
  group: ActionRequiredGroup
): string | null {
  const vulnerabilities = group.vulnerabilities;

  const checked = vulnerabilities.checkedComponentCount;
  const notQueryable = vulnerabilities.notQueryableComponentCount;
  const failed = vulnerabilities.failedComponentCount;

  if (
    checked === undefined &&
    notQueryable === undefined &&
    failed === undefined
  ) {
    return null;
  }

  const parts: string[] = [];

  if (checked) {
    parts.push(`${checked} geprüft`);
  }

  if (notQueryable) {
    parts.push(`${notQueryable} nicht prüfbar`);
  }

  if (failed) {
    parts.push(`${failed} Prüfung fehlgeschlagen`);
  }

  return parts.length > 0 ? parts.join(" · ") : null;
}

export function ActionRequiredComponents({
  groups,
  totalItems,
  currentPage,
  pageSize,
  onPageChange,
  onViewDetails,
  isLoading = false,
  error = null,
}: ActionRequiredComponentsProps) {
  const titleId = useId();
  const descriptionId = useId();

  return (
    <section
      aria-labelledby={titleId}
      aria-describedby={descriptionId}
      className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
    >
      {/* Überschrift */}
      <div className="mb-5">
        <h2
          id={titleId}
          className="text-base font-semibold text-slate-900"
        >
          Handlungsbedarf
        </h2>

        <p
          id={descriptionId}
          className="mt-1 text-sm text-slate-600"
        >
          Produkte mit erreichtem EOL, einem Support-Ende innerhalb
          der nächsten 12 Monate oder bekannten kritischen,
          hohen bzw. mittleren Schwachstellen.
        </p>
      </div>

      {/* Fehlerzustand */}
      {error ? (
        <p
          role="alert"
          className="py-6 text-sm text-red-700"
        >
          {error}
        </p>
      ) : isLoading ? (
        /* Ladezustand */
        <p
          role="status"
          aria-live="polite"
          className="py-6 text-sm text-slate-600"
        >
          Handlungsbedarf wird geladen ...
        </p>
      ) : groups.length === 0 ? (
        /* Leerer Zustand */
        <p className="py-6 text-center text-sm text-slate-600">
          Für die ausgewählte Produktversion wurden keine Einträge
          mit Handlungsbedarf gefunden.
        </p>
      ) : (
        /* Ergebnistabelle */
        <div
          role="region"
          aria-label="Tabelle mit Produkten und Lifecycle- sowie Schwachstelleninformationen"
          tabIndex={0}
          className="overflow-x-auto rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
        >
          <table className="w-full min-w-[780px] text-left text-sm">
            <caption className="sr-only">
              Nach EOL-Produkt und Release gruppierte Einträge.
              Die Tabelle zeigt zugeordnete Komponenten,
              Lifecycle-Status und bekannte Schwachstellen.
            </caption>

            <thead>
              <tr className="border-b border-slate-200 text-xs tracking-wide text-slate-600">
                <th
                  scope="col"
                  className="px-3 pb-3 font-semibold"
                >
                  Produkt &amp; Release
                </th>

                <th
                  scope="col"
                  className="px-3 pb-3 font-semibold"
                >
                  Zugeordnete Komponenten
                </th>

                <th
                  scope="col"
                  className="px-3 pb-3 font-semibold"
                >
                  Lifecycle
                </th>

                <th
                  scope="col"
                  className="px-3 pb-3 font-semibold"
                >
                  Schwachstellen
                </th>

                <th
                  scope="col"
                  className="px-3 pb-3 text-right font-semibold"
                >
                  Details
                </th>
              </tr>
            </thead>

            <tbody>
              {groups.map((group) => {
                const lifecycle = getLifecycleDisplay(group.lifecycle);

                const severityEntries = getSeverityEntries(
                  group.vulnerabilities.severityCounts
                );

                const checkSummary = getCheckSummary(group);

                const allComponentsChecked =
                  group.componentCount > 0 &&
                  group.vulnerabilities.checkedComponentCount ===
                    group.componentCount;

                return (
                  <tr
                    key={group.id}
                    className="border-b border-slate-100 last:border-0 hover:bg-slate-50"
                  >
                    {/* Produkt & Release */}
                    <th
                      scope="row"
                      className="px-3 py-4 text-left font-normal"
                    >
                      <div className="font-semibold text-slate-900">
                        {group.productName ?? "Keine EOL-Zuordnung"}
                      </div>

                      <div className="mt-1 text-xs font-normal text-slate-600">
                        {group.release
                          ? `Release ${group.release}`
                          : "Kein Release zugeordnet"}
                      </div>
                    </th>

                    {/* Zugeordnete Komponenten */}
                    <td className="px-3 py-4">
                      <span className="font-semibold tabular-nums text-slate-900">
                        {group.componentCount}
                      </span>

                      <span className="ml-1 text-xs text-slate-600">
                        {group.componentCount === 1
                          ? "Komponente"
                          : "Komponenten"}
                      </span>
                    </td>

                    {/* Lifecycle */}
                    <td className="px-3 py-4">
                      <div className="flex items-center gap-2">
                        <span
                          aria-hidden="true"
                          className="h-2.5 w-2.5 shrink-0 rounded-full"
                          style={{
                            backgroundColor: lifecycle.color,
                          }}
                        />

                        <span className="font-medium text-slate-900">
                          {lifecycle.label}
                        </span>
                      </div>

                      <p className="mt-1 text-xs text-slate-600">
                        {lifecycle.dateLabel}
                      </p>
                    </td>

                    {/* Schwachstellen */}
                    <td className="px-3 py-4">
                      <p className="font-semibold tabular-nums text-slate-900">
                        {getCountLabel(
                          group.vulnerabilities.totalCount,
                          "Schwachstelle",
                          "Schwachstellen"
                        )}
                      </p>

                      {severityEntries.length > 0 && (
                        <ul
                          aria-label="Verteilung nach Schweregrad"
                          className="mt-2 flex flex-wrap gap-1.5"
                        >
                          {severityEntries.map(
                            ({ severity, count }) => (
                              <li
                                key={severity}
                                className="inline-flex items-center gap-1.5 rounded-md border border-slate-200 bg-slate-50 px-2 py-1 text-xs text-slate-800"
                              >
                                <span
                                  aria-hidden="true"
                                  className="h-2 w-2 shrink-0 rounded-full"
                                  style={{
                                    backgroundColor:
                                      severityColors[severity],
                                  }}
                                />

                                <span>
                                  {count} {severityLabels[severity]}
                                </span>
                              </li>
                            )
                          )}
                        </ul>
                      )}

                      {group.vulnerabilities.totalCount > 0 ? (
                        <p className="mt-2 text-xs text-slate-600">
                          {group.vulnerabilities.affectedComponentCount} von{" "}
                          {group.componentCount} Komponenten betroffen
                        </p>
                      ) : allComponentsChecked ? (
                        <p className="mt-1 text-xs text-slate-600">
                          Keine bekannten Schwachstellen gefunden
                        </p>
                      ) : (
                        <p className="mt-1 text-xs text-slate-600">
                          Keine Schwachstellen gemeldet
                        </p>
                      )}

                      {checkSummary && (
                        <p className="mt-1 text-xs text-slate-500">
                          Prüfstatus: {checkSummary}
                        </p>
                      )}
                    </td>

                    {/* Detailaktion */}
                    <td className="px-3 py-4 text-right">
                      <button
                        type="button"
                        onClick={() => onViewDetails(group)}
                        aria-label={`Details zu ${group.productName ?? "nicht zugeordnetem Produkt"}, Release ${group.release ?? "unbekannt"}, ansehen`}
                        className="whitespace-nowrap rounded font-medium text-blue-700 hover:text-blue-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                      >
                        Details ansehen
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
      {!isLoading && !error && totalItems > 0 && (
        <div className="mt-4">
          <Pagination
            currentPage={currentPage}
            totalItems={totalItems}
            pageSize={pageSize}
            onPageChange={onPageChange}
            ariaLabel="Seitennavigation für Handlungsbedarf"
            itemLabel="Einträge"
          />
        </div>
      )}
    </section>
  );
}
