

import type { DonutSegment, SecurityRisk, UpcomingEolItem } from "./chart";
export interface DashboardData {
  totalComponents: number;
  lifecycle: DonutSegment[];
  vulnerabilities: DonutSegment[];
  securityRisks: SecurityRisk[];
  upcomingEol: UpcomingEolItem[];
}

export interface ProductVersion {
  id: number;
  label: string;
}