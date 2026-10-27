
import { useCallback, useEffect, useMemo, useState } from "react";

import { DonutSummaryCard } from "../components/dashboard/DonutSummaryCard";
import { HighestSecurityRisks } from "../components/dashboard/HighestSecurityRisks";
import { UpcomingEolCard } from "../components/dashboard/UpcomingEolCard";
import { ProductVersionFilter } from "../components/filters/ProductVersionFilter";

import { getDashboardData } from "../services/dashboardService";

import type { DashboardData } from "../services/dashboardService";
import type {
  SecurityRisk,
  UpcomingEolItem,
} from "../types/chart";

import { DEFAULT_PAGE_SIZE } from "../config/applicationConfig";

export function DashboardPage() {
  const [dashboardData, setDashboardData] =
    useState<DashboardData | null>(null);

  const [loadError, setLoadError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [retryCount, setRetryCount] = useState(0);

  const [selectedVersion, setSelectedVersion] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [eolPage, setEolPage] = useState(1);

  const [componentCount, setComponentCount] = useState(0);

  // Dashboard-Daten laden
  useEffect(() => {
    let isCurrent = true;

    async function loadDashboard() {
      setIsLoading(true);
      setLoadError(null);

      try {
        const data = await getDashboardData(selectedVersion);

        if (isCurrent) {
          setDashboardData(data);
          setComponentCount(data.totalComponents);
        }
      } catch {
        if (isCurrent) {
          setLoadError(
            "Die Dashboard-Daten konnten nicht geladen werden. Bitte versuche es erneut.",
          );
        }
      } finally {
        if (isCurrent) {
          setIsLoading(false);
        }
      }
    }

    void loadDashboard();

    return () => {
      isCurrent = false;
    };
  }, [retryCount, selectedVersion]);

  // Erneutes Laden bei einem Fehler
  const handleRetry = useCallback(() => {
    setRetryCount((count) => count + 1);
  }, []);

  // Verfügbare Filteroptionen
  const versions = useMemo(() => {
    if (!dashboardData) {
      return [];
    }

    return Array.from(
      new Set(
        dashboardData.upcomingEol.map(
          (item) => `${item.component} ${item.version}`,
        ),
      ),
    ).sort((a, b) => a.localeCompare(b));
  }, [dashboardData]);

  // EOL-Einträge nach Produktversion filtern
  const filteredEolItems = useMemo(() => {
    if (!dashboardData) {
      return [];
    }

    if (selectedVersion === "all") {
      return dashboardData.upcomingEol;
    }

    return dashboardData.upcomingEol.filter(
      (item) =>
        `${item.component} ${item.version}` === selectedVersion,
    );
  }, [dashboardData, selectedVersion]);

  const handleVersionChange = useCallback((version: string) => {
    setSelectedVersion(version);
    setEolPage(1);
    setCurrentPage(1);
  }, []);

  // Sicherheitsrisiken paginieren
  const risks = useMemo(() => {
    if (!dashboardData) {
      return [];
    }

    const startIndex = (currentPage - 1) * DEFAULT_PAGE_SIZE;

    return dashboardData.securityRisks.slice(
      startIndex,
      startIndex + DEFAULT_PAGE_SIZE,
    );
  }, [dashboardData, currentPage]);

  // EOL-Einträge paginieren
  const eolItems = useMemo(() => {
    const startIndex = (eolPage - 1) * DEFAULT_PAGE_SIZE;

    return filteredEolItems.slice(
      startIndex,
      startIndex + DEFAULT_PAGE_SIZE,
    );
  }, [filteredEolItems, eolPage]);

  // Details der ausgewählten Sicherheitsrisiken
  const handleViewRiskDetails = useCallback(
    (risk: SecurityRisk) => {
      console.info("Sicherheitsrisiko ausgewählt:", risk);
    },
    [],
  );

  // Details der ausgewählten EOL-Einträge
  const handleViewEolDetails = useCallback(
    (item: UpcomingEolItem) => {
      console.info("EOL-Eintrag ausgewählt:", item);
    },
    [],
  );

  // Summen für die Donut-Diagramme
  const lifecycleTotal = useMemo(
    () =>
      dashboardData?.lifecycle.reduce(
        (sum, segment) => sum + segment.value,
        0,
      ) ?? 0,
    [dashboardData],
  );

  const vulnerabilityTotal = useMemo(
    () =>
      dashboardData?.vulnerabilities.reduce(
        (sum, segment) => sum + segment.value,
        0,
      ) ?? 0,
    [dashboardData],
  );

  return (
    <main className="mx-auto w-full max-w-screen-2xl space-y-6 p-4 sm:p-6 lg:p-8">
      {/* Seitenüberschrift und Produktversionsfilter */}
      <header className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <h1 className="text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">
            Software-Lifecycle und Sicherheitsstatus im Überblick
          </h1>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-700">
            Überwache den Lebenszyklus deiner Software-Komponenten,
            bevorstehende Support-Enden und bekannte Schwachstellen.
          </p>
        </div>

        <div className="w-full shrink-0 sm:max-w-xs">
          <ProductVersionFilter
            versions={versions}
            value={selectedVersion}
            onChange={handleVersionChange}
          />
        </div>
      </header>

      {/* Ladezustand */}
      {isLoading && (
        <div
          role="status"
          aria-live="polite"
          className="rounded-xl border border-slate-200 bg-white p-6 text-sm text-slate-700"
        >
          Dashboard-Daten werden geladen …
        </div>
      )}

      {/* Fehlerzustand */}
      {!isLoading && loadError && (
        <div
          role="alert"
          className="rounded-xl border border-red-300 bg-red-50 p-5"
        >
          <p className="text-sm font-medium text-red-900">
            {loadError}
          </p>

          <button
            type="button"
            onClick={handleRetry}
            className="mt-3 rounded-md bg-red-800 px-4 py-2 text-sm font-medium text-white hover:bg-red-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-800 focus-visible:ring-offset-2"
          >
            Erneut versuchen
          </button>
        </div>
      )}

      {/* Dashboard-Inhalte */}
      {!isLoading && !loadError && dashboardData && (
        <>
          {/* KPI: Komponenten */}
          <section
            aria-label="Komponentenkennzahl"
            className="grid min-w-0 grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4"
          >
            <article
              aria-labelledby="component-count-title"
              className="min-w-0 rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <h2
                    id="component-count-title"
                    className="text-sm font-medium text-slate-700"
                  >
                    Komponenten
                  </h2>

                  <p
                    className="mt-3 break-words text-3xl font-bold tracking-tight text-slate-950"
                    aria-live="polite"
                    aria-atomic="true"
                  >
                    {componentCount.toLocaleString("de-DE")}
                  </p>

                  <p className="mt-2 break-words text-sm text-slate-600">
                    {selectedVersion === "all"
                      ? "Alle Versionen"
                      : selectedVersion}
                  </p>
                </div>

                <div
                  className="shrink-0 rounded-lg bg-slate-100 p-3 text-slate-700"
                  aria-hidden="true"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-6 w-6"
                  >
                    <path d="m12 3 8 4.5v9L12 21l-8-4.5v-9L12 3Z" />
                    <path d="m4.3 7.7 7.7 4.5 7.7-4.5" />
                    <path d="M12 21v-8.8" />
                  </svg>
                </div>
              </div>
            </article>
          </section>

          {/* Lifecycle- und Schwachstellenübersicht */}
          <section
            aria-label="Lifecycle- und Schwachstellenübersicht"
            className="grid min-w-0 grid-cols-1 items-stretch gap-6 xl:grid-cols-2"
          >
            <div className="min-w-0">
              <DonutSummaryCard
                title="Lifecycle-Verteilung"
                data={dashboardData.lifecycle}
                centerLabel="Versionen"
                total={lifecycleTotal}
              />
            </div>

            <div className="min-w-0">
              <DonutSummaryCard
                title="Offene Schwachstellen nach Schweregrad"
                data={dashboardData.vulnerabilities}
                centerLabel="Schwachstellen"
                total={vulnerabilityTotal}
              />
            </div>
          </section>

          {/* Sicherheitsrisiken und bevorstehende Support-Enden */}
          <section
            aria-label="Sicherheitsrisiken und bevorstehende Support-Enden"
            className="grid min-w-0 grid-cols-1 items-start gap-6 xl:grid-cols-2"
          >
            <div className="min-w-0">
              <HighestSecurityRisks
                risks={risks}
                totalItems={dashboardData.securityRisks.length}
                currentPage={currentPage}
                pageSize={DEFAULT_PAGE_SIZE}
                onPageChange={setCurrentPage}
                onViewDetails={handleViewRiskDetails}
              />
            </div>

            <div className="min-w-0">
              <UpcomingEolCard
                items={eolItems}
                totalItems={filteredEolItems.length}
                currentPage={eolPage}
                pageSize={DEFAULT_PAGE_SIZE}
                onPageChange={setEolPage}
                onViewDetails={handleViewEolDetails}
              />
            </div>
          </section>

          {/* Hinweis zur Filterwirkung */}
          {selectedVersion !== "all" && (
            <p
              role="note"
              className="text-sm leading-6 text-slate-700"
            >
              Die EOL-Liste und die Komponentenkennzahl beziehen sich
              auf die ausgewählte Version. Die Lifecycle-Verteilung,
              die Schwachstellenübersicht und die Sicherheitsrisiken
              zeigen weiterhin die zusammengefassten Dashboard-Daten.
            </p>
          )}
        </>
      )}
    </main>
  );
}
