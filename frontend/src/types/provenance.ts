// types/provenance.ts

export interface SourceInfo {
  source: string;                  // "endoflife.date", "osv.dev"
  lastUpdatedAt: string;           // ISO-Datum
}

export interface Provenance {
  lifecycle: SourceInfo | null;
  vulnerability: SourceInfo | null;
}