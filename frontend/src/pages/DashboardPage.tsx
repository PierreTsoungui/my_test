
import { useCallback, useEffect, useMemo, useState } from "react";

import { DonutSummaryCard } from "../components/dashboard/DonutSummaryCard";
import { HighestSecurityRisks } from "../components/dashboard/HighestSecurityRisks";
import { UpcomingEolCard } from "../components/dashboard/UpcomingEolCard";
import { ProductVersionFilter } from "../components/dashboard/ProductVersionFilter";

import {
  getDashboardData,
  getProductVersions,
} from "../services/dashboardService";

import type {
  DashboardData,
  ProductVersion,
} from "../types/dashboard";

import type {
  SecurityRisk,
  UpcomingEolItem,
} from "../types/chart";

import { DEFAULT_PAGE_SIZE } from "../config/applicationConfig";
import { useApiData } from "../hooks/useApiData";

const SELECTED_VERSION_STORAGE_KEY = "selectedVersion";

function getStoredVersion(): string {
  const storedVersion = sessionStorage.getItem(
    SELECTED_VERSION_STORAGE_KEY,
  );

  if (storedVersion === null || storedVersion === "all") {
    return "all";
  }

  const id = Number(storedVersion);

  return Number.isInteger(id) && id > 0
    ? String(id)
    : "all";
}

export function DashboardPage() {
  const [selectedVersion, setSelectedVersion] =
    useState<string>(getStoredVersion);

  const [currentPage, setCurrentPage] = useState(1);
  const [eolPage, setEolPage] = useState(1);

  // Produktversionen unabhängig von den Dashboard-Daten laden.
  const fetchProductVersions = useCallback(
    (signal: AbortSignal) => getProductVersions(signal),
    [],
  );

  const {
    data: versions,
    error: versionsError,
    isLoading: isLoadingVersions,
    reload: reloadVersions,
  } = useApiData<ProductVersion[]>(fetchProductVersions);

  
  const fetchDashboardData = useCallback(
    (signal: AbortSignal) =>
      getDashboardData(selectedVersion, signal),
    [selectedVersion],
  );

  const {
    data: dashboardData,
    error: loadError,
    isLoading,
    reload: reloadDashboard,
  } = useApiData<DashboardData>(fetchDashboardData);

  // Auswahl für einen erneuten Seitenaufruf speichern.
  useEffect(() => {
    sessionStorage.setItem(
      SELECTED_VERSION_STORAGE_KEY,
      selectedVersion,
    );
  }, [selectedVersion]);

 
  useEffect(() => {
    if (versions === null) {
      return;
    }

    const selectedVersionExists =
      selectedVersion === "all" ||
      versions.some(
        (version) => String(version.id) === selectedVersion,
      );

    if (!selectedVersionExists) {
      setSelectedVersion("all");
      setCurrentPage(1);
      setEolPage(1);
    }
  }, [versions, selectedVersion]);

  // Beide API-Aufrufe erneut ausführen.
  const handleRetry = useCallback(() => {
    reloadVersions();
    reloadDashboard();
  }, [reloadVersions, reloadDashboard]);

  const handleVersionChange = useCallback((version: string) => {
    setSelectedVersion(version);
    setCurrentPage(1);
    setEolPage(1);
  }, []);

  
  const filteredEolItems = useMemo(
    () => dashboardData?.upcomingEol ?? [],
    [dashboardData],
  );

  // Sicherheitsrisiken paginieren.
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

  // EOL-Einträge paginieren.
  const eolItems = useMemo(() => {
    const startIndex = (eolPage - 1) * DEFAULT_PAGE_SIZE;

    return filteredEolItems.slice(
      startIndex,
      startIndex + DEFAULT_PAGE_SIZE,
    );
  }, [filteredEolItems, eolPage]);

  const handleViewRiskDetails = useCallback(
    (risk: SecurityRisk) => {
      console.info("Sicherheitsrisiko ausgewählt:", risk);
    },
    [],
  );

  const handleViewEolDetails = useCallback(
    (item: UpcomingEolItem) => {
      console.info("EOL-Eintrag ausgewählt:", item);
    },
    [],
  );

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

  const selectedVersionLabel =
    selectedVersion === "all"
      ? "Alle Versionen"
      : versions?.find(
          (version) => String(version.id) === selectedVersion,
        )?.label ?? `Produktversion ${selectedVersion}`;

  return (
    <main
      aria-busy={isLoading}
      className="mx-auto w-full max-w-screen-2xl space-y-6 p-4 sm:p-6 lg:p-8"
    >
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
            versions={versions ?? []}
            value={selectedVersion}
            onChange={handleVersionChange}
          />

          {isLoadingVersions && (
            <p
              role="status"
              className="mt-2 text-sm text-slate-600"
            >
              Produktversionen werden geladen …
            </p>
          )}

          {versionsError && (
            <p
              role="alert"
              className="mt-2 text-sm text-red-800"
            >
              Produktversionen konnten nicht geladen werden:{" "}
              {versionsError}
            </p>
          )}
        </div>
      </header>

      {isLoading && (
        <div
          role="status"
          aria-live="polite"
          className="rounded-xl border border-slate-200 bg-white p-6 text-sm text-slate-700"
        >
          Dashboard-Daten werden geladen …
        </div>
      )}

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

      {!isLoading && !loadError && dashboardData && (
        <>
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
                    {dashboardData.totalComponents.toLocaleString("de-DE")}
                  </p>

                  <p className="mt-2 break-words text-sm text-slate-600">
                    {selectedVersionLabel}
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
        </>
      )}
    </main>
  );
}
