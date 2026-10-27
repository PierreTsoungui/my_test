
import { useEffect, useMemo, useState } from "react";
import { PackagePlus, X } from "lucide-react";

import ProductVersionMatrixFilters, {
  type ProductVersionMatrixFilterValues,
  type VulnerabilityFilter,
} from "../components/product-version-matrix/ProductVersionMatrixFilters";

import {
  AddProductVersionModal,
  type CreateProductVersionPayload,
} from "../components/product-version-matrix/AddProductVersionModal";

import { ProductVersionMatrixTable } from "../components/product-version-matrix/ProductVersionMatrixTable";
import { Pagination } from "../components/ui/Pagination";
import { getProductVersionMatrix } from "../services/productVersionMatrixService";

import type {
  ComponentLifecycleStatus,
  Severity,
} from "../config/statusConfig";

import type { MatrixComponent, MatrixProductVersion } from "../types/productVersionMatrix";
import { DEFAULT_PAGE_SIZE } from "../config/applicationConfig";
interface MatrixFilters {
  search: string;
  productVersionId: string;
  category: string;
  lifecycle: "ALL" | ComponentLifecycleStatus;
  vulnerability: VulnerabilityFilter;
}


const defaultFilters: MatrixFilters = {
  search: "",
  productVersionId: "ALL",
  category: "ALL",
  lifecycle: "ALL",
  vulnerability: "ALL",
};

