

import {
  ExternalLink,
  Loader2,
  Package,
  ShieldAlert,
  ShieldCheck,
  ShieldX,
} from "lucide-react";
import { SeverityBadge } from "../ui/SeverityBadge";
import type {
  ComponentVulnerability,
  FixStatus,
  ProductVersionUsage,
  SecurityCheck,
  VulnerabilityReference,
} from "../../types/componentDetail";
import type { UsedComponentSummary } from "../../types/productDetail";

// ============================================================
// Helper – exportiert für Unit-Tests
// ============================================================

const fixLabels: Record<FixStatus, string> = {
  AVAILABLE:     "Fix verfügbar",
  NOT_AFFECTED:  "Nicht mehr betroffen",
  NOT_SPECIFIED: "Kein Fix verfügbar",
  UNKNOWN:       "Fix-Status unbekannt",
};

const fixStyles: Record<FixStatus, string> = {
  AVAILABLE:     "text-green-700",
  NOT_AFFECTED:  "text-slate-600",
  NOT_SPECIFIED: "text-red-700",
  UNKNOWN:       "text-slate-500",
};

export function formatDateTime(value: string): string {
  return new Date(value).toLocaleString("de-DE", {
    dateStyle: "short",
    timeStyle: "short",
  });
}

const referenceLabels: Record<string, string> = {
  ADVISORY: "Advisory",
  FIX:      "Fix",
  PATCH:    "Patch",
  OSV:      "OSV",
  NVD:      "NVD",
};

/**
 * Liefert genau einen Link pro CVE:
 * 1. Erster Reference mit Typ != "OSV" (vom Backend bevorzugt)
 * 2. Sonst OSV-Reference aus references
 * 3. Sonst OSV-Link aus osvId # kann not found  sein auch  , wenn der  Id  existiert, daher   nicht sebst eine  Link  bilden 
 * 4. Sonst NVD-Link aus cveId
 * 5. Sonst null (kein Link)
 */
export function pickPrimaryReference(cve: {
  cveId: string | null;
  osvId: string | null;
  references: VulnerabilityReference[];
}): { label: string; url: string } | null {
  const primary = cve.references.find(
    (r) => r.type?.toUpperCase() !== "OSV",
  );
  if (primary) {
    return {
      label: referenceLabels[primary.type?.toUpperCase() ?? ""] ?? "Details",
      url: primary.url,
    };
  }

  const osvRef = cve.references.find(
    (r) => r.type?.toUpperCase() === "OSV",
  );
  if (osvRef) {
    return { label: "OSV", url: osvRef.url };
  }

  if (cve.osvId) {
    return {
      label: "OSV",
      url: `https://osv.dev/vulnerability/${cve.osvId}`,
    };
  }


  return null;
}

// ============================================================
// Props – schmal, testbar
// ============================================================

interface Props {
  component: UsedComponentSummary;
  vulnerabilities: ComponentVulnerability[];
  securityCheck: SecurityCheck;
  productVersionUsages: ProductVersionUsage[];
  isLoading: boolean;
  error: string | null;
}

// ============================================================
// Komponente
// ============================================================

