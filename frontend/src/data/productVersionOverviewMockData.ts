import type { ProductVersion } from "../types/dashboard";
import type { ProductVersionOverview } from "../types/productVersionOverview";

export const PRODUCT_VERSION_OVERVIEW_MOCK_DATA: ProductVersionOverview[] = [
  // OSV und EOL bewertet, Auffälligkeiten in beiden Quellen
  {
    id: 114,
    label: "5.1.0",
    criticalAffectedComponentCount: 2,
    highAffectedComponentCount: 5,
    eolComponentCount: 3,
  },
  {
    id: 113,
    label: "5.0.0",
    criticalAffectedComponentCount: 0,
    highAffectedComponentCount: 8,
    eolComponentCount: 12,
  },
  {
    id: 112,
    label: "4.9.0",
    criticalAffectedComponentCount: 0,
    highAffectedComponentCount: 0,
    eolComponentCount: 3,
  },
  {
    id: 111,
    label: "4.8.0",
    criticalAffectedComponentCount: 0,
    highAffectedComponentCount: 0,
    eolComponentCount: 7,
  },

  // Vollständig bewertet, keine Auffälligkeiten
  {
    id: 110,
    label: "4.7.0",
    criticalAffectedComponentCount: 0,
    highAffectedComponentCount: 0,
    eolComponentCount: 0,
  },

  // Unterschiedliche OSV- und EOL-Auffälligkeiten
  {
    id: 109,
    label: "4.6.0",
    criticalAffectedComponentCount: 1,
    highAffectedComponentCount: 2,
    eolComponentCount: 1,
  },
  {
    id: 108,
    label: "4.5.0",
    criticalAffectedComponentCount: 0,
    highAffectedComponentCount: 4,
    eolComponentCount: 0,
  },
  {
    id: 107,
    label: "4.4.0",
    criticalAffectedComponentCount: 0,
    highAffectedComponentCount: 0,
    eolComponentCount: 2,
  },

  // Weder OSV noch EOL bewertet
  {
    id: 106,
    label: "4.3.0",
    criticalAffectedComponentCount: null,
    highAffectedComponentCount: null,
    eolComponentCount: null,
  },

  // OSV bewertet, EOL noch nicht bewertet
  {
    id: 105,
    label: "4.2.0",
    criticalAffectedComponentCount: 0,
    highAffectedComponentCount: 1,
    eolComponentCount: null,
  },

  // Ebenfalls vollständig bewertet und ohne Auffälligkeiten
  {
    id: 104,
    label: "4.1.0",
    criticalAffectedComponentCount: 0,
    highAffectedComponentCount: 0,
    eolComponentCount: 0,
  },

  // Archivierte Produktversion mit EOL-Auffälligkeit
  {
    id: 103,
    label: "4.0.0",
    criticalAffectedComponentCount: 0,
    highAffectedComponentCount: 0,
    eolComponentCount: 3,
    archivedAt: "2026-10-15T09:30:00+02:00",
  },

  // Archivierte Produktversion ohne Auffälligkeiten
  {
    id: 102,
    label: "3.9.0",
    criticalAffectedComponentCount: 0,
    highAffectedComponentCount: 0,
    eolComponentCount: 0,
    archivedAt: "2026-08-12T14:00:00+02:00",
  },

  // OSV noch nicht bewertet, EOL bereits ausgewertet
  {
    id: 101,
    label: "3.8.0",
    criticalAffectedComponentCount: null,
    highAffectedComponentCount: null,
    eolComponentCount: 1,
  },
];

/**
 * Abgeleitete Produktversionsdaten für bestehende Mock-Detailansichten.
 */
export const PRODUCT_VERSION_OVERVIEW_MOCK_VERSIONS: ProductVersion[] =
  PRODUCT_VERSION_OVERVIEW_MOCK_DATA.map(({ id, label }) => ({
    id,
    label,
  }));

/** Three-month warning horizon used by the mock detail view. */
export const PRODUCT_VERSION_OVERVIEW_MOCK_EOL_WARNING_DAYS = 90;