export function ProductVersionMatrixPage() {
  const [filters, setFilters] = useState<MatrixFilters>({
    ...defaultFilters,
  });

  const [currentPage, setCurrentPage] = useState(1);
  const [isAddProductVersionOpen, setIsAddProductVersionOpen] =
    useState(false);

  const [sortColumn, setSortColumn] = useState<"name" | "category">("name");
  const [sortAscending, setSortAscending] = useState(true);

  const [notice, setNotice] = useState("");

  const [components, setComponents] = useState<MatrixComponent[]>([]);
  const [productVersions, setProductVersions] = useState<
    MatrixProductVersion[]
    >([]);

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isActive = true;

    async function loadMatrix() {
      try {
        setIsLoading(true);
        setError(null);

        const data = await getProductVersionMatrix();

        if (!isActive) return;

        setComponents(data.components);
        setProductVersions(data.productVersions);
      } catch {
        if (!isActive) return;

        setError(
          "Die Komponentenmatrix konnte nicht geladen werden. Bitte versuche es erneut.",
        );
      } finally {
        if (isActive) {
          setIsLoading(false);
        }
      }
    }

    void loadMatrix();

    return () => {
      isActive = false;
    };
  }, []);

  const categories = useMemo(
    () =>
      [...new Set(components.map((component) => component.category))].sort(
        (a, b) => a.localeCompare(b, "de"),
      ),
    [components],
  );

  const visibleComponents = useMemo(() => {
    const result = components.filter((component) => {
      const search = filters.search.trim().toLocaleLowerCase("de");

      if (
        search &&
        !component.name.toLocaleLowerCase("de").includes(search) &&
        !component.category.toLocaleLowerCase("de").includes(search)
      ) {
        return false;
      }

      if (
        filters.category !== "ALL" &&
        component.category !== filters.category
      ) {
        return false;
      }

      const relevantEntries = Object.entries(component.productVersions).filter(
        ([versionId]) =>
          filters.productVersionId === "ALL" ||
          versionId === filters.productVersionId,
      );

      if (relevantEntries.length === 0) {
        return false;
      }

      if (filters.lifecycle !== "ALL") {
        const matchesLifecycle = relevantEntries.some(
          ([, data]) => data.lifecycleStatus === filters.lifecycle,
        );

        if (!matchesLifecycle) {
          return false;
        }
      }

      if (filters.vulnerability !== "ALL") {
        const matchesVulnerability = relevantEntries.some(([, data]) => {
          const vulnerabilities = data.vulnerabilities;

          if (filters.vulnerability === "WITH_VULNERABILITIES") {
            return vulnerabilities !== null && vulnerabilities.total > 0;
          }

          if (filters.vulnerability === "WITHOUT_VULNERABILITIES") {
            return vulnerabilities !== null && vulnerabilities.total === 0;
          }

          if (vulnerabilities === null) {
            return false;
          }

          return (
            (vulnerabilities.bySeverity[
              filters.vulnerability as Severity
            ] ?? 0) > 0
          );
        });

        if (!matchesVulnerability) {
          return false;
        }
      }

      return true;
    });

    return [...result].sort((a, b) => {
      const comparison = a[sortColumn].localeCompare(b[sortColumn], "de", {
        sensitivity: "base",
      });

      return sortAscending ? comparison : -comparison;
    });
  }, [components, filters, sortColumn, sortAscending]);

  function resetFilters() {
    setFilters({ ...defaultFilters });
    setCurrentPage(1);
  }

  function handleSort(column: "name" | "category") {
    if (sortColumn === column) {
      setSortAscending((current) => !current);
    } else {
      setSortColumn(column);
      setSortAscending(true);
    }

    setCurrentPage(1);
  }

  function simulateAction(
    action: "Ansehen" | "Bearbeiten" | "Löschen",
    component: MatrixComponent,
  ) {
    setNotice(`${action}: ${component.name} (Mock-Aktion)`);
  }

  const totalPages = Math.ceil(visibleComponents.length / DEFAULT_PAGE_SIZE);

  const safeCurrentPage = Math.min(currentPage, Math.max(totalPages, 1));

  const paginatedComponents = useMemo(() => {
    const startIndex = (safeCurrentPage - 1) * DEFAULT_PAGE_SIZE;

    return visibleComponents.slice(startIndex, startIndex + DEFAULT_PAGE_SIZE);
  }, [visibleComponents, safeCurrentPage]);

  return (
    <main className="min-h-screen min-w-0 bg-slate-50 p-4 text-slate-900 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-[1600px] space-y-6">
        <header className="flex min-w-0 flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-blue-600">
              Software Lifecycle
            </p>

            <h1 className="mt-1 text-2xl font-semibold tracking-tight">
              Produktversionsmatrix
            </h1>

            <p className="mt-1 max-w-2xl text-sm leading-6 text-slate-500">
              Komponenten, Lebenszyklen und bekannte Schwachstellen über
              mehrere Produktversionen vergleichen.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setIsAddProductVersionOpen(true)}
            className="inline-flex min-h-10 items-center justify-center gap-2 rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
          >
            <PackagePlus size={16} aria-hidden="true" />
            + Produktversion
          </button>
        </header>

        {/* Reservierter Fehlerbereich: bleibt auch ohne Fehler bestehen. */}
        <section
          aria-label="Fehlermeldungen"
          aria-live="polite"
          aria-atomic="true"
          className="min-h-14"
        >
          {error && (
            <div
              role="alert"
              className="flex items-start justify-between gap-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800"
            >
              <p>{error}</p>

              <button
                type="button"
                onClick={() => window.location.reload()}
                className="shrink-0 font-medium underline underline-offset-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500"
              >
                Erneut laden
              </button>
            </div>
          )}
        </section>

        {/* Modal bleibt auf Seitenebene verfügbar. */}
        <AddProductVersionModal
          isOpen={isAddProductVersionOpen}
          onClose={() => setIsAddProductVersionOpen(false)}
          productVersions={productVersions}
          onSubmit={async (payload: CreateProductVersionPayload) => {
            console.log("Neue Produktversion:", {
              ...payload,
              sbomFile: payload.sbomFile?.name ?? null,
            });

            // Später den Backend-Aufruf zum Anlegen integrieren.
          }}
        />

        {/* Kennzahlen */}
        <section
          aria-label="Kennzahlen der Komponentenmatrix"
          className="grid grid-cols-1 gap-3 sm:grid-cols-3"
        >
          <article className="rounded-lg border border-slate-200 bg-white p-4">
            <p className="text-sm text-slate-500">Komponenten gesamt</p>
            <p className="mt-2 text-2xl font-semibold tabular-nums">
              {components.length}
            </p>
          </article>

          <article className="rounded-lg border border-slate-200 bg-white p-4">
            <p className="text-sm text-slate-500">Produktversionen</p>
            <p className="mt-2 text-2xl font-semibold tabular-nums">
              {productVersions.length}
            </p>
          </article>

          <article className="rounded-lg border border-slate-200 bg-white p-4">
            <p className="text-sm text-slate-500">Gefilterte Komponenten</p>
            <p className="mt-2 text-2xl font-semibold tabular-nums">
              {visibleComponents.length}
              <span className="ml-2 text-sm font-normal text-slate-400">
                von {components.length}
              </span>
            </p>
          </article>
        </section>

        {/* Filter */}
        <ProductVersionMatrixFilters
          values={{
            search: filters.search,
            productVersionId: filters.productVersionId,
            categoryId: filters.category,
            lifecycleStatus: filters.lifecycle,
            vulnerabilityStatus: filters.vulnerability,
          }}
          productVersions={productVersions}
          categories={categories.map((category) => ({
            id: category,
            name: category,
          }))}
          onChange={(values: ProductVersionMatrixFilterValues) => {
            setFilters({
              search: values.search,
              productVersionId: values.productVersionId,
              category: values.categoryId,
              lifecycle: values.lifecycleStatus,
              vulnerability: values.vulnerabilityStatus,
            });

            setCurrentPage(1);
          }}
          onReset={resetFilters}
        />

        {/* Komponentenmatrix */}
        <section aria-label="Komponentenmatrix und Seitennavigation">
          {isLoading ? (
            <div
              role="status"
              className="flex min-h-48 items-center justify-center rounded-lg border border-slate-200 bg-white text-sm text-slate-500"
            >
              Komponenten werden geladen …
            </div>
          ) : (
            <>
              <ProductVersionMatrixTable
                productVersions={productVersions}
                components={paginatedComponents}
                selectedProductVersionId={filters.productVersionId}
                onSort={handleSort}
                onView={(component) => simulateAction("Ansehen", component)}
                onEdit={(component) => simulateAction("Bearbeiten", component)}
                onDelete={(component) => simulateAction("Löschen", component)}
              />

              <Pagination
                currentPage={safeCurrentPage}
                totalItems={visibleComponents.length}
                pageSize={DEFAULT_PAGE_SIZE}
                onPageChange={setCurrentPage}
                ariaLabel="Seitennavigation der Komponenten"
                itemLabel="Komponenten"
              />
            </>
          )}
        </section>

        <p className="text-xs text-slate-400">
          Mock-Modus · Daten und Aktionen sind noch nicht vollständig mit
          einem Backend verbunden.
        </p>

        {notice && (
          <div
            role="status"
            aria-live="polite"
            className="fixed inset-x-4 bottom-4 z-50 mx-auto flex max-w-md items-start justify-between gap-3 rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm shadow-lg sm:inset-x-auto sm:right-5"
          >
            <span>{notice}</span>

            <button
              type="button"
              onClick={() => setNotice("")}
              aria-label="Meldung schließen"
              className="shrink-0 rounded p-1 text-slate-500 hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
            >
              <X size={15} aria-hidden="true" />
            </button>
          </div>
        )}
      </div>
    </main>
  );
}

export default ProductVersionMatrixPage;
