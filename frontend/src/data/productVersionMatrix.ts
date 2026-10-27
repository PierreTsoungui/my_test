
import type { ProductVersionMatrixData } from "../types/productVersionMatrix";

export const productVersionMatrixMock: ProductVersionMatrixData = {
  productVersions: [
    {
      id: "pv-1",
      name: "WebApp 1.0",
      releaseDate: "2025-03-15",
    },
    {
      id: "pv-2",
      name: "WebApp 2.0",
      releaseDate: "2025-09-20",
    },
    {
      id: "pv-3",
      name: "WebApp 3.0",
      releaseDate: "2026-04-10",
    },
  ],

  components: [
    {
      id: "comp-1",
      name: "React",
      category: "Frontend Framework",
      productVersions: {
        "pv-1": {
          version: "18.2.0",
          lifecycleStatus: "ACTIVE",
          supportEndDate: "2025-12-31",
          vulnerabilities: {
            total: 2,
            bySeverity: {
              HIGH: 1,
              MEDIUM: 1,
            },
          },
        },
        "pv-2": {
          version: "18.3.1",
          lifecycleStatus: "ACTIVE",
          supportEndDate: "2026-12-31",
          vulnerabilities: {
            total: 1,
            bySeverity: {
              MEDIUM: 1,
            },
          },
        },
        "pv-3": {
          version: "19.1.0",
          lifecycleStatus: "ACTIVE",
          supportEndDate: "2027-06-30",
          vulnerabilities: {
            total: 0,
            bySeverity: {},
          },
        },
      },
    },
    {
      id: "comp-2",
      name: "Spring Boot",
      category: "Backend Framework",
      productVersions: {
        "pv-1": {
          version: "2.7.18",
          lifecycleStatus: "EOL",
          supportEndDate: "2024-12-31",
          vulnerabilities: {
            total: 4,
            bySeverity: {
              CRITICAL: 1,
              HIGH: 2,
              MEDIUM: 1,
            },
          },
        },
        "pv-2": {
          version: "3.2.5",
          lifecycleStatus: "NEAR_EOL",
          supportEndDate: "2025-06-30",
          vulnerabilities: {
            total: 2,
            bySeverity: {
              HIGH: 1,
              LOW: 1,
            },
          },
        },
        "pv-3": {
          version: "3.5.0",
          supportEndDate: "2026-12-31",
          lifecycleStatus: "ACTIVE",
          vulnerabilities: null,
        },
      },
    },
    {
      id: "comp-3",
      name: "MariaDB",
      category: "Datenbank",
      productVersions: {
        "pv-1": {
          version: "10.6",
          supportEndDate: "2025-05-31",
          lifecycleStatus: "NEAR_EOL",
          vulnerabilities: {
            total: 1,
            bySeverity: {
              HIGH: 1,
            },
          },
        },
        "pv-2": {
          version: "10.11",
          supportEndDate: "2027-05-31",
          lifecycleStatus: "ACTIVE",
          vulnerabilities: {
            total: 0,
            bySeverity: {},
          },
        },
        "pv-3": {
          version: "11.4",
          supportEndDate: "2029-05-31",
          lifecycleStatus: "ACTIVE",
          vulnerabilities: {
            total: 1,
            bySeverity: {
              MEDIUM: 1,
            },
          },
        },
      },
    },
    {
      id: "comp-4",
      name: "Node.js",
      category: "Runtime",
      productVersions: {
        "pv-1": {
          version: "16.20.2",
          supportEndDate: "2024-12-31",
          lifecycleStatus: "EOL",
          vulnerabilities: {
            total: 5,
            bySeverity: {
              CRITICAL: 2,
              HIGH: 2,
              MEDIUM: 1,
            },
          },
        },
        "pv-2": {
          version: "20.15.1",
          supportEndDate: "2025-12-31",
          lifecycleStatus: "ACTIVE",
          vulnerabilities: {
            total: 1,
            bySeverity: {
              LOW: 1,
            },
          },
        },
        "pv-3": {
          version: "22.14.0",
          supportEndDate: "2027-12-31",
          lifecycleStatus: "ACTIVE",

          vulnerabilities: {
            total: 0,
            bySeverity: {},
          },
        },
      },
    },
    {
      id: "comp-5",
      name: "OpenSSL",
      category: "Systembibliothek",
      productVersions: {
        "pv-1": {
          version: "1.1.1",
          lifecycleStatus: "UNKNOWN",
          supportEndDate: null,
          vulnerabilities: null,
        },
        "pv-2": {
          version: "3.0.14",
          lifecycleStatus: "ACTIVE",
          supportEndDate: "2026-12-31",
          vulnerabilities: {
            total: 2,
            bySeverity: {
              HIGH: 1,
              MEDIUM: 1,
            },
          },
        },
        "pv-3": {
          version: "3.4.1",
          lifecycleStatus: "ACTIVE",
          supportEndDate: "2028-12-31",
          vulnerabilities: {
            total: 0,
            bySeverity: {},
          },
        },
      },
    },
    {
      id: "comp-6",
      name: "Lodash",
      category: "JavaScript-Bibliothek",
      productVersions: {
        "pv-1": {
          version: "4.17.20",
          lifecycleStatus: "ACTIVE",
          supportEndDate: "2025-12-31",
          vulnerabilities: {
            total: 3,
            bySeverity: {
              HIGH: 1,
              MEDIUM: 2,
            },
          },
        },
        "pv-2": {
          version: "4.17.21",
          lifecycleStatus: "ACTIVE",
          supportEndDate: "2026-12-31",
          vulnerabilities: {
            total: 0,
            bySeverity: {},
          },
        },
      },
    },
    {
      id: "comp-7",
      name: "Python",
      category: "Runtime",
    
      productVersions: {
        "pv-2": {
          version: "3.10.14",
          lifecycleStatus: "NEAR_EOL",
          supportEndDate: "2025-12-31",
          vulnerabilities: {
            total: 2,
            bySeverity: {
              HIGH: 1,
              MEDIUM: 1,
            },
          },
        },
        "pv-3": {
          version: "3.12.9",
          lifecycleStatus: "ACTIVE",
          supportEndDate: "2027-12-31",
          vulnerabilities: {
        
            total: 0,
            bySeverity: {},
          },
        },
      },
    },
    {
      id: "comp-8",
      name: "Legacy Library",
      category: "Sonstige",
      productVersions: {
        "pv-1": {
          version: null,
          supportEndDate: null,
          lifecycleStatus: "UNKNOWN",
          vulnerabilities: null,
        },
      },
    },
  ],

  totalComponents: 8,
};
