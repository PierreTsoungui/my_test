
import type { DashboardData } from "../types/dashboard";
import type { ProductVersion } from "../types/dashboard";
import{apiRequest} from "../config/api";


export async function getDashboardData(
  selectedVersion: string,
  signal?: AbortSignal,
): Promise<DashboardData> {
  const query =
    selectedVersion !== "all"
      ? `?product_version_id=${encodeURIComponent(selectedVersion)}`
      : "";

  return apiRequest<DashboardData>(`/dashboard/${query}`, { signal });
}


export async function getProductVersions(signal?: AbortSignal): Promise<ProductVersion[]> {
  return apiRequest<ProductVersion[]>("/product-versions", { signal });
}

