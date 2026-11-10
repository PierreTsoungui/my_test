

import type { ComponentLifecycleStatus, Severity } from "../config/statusConfig";
import type {DonutSegment} from "./chart";

// wird Zb für  die Filterung von Product-version  in  der  Übersicht verwenden 
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

}

export interface DashboardData {
  totalComponents: number;
  lifecycle: DonutSegment[];
  vulnerabilities: DonutSegment[];
  actionRequiredGroups?: ActionRequiredGroup[];
}

export type ActionRequiredGroup =
  | ActionRequiredProductGroup
  | ActionRequiredComponentGroup;

/**
 * Ein Produkt-Release mit mehreren zugeordneten Komponenten.
 * Aggregat über alle Komponenten dieser Release-Linie.
 */
export interface ActionRequiredProductGroup {
  kind: "PRODUCT";
  /** Zusammengesetzt: `${productId}:${releaseLineId}` */
  productId: string;
  releaseLineId: string;
  productName: string;
  release: string;
  /** Anzahl der Komponenten in dieser Release-Linie (>= 1) */
  componentCount: number;
  productVersion: string[];
  lifecycle: ActionRequiredLifecycle;
  vulnerabilities: ActionRequiredVulnerabilities;
}

/**
 * Eine einzelne Komponente ohne Produktzuordnung (unmapped).
 * Immer genau eine Komponente – daher kein componentCount.
 */
export interface ActionRequiredComponentGroup {
  kind: "COMPONENT";
  /** = componentId */
  componentId: string;
  componentName: string;
  version: string;
  productVersion: string[];
  lifecycle: ActionRequiredLifecycle;  // status ist immer "UNKNOWN"
  vulnerabilities: ActionRequiredVulnerabilities;
}

export interface ActionRequiredPage {
  items: ActionRequiredGroup[];
  total: number;
  page: number;
  pageSize: number;
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