export function UsedComponentPanel({
  component,
  vulnerabilities,
  securityCheck,
  productVersionUsages,
  isLoading,
  error,
}: Props) {
  return (
    <section
      aria-label={`Details zu ${component.name} ${component.version}`}
      className="w-full rounded-lg border border-slate-200 bg-white"
    >
      {/* Kopf */}
      <div className="border-b border-slate-200 px-4 py-3">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h2 className="truncate text-base font-semibold text-slate-900">
              {component.name}{" "}
              <span className="font-mono text-sm text-slate-500">
                {component.version}
              </span>
            </h2>
            {component.purl && (
              <p className="mt-0.5 truncate font-mono text-[11px] text-slate-500">
                {component.purl}
              </p>
            )}
          </div>
          <Package
            className="size-5 shrink-0 text-slate-300"
            aria-hidden="true"
          />
        </div>
      </div>

      {/* Eingesetzt in */}
      {productVersionUsages.length > 0 && (
        <div className="border-b border-slate-200 px-4 py-3">
          <h3 className="text-xs font-medium uppercase tracking-wide text-slate-500">
            Eingesetzt in
          </h3>
          <ul className="mt-2 flex flex-wrap gap-1.5">
            {productVersionUsages.map((usage) => (
              <li key={usage.id}>
                <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-700">
                  {usage.label}
                  {usage.cveCount > 0 && (
                    <span
                      className="rounded-full bg-red-100 px-1 text-red-700"
                      aria-label={`${usage.cveCount} CVEs in ${usage.label}`}
                    >
                      {usage.cveCount}
                    </span>
                  )}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Inhalt */}
      <div className="max-h-[60vh] overflow-y-auto p-4">
        {isLoading && (
          <p className="flex items-center gap-2 text-sm text-slate-500">
            <Loader2 className="size-4 animate-spin" aria-hidden="true" />
            Schwachstellen werden geladen…
          </p>
        )}

        {error && (
          <div
            role="alert"
            className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800"
          >
            Fehler beim Laden der Schwachstellen: {error}
          </div>
        )}

        {!isLoading && !error && (
          <VulnerabilityContent
            vulnerabilities={vulnerabilities}
            securityCheck={securityCheck}
          />
        )}
      </div>
    </section>
  );
}

// ============================================================
// Inhalt – drei Empty-States
// ============================================================

function VulnerabilityContent({
  vulnerabilities,
  securityCheck,
}: {
  vulnerabilities: ComponentVulnerability[];
  securityCheck: SecurityCheck;
}) {
  if (vulnerabilities.length > 0) {
    return (
      <ul className="space-y-3">
        {vulnerabilities.map((v) => (
          <CveCard key={v.id} cve={v} />
        ))}
      </ul>
    );
  }

  switch (securityCheck.status) {
    case "CHECKED":
      return (
        <div className="flex flex-col items-center gap-2 rounded-md border border-green-200 bg-green-50 px-4 py-6 text-center">
          <ShieldCheck className="size-8 text-green-600" aria-hidden="true" />
          <p className="text-sm font-medium text-green-900">
            Keine bekannten Schwachstellen
          </p>
          <p className="text-xs text-green-700">
            OSV.dev hat diese Version geprüft und keine CVEs gefunden.
          </p>
          {securityCheck.lastCheckedAt && (
            <p className="text-xs text-green-700">
              Zuletzt geprüft: {formatDateTime(securityCheck.lastCheckedAt)}
            </p>
          )}
        </div>
      );

    case "NOT_QUERYABLE":
      return (
        <div className="flex flex-col items-center gap-2 rounded-md border border-amber-200 bg-amber-50 px-4 py-6 text-center">
          <ShieldAlert className="size-8 text-amber-600" aria-hidden="true" />
          <p className="text-sm font-medium text-amber-900">
            Keine Prüfung möglich
          </p>
          <p className="text-xs text-amber-700">
            Diese Komponente hat keine PURL/CPE-Kennung – OSV.dev kann nicht
            nach Schwachstellen suchen.
          </p>
        </div>
      );

    case "FAILED":
      return (
        <div className="flex flex-col items-center gap-2 rounded-md border border-red-200 bg-red-50 px-4 py-6 text-center">
          <ShieldX className="size-8 text-red-600" aria-hidden="true" />
          <p className="text-sm font-medium text-red-900">
            Prüfung fehlgeschlagen
          </p>
          <p className="text-xs text-red-700">
            OSV.dev war bei der letzten Abfrage nicht erreichbar. Es könnten
            Schwachstellen fehlen.
          </p>
          {securityCheck.lastCheckedAt && (
            <p className="text-xs text-red-700">
              Letzter Versuch: {formatDateTime(securityCheck.lastCheckedAt)}
            </p>
          )}
        </div>
      );

    case "PENDING":
      return (
        <p className="flex items-center justify-center gap-2 py-6 text-sm text-slate-500">
          <Loader2 className="size-4 animate-spin" aria-hidden="true" />
          Prüfung läuft…
        </p>
      );
  }
}

// ============================================================
// CVE-Karte – ein Link pro CVE
// ============================================================

function CveCard({ cve }: { cve: ComponentVulnerability }) {
  const link = pickPrimaryReference(cve);

  return (
    <li className="rounded-md border border-slate-200 p-3">
      <div className="flex flex-wrap items-center gap-2">
        <span className="font-mono text-sm font-semibold text-slate-900">
          {cve.displayId}
        </span>
        <SeverityBadge severity={cve.severity} score={cve.cvssScore} />
      </div>

      {cve.summary && (
        <p className="mt-1 text-sm text-slate-700">{cve.summary}</p>
      )}

      <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
        <p className={`text-xs font-medium ${fixStyles[cve.fixStatus]}`}>
          {fixLabels[cve.fixStatus]}
          {cve.fixStatus === "AVAILABLE" && cve.fixVersion && (
            <span className="font-mono"> · {cve.fixVersion}</span>
          )}
        </p>

        {link && (
          <a
            href={link.url}
            target="_blank"
            rel="noreferrer noopener"
            className="inline-flex items-center gap-1 rounded text-xs font-medium text-blue-700 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
            aria-label={`${link.label} zu ${cve.displayId} (öffnet in neuem Tab)`}
          >
            {link.label}
            <ExternalLink className="size-3" aria-hidden="true" />
          </a>
        )}
      </div>
    </li>
  );
}