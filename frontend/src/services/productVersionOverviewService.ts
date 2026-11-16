import { apiRequest } from "../config/api";
import type {
  ProductVersionOverviewPage,
  ProductVersionOverviewQuery,
} from "../types/productVersionOverview";
import type { CreateProductVersionPayload } from "../types/productVersion";

export function getProductVersionOverview(
  query: ProductVersionOverviewQuery,
  signal?: AbortSignal,
): Promise<ProductVersionOverviewPage> {
  const params = new URLSearchParams({
    archive_state: query.archiveState,
    status: query.status,
    search: query.search,
    sort_by: query.sortBy,
    sort_order: query.sortOrder,
    page: String(query.page),
    page_size: String(query.pageSize),
  });

  return apiRequest<ProductVersionOverviewPage>(
    `/product-versions/overview?${params.toString()}`,
    { signal },
  );
}

export function archiveProductVersion(id: number): Promise<void> {
  return apiRequest<void>(`/product-versions/${id}/archive`, { method: "PATCH" });
}

export function restoreProductVersion(id: number): Promise<void> {
  return apiRequest<void>(`/product-versions/${id}/restore`, { method: "PATCH" });
}

export function deleteProductVersion(id: number): Promise<void> {
  return apiRequest<void>(`/product-versions/${id}`, { method: "DELETE" });
}

export function createProductVersion(payload: CreateProductVersionPayload): Promise<void> {
  const body = new FormData();
  body.set("name", payload.name);
  body.set("method", payload.method);

  if (payload.releaseDate) body.set("release_date", payload.releaseDate);
  if (payload.sbomFile) body.set("sbom_file", payload.sbomFile);
  if (payload.sourceProductVersionId) body.set("source_product_version_id", payload.sourceProductVersionId);

  return apiRequest<void>("/product-versions", { method: "POST", body });
}

