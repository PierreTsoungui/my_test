import type {
  DonutSegment,
  LifecycleApiItem,
  VulnerabilityApiItem,
} from "../types/chart";

import {
  lifecycleColors,
  lifecycleLabels,
  severityColors,
  severityLabels,
} from "../config/statusConfig";

export function mapLifecycleData(
  items: LifecycleApiItem[],
): DonutSegment[] {
  return items.map((item) => ({
    label: lifecycleLabels[item.status],
    value: item.count,
    color: lifecycleColors[item.status],
  }));
}
export function mapVulnerabilityData(
  items: VulnerabilityApiItem[],
): DonutSegment[] {
  return items.map((item) => ({
    label: severityLabels[item.severity],
    value: item.count,
    color: severityColors[item.severity],
  }));
}