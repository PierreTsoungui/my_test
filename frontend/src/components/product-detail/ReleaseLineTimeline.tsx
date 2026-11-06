import { AlertTriangle } from "lucide-react";
import type { ReleaseLine } from "../../types/productDetail";

function formatMonthYear(value: string) {
  return new Date(value).toLocaleDateString("de-DE", {
    month: "2-digit",
    year: "numeric",
  });
}

function formatFullDate(value: string) {
  return new Date(value).toLocaleDateString("de-DE");
}

function monthsUntil(value: string) {
  const target = new Date(value).getTime();
  const now = Date.now();
  return Math.round((target - now) / (1000 * 60 * 60 * 24 * 30.44));
}

export function ReleaseLineTimeline({
  releaseLine,
}: {
  releaseLine: ReleaseLine;
}) {
  const { releaseDate, eolDate } = releaseLine;

  if (!releaseDate || !eolDate) {
    return (
      <section
        aria-labelledby="timeline-heading"
        className="mt-4 rounded-lg border border-slate-200 bg-white p-4"
      >
        <h2
          id="timeline-heading"
          className="text-sm font-semibold text-slate-900"
        >
          Lebenszyklus
        </h2>
        <p className="mt-2 text-sm text-slate-500">
          Für diese Release-Linie sind keine vollständigen
          Lebenszyklus-Daten verfügbar.
        </p>
      </section>
    );
  }

  const start = new Date(releaseDate).getTime();
  const end = new Date(eolDate).getTime();
  const now = Date.now();

  const rawPercent = ((now - start) / (end - start)) * 100;
  const todayPercent = Math.min(100, Math.max(0, rawPercent));

  const isPast = now > end;
  const months = monthsUntil(eolDate);

  const phaseColor = isPast
    ? "bg-red-500"
    : months <= 12
      ? "bg-amber-500"
      : "bg-green-500";

  return (
    <section
      aria-labelledby="timeline-heading"
      className="mt-4 rounded-lg border border-slate-200 bg-white p-4"
    >
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <h2
          id="timeline-heading"
          className="text-sm font-semibold text-slate-900"
        >
          Lebenszyklus
        </h2>
        <span className="text-xs text-slate-500">
          {isPast
            ? `EOL seit ${Math.abs(months)} Monat${Math.abs(months) === 1 ? "" : "en"}`
            : `EOL in ${months} Monat${months === 1 ? "" : "en"}`}
        </span>
      </div>

      <div
        className="relative h-8"
        role="img"
        aria-label={`Lebenszyklus: Release ${formatFullDate(releaseDate)}, EOL ${formatFullDate(eolDate)}, heute bei ${todayPercent.toFixed(0)} Prozent der Strecke`}
      >
        <div className="absolute inset-x-0 top-3 h-1 rounded-full bg-slate-200" />

        <div
          className={`absolute top-3 h-1 rounded-full ${phaseColor}`}
          style={{ width: `${todayPercent}%` }}
        />

        <div
          className="absolute top-1.5 size-3.5 rounded-full border-2 border-white bg-slate-400 ring-2 ring-slate-200"
          style={{ left: 0 }}
          aria-hidden="true"
        />

        <div
          className={`absolute top-1.5 size-3.5 -translate-x-1/2 rounded-full border-2 border-white ring-2 ${
            isPast ? "bg-red-500 ring-red-200" : "bg-slate-400 ring-slate-200"
          }`}
          style={{ left: "100%" }}
          aria-hidden="true"
        />

        <div
          className="absolute top-0 -translate-x-1/2"
          style={{ left: `${todayPercent}%` }}
          aria-hidden="true"
        >
          <div className="flex flex-col items-center">
            <span className="rounded bg-slate-900 px-1.5 py-0.5 text-[10px] font-semibold text-white">
              heute
            </span>
            <div className="h-2 w-0.5 bg-slate-900" />
          </div>
        </div>
      </div>

      <div className="mt-2 flex justify-between text-xs text-slate-500">
        <span>
          <span className="block font-medium text-slate-700">Release</span>
          {formatMonthYear(releaseDate)}
        </span>
        <span className="text-right">
          <span className="block font-medium text-slate-700">EOL</span>
          {formatMonthYear(eolDate)}
        </span>
      </div>

      {!isPast && months <= 6 && (
        <p className="mt-3 flex items-start gap-2 rounded-md bg-amber-50 px-3 py-2 text-xs text-amber-900">
          <AlertTriangle
            className="mt-0.5 size-4 shrink-0"
            aria-hidden="true"
          />
          <span>
            Diese Release-Linie erreicht in weniger als 6 Monaten ihr
            End-of-Life. Planen Sie ein Upgrade.
          </span>
        </p>
      )}
    </section>
  );
}