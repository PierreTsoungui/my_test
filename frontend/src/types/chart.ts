
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

