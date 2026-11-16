

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



// ============================================================
// Produktversionen-Übersicht (Master-Tabelle)
// ============================================================

/**
 * Health-Status einer Produktversion.
 * Abgeleitet vom Backend aus Lifecycle + CVEs.
 */
export type ProductVersionHealthStatus =
  | "CRITICAL"      // EOL erreicht ODER kritische CVE
  | "ATTENTION"     // EOL ≤ 12 Monate ODER hohe CVE
  | "HEALTHY";      // Nichts davon

export interface ProductVersionOverview {
  id: number;
  label: string;                       // "5.1"

  componentCount: number;              // 248

  healthStatus: ProductVersionHealthStatus;

  /** Verteilung nach Lifecycle-Status (nur > 0) */
  lifecycleBreakdown: LifecycleApiItem[];// sollte  Normalerweise  für  Donut-Diagramm  verwenden
  vulnerabilityBreakdown: VulnerabilityApiItem[]; // sollte  Normalerweise  für  Donut-Diagramm  verwenden
  /** Zahlen für die "Handlung"-Spalte */
  actionRequired: ProductVersionActionRequiredSummary;
}

export interface ProductVersionActionRequiredSummary {
  /** Anzahl Handlungsbedarf-Gruppen insgesamt */
  totalCount: number;                  // 8

  /** Davon mit mindestens einer kritischen CVE */
  criticalCveCount: number;            // 2

  /** Anzahl unterschiedlicher betroffener Komponenten */
  affectedComponentCount: number;
}

/**
 * API-Response der Produktversionen-Tabelle (paginiert).
 */
export interface ProductVersionOverviewPage {
  items: ProductVersionOverview[];
  total: number;
  page: number;
  pageSize: number;
}

/**
 * Filter/Sortierung für die Tabelle.
 * Wird im Service als Query-Parameter verwendet.
 */
export interface ProductVersionOverviewQuery {
  status?: ProductVersionHealthStatus | "ALL";
  search?: string;
  sort?: ProductVersionOverviewSort;
  page: number;
  pageSize: number;
}

export type ProductVersionOverviewSort =
  | "health"           // schlechtester Status zuerst
  | "actionRequired"   // meiste Probleme zuerst
  | "label"            // Versionsnummer (Standard)
  | "eol";             // frühestes EOL zuerst