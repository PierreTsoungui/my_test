
import type { SecurityRisk } from "../types/chart";

export const securityRisksDemoData: SecurityRisk[] = [
  {
    id: "1",
    component: "log4j-core",
    vulnerabilityId: "CVE-2021-44228",
    severity: "CRITICAL",
    score: 10.0,
  },
  {
    id: "2",
    component: "spring-core",
    vulnerabilityId: "CVE-2022-22965",
    severity: "CRITICAL",
    score: 9.8,
  },
  {
    id: "3",
    component: "jackson-databind",
    vulnerabilityId: "CVE-2020-36518",
    severity: "HIGH",
    score: 8.1,
  },
  {
    id: "4",
    component: "commons-io",
    vulnerabilityId: "CVE-2024-47554",
    severity: "HIGH",
    score: 7.5,
  },
  {
    id: "5",
    component: "snakeyaml",
    vulnerabilityId: "CVE-2022-1471",
    severity: "CRITICAL",
    score: 9.8,
  },
  {
    id: "6",
    component: "guava",
    vulnerabilityId: "CVE-2023-2976",
    severity: "HIGH",
    score: 7.5,
  },
  {
    id: "7",
    component: "tomcat-embed-core",
    vulnerabilityId: "CVE-2024-50379",
    severity: "HIGH",
    score: 9.8,
  },
  {
    id: "8",
    component: "protobuf-java",
    vulnerabilityId: "CVE-2022-3171",
    severity: "MEDIUM",
    score: 6.5,
  },
  {
    id: "9",
    component: "commons-compress",
    vulnerabilityId: "CVE-2024-26308",
    severity: "MEDIUM",
    score: 5.5,
  },
  {
    id: "10",
    component: "httpclient",
    vulnerabilityId: "CVE-2020-13956",
    severity: "LOW",
    score: 3.1,
  },
];