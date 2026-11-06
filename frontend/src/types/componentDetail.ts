// types/componentDetail.ts

import type { ComponentLifecycleStatus, Severity } from "../config/statusConfig";

export interface ComponentDetail {
  id: string;
  name: string;
  version: string;
  category: string | null;

  purl: string | null;
  cpe: string | null;

  /** null = keinem Release zugeordnet (UNMAPPED). */
  releaseContext: ReleaseContext | null;

  productVersionUsages: ProductVersionUsage[];
  vulnerabilities: ComponentVulnerability[];

  securityCheck: SecurityCheck;

  // provenance: WEG – manuelles Hinzufügen ist Runde 2
}

export interface ReleaseContext {
  releaseLineId: string;
  productName: string;
  release: string;
  status: ComponentLifecycleStatus;
  eolDate: string | null;
}

export interface ComponentVulnerability {
  id: string;
  displayId: string;
  cveId: string | null;
  osvId: string | null;
  summary: string | null;
  severity: Severity;
  cvssScore: number | null;
  publishedAt: string | null;
  fixStatus: FixStatus;
  fixVersion: string | null;
  references: VulnerabilityReference[];
}

export type FixStatus = "AVAILABLE" | "NOT_AFFECTED" | "NOT_SPECIFIED" | "UNKNOWN";

export interface VulnerabilityReference {
  type: string | null;   // "ADVISORY", "FIX", "OSV", "NVD", …
  url: string;
}

export interface ProductVersionUsage {
  id: string;
  label: string;
  usedVersion: string;
  cveCount: number;
}

export interface SecurityCheck {
  status: "CHECKED" | "NOT_QUERYABLE" | "FAILED" | "PENDING";
  lastCheckedAt: string | null;
}

// ComponentProvenance: GELÖSCHT