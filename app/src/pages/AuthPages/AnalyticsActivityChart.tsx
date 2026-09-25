import { useEffect, useId, useRef, useState } from "react";
import type {
  AnalyticsActivityTimeline,
  AnalyticsTimelineBucket,
  AnalyticsTimelineValue
} from "../../api/analytics";
import styles from "./AnalyticsActivityChart.module.css";

const SERIES = [
  { key: "accounts", label: "Signed-in accounts" },
  { key: "anonymous", label: "Anonymous visitors" },
  { key: "legacy", label: "Signed-in browsers — legacy" }
] as const;

type SeriesKey = (typeof SERIES)[number]["key"];
const HEIGHT = 250;
const TOP = 20;
const BOTTOM = 212;
const LEFT = 42;
const RIGHT = 18;

function formatDate(value: string) {
  return new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "numeric",
    timeZone: "UTC"
  }).format(new Date(value));
}

function dateRange(start: string, end: string) {
  return start === end ? start : `${start} – ${end}`;
}

function describeValue(value: AnalyticsTimelineValue) {
  if (value.count === null)
    return value.incomplete ? "Unavailable — incomplete tracking" : "Unavailable";
  return `${value.incomplete ? "≥ " : ""}${value.count.toLocaleString()}${value.incomplete ? " (incomplete tracking)" : ""}${value.partial ? " (partial)" : ""}`;
}

function describeBucket(bucket: AnalyticsTimelineBucket, series: (typeof SERIES)[number][]) {
  return `${dateRange(bucket.start, bucket.end)}${bucket.partial ? ", partial period" : ""}. ${series
    .map(({ key, label }) => `${label}: ${describeValue(bucket[key])}`)
    .join(". ")}`;
}

function linePath(
  buckets: AnalyticsTimelineBucket[],
  key: SeriesKey,
  x: (index: number) => number,
  y: (value: number) => number
) {
  let connected = false;
  return buckets
    .map((bucket, index) => {
      const value = bucket[key].count;
      if (value === null) {
        connected = false;
        return "";
      }
      const command = connected ? "L" : "M";
      connected = true;
      return `${command}${x(index)},${y(value)}`;
    })
    .join(" ");
}

