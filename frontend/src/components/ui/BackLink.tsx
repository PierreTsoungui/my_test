import { ChevronLeft } from "lucide-react";
import { Link } from "react-router-dom";

interface ParentLinkProps {
  to: string;
  label: string;
}

export function ParentLink({ to, label }: ParentLinkProps) {
  return (
    <Link
      to={to}
      className="mb-3 inline-flex items-center gap-1 rounded text-sm text-slate-600 hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2"
    >
      <ChevronLeft className="size-4" aria-hidden="true" />
      {label}
    </Link>
  );
}