import type { DonutSummaryCardProps } from "../../types/chart";
import { DonutChart } from "../charts/DonutChart";

export function DonutSummaryCard({
  title,
  data,
  centerLabel,
  total,
}: DonutSummaryCardProps) {
  const totalValue = total ?? data.reduce((sum, segment) => sum + segment.value, 0);

  return (
    <section className="h-full rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <h2 className="mb-5 text-base font-semibold text-slate-900">
        {title}
      </h2>

      <div className="flex flex-col items-center gap-6 sm:flex-row sm:gap-8">
        {/* Donut-Diagramm */}
        <div className="flex shrink-0 justify-center">
          <DonutChart
            data={data}
            total={totalValue}
            centerLabel={centerLabel}
          />
        </div>

        {/* Legende: Feste Breite verhindert, dass die Zahlen wegrutschen */}
        <ul className="flex w-full max-w-xs flex-col justify-center gap-3">
          {data.map((segment) => (
            <li
              key={segment.label}
              className="flex items-center gap-3 text-sm"
            >
              {/* Farbpunkt mit dezentem Ring */}
              <span
                aria-hidden="true"
                className="h-3 w-3 shrink-0 rounded-full ring-2 ring-white ring-offset-1 ring-offset-slate-50"
                style={{ backgroundColor: segment.color }}
              />

              {/* Label: Bekommt eine feste Breite (z.B. w-28), damit alle Zahlen exakt untereinander stehen */}
              <span className="w-28 shrink-0 truncate text-slate-700">
                {segment.label}
              </span>

              {/* Zahlen: Kleben direkt am Label */}
              <span
                className="flex shrink-0 items-baseline gap-1.5 tabular-nums"
                aria-label={`${segment.value} von ${totalValue}`}
              >
                <span className="font-semibold text-slate-900">
                  {segment.value}
                </span>
               
              </span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}