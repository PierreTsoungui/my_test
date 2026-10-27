export const lifecycleColors = {
  ACTIVE: "#22C55E",
  NEAR_EOL: "#F59E0B",
  EOL: "#EF4444",
  UNKNOWN: "#94A3B8",
} as const;

export const severityColors = {
  CRITICAL: "#7F1D1D",
  HIGH: "#DC2626",
  MEDIUM: "#F59E0B",
  LOW: "#22C55E",
  UNKNOWN: "#94A3B8",
} as const;


export type ComponentLifecycleStatus = keyof typeof lifecycleColors;

export const lifecycleLabels: Record<
  ComponentLifecycleStatus,
  string
> = {
  ACTIVE: "Aktiv",
  NEAR_EOL: "Bald EOL",
  EOL: "EOL",
  UNKNOWN: "Unbekannt",
};
export type Severity =
  keyof typeof severityColors;
export const severityLabels: Record<
  Severity,
  string
> = {
  CRITICAL: "Kritisch",
  HIGH: "Hoch",
  MEDIUM: "Mittel",
  LOW: "Niedrig",
  UNKNOWN: "Unbekannt",
};