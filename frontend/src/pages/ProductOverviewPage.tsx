import { useCallback, useState } from "react";

import { ProductVersionOverviewView } from "../components/product-overview/ProductVersionOverviewView";
import { useApiData } from "../hooks/useApiData";
import { getProductVersions } from "../services/dashboardService";
import {
  archiveProductVersion,
  createProductVersion,
  deleteProductVersion,
  getProductVersionOverview,
  restoreProductVersion,
} from "../services/productVersionOverviewService";
import type { CreateProductVersionPayload } from "../types/productVersion";
import type { ProductVersionOverviewQuery, ProductVersionOverviewAction, ProductVersionOverview } from "../types/productVersionOverview";


const INITIAL_QUERY: ProductVersionOverviewQuery = {
  archiveState: "ACTIVE",
  status: "ALL",
  search: "",
  sortBy: null,
  sortOrder: "DESC",
  page: 1,
  pageSize: 10,
};

export function ProductOverviewPage() {
  const [query, setQuery] = useState(INITIAL_QUERY);
  const [busyVersionId, setBusyVersionId] = useState<number | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const fetchOverview = useCallback(
    (signal: AbortSignal) => getProductVersionOverview(query, signal),
    [query],
  );
  const overview = useApiData(fetchOverview);

  const fetchVersions = useCallback(
    (signal: AbortSignal) => getProductVersions(signal),
    [],
  );
  const versions = useApiData(fetchVersions);

  const handleQueryChange = useCallback((next: Partial<ProductVersionOverviewQuery>) => {
    setQuery((current) => ({ ...current, ...next }));
  }, []);

  const retry = useCallback(() => {
    overview.reload();
    versions.reload();
  }, [overview.reload, versions.reload]);

  const runAction = useCallback(async (item: ProductVersionOverview, action: ProductVersionOverviewAction) => {
    if (action === "delete") {
      const confirmed = window.confirm(
        `Möchtest du die Produktversion ${item.label} endgültig löschen? Diese Aktion kann nicht rückgängig gemacht werden.`,
      );
      if (!confirmed) return;
    }

    setBusyVersionId(item.id);
    setActionError(null);
    setNotice(null);

    try {
      if (action === "archive") {
        await archiveProductVersion(item.id);
        setNotice(`Produktversion ${item.label} wurde archiviert.`);
      } else if (action === "restore") {
        await restoreProductVersion(item.id);
        setNotice(`Produktversion ${item.label} wurde wiederhergestellt.`);
      } else {
        await deleteProductVersion(item.id);
        setNotice(`Produktversion ${item.label} wurde gelöscht.`);
      }
      setQuery((current) => ({ ...current, page: 1 }));
      overview.reload();
      versions.reload();
    } catch (error) {
      setActionError(error instanceof Error ? error.message : "Die Aktion konnte nicht ausgeführt werden.");
    } finally {
      setBusyVersionId(null);
    }
  }, [overview.reload, versions.reload]);

  const createVersion = useCallback(async (payload: CreateProductVersionPayload) => {
    await createProductVersion(payload);
    setNotice(`Produktversion ${payload.name} wurde angelegt.`);
    setQuery({
      archiveState: "ACTIVE",
      status: "ALL",
      search: "",
      sortBy: null,
      sortOrder: "DESC",
      page: 1,
      pageSize: 10,
    });
    overview.reload();
    versions.reload();
  }, [overview.reload, versions.reload]);

  return (
    <ProductVersionOverviewView
      query={query}
      data={overview.data}
      availableVersions={versions.data ?? []}
      isLoading={overview.isLoading}
      isLoadingAvailableVersions={versions.isLoading}
      error={overview.error}
      actionError={actionError}
      notice={notice}
      busyVersionId={busyVersionId}
      onQueryChange={handleQueryChange}
      onRetry={retry}
      onAction={(item, action) => void runAction(item, action)}
      onCreate={createVersion}
    />
  );
}
