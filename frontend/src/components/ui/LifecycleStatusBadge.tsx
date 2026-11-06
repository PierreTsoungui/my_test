import {
  lifecycleLabels,
  type ComponentLifecycleStatus,
} from "../../config/statusConfig";

const styles: Record<ComponentLifecycleStatus, string> = {
  ACTIVE:   "bg-green-50 text-green-700 ring-green-200",
  NEAR_EOL: "bg-amber-50 text-amber-800 ring-amber-200",
  EOL:      "bg-red-50 text-red-700 ring-red-200",
  UNKNOWN:  "bg-slate-50 text-slate-600 ring-slate-200",
};

const dots: Record<ComponentLifecycleStatus, string> = {
  ACTIVE:   "bg-green-500",
  NEAR_EOL: "bg-amber-500",
  EOL:      "bg-red-500",
  UNKNOWN:  "bg-slate-400",
};

export function LifecycleStatusBadge({
  status,
}: {
  status: ComponentLifecycleStatus;
}) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ${styles[status]}`}
    >
      <span
        className={`size-1.5 rounded-full ${dots[status]}`}
        aria-hidden="true"
      />
      {lifecycleLabels[status]}
    </span>
  );
}