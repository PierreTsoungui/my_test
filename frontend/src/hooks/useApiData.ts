
import { useCallback, useEffect, useState } from "react";

interface ApiDataState<T> {
  data: T | null;
  error: string | null;
  isLoading: boolean;
}

export function useApiData<T>(
  fetchData: (signal: AbortSignal) => Promise<T>,
) {
  const [state, setState] = useState<ApiDataState<T>>({
    data: null,
    error: null,
    isLoading: true,
  });

  const [reloadKey, setReloadKey] = useState(0);

  const reload = useCallback(() => {
    setReloadKey((key) => key + 1);
  }, []);

  useEffect(() => {
    const controller = new AbortController();

    setState((previous) => ({
      ...previous,
      error: null,
      isLoading: true,
    }));

    async function loadData() {
      try {
        const result = await fetchData(controller.signal);

        if (!controller.signal.aborted) {
          setState({
            data: result,
            error: null,
            isLoading: false,
          });
        }
      } catch (err) {
        if (controller.signal.aborted) {
          return;
        }

        setState((previous) => ({
          ...previous,
          error:
            err instanceof Error
              ? err.message
              : "Ein unbekannter Fehler ist aufgetreten.",
          isLoading: false,
        }));
      } finally {
        if (!controller.signal.aborted) {
          setState((previous) => ({
            ...previous,
            isLoading: false,
          }));
        }
      }
    }

    void loadData();

    return () => {
      controller.abort();
    };
  }, [fetchData, reloadKey]);

  return {
    ...state,
    reload,
  };
}
