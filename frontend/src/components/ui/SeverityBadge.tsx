import { severityLabels, type Severity } from "../../config/statusConfig";

const styles: Record<Severity, string> = {
  CRITICAL: "bg-red-700 text-white",
  HIGH:     "bg-red-500 text-white",
  MEDIUM:   "bg-amber-400 text-slate-900",
  LOW:      "bg-green-500 text-white",
  UNKNOWN:  "bg-slate-400 text-white",
};

export function SeverityBadge({
  severity,
  score,
}: {
  severity: Severity;
  score?: number | null;
}) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <span
        className={`rounded px-1.5 py-0.5 text-xs font-semibold ${styles[severity]}`}
      >
        {severityLabels[severity]}
      </span>
      {score !== null && score !== undefined && (
        <span className="text-xs tabular-nums text-slate-500">
          CVSS {score.toFixed(1)}
        </span>
      )}
    </span>
  );
}