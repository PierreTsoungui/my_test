
import type { DonutSegment } from "../types/chart";

export const lifecycleDemoData: DonutSegment[] = [
  { label: "Aktiv", value: 42, color: "#22C55E" },
  { label: "Bald EOL", value: 13, color: "#F59E0B" },
  { label: "EOL", value: 5, color: "#EF4444" },
  { label: "Unbekannt", value: 3, color: "#94A3B8" },
];

export const vulnerabilityDemoData: DonutSegment[] = [
  { label: "Kritisch", value: 8, color: "#7F1D1D" },
  { label: "Hoch", value: 17, color: "#DC2626" },
  { label: "Mittel", value: 24, color: "#F59E0B" },
  { label: "Niedrig", value: 11, color: "#22C55E" },
  { label: "Unbekannt", value: 5, color: "#94A3B8" },
];
