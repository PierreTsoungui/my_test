
export type ProductVersionArchiveState =
  | "ALL"
  | "ACTIVE"
  | "ARCHIVED";


/**
 * Filtert Produktversionen nach ihren Auffälligkeiten
 * und dem Bewertungsstand der Datenquellen.
 */
export type ProductVersionAttentionFilter =
  | "ALL"
  | "EOL"
  | "HEALTHY"
  | "OSV_AFFECTED_COMPONENTS"
  | "EOL_NOT_ASSESSED"
  | "OSV_NOT_ASSESSED";


/**
 * Priorisiert Produktversionen nach Lifecycle
 * oder Schwere der OSV-Schwachstellen.
 */
export type ProductVersionSortBy =
  | "EOL_COMPONENT_COUNT"
  | "VULNERABILITY_SEVERITY";


export interface ProductVersionOverviewQuery {
  archiveState: ProductVersionArchiveState;
  attentionFilter: ProductVersionAttentionFilter;
  search: string;

  sortBy: ProductVersionSortBy | null;

  page: number;
  pageSize: number;
}


export interface ProductVersionOverview {
  id: number;
  label: string;

  criticalAffectedComponentCount: number | null;
  highAffectedComponentCount: number | null;
  eolComponentCount: number | null;

  archivedAt?: string;
}


export interface ProductVersionOverviewPage {
  items: ProductVersionOverview[];
  total: number;
  page: number;
  pageSize: number;
}


export type ProductVersionOverviewAction =
  | "archive"
  | "restore"
  | "delete";
