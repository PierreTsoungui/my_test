import type { ComponentLifecycleStatus, Severity } from "../config/statusConfig";


export interface DonutSegment {
  label: string;
  value: number;
  color: string;
}

export interface DonutChartProps {
  data: DonutSegment[];
  total?: number;
  centerLabel: string;
  size?: number;
  thickness?: number;
}

export interface DonutSummaryCardProps {
  title: string;
  data: DonutSegment[];
  centerLabel: string;
  total?: number;
}


export interface SecurityRisk {
  id: string;
  component: string;
  vulnerabilityId: string;
  severity: Severity;
  score: number;
}


export interface UpcomingEolItem {
  id: string;
  component: string;
  version: string;
  releaseDate: string;
  eolDate: string;
}
