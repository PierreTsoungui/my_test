
import type { DashboardApiResponse, DashboardData } from "../types/dashboard";
import type { ProductVersion } from "../types/dashboard";
import{apiRequest} from "../config/api";
import { mapLifecycleData, mapVulnerabilityData } from "../mappers/dashboardMapper";

export async function getDashboardData(
  selectedVersion: string,
  signal?: AbortSignal,
): Promise<DashboardData> {
  const query =
    selectedVersion !== "all"
      ? `?product_version_id=${encodeURIComponent(selectedVersion)}`
      : "";

  const apiData = await apiRequest<DashboardApiResponse>(
    `/dashboard/${query}`,
    { signal },
  );

  return {
    ...apiData,
    lifecycle: mapLifecycleData(apiData.lifecycle),
    vulnerabilities: mapVulnerabilityData(apiData.vulnerabilities),
  };
}

export async function getProductVersions(signal?: AbortSignal): Promise<ProductVersion[]> {
  return apiRequest<ProductVersion[]>("/product-versions", { signal });
}

