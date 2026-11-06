// types/product-Detail.ts

import type {
  ComponentLifecycleStatus,
  Severity,
} from "../config/statusConfig";
import type { Provenance } from "./provenance";

// ============================================================
// Product Detail (Produktdetailseite)
// ============================================================

export interface ProductDetail {
  id: string;
  name: string;
  category: string | null;

  activeReleaseLine: ReleaseLine;

  productVersionCount: number;

  usedComponents: UsedComponentSummary[];

  totalCveCount: number;

  provenance: Provenance;
}

// ============================================================
// Release Line – nur Daten der Linie selbst
// ============================================================

export interface ReleaseLine {
  id: string;
  release: string;                 // "25.8"

  status: ComponentLifecycleStatus;

  releaseDate: string | null;
  eolDate: string | null;

  isMaintained: boolean | null;
  isLts: boolean | null;

  latestPatchVersion: string | null;
  latestPatchLink: string | null;
  patchReleaseDate: string | null;


}

// ============================================================
// Used Component Summary
// ============================================================

export interface UsedComponentSummary {
  id: string;
  name: string;
  version: string;
  purl: string | null;
  cveCount: number;
  highestSeverity: Severity | null;

}
