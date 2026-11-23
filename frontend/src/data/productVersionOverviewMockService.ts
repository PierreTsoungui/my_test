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
/**
 * Compares nullable numbers in descending order.
 * Unassessed values (null) are placed last.
 */
function compareNullableDescending(
  a: number | null,
  b: number | null,
): number {
  if (a === null && b === null) return 0;
  if (a === null) return 1;
  if (b === null) return -1;

  return b - a;
}

/**
 * Sorts product versions by their version label,
 * newest version first.
 */
function compareVersionsNewestFirst(
  a: ProductVersionOverview,
  b: ProductVersionOverview,
): number {
  const comparison = b.label.localeCompare(
    a.label,
    "de-DE",
    { numeric: true, sensitivity: "base" },
  );

  return comparison !== 0 ? comparison : b.id - a.id;
}

/**
 * Compares product versions by OSV vulnerability severity:
 * Critical first, then High.
 */
function compareVulnerabilitySeverity(
  a: ProductVersionOverview,
  b: ProductVersionOverview,
): number {
  return (
    compareNullableDescending(
      a.criticalAffectedComponentCount,
      b.criticalAffectedComponentCount,
    ) ||
    compareNullableDescending(
      a.highAffectedComponentCount,
      b.highAffectedComponentCount,
    ) ||
    compareNullableDescending(
      a.eolComponentCount,
      b.eolComponentCount,
    )
  );
}

/**
 * Builds the same filtered, sorted and paginated result
 * shape as the overview API.
 */
export function buildMockProductVersionOverviewPage(
  inventory: ProductVersionOverview[],
  query: ProductVersionOverviewQuery,
): ProductVersionOverviewPage {
  const normalizedSearch = query.search
    .trim()
    .toLocaleLowerCase("de-DE");

  const filtered = inventory
    .filter((item) => {
      const isArchived = item.archivedAt != null;

      // Archive filter
      if (query.archiveState === "ACTIVE" && isArchived) {
        return false;
      }

      if (query.archiveState === "ARCHIVED" && !isArchived) {
        return false;
      }

      // Attention filter
      switch (query.attentionFilter) {
        case "EOL":
          if (item.eolComponentCount === null ||
              item.eolComponentCount <= 0) {
            return false;
          }
          break;

        case "HEALTHY":
          if (
            item.criticalAffectedComponentCount !== 0 ||
            item.highAffectedComponentCount !== 0 ||
            item.eolComponentCount !== 0
          ) {
            return false;
          }
          break;

        case "OSV_AFFECTED_COMPONENTS":
          if (
            (item.criticalAffectedComponentCount ?? 0) <= 0 &&
            (item.highAffectedComponentCount ?? 0) <= 0
          ) {
            return false;
          }
          break;

        case "EOL_NOT_ASSESSED":
          if (item.eolComponentCount !== null) {
            return false;
          }
          break;

        case "OSV_NOT_ASSESSED":
          if (
            item.criticalAffectedComponentCount !== null ||
            item.highAffectedComponentCount !== null
          ) {
            return false;
          }
          break;

        case "ALL":
        default:
          break;
      }

      // Search filter
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
        case "EOL_COMPONENT_COUNT":
          comparison =
            compareNullableDescending(
              a.eolComponentCount,
              b.eolComponentCount,
            ) ||
            compareNullableDescending(
              a.criticalAffectedComponentCount,
              b.criticalAffectedComponentCount,
            ) ||
            compareNullableDescending(
              a.highAffectedComponentCount,
              b.highAffectedComponentCount,
            );
          break;

        case "VULNERABILITY_SEVERITY":
          comparison = compareVulnerabilitySeverity(a, b);
          break;

        case null:
          // Default: newest product version first.
          return compareVersionsNewestFirst(a, b);

        default:
          return compareVersionsNewestFirst(a, b);
      }

      if (comparison !== 0) {
        return comparison;
      }

      // Stable tie-breaker: newest version first.
      return compareVersionsNewestFirst(a, b);
    });

  const start = (query.page - 1) * query.pageSize;

  return {
    items: filtered.slice(start, start + query.pageSize),
    total: filtered.length,
    page: query.page,
    pageSize: query.pageSize,
  };
}
