import { lifecycleDemoData, vulnerabilityDemoData } from "../data/dashboardDemoData";
import { securityRisksDemoData } from "../data/securityRisksDemoData";
import { upcomingEolDemoData } from "../data/upcomingEolDemoData";
import type { DonutSegment, SecurityRisk, UpcomingEolItem } from "../types/chart";
import{apiRequest} from "../config/api";
export interface DashboardData {
  totalComponents: number;
  lifecycle: DonutSegment[];
  vulnerabilities: DonutSegment[];
  securityRisks: SecurityRisk[];
  upcomingEol: UpcomingEolItem[];
}

/**
 * Central entry point for overview data.
 * Demo data is used temporarily; replace this function's implementation with
 * API requests when the backend endpoint is available. The page and dashboard
 * components can then stay unchanged.
 */
export async function getDashboardData(selectedVersion: string): Promise<DashboardData> {
  let response: DashboardData;

  if (selectedVersion === "All") {
     response = await apiRequest<DashboardData>(`/dashboard/`);
  }else {
     response = await apiRequest<DashboardData>(`/dashboard/${selectedVersion}`);
  }

  return {
    lifecycle: lifecycleDemoData.map((item) => ({ ...item })),
    vulnerabilities: vulnerabilityDemoData.map((item) => ({ ...item })),
    securityRisks: securityRisksDemoData.map((item) => ({ ...item })),
    upcomingEol: upcomingEolDemoData.map((item) => ({ ...item })),
    totalComponents: lifecycleDemoData.reduce((sum, item) => sum + item.value, 0),
  };
}

