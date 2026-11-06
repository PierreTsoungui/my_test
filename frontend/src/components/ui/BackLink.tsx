import { ChevronLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { useBackNavigation } from "../../hooks/useBackNavigation";

export function BackLink() {
  const { backTo, backLabel } = useBackNavigation();

  return (
    <Link
      to={backTo}
      className="mb-3 inline-flex items-center gap-1 rounded text-sm text-slate-600 hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2"
    >
      <ChevronLeft className="size-4" aria-hidden="true" />
       {backLabel}
    </Link>
  );
}