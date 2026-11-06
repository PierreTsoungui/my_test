import { useCallback, useMemo } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import { AlertCircle, Loader2 } from "lucide-react";
import { apiRequest } from "../api";
import { useApiData } from "../hooks/useApiData";
import { ProductDetailHeader } from "../components/product-detail/ProductDetailHeader";
import { ReleaseLineTimeline } from "../components/product-detail/ReleaseLineTimeline";
import { UsedComponentList } from "../components/product-detail/UsedComponentList";
import { UsedComponentPanel } from "../components/product-detail/UsedComponentPanel";
import type { ProductDetail } from "../types/productDetail";
import type {
  ComponentDetail,
  VulnerabilityState,
} from "../types/componentDetail";

export default function ProductDetailPage() {
  const { productId = "" } = useParams<{ productId: string }>();
  const [searchParams, setSearchParams] = useSearchParams();
  const selectedIdParam = searchParams.get("component");

  // === Produkt laden (einmal pro productId) ===
  const fetchProduct = useCallback(
    (signal: AbortSignal) =>
      apiRequest<ProductDetail>(`/products/${productId}`, { signal }),
    [productId],
  );
  const productState = useApiData(fetchProduct);

  // === Ausgewähltes Package ermitteln ===
  const selectedComponent = useMemo(() => {
    if (!productState.data) return null;
    return (
      productState.data.usedComponents.find(
        (c) => c.id === selectedIdParam,
      ) ?? productState.data.usedComponents[0] ?? null
    );
  }, [productState.data, selectedIdParam]);

  // === ComponentDetail für ausgewähltes Package laden ===
  const fetchComponentDetail = useCallback(
    async (signal: AbortSignal): Promise<ComponentDetail | null> => {
      if (!selectedComponent) return null;
      return apiRequest<ComponentDetail>(
        `/components/${selectedComponent.id}`,
        { signal },
      );
    },
    [selectedComponent],
  );
  const componentState = useApiData(fetchComponentDetail);

  // === Auswahl setzen (URL-Parameter für Deep-Link) ===
  const handleSelect = (id: string) => {
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        next.set("component", id);
        return next;
      },
      { replace: true },
    );
  };

  // === Assessment ändern (optimistisch, TODO: PATCH) ===
  const handleAssessmentChange = (
    _vulnerabilityId: string,
    _nextState: VulnerabilityState,
  ) => {
    // TODO: PATCH /vulnerabilities/:id/assessment
    // Danach: componentState.reload()
  };

  // === Zustände ===
  if (productState.isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center text-slate-500">
        <Loader2 className="mr-2 size-5 animate-spin" aria-hidden="true" />
        Produkt wird geladen…
      </div>
    );
  }

  if (productState.error || !productState.data) {
    return (
      <div className="mx-auto max-w-xl px-4 py-12 text-center">
        <AlertCircle
          className="mx-auto mb-3 size-10 text-red-500"
          aria-hidden="true"
        />
        <h1 className="text-lg font-semibold text-slate-900">
          Produkt konnte nicht geladen werden
        </h1>
        <p className="mt-1 text-sm text-slate-600">
          {productState.error ?? "Unbekannter Fehler"}
        </p>
        <button
          type="button"
          onClick={productState.reload}
          className="mt-4 rounded-md bg-blue-700 px-4 py-2 text-sm font-medium text-white hover:bg-blue-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
        >
          Erneut versuchen
        </button>
      </div>
    );
  }

  const product = productState.data;

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      <ProductDetailHeader product={product} />

      <ReleaseLineTimeline releaseLine={product.activeReleaseLine} />

      {/* Desktop: Master-Detail */}
      <div className="mt-6 hidden gap-6 lg:grid lg:grid-cols-[320px_minmax(0,1fr)]">
        <aside aria-label="Package-Liste">
          <UsedComponentList
            components={product.usedComponents}
            selectedId={selectedComponent?.id ?? null}
            onSelect={handleSelect}
          />
        </aside>

        <div aria-live="polite">
          {selectedComponent ? (
            <UsedComponentPanel
              component={selectedComponent}
              productId={product.id}
              detail={componentState.data}
              isLoading={componentState.isLoading}
              error={componentState.error}
              onAssessmentChange={handleAssessmentChange}
            />
          ) : (
            <p className="rounded-lg border border-dashed border-slate-300 p-8 text-center text-sm text-slate-500">
              Keine Packages für diese Release-Linie vorhanden.
            </p>
          )}
        </div>
      </div>

      {/* Mobile: nur Liste */}
      <div className="mt-6 lg:hidden">
        <UsedComponentList
          components={product.usedComponents}
          selectedId={selectedComponent?.id ?? null}
          onSelect={(id) => {
            // Mobile: navigiere zur ComponentDetailPage
            window.location.href = `/products/${product.id}/components/${id}`;
          }}
        />
      </div>
    </div>
  );
}