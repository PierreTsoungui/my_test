import { useId, useState } from "react";
import type { DonutChartProps } from "../../types/chart";;

export function DonutChart({
  data,
  total,
  centerLabel,
  size = 140,
  thickness = 16,
}: DonutChartProps) {
  const tooltipId = useId();
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const calculatedTotal = data.reduce(
    (sum, segment) => sum + segment.value,
    0,
  );

  const displayTotal = total ?? calculatedTotal;
  const radius = (size - thickness) / 2;
  const circumference = 2 * Math.PI * radius;

  let offset = 0;

  const segments = data.map((segment) => {
    const length =
      calculatedTotal > 0 && segment.value > 0
        ? (segment.value / calculatedTotal) * circumference
        : 0;

    const currentSegment = {
      ...segment,
      length,
      offset,
      percentage:
        calculatedTotal > 0
          ? (segment.value / calculatedTotal) * 100
          : 0,
    };

    offset += length;
    return currentSegment;
  });

  const activeSegment =
    activeIndex === null ? null : segments[activeIndex];

  return (
    <div
      className="relative shrink-0"
      style={{ width: size, height: size }}
    >
      <svg
        viewBox={`0 0 ${size} ${size}`}
        className="h-full w-full -rotate-90 overflow-visible"
        role="group"
        aria-label={`${centerLabel}: ${displayTotal}`}
      >
        {segments.map((segment, index) => (
          <circle
            key={`${segment.label}-${index}`}
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={segment.color}
            strokeWidth={thickness}
            strokeDasharray={`${segment.length} ${
              circumference - segment.length
            }`}
            strokeDashoffset={-segment.offset}
            strokeLinecap="butt"
            tabIndex={0}
            role="img"
            aria-label={`${segment.label}: ${segment.value}, ${segment.percentage.toFixed(1)} Prozent`}
            aria-describedby={
              activeIndex === index ? tooltipId : undefined
            }
            className="cursor-pointer outline-none focus-visible:stroke-[5px]"
            onMouseEnter={() => setActiveIndex(index)}
            onMouseLeave={() => setActiveIndex(null)}
            onFocus={() => setActiveIndex(index)}
            onBlur={() => setActiveIndex(null)}
            onClick={() =>
              setActiveIndex((current) =>
                current === index ? null : index,
              )
            }
            onKeyDown={(event) => {
              if (event.key === "Escape") {
                setActiveIndex(null);
              }
            }}
          >
            <title>
              {`${segment.label}: ${segment.value} (${segment.percentage.toFixed(1)} %)`}
            </title>
          </circle>
        ))}
      </svg>

      <div
        className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center"
        aria-hidden="true"
      >
        <span className="text-2xl font-semibold leading-tight text-slate-900">
          {displayTotal}
        </span>
        <span className="text-xs text-slate-600">
          {centerLabel}
        </span>
      </div>

      {activeSegment && (
        <div
          id={tooltipId}
          role="tooltip"
          className="absolute left-1/2 top-0 z-10 min-w-max -translate-x-1/2 -translate-y-full rounded-md bg-slate-900 px-3 py-2 text-sm text-white shadow-lg"
        >
          <div className="font-medium">{activeSegment.label}</div>
          <div>
            {activeSegment.value} (
            {activeSegment.percentage.toFixed(1)} %)
          </div>
        </div>
      )}
    </div>
  );
}