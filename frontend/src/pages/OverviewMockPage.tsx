import { useCallback, useMemo, useState } from "react";

import { ProductVersionOverviewView } from "../components/product-overview/ProductVersionOverviewView";
import { PRODUCT_VERSION_OVERVIEW_MOCK_DATA } from "../data/productVersionOverviewMockData";
import { buildMockProductVersionOverviewPage } from "../data/productVersionOverviewMockService";
import type { CreateProductVersionPayload } from "../types/productVersion";
import type {
  ProductVersionOverview,
  ProductVersionOverviewAction,
  ProductVersionOverviewQuery,
} from "../types/productVersionOverview";

const INITIAL_QUERY: ProductVersionOverviewQuery = {
  archiveState: "ACTIVE",
  status: "ALL",
  search: "",
  sortBy: null,
  sortOrder: "DESC",
  page: 1,
  pageSize: 10,
};

export function OverviewMockPage() {
  const [query, setQuery] = useState(INITIAL_QUERY);
  const [inventory, setInventory] = useState(PRODUCT_VERSION_OVERVIEW_MOCK_DATA);
  const [notice, setNotice] = useState<string | null>("Demo-Modus: Änderungen werden nur im lokalen Browserzustand simuliert.");
  const [actionError, setActionError] = useState<string | null>(null);

  const page = useMemo(
    () => buildMockProductVersionOverviewPage(inventory, query),
    [inventory, query],
  );
  const handleQueryChange = useCallback((next: Partial<ProductVersionOverviewQuery>) => {
    setQuery((current) => ({ ...current, ...next }));
  }, []);

  const handleAction = useCallback((item: ProductVersionOverview, action: ProductVersionOverviewAction) => {
    if (action === "delete" && !window.confirm(`Mock: Produktversion ${item.label} löschen?`)) return false;

    setActionError(null);
    setNotice(null);

    setInventory((current) => {
      if (action === "delete") return current.filter((version) => version.id !== item.id);
      return current.map((version) => version.id === item.id
        ? { ...version, isArchived: action === "archive" }
        : version);
    });

    setNotice(action === "archive"
      ? `Mock: ${item.label} wurde archiviert.`
      : action === "restore"
        ? `Mock: ${item.label} wurde wiederhergestellt.`
        : `Mock: ${item.label} wurde gelöscht.`);
    setQuery((current) => ({ ...current, page: 1 }));
    return true;
  }, []);

  const handleCreate = useCallback(async (payload: CreateProductVersionPayload) => {
    const nextId = Math.max(0, ...inventory.map((item) => item.id)) + 1;
    const newItem: ProductVersionOverview = {
      id: nextId,
      label: payload.name,
      criticalCveCount: 0,
      highCveCount: 0,
      eolComponentCount: 0,
      healthStatus: "NOT_ASSESSED",
      isArchived: false,
    };
    setInventory((current) => [newItem, ...current]);
    setQuery(INITIAL_QUERY);
    setNotice(`Mock: Produktversion ${payload.name} wurde angelegt. Für die Demo startet sie ohne Komponenten und ohne abgeschlossene Bewertung.`);
  }, [inventory]);

  return (
    <div className="space-y-3">
      <div className="mx-auto flex w-full max-w-[1600px] items-center gap-2 px-4 pt-4 text-xs text-indigo-800 sm:px-6 lg:px-8">
        <span className="rounded-full bg-indigo-100 px-2.5 py-1 font-semibold">MOCK</span>
        <span>Die Übersicht verwendet lokale Beispieldaten aus <code>src/data</code>; Änderungen werden lokal simuliert.</span>
      </div>
      <ProductVersionOverviewView
        query={query}
        data={page}
        isLoading={false}
        error={null}
        actionError={actionError}
        notice={notice}
        onQueryChange={handleQueryChange}
        onRetry={() => setNotice("Mock-Daten sind bereits geladen.")}
        onAction={handleAction}
        onCreate={handleCreate}
      />
    </div>
  );
}
