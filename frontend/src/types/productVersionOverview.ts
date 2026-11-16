export type ProductVersionHealthStatus =
  | "ACTION_REQUIRED"
  | "NOT_ASSESSED"
  | "HEALTHY";


export type ProductVersionArchiveState =
  | "ALL"
  | "ACTIVE"
  | "ARCHIVED";

export type ProductVersionStatusFilter =
  | "ALL"
  | "ACTION_REQUIRED"
  | "HEALTHY"
  | "NOT_ASSESSED";

export type ProductVersionSortBy =
  | "LABEL"
  | "CRITICAL_CVE_COUNT"
  | "HIGH_CVE_COUNT"
  | "EOL_COMPONENT_COUNT"
  

export type SortOrder = "ASC" | "DESC";

export interface ProductVersionOverviewQuery {
  archiveState: ProductVersionArchiveState;
  status: ProductVersionStatusFilter;
  search: string;
  sortBy: ProductVersionSortBy|null;
  sortOrder: SortOrder;
  page: number;
  pageSize: number;
}

export interface ProductVersionOverview {
  id: number;
  label: string;

  criticalCveCount: number;
  highCveCount: number;
  eolComponentCount: number;

  healthStatus: ProductVersionHealthStatus;

  isArchived: boolean;
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