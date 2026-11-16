import type {
  ProductVersionOverview,
  ProductVersionOverviewPage,
  ProductVersionOverviewQuery,
} from "../types/productVersionOverview";

/**
 * Builds the same filtered and paginated shape as the overview API.
 * A warning is filtered independently from ACTION_REQUIRED: a version can
 * have both already-EOL components and components approaching EOL, while its
 * single primary status remains ACTION_REQUIRED.
 */
export function buildMockProductVersionOverviewPage(
  inventory: ProductVersionOverview[],
  query: ProductVersionOverviewQuery,
): ProductVersionOverviewPage {
  const normalizedSearch = query.search.trim().toLocaleLowerCase("de-DE");

  const filtered = inventory
    .filter((item) => {
      if (query.archiveState === "ACTIVE" && item.isArchived) return false;
      if (query.archiveState === "ARCHIVED" && !item.isArchived) return false;

      switch (query.status) {
        case "ACTION_REQUIRED":
          if (item.healthStatus !== "ACTION_REQUIRED") return false;
          break;
    
        case "HEALTHY":
          if (item.healthStatus !== "HEALTHY") return false;
          break;
        case "NOT_ASSESSED":
          if (item.healthStatus !== "NOT_ASSESSED" && item.healthStatus !== null) return false;
          break;
        case "ALL":
        default:
          break;
      }

      if (
        normalizedSearch &&
        !item.label.toLocaleLowerCase("de-DE").includes(normalizedSearch)
      ) {
        return false;
      }

      return true;
    })
    .sort((a, b) => {
      let comparison = 0;

      switch (query.sortBy) {
        // IDs in this fixture increase with creation order.
        // DESC therefore represents "Neueste zuerst" in the mock data
        case "LABEL":
          comparison = a.label.localeCompare(b.label, "de-DE", { numeric: true });
          break;
        case "CRITICAL_CVE_COUNT":
          comparison = a.criticalCveCount - b.criticalCveCount;
          break;
        case "HIGH_CVE_COUNT":
          comparison = a.highCveCount - b.highCveCount;
          break;
        case "EOL_COMPONENT_COUNT":
          comparison = a.eolComponentCount - b.eolComponentCount;
          break;
        default:
          // Safe fallback for an unrecognized sort value.
          comparison = a.id - b.id;
          break;
      }

      const direction = query.sortOrder === "ASC" ? 1 : -1;
      if (comparison !== 0) return comparison * direction;

      // Stable tie-breaker: newest fixture first.
      return b.id - a.id;
    });

  const start = (query.page - 1) * query.pageSize;

  return {
    items: filtered.slice(start, start + query.pageSize),
    total: filtered.length,
    page: query.page,
    pageSize: query.pageSize,
  };
}