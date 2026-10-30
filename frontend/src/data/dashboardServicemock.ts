
import type { DashboardData } from "../types/dashboard";
import type { ProductVersion } from "../types/dashboard";
import { lifecycleDemoData, vulnerabilityDemoData } from "./dashboardDemoData";
import { securityRisksDemoData } from "./securityRisksDemoData";
import { upcomingEolDemoData } from "./upcomingEolDemoData";



export async function getDashboardMockData(
  selectedVersion: string,
  signal?: AbortSignal,
): Promise<DashboardData> {
  const query =
    selectedVersion !== "all"
      ? `?product_version_id=${encodeURIComponent(selectedVersion)}`
      : "";
      
return {
    lifecycle: lifecycleDemoData.map((item) => ({ ...item })),
    vulnerabilities: vulnerabilityDemoData.map((item) => ({ ...item })),
    securityRisks: securityRisksDemoData.map((item) => ({ ...item })),
    upcomingEol: upcomingEolDemoData.map((item) => ({ ...item })),
    totalComponents: lifecycleDemoData.reduce((sum, item) => sum + item.value, 0),
  };        
 
}
const version: ProductVersion[] = [
    { id: 1, label: "Version 1" },
    { id: 2, label: "Version 2" },
    { id: 3, label: "Version 3" },
];

export async function getProductMockVersions(signal?: AbortSignal): Promise<ProductVersion[]> {

  return version.map((item) => ({ ...item }));
  //return apiRequest<ProductVersion[]>("/product-versions", { signal });
}

