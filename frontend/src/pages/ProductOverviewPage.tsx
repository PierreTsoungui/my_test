import { useCallback, useRef, useState } from "react";

import { ProductVersionOverviewView } from "../components/product-overview/ProductVersionOverviewView";
import { useApiData } from "../hooks/useApiData";
import {
  archiveProductVersion,
  createProductVersion,
  deleteProductVersion,
  getProductVersionOverview,
  restoreProductVersion,
} from "../services/productVersionOverviewService";
import type { CreateProductVersionPayload } from "../types/productVersion";
import type {
  ProductVersionOverviewQuery,
  ProductVersionOverviewAction,
  ProductVersionOverview,

} from "../types/productVersionOverview";



const INITIAL_QUERY: ProductVersionOverviewQuery = {
  archiveState: "ACTIVE",
  attentionFilter: "ALL",
  search: "",
  sortBy: "EOL_COMPONENT_COUNT",
  page: 1,
  pageSize: 10,
};

function isInitialQuery(query: ProductVersionOverviewQuery): boolean {
  return (
    query.archiveState === INITIAL_QUERY.archiveState &&
    query.attentionFilter === INITIAL_QUERY.attentionFilter &&
    query.search === INITIAL_QUERY.search &&
    query.sortBy === INITIAL_QUERY.sortBy &&
    query.page === INITIAL_QUERY.page &&
    query.pageSize === INITIAL_QUERY.pageSize
  );
}

function getErrorMessage(error: unknown, fallback: string): string {
  return error instanceof Error && error.message.trim()
    ? error.message
    : fallback;
}

export function ProductOverviewPage() {
  const [query, setQuery] = useState(INITIAL_QUERY);
  const [isMutationRunning, setIsMutationRunning] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  // Schützt auch vor zwei Klicks, bevor React den neuen Zustand gerendert hat.
  const mutationInProgressRef = useRef(false);

  const fetchOverview = useCallback(
    (signal: AbortSignal) => getProductVersionOverview(query, signal),
    [query],
  );
  const overview = useApiData(fetchOverview);

  const handleQueryChange = useCallback(
    (next: Partial<ProductVersionOverviewQuery>) => {
      setQuery((current) => ({ ...current, ...next }));
    },
    [],
  );

  const retry = useCallback(() => {
    overview.reload();
  }, [overview.reload]);

  const refreshAfterMutation = useCallback(() => {
    // Eine Änderung der Query löst den Abruf bereits aus. Nur bei Seite 1
    // muss explizit neu geladen werden.
    if (query.page === 1) {
      overview.reload();
    } else {
      setQuery((current) => ({ ...current, page: 1 }));
    }
  }, [overview.reload, query.page]);

  const runAction = useCallback(
    async (item: ProductVersionOverview, action: ProductVersionOverviewAction) => {
      if (mutationInProgressRef.current) return false;

      if (action === "delete") {
        const confirmed = window.confirm(
          `Möchtest du die Produktversion ${item.label} endgültig löschen? Diese Aktion kann nicht rückgängig gemacht werden.`,
        );
        if (!confirmed) return false;
      }

      mutationInProgressRef.current = true;
      setIsMutationRunning(true);
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

        refreshAfterMutation();
        return true;
      } catch (error) {
        setActionError(
          getErrorMessage(error, "Die Aktion konnte nicht ausgeführt werden."),
        );
        return false;
      } finally {
        mutationInProgressRef.current = false;
        setIsMutationRunning(false);
      }
    },
    [refreshAfterMutation],
  );

  const createVersion = useCallback(
    async (payload: CreateProductVersionPayload) => {
      if (mutationInProgressRef.current) {
        throw new Error("Es wird bereits eine andere Änderung ausgeführt. Bitte versuche es erneut.");
      }

      mutationInProgressRef.current = true;
      setIsMutationRunning(true);
      setActionError(null);
      setNotice(null);

      try {
        await createProductVersion(payload);
        setNotice(`Produktversion ${payload.name} wurde angelegt.`);

        if (isInitialQuery(query)) {
          overview.reload();
        } else {
          setQuery(INITIAL_QUERY);
        }
      } catch (error) {
        const message = getErrorMessage(
          error,
          "Die Produktversion konnte nicht erstellt werden.",
        );
        // Der Dialog zeigt den Fehler direkt am Formular an. Ein zweiter
        // globaler Alert würde dieselbe Fehlermeldung doppelt ausgeben.
        throw new Error(message, { cause: error });
      } finally {
        mutationInProgressRef.current = false;
        setIsMutationRunning(false);
      }
    },
    [overview.reload, query],
  );

  return (
    <ProductVersionOverviewView
      query={query}
      data={overview.data}
      isLoading={overview.isLoading}
      error={overview.error}
      actionError={actionError}
      notice={notice}
      isMutationRunning={isMutationRunning}
      onQueryChange={handleQueryChange}
      onRetry={retry}
      onAction={runAction}
      onCreate={createVersion}
    />
  );
}
