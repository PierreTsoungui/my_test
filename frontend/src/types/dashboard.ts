

import type { ComponentLifecycleStatus, Severity } from "../config/statusConfig";
import type { DonutSegment, SecurityRisk, UpcomingEolItem} from "./chart";
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


export interface LifecycleApiItem {
  status: ComponentLifecycleStatus;
  count: number;
}

export interface VulnerabilityApiItem {
  severity: Severity;
  count: number;
}

export interface DashboardApiResponse {
  totalComponents: number;
  lifecycle: LifecycleApiItem[];
  vulnerabilities: VulnerabilityApiItem[];
  securityRisks: SecurityRisk[];
  upcomingEol: UpcomingEolItem[];
}

export interface DashboardData {
  totalComponents: number;
  lifecycle: DonutSegment[];
  vulnerabilities: DonutSegment[];
  securityRisks: SecurityRisk[];
  upcomingEol: UpcomingEolItem[];
}