

import type { ComponentLifecycleStatus, Severity } from "../config/statusConfig";
import type {DonutSegment} from "./chart";


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

  actionRequiredGroups: ActionRequiredGroup[];
}

export interface DashboardData {
  totalComponents: number;
  lifecycle: DonutSegment[];
  vulnerabilities: DonutSegment[];
  actionRequiredGroups: ActionRequiredGroup[];
}


export interface ActionRequiredGroup {
  id: string;
  productName: string;
  release: string | null;
  componentCount: number;
  lifecycle: ActionRequiredLifecycle;
  vulnerabilities: ActionRequiredVulnerabilities;
}

export interface ActionRequiredLifecycle {
  releaseDate: string | null;
  status: ComponentLifecycleStatus;
  eoasDate: string | null;
  eolDate: string | null;
}

export interface ActionRequiredVulnerabilities {
  // Anzahl eindeutiger OSV-Schwachstellen
  totalCount: number;

  // Anzahl unterschiedlicher Komponenten mit mindestens
  // einer bekannten Schwachstelle
  affectedComponentCount: number;

  // Anzahl eindeutiger Schwachstellen je Severity
  severityCounts: Record<Severity, number>;
  checkedComponentCount?: number;
  notQueryableComponentCount?: number;
  failedComponentCount?: number;
}