
import type { UpcomingEolItem } from "../../types/chart";
import { Pagination } from "../ui/Pagination";

interface UpcomingEolCardProps {
  items: UpcomingEolItem[];
  totalItems: number;
  currentPage: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onViewDetails: (item: UpcomingEolItem) => void;
  isLoading?: boolean;
  error?: string | null;
}

const DAY_IN_MS = 1000 * 60 * 60 * 24;

function parseDate(date: string): Date {
  return new Date(`${date}T00:00:00Z`);
}

function formatDate(date: string): string {
  return new Intl.DateTimeFormat("de-DE", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  }).format(parseDate(date));
}

function getDaysRemaining(eolDate: string): number {
  const today = new Date();
  const todayUtc = Date.UTC(
    today.getFullYear(),
    today.getMonth(),
    today.getDate(),
  );

  return Math.ceil((parseDate(eolDate).getTime() - todayUtc) / DAY_IN_MS);
}

function getRemainingLabel(daysRemaining: number): string {
  if (daysRemaining < 0) {
    return `Support-Ende seit ${Math.abs(daysRemaining)} Tagen überschritten`;
  }

  if (daysRemaining === 0) {
    return "Support-Ende heute";
  }

  const months = Math.ceil(daysRemaining / 30);

  return `EOL in ca. ${months} ${months === 1 ? "Monat" : "Monaten"}`;
}

function getLifecycleProgress(
  releaseDate: string,
  eolDate: string,
): number {
  const start = parseDate(releaseDate).getTime();
  const end = parseDate(eolDate).getTime();
  const now = Date.now();

  if (end <= start) {
    return 100;
  }

  return Math.max(0, Math.min(100, ((now - start) / (end - start)) * 100));
}

function getLifecycleColor(daysRemaining: number): string {
  if (daysRemaining <= 90) {
    return "bg-red-600 text-red-600";
  }

  if (daysRemaining <= 180) {
    return "bg-amber-600 text-amber-700";
  }

  return "bg-blue-600 text-blue-700";
}

export function UpcomingEolCard({
  items,
  totalItems,
  currentPage,
  pageSize,
  onPageChange,
  onViewDetails,
  isLoading = false,
  error = null,
}: UpcomingEolCardProps) {

    
  return (
    <section
      aria-labelledby="upcoming-eol-title"
      className="flex h-full min-w-0 flex-col rounded-2xl border
        border-slate-200 bg-white p-4 shadow-sm sm:p-5"
    >
      <header className="mb-4">
        <h2
          id="upcoming-eol-title"
          className="text-base font-semibold leading-6 text-slate-900 sm:text-lg"
        >
          Bevorstehendes Support-Ende (EOL)
        </h2>

        <p className="mt-2 max-w-prose text-sm leading-5 text-slate-500">
          Komponenten, deren Support innerhalb der nächsten 12 Monate endet.
        </p>
      </header>

      <div className="min-w-0 flex-1">
        {isLoading ? (
          <p
            role="status"
            className="py-8 text-center text-sm text-slate-600"
          >
            EOL-Daten werden geladen …
          </p>
        ) : error ? (
          <p
            role="alert"
            className="py-8 text-center text-sm text-red-700"
          >
            {error}
          </p>
        ) : items.length === 0 ? (
          <p className="py-8 text-center text-sm text-slate-600">
            Keine EOL-Komponenten für diese Seite gefunden.
          </p>
        ) : (
          <ul className="space-y-2">
            {items.map((item) => {
              const daysRemaining = getDaysRemaining(item.eolDate);
              const progress = getLifecycleProgress(
                item.releaseDate,
                item.eolDate,
              );
              const colors = getLifecycleColor(daysRemaining);
              const [barColor, textColor] = colors.split(" ");

              return (
                <li
                  key={item.id}
                  className="min-w-0 rounded-xl border border-slate-200
                    bg-slate-50/50 px-3 py-2"
                >
                  <div className="flex min-w-0 flex-wrap items-start justify-between gap-x-3 gap-y-1">
                    <h3 className="min-w-0 break-words text-sm font-semibold text-slate-800">
                      {item.component} {item.version}
                    </h3>
                  </div>

                  <p className="mt-1 text-xs text-slate-500">
                    Release: {formatDate(item.releaseDate)}
                  </p>

                  <div className="mt-1.5 flex flex-wrap items-center justify-between gap-x-3 gap-y-1">
                    <span className="text-xs text-slate-500">
                      Lebenszyklus
                    </span>

                    <span className={`text-right text-xs font-semibold ${textColor}`}>
                      Support-Ende: {formatDate(item.eolDate)}
                    </span>
                  </div>

                  <div
                    className="mt-1 h-1.5 overflow-hidden rounded-full bg-slate-200"
                    role="progressbar"
                    aria-label={`Verstrichener Lebenszyklus von ${item.component} ${item.version}`}
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-valuenow={Math.round(progress)}
                    aria-valuetext={`${Math.round(progress)} Prozent des Zeitraums seit Release bis zum EOL-Datum`}
                  >
                    <div
                      className={`h-full rounded-full ${barColor}`}
                      style={{ width: `${progress}%` }}
                    />
                  </div>

                  <div className="mt-1 flex flex-wrap items-center justify-between gap-x-3 gap-y-1">
                    <button
                      type="button"
                      onClick={() => onViewDetails(item)}
                      className="inline-flex min-h-7 items-center gap-1 rounded
                        text-xs font-medium text-blue-700
                        hover:text-blue-900
                        focus-visible:outline-none focus-visible:ring-2
                        focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                      aria-label={`Details zu ${item.component} ${item.version} ansehen`}
                    >
                      Details ansehen
                      <span aria-hidden="true">→</span>
                    </button>

                    <span className={`text-right text-xs font-medium ${textColor}`}>
                      {getRemainingLabel(daysRemaining)}
                    </span>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      {!isLoading && !error && (
        <Pagination
             currentPage={currentPage}
            totalItems={totalItems}
            pageSize={pageSize}
            onPageChange={onPageChange}
            ariaLabel="Seitennavigation für bevorstehende Support-Enden"
            itemLabel="Komponenten"
        />
        )}
    </section>
  );
}
