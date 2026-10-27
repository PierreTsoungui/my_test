
import type { SecurityRisk } from "../../types/chart";
import { Pagination } from "../ui/Pagination";
import { severityLabels } from "../../config/statusConfig";
interface HighestSecurityRisksProps {
  risks: SecurityRisk[];
  totalItems: number;
  currentPage: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onViewDetails: (risk: SecurityRisk) => void;
  isLoading?: boolean;
  error?: string | null;
}

const severityStyles: Record<SecurityRisk["severity"], string> = {
  CRITICAL: "bg-red-100 text-red-800",
  HIGH: "bg-orange-100 text-orange-800",
  MEDIUM: "bg-amber-100 text-amber-800",
  LOW: "bg-green-100 text-green-800",
  UNKNOWN: "bg-gray-100 text-gray-800",
};



export function HighestSecurityRisks({
  risks,
  totalItems,
  currentPage,
  pageSize,
  onPageChange,
  onViewDetails,
  isLoading = false,
  error = null,
}: HighestSecurityRisksProps) {

 
  return (
    <section
      aria-labelledby="highest-security-risks-title"
      className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
    >
      <div className="mb-5">
        <h2
          id="highest-security-risks-title"
          className="text-base font-semibold text-slate-900"
        >
          Höchste Sicherheitsrisiken
        </h2>

        <p className="mt-1 text-sm text-slate-500">
          Komponenten mit den schwerwiegendsten Schwachstellen
        </p>
      </div>

      {error ? (
        <p role="alert" className="py-6 text-sm text-red-700">
          {error}
        </p>
      ) : isLoading ? (
        <p role="status" className="py-6 text-sm text-slate-500">
          Sicherheitsrisiken werden geladen ...
        </p>
      ) : risks.length === 0 ? (
        <p className="py-6 text-center text-sm text-slate-500">
          Keine Sicherheitsrisiken gefunden.
        </p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[620px] text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-xs uppercase tracking-wide text-slate-500">
                <th scope="col" className="pb-3 pr-4 font-medium">
                  Komponente
                </th>
                <th scope="col" className="pb-3 pr-4 font-medium">
                  Schwachstellen-ID
                </th>
                <th scope="col" className="pb-3 pr-4 font-medium">
                  Schweregrad
                </th>
                <th
                  scope="col"
                  className="pb-3 pr-4 text-right font-medium"
                >
                  CVSS-Score
                </th>
                <th scope="col" className="pb-3 text-right font-medium">
                  Aktion
                </th>
              </tr>
            </thead>

            <tbody>
              {risks.map((risk) => (
                <tr
                  key={risk.id}
                  className="border-b border-slate-100 last:border-0"
                >
                  <td className="py-4 pr-4 font-medium text-slate-900">
                    {risk.component}
                  </td>

                  <td className="py-4 pr-4 font-mono text-xs text-slate-600">
                    {risk.vulnerabilityId}
                  </td>

                  <td className="py-4 pr-4">
                    <span
                      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${severityStyles[risk.severity]}`}
                    >
                      {severityLabels[risk.severity]}
                    </span>
                  </td>

                  <td className="py-4 pr-4 text-right font-semibold tabular-nums text-slate-900">
                    {risk.score.toFixed(1)}
                  </td>

                  <td className="py-4 text-right">
                    <button
                      type="button"
                      onClick={() => onViewDetails(risk)}
                      aria-label={`Details zur Schwachstelle ${risk.vulnerabilityId} ansehen`}
                      className="whitespace-nowrap font-medium text-blue-600 hover:text-blue-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                    >
                      Details ansehen
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

   {!isLoading && !error && (
    <Pagination
        currentPage={currentPage}
        totalItems={totalItems}
        pageSize={pageSize}
        onPageChange={onPageChange}
        ariaLabel="Seitennavigation für Sicherheitsrisiken"
        itemLabel="Risiken"
    />
    )}
    </section>
  );
}