export function AnalyticsActivityChart({ timeline }: { timeline: AnalyticsActivityTimeline }) {
  const [grouping, setGrouping] = useState<"daily" | "weekly">("daily");
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [containerWidth, setContainerWidth] = useState(640);
  const viewport = useRef<HTMLDivElement>(null);
  const titleId = useId();

  useEffect(() => {
    const element = viewport.current;
    if (!element) return;
    const observer = new ResizeObserver(([entry]) => setContainerWidth(entry.contentRect.width));
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  const buckets = timeline[grouping];
  const series = SERIES.filter(
    ({ key }) => key !== "legacy" || buckets.some((bucket) => bucket.legacy.from !== null)
  );
  const selectedIndex = Math.max(
    0,
    selectedDate ? buckets.findIndex((bucket) => bucket.start === selectedDate) : buckets.length - 1
  );
  const selected = buckets[selectedIndex];
  const width = Math.max(containerWidth, buckets.length * 12 + LEFT + RIGHT);
  const maximum = buckets.reduce(
    (max, bucket) => Math.max(max, ...series.map(({ key }) => bucket[key].count ?? 0)),
    1
  );
  const step = Math.max(1, Math.ceil(maximum / 4));
  const ceiling = Math.ceil(maximum / step) * step;
  const x = (index: number) =>
    LEFT +
    (buckets.length <= 1
      ? (width - LEFT - RIGHT) / 2
      : (index * (width - LEFT - RIGHT)) / (buckets.length - 1));
  const y = (value: number) => BOTTOM - (value / ceiling) * (BOTTOM - TOP);
  const labelEvery = Math.max(1, Math.ceil(buckets.length / Math.max(2, Math.floor(width / 120))));
  const hitStart = (index: number) => (index === 0 ? LEFT - 6 : (x(index - 1) + x(index)) / 2);
  const hitEnd = (index: number) =>
    index === buckets.length - 1 ? width - RIGHT + 6 : (x(index) + x(index + 1)) / 2;
  const hasData = buckets.some((bucket) => series.some(({ key }) => bucket[key].count !== null));

  return (
    <section className={styles.section} aria-labelledby={titleId}>
      <div className={styles.header}>
        <h3 id={titleId}>Visitor Activity</h3>
        <div className={styles.controls} role="group" aria-label="Activity grouping">
          {(["daily", "weekly"] as const).map((value) => (
            <button
              key={value}
              type="button"
              aria-pressed={grouping === value}
              onClick={() => {
                setGrouping(value);
                setSelectedDate(null);
              }}
            >
              {value === "daily" ? "Daily" : "Weekly"}
            </button>
          ))}
        </div>
      </div>
      <ul className={styles.legend}>
        {series.map(({ key, label }) => (
          <li key={key}>
            <span className={`${styles.swatch} ${styles[key]}`} />
            {label}
          </li>
        ))}
      </ul>
      <div ref={viewport} className={styles.viewport}>
        {hasData ? (
          <svg
            width={width}
            height={HEIGHT}
            viewBox={`0 0 ${width} ${HEIGHT}`}
            role="group"
            aria-label={`Visitor activity graph, ${grouping} UTC intervals`}
          >
            {Array.from({ length: ceiling / step + 1 }, (_, index) => index * step).map((tick) => (
              <g key={tick} aria-hidden="true">
                <line
                  x1={LEFT}
                  x2={width - RIGHT}
                  y1={y(tick)}
                  y2={y(tick)}
                  className={styles.grid}
                />
                <text x={LEFT - 8} y={y(tick) + 4} textAnchor="end" className={styles.axis}>
                  {tick.toLocaleString()}
                </text>
              </g>
            ))}
            {series.map(({ key }) => (
              <g key={key} className={styles[key]} aria-hidden="true">
                <path d={linePath(buckets, key, x, y)} className={styles.line} />
                {buckets.map((bucket, index) =>
                  bucket[key].count === null ? null : (
                    <circle
                      key={bucket.start}
                      cx={x(index)}
                      cy={y(bucket[key].count!)}
                      r={key === "legacy" ? 4 : 3}
                      className={styles.dot}
                    />
                  )
                )}
              </g>
            ))}
            {selected && (
              <line
                x1={x(selectedIndex)}
                x2={x(selectedIndex)}
                y1={TOP}
                y2={BOTTOM}
                className={styles.cursor}
                aria-hidden="true"
              />
            )}
            {buckets.map((bucket, index) => (
              <g key={bucket.start}>
                {(index === 0 ||
                  index === buckets.length - 1 ||
                  (index % labelEvery === 0 && buckets.length - 1 - index >= labelEvery)) && (
                  <text
                    x={x(index)}
                    y={HEIGHT - 12}
                    textAnchor={
                      index === 0 ? "start" : index === buckets.length - 1 ? "end" : "middle"
                    }
                    className={styles.axis}
                    aria-hidden="true"
                  >
                    {formatDate(bucket.start)}
                  </text>
                )}
                <rect
                  x={hitStart(index)}
                  width={hitEnd(index) - hitStart(index)}
                  y={TOP}
                  height={BOTTOM - TOP}
                  fill="transparent"
                  tabIndex={0}
                  role="button"
                  aria-label={describeBucket(bucket, series)}
                  className={styles.target}
                  onPointerEnter={() => setSelectedDate(bucket.start)}
                  onFocus={() => setSelectedDate(bucket.start)}
                  onClick={() => setSelectedDate(bucket.start)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" || event.key === " ") {
                      event.preventDefault();
                      setSelectedDate(bucket.start);
                    }
                    if (event.key === "ArrowRight" || event.key === "ArrowLeft") {
                      event.preventDefault();
                      const next =
                        event.currentTarget.parentElement?.[
                          event.key === "ArrowRight"
                            ? "nextElementSibling"
                            : "previousElementSibling"
                        ];
                      next?.querySelector<SVGRectElement>("[role='button']")?.focus();
                    }
                  }}
                />
              </g>
            ))}
          </svg>
        ) : (
          <p className={styles.empty}>No recorded visitor activity is available for this range.</p>
        )}
      </div>
      {hasData && selected && (
        <div className={styles.readout} aria-live="polite" aria-atomic="true">
          <strong>
            {dateRange(selected.start, selected.end)}
            {selected.partial ? " · Partial period" : ""}
          </strong>
          <dl>
            {series.map(({ key, label }) => (
              <div key={key}>
                <dt>{label}</dt>
                <dd>
                  {describeValue(selected[key])}
                  {selected[key].from && (
                    <small>{dateRange(selected[key].from!, selected[key].through!)}</small>
                  )}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      )}
    </section>
  );
}
