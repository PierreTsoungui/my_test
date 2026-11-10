import { useId } from "react";
import { ChevronRight, Database, Package, ShieldCheck } from "lucide-react";

import type { ActionRequiredGroup } from "../../types/dashboard";
import { Pagination } from "../ui/Pagination";

import {
  lifecycleColors,
  lifecycleLabels,
  severityColors,
  severityLabels,
} from "../../config/statusConfig";

// ============================================================
// Props
// ============================================================

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

// ============================================================
// Helper – exportiert für Unit-Tests
// ============================================================

type SeverityKey =
  keyof ActionRequiredGroup["vulnerabilities"]["severityCounts"];

const severityOrder: SeverityKey[] = [
  "CRITICAL",
  "HIGH",
  "MEDIUM",
  "LOW",
  "UNKNOWN",
];
export function formatDate(
  value: string | null,
  locale: string = "de-DE",
): string | null {
  if (!value) return null;

  const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(value);
  if (!match) return null;

  const [, year, month, day] = match;

  const date = new Date(
    Number(year),
    Number(month) - 1,
    Number(day),
  );

  // Ungültige Kalenderdaten abfangen (z. B. 2025-02-30)
  if (
    date.getFullYear() !== Number(year) ||
    date.getMonth() !== Number(month) - 1 ||
    date.getDate() !== Number(day)
  ) {
    return null;
  }

  return new Intl.DateTimeFormat(locale, {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(date);
}

export function getLifecycleDisplay(
  lifecycle: ActionRequiredGroup["lifecycle"],
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

  return { label, color, dateLabel };
}

export function getSeverityEntries(
  severityCounts: ActionRequiredGroup["vulnerabilities"]["severityCounts"],
) {
  return severityOrder
    .map((severity) => ({
      severity,
      count: severityCounts[severity] ?? 0,
    }))
    .filter((entry) => entry.count > 0);
}

export function getCountLabel(
  count: number,
  singular: string,
  plural: string,
): string {
  return `${count} ${count === 1 ? singular : plural}`;
}

export function getCheckSummary(
  group: ActionRequiredGroup,
): string | null {
  const { checkedComponentCount, notQueryableComponentCount, failedComponentCount } =
    group.vulnerabilities;

  if (
    checkedComponentCount === undefined &&
    notQueryableComponentCount === undefined &&
    failedComponentCount === undefined
  ) {
    return null;
  }

  const parts: string[] = [];

  if (checkedComponentCount) {
    parts.push(`${checkedComponentCount} geprüft`);
  }
  if (notQueryableComponentCount) {
    parts.push(`${notQueryableComponentCount} nicht prüfbar`);
  }
  if (failedComponentCount) {
    parts.push(`${failedComponentCount} fehlgeschlagen`);
  }

  return parts.length > 0 ? parts.join(" · ") : null;
}

export function getGroupKey(group: ActionRequiredGroup): string {
  return group.kind === "PRODUCT"
    ? `product:${group.productId}:${group.releaseLineId}`
    : `component:${group.componentId}`;
}

interface GroupDisplay {
  Icon: typeof Database;
  primary: string;
  subtitle: string;
  unmapped: boolean;
}

export function getGroupDisplay(
  group: ActionRequiredGroup,
): GroupDisplay {
  if (group.kind === "PRODUCT") {
    const countLabel = getCountLabel(
      group.componentCount,
      "Komponente",
      "Komponenten",
    );
    return {
      Icon: Database,
      primary: group.productName,
      subtitle: `Release ${group.release} · ${countLabel}`,
      unmapped: false,
    };
  }

  return {
    Icon: Package,
    primary: group.componentName,
    subtitle: `Version ${group.version} · nicht zugeordnet`,
    unmapped: true,
  };
}

// ============================================================
// Komponente
// ============================================================

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
      className="rounded-xl border border-slate-200 bg-white shadow-sm"
    >
      {/* Kopf */}
      <div className="border-b border-slate-100 px-5 py-4">
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
          Produkte mit EOL ≤ 12 Monaten oder kritischen/hohen
          Schwachstellen.
        </p>
      </div>

      {/* Inhalt */}
      {error ? (
        <div className="px-5 py-6">
          <p role="alert" className="text-sm text-red-700">
            {error}
          </p>
        </div>
      ) : isLoading ? (
        <LoadingSkeleton />
      ) : groups.length === 0 ? (
        <EmptyState />
      ) : (
        <div
          role="region"
          aria-label="Handlungsbedarf-Tabelle"
          tabIndex={0}
          className="overflow-x-auto focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-blue-500"
        >
          <table className="w-full min-w-[640px] text-left text-sm">
            <caption className="sr-only">
              Handlungsbedarf: Produkte und Komponenten mit EOL oder
              Schwachstellen, sortiert nach Risiko.
            </caption>

            <thead>
              <tr className="border-b border-slate-100 text-xs uppercase tracking-wide text-slate-500">
                <th scope="col" className="px-5 py-3 font-semibold">
                  Produkt / Komponente
                </th>
                <th scope="col" className="px-4 py-3 font-semibold">
                  Lifecycle
                </th>
                <th scope="col" className="px-4 py-3 font-semibold">
                  Schwachstellen
                </th>
                <th scope="col" className="w-10 px-2 py-3">
                  <span className="sr-only">Details ansehen</span>
                </th>
              </tr>
            </thead>

            <tbody>
              {groups.map((group) => {
                const display = getGroupDisplay(group);
                const lifecycle = getLifecycleDisplay(group.lifecycle);
                const severityEntries = getSeverityEntries(
                  group.vulnerabilities.severityCounts,
                );
                const checkSummary = getCheckSummary(group);

                const allComponentsChecked =
                  group.kind === "PRODUCT" &&
                  group.componentCount > 0 &&
                  group.vulnerabilities.checkedComponentCount ===
                    group.componentCount;

                const ariaParts = [
                  display.primary,
                  display.subtitle,
                  `Lifecycle: ${lifecycle.label}${
                    lifecycle.dateLabel ? `, ${lifecycle.dateLabel}` : ""
                  }`,
                  group.vulnerabilities.totalCount > 0
                    ? getCountLabel(
                        group.vulnerabilities.totalCount,
                        "Schwachstelle",
                        "Schwachstellen",
                      )
                    : "keine bekannten Schwachstellen",
                  "Details ansehen",
                ];

                return (
                  <tr
                    key={getGroupKey(group)}
                    onClick={() => onViewDetails(group)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter" || event.key === " ") {
                        event.preventDefault();
                        onViewDetails(group);
                      }
                    }}
                    tabIndex={0}
                    aria-label={ariaParts.join(", ")}
                    className="group cursor-pointer border-b border-slate-100 last:border-0 transition-colors hover:bg-slate-50 focus-visible:bg-blue-50/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-blue-500"
                  >
                    {/* Spalte 1: Name + Untertitel + Versionen */}
                    <th
                      scope="row"
                      className="px-5 py-4 text-left font-normal align-top"
                    >
                      <div className="flex items-start gap-3">
                        <span
                          className="mt-0.5 inline-flex size-8 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-600 group-hover:bg-white"
                          aria-hidden="true"
                        >
                          <display.Icon className="size-4" />
                        </span>

                        <div className="min-w-0">
                          <div className="truncate font-semibold text-slate-900">
                            {display.primary}
                          </div>

                          <div className="mt-0.5 text-xs text-slate-500">
                            {display.subtitle}
                          </div>

                          {group.productVersion.length > 0 && (
                            <div className="mt-1.5 flex flex-wrap gap-1">
                              {group.productVersion.map((v) => (
                                <span
                                  key={v}
                                  className="inline-flex items-center rounded bg-slate-100 px-1.5 py-0.5 text-[11px] font-medium tabular-nums text-slate-700"
                                >
                                  {v}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </th>

                    {/* Spalte 2: Lifecycle */}
                    <td className="px-4 py-4 align-top">
                      <div className="flex items-center gap-2">
                        <span
                          aria-hidden="true"
                          className="size-2 shrink-0 rounded-full"
                          style={{ backgroundColor: lifecycle.color }}
                        />
                        <span className="font-medium text-slate-900">
                          {lifecycle.label}
                        </span>
                      </div>
                      <p className="mt-1 text-xs text-slate-500">
                        {lifecycle.dateLabel}
                      </p>
                    </td>

                    {/* Spalte 3: Schwachstellen */}
                    <td className="px-4 py-4 align-top">
                      <p className="font-medium tabular-nums text-slate-900">
                        {getCountLabel(
                          group.vulnerabilities.totalCount,
                          "Schwachstelle",
                          "Schwachstellen",
                        )}
                      </p>

                      {severityEntries.length > 0 && (
                        <ul
                          aria-label="Verteilung nach Schweregrad"
                          className="mt-1.5 flex flex-wrap gap-1"
                        >
                          {severityEntries.map(({ severity, count }) => (
                            <li
                              key={severity}
                              className="inline-flex items-center gap-1 rounded-md bg-slate-50 px-1.5 py-0.5 text-[11px] text-slate-700 ring-1 ring-inset ring-slate-200"
                            >
                              <span
                                aria-hidden="true"
                                className="size-1.5 shrink-0 rounded-full"
                                style={{
                                  backgroundColor: severityColors[severity],
                                }}
                              />
                              {count} {severityLabels[severity]}
                            </li>
                          ))}
                        </ul>
                      )}

                      {group.vulnerabilities.totalCount > 0 &&
                        group.kind === "PRODUCT" && (
                          <p className="mt-1.5 text-xs text-slate-500">
                            {group.vulnerabilities.affectedComponentCount} von{" "}
                            {group.componentCount} Komponenten betroffen
                          </p>
                        )}

                      {group.vulnerabilities.totalCount === 0 &&
                        allComponentsChecked && (
                          <p className="mt-1.5 text-xs text-slate-500">
                            Keine bekannten Schwachstellen
                          </p>
                        )}

                      {checkSummary && (
                        <p className="mt-1 text-[11px] text-slate-400">
                          Prüfstatus: {checkSummary}
                        </p>
                      )}
                    </td>

                    {/* Spalte 4: Chevron */}
                    <td className="w-10 px-2 py-4 align-middle text-right">
                      <ChevronRight
                        className="ml-auto size-4 text-slate-300 transition-colors group-hover:text-slate-500 group-focus-visible:text-blue-600"
                        aria-hidden="true"
                      />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
      {!isLoading && !error && totalItems > pageSize && (
        <div className="border-t border-slate-100 px-5 pb-4">
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

// ============================================================
// Zustände
// ============================================================

function LoadingSkeleton() {
  return (
    <div className="space-y-3 px-5 py-4" role="status" aria-live="polite">
      <span className="sr-only">Handlungsbedarf wird geladen …</span>

      {Array.from({ length: 3 }).map((_, i) => (
        <div
          key={i}
          className="flex animate-pulse items-start gap-3 py-2"
          aria-hidden="true"
        >
          <div className="mt-0.5 size-8 shrink-0 rounded-lg bg-slate-100" />
          <div className="flex-1 space-y-2">
            <div className="h-3 w-1/3 rounded bg-slate-100" />
            <div className="h-2 w-1/4 rounded bg-slate-100" />
          </div>
          <div className="h-3 w-20 rounded bg-slate-100" />
          <div className="h-3 w-24 rounded bg-slate-100" />
        </div>
      ))}
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center gap-3 px-5 py-10 text-center">
      <span
        className="inline-flex size-12 items-center justify-center rounded-full bg-green-50 text-green-600"
        aria-hidden="true"
      >
        <ShieldCheck className="size-6" />
      </span>
      <div>
        <p className="text-sm font-medium text-slate-900">
          Kein Handlungsbedarf
        </p>
        <p className="mt-1 text-xs text-slate-500">
          Für die ausgewählte Produktversion gibt es keine Produkte mit
          EOL oder Schwachstellen.
        </p>
      </div>
    </div>
  );
}