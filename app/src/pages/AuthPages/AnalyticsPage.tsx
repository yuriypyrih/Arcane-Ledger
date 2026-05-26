import { RefreshCw } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import {
  fetchAnalyticsSummary,
  type AnalyticsNamedBucket,
  type AnalyticsSummary,
  type AnalyticsSummaryQuery,
  type AnalyticsSummaryRangeKey
} from "../../api/analytics";
import ActionButton from "../../components/ActionButton";
import { useAppSelector } from "../../store";
import styles from "./AnalyticsPage.module.css";

type DemographicFilter = keyof AnalyticsSummary["demographics"];

type ChartRow = {
  count: number;
  label: string;
};

type DonutLegendValue = "count" | "percent";

const DONUT_HUES = [
  "37, 88, 184",
  "202, 107, 36",
  "45, 129, 95",
  "190, 70, 75",
  "122, 82, 184"
] as const;
const DONUT_OPACITIES = [1, 0.66, 0.32] as const;
const DONUT_SEGMENT_LIMIT = DONUT_HUES.length * DONUT_OPACITIES.length;

const rangeOptions: Array<{ label: string; value: AnalyticsSummaryRangeKey }> = [
  { label: "Last 30 days", value: "last30" },
  { label: "All time", value: "all" },
  { label: "Custom", value: "custom" }
];

const demographicOptions: Array<{ label: string; value: DemographicFilter }> = [
  { label: "All", value: "all" },
  { label: "Authenticated", value: "authenticated" },
  { label: "Anonymous", value: "anonymous" }
];

const latencyLabels: Record<string, string> = {
  lt_100ms: "< 100ms",
  "100_299ms": "100-299ms",
  "300_999ms": "300-999ms",
  "1_3s": "1-3s",
  gt_3s: "> 3s"
};

function formatNumber(value: number) {
  return new Intl.NumberFormat(undefined, {
    maximumFractionDigits: 1
  }).format(value);
}

function getDateInputValue(value: Date) {
  const year = value.getFullYear();
  const month = String(value.getMonth() + 1).padStart(2, "0");
  const day = String(value.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function getDefaultCustomStart() {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - 29);

  return getDateInputValue(startDate);
}

function formatIsoDateLabel(value: string) {
  const [yearText, monthText, dayText] = value.slice(0, 10).split("-");
  const year = Number(yearText);
  const month = Number(monthText);
  const day = Number(dayText);
  const formatter = new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium"
  });

  return formatter.format(new Date(year, month - 1, day));
}

function formatDateRange(summary: AnalyticsSummary) {
  const startLabel = summary.range.start ? formatIsoDateLabel(summary.range.start) : "Beginning";

  return `${startLabel} - ${formatIsoDateLabel(summary.range.end)}`;
}

function getPercent(count: number, total: number) {
  if (total <= 0) {
    return "0%";
  }

  return `${Math.round((count / total) * 100)}%`;
}

function getSummaryQuery(
  rangeMode: AnalyticsSummaryRangeKey,
  customStart: string,
  customEnd: string
): AnalyticsSummaryQuery {
  if (rangeMode !== "custom") {
    return {
      range: rangeMode
    };
  }

  return {
    range: rangeMode,
    start: customStart,
    end: customEnd
  };
}

function toChartRows(rows: AnalyticsNamedBucket[]): ChartRow[] {
  return rows.map((row) => ({
    count: row.count,
    label: row.name
  }));
}

function getDonutSegmentColor(index: number) {
  const hue = DONUT_HUES[Math.floor(index / DONUT_OPACITIES.length)] ?? DONUT_HUES[0];
  const opacity = DONUT_OPACITIES[index % DONUT_OPACITIES.length] ?? DONUT_OPACITIES[0];

  return `rgba(${hue}, ${opacity})`;
}

function EmptyState({ label }: { label: string }) {
  return <p className={styles.emptyState}>{label}</p>;
}

function KpiCard({ label, value }: { label: string; value: number | string }) {
  return (
    <article className={styles.kpiCard}>
      <span className={styles.kpiLabel}>{label}</span>
      <strong className={styles.kpiValue}>
        {typeof value === "number" ? formatNumber(value) : value}
      </strong>
    </article>
  );
}

function SegmentButton<TValue extends string>({
  active,
  children,
  onSelect,
  value
}: {
  active: boolean;
  children: string;
  onSelect: (value: TValue) => void;
  value: TValue;
}) {
  return (
    <button
      type="button"
      aria-pressed={active}
      className={active ? styles.segmentButtonActive : styles.segmentButton}
      onClick={() => onSelect(value)}
    >
      {children}
    </button>
  );
}

function DonutChart({
  ariaLabel,
  emptyLabel,
  legendValue = "percent",
  rows
}: {
  ariaLabel: string;
  emptyLabel: string;
  legendValue?: DonutLegendValue;
  rows: ChartRow[];
}) {
  const chartRows = rows.slice(0, DONUT_SEGMENT_LIMIT);
  const total = chartRows.reduce((nextTotal, row) => nextTotal + row.count, 0);
  const circumference = 2 * Math.PI * 34;
  let offset = 0;

  if (total <= 0) {
    return (
      <div className={styles.chartEmpty}>
        <EmptyState label={emptyLabel} />
      </div>
    );
  }

  return (
    <div className={styles.chartGrid}>
      <svg className={styles.donut} viewBox="0 0 100 100" role="img" aria-label={ariaLabel}>
        <circle className={styles.donutTrack} cx="50" cy="50" r="34" />
        {chartRows.map((row, index) => {
          const segmentLength = (row.count / total) * circumference;
          const segmentOffset = offset;
          const segmentColor = getDonutSegmentColor(index);
          offset += segmentLength;

          return (
            <circle
              key={row.label}
              className={styles.donutSegment}
              cx="50"
              cy="50"
              r="34"
              stroke={segmentColor}
              strokeDasharray={`${segmentLength} ${circumference - segmentLength}`}
              strokeDashoffset={-segmentOffset}
            />
          );
        })}
      </svg>
      <ul className={styles.legend}>
        {chartRows.map((row, index) => (
          <li key={row.label} className={styles.legendItem}>
            <span
              className={styles.legendSwatch}
              style={{ backgroundColor: getDonutSegmentColor(index) }}
            />
            <span>{row.label}</span>
            <strong>
              {legendValue === "count" ? formatNumber(row.count) : getPercent(row.count, total)}
            </strong>
          </li>
        ))}
      </ul>
    </div>
  );
}

function CountTable({
  emptyLabel,
  rows,
  valueLabel
}: {
  emptyLabel: string;
  rows: Array<{ count: number; label: string }>;
  valueLabel: string;
}) {
  if (rows.length === 0) {
    return <EmptyState label={emptyLabel} />;
  }

  return (
    <table className={styles.table}>
      <thead>
        <tr>
          <th>Label</th>
          <th>{valueLabel}</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((row) => (
          <tr key={row.label}>
            <td>{row.label}</td>
            <td>{formatNumber(row.count)}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function AnalyticsPage() {
  const navigate = useNavigate();
  const { status: authStatus, user } = useAppSelector((state) => state.auth);
  const [summary, setSummary] = useState<AnalyticsSummary | null>(null);
  const [status, setStatus] = useState<"idle" | "loading" | "ready" | "error">("idle");
  const [error, setError] = useState<string | null>(null);
  const [refreshSignal, setRefreshSignal] = useState(0);
  const [rangeMode, setRangeMode] = useState<AnalyticsSummaryRangeKey>("last30");
  const [customStart, setCustomStart] = useState(getDefaultCustomStart);
  const [customEnd, setCustomEnd] = useState(() => getDateInputValue(new Date()));
  const [demographicFilter, setDemographicFilter] = useState<DemographicFilter>("all");
  const isAdmin = user?.role === "admin";

  const summaryQuery = useMemo(
    () => getSummaryQuery(rangeMode, customStart, customEnd),
    [customEnd, customStart, rangeMode]
  );
  const topRouteRows = useMemo(
    () =>
      summary?.routes.topRoutes.map((row) => ({
        label: row.route,
        count: row.count
      })) ?? [],
    [summary?.routes.topRoutes]
  );
  const latencyRows = useMemo(
    () =>
      summary?.health.latencyBuckets.map((row) => ({
        label: latencyLabels[row.label] ?? row.label,
        count: row.count
      })) ?? [],
    [summary?.health.latencyBuckets]
  );
  const classRows = useMemo(
    () => (summary ? toChartRows(summary.characters.topClasses) : []),
    [summary]
  );
  const speciesRows = useMemo(
    () => (summary ? toChartRows(summary.characters.topSpecies) : []),
    [summary]
  );
  const countryRows = useMemo(
    () =>
      summary?.demographics[demographicFilter].countries.map((country) => ({
        label: country.country,
        count: country.count
      })) ?? [],
    [demographicFilter, summary]
  );
  const demographicTotal = countryRows.reduce((total, row) => total + row.count, 0);

  useEffect(() => {
    if (!isAdmin) {
      return undefined;
    }

    let cancelled = false;
    const abortController = new AbortController();

    setStatus("loading");
    setError(null);

    void fetchAnalyticsSummary(summaryQuery, {
      signal: abortController.signal,
      suppressFailureToast: true
    })
      .then((nextSummary) => {
        if (!cancelled) {
          setSummary(nextSummary);
          setStatus("ready");
        }
      })
      .catch(() => {
        if (!cancelled) {
          setSummary(null);
          setStatus("error");
          setError("Unable to load analytics.");
        }
      });

    return () => {
      cancelled = true;
      abortController.abort();
    };
  }, [isAdmin, refreshSignal, summaryQuery]);

  if (authStatus === "unknown") {
    return (
      <section className={styles.page}>
        <div className={styles.panel}>
          <p className={styles.eyebrow}>Analytics</p>
          <h2 className={styles.title}>Loading</h2>
        </div>
      </section>
    );
  }

  if (!user) {
    return <Navigate replace to="/login" />;
  }

  if (!isAdmin) {
    return (
      <section className={styles.page}>
        <div className={styles.panel}>
          <p className={styles.eyebrow}>Analytics</p>
          <h2 className={styles.title}>Unavailable</h2>
          <p className={styles.text}>This page is available to admins only.</p>
          <div className={styles.actions}>
            <ActionButton type="button" fullWidth={false} onClick={() => navigate("/account")}>
              Account
            </ActionButton>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className={styles.page}>
      <div className={styles.dashboard}>
        <header className={styles.header}>
          <div>
            <p className={styles.eyebrow}>Analytics</p>
            <h2 className={styles.title}>Admin Overview</h2>
            {summary ? <p className={styles.text}>{formatDateRange(summary)}</p> : null}
            {summary ? (
              <dl className={styles.overviewRows}>
                <div>
                  <dt>Active users</dt>
                  <dd>{formatNumber(summary.overview.totalActiveUsers)}</dd>
                </div>
                <div>
                  <dt>Active characters</dt>
                  <dd>{formatNumber(summary.overview.totalActiveCharacters)}</dd>
                </div>
              </dl>
            ) : null}
          </div>
          <div className={styles.headerControls}>
            <div className={styles.segmentedControl} aria-label="Analytics range">
              {rangeOptions.map((option) => (
                <SegmentButton
                  key={option.value}
                  active={rangeMode === option.value}
                  value={option.value}
                  onSelect={setRangeMode}
                >
                  {option.label}
                </SegmentButton>
              ))}
            </div>
            {rangeMode === "custom" ? (
              <div className={styles.dateControls}>
                <label className={styles.dateField}>
                  <span>Start</span>
                  <input
                    type="date"
                    value={customStart}
                    onChange={(event) => setCustomStart(event.target.value)}
                  />
                </label>
                <label className={styles.dateField}>
                  <span>End</span>
                  <input
                    type="date"
                    value={customEnd}
                    onChange={(event) => setCustomEnd(event.target.value)}
                  />
                </label>
              </div>
            ) : null}
            <ActionButton
              icon={<RefreshCw size={16} aria-hidden="true" />}
              fullWidth={false}
              loading={status === "loading"}
              onClick={() => setRefreshSignal((currentSignal) => currentSignal + 1)}
            >
              Refresh
            </ActionButton>
          </div>
        </header>

        {error ? <div className={styles.error}>{error}</div> : null}

        {summary ? (
          <>
            <div className={styles.kpiGrid}>
              <KpiCard label="Created Users" value={summary.overview.createdUsers} />
              <KpiCard label="Created Characters" value={summary.overview.createdCharacters} />
              <KpiCard label="Anonymous Visitors" value={summary.overview.anonymousVisitors} />
              <KpiCard label="Emails Sent" value={summary.overview.emailsSent} />
            </div>

            <div className={styles.sectionGrid}>
              <section className={styles.section}>
                <div className={styles.sectionHeader}>
                  <div>
                    <h3>Demographics</h3>
                    <span>{formatNumber(demographicTotal)} visitors</span>
                  </div>
                  <div className={styles.segmentedControlCompact} aria-label="Demographics filter">
                    {demographicOptions.map((option) => (
                      <SegmentButton
                        key={option.value}
                        active={demographicFilter === option.value}
                        value={option.value}
                        onSelect={setDemographicFilter}
                      >
                        {option.label}
                      </SegmentButton>
                    ))}
                  </div>
                </div>
                <DonutChart
                  ariaLabel="Visitor countries"
                  emptyLabel="No demographics yet."
                  rows={countryRows}
                />
              </section>

              <section className={styles.section}>
                <div className={styles.sectionHeader}>
                  <h3>Top Routes</h3>
                  <span>{formatNumber(summary.routes.topRoutes.length)} routes</span>
                </div>
                <CountTable
                  emptyLabel="No route data yet."
                  rows={topRouteRows}
                  valueLabel="Views"
                />
              </section>
            </div>
            <section className={styles.section}>
              <div className={styles.sectionHeader}>
                <h3>Characters</h3>
                <span>{formatNumber(summary.overview.totalActiveCharacters)} active</span>
              </div>
              <div className={styles.characterCharts}>
                <div className={styles.chartPanel}>
                  <h4>Classes</h4>
                  <DonutChart
                    ariaLabel="Character classes"
                    emptyLabel="No class data yet."
                    legendValue="count"
                    rows={classRows}
                  />
                </div>
                <div className={styles.chartPanel}>
                  <h4>Species</h4>
                  <DonutChart
                    ariaLabel="Character species"
                    emptyLabel="No species data yet."
                    legendValue="count"
                    rows={speciesRows}
                  />
                </div>
              </div>
            </section>
            <section className={styles.section}>
              <div className={styles.sectionHeader}>
                <h3>Server Health</h3>
                <span>{formatNumber(summary.health.apiRequests)} API requests</span>
              </div>
              <div className={styles.splitTables}>
                <CountTable
                  emptyLabel="No status data yet."
                  rows={summary.health.statusFamilies}
                  valueLabel="Requests"
                />
                <CountTable
                  emptyLabel="No latency data yet."
                  rows={latencyRows}
                  valueLabel="Requests"
                />
              </div>
            </section>
          </>
        ) : (
          <div className={styles.panel}>
            <p className={styles.eyebrow}>Analytics</p>
            <h2 className={styles.title}>{status === "loading" ? "Loading" : "No Data"}</h2>
            <p className={styles.text}>
              {status === "loading"
                ? "Preparing the latest summary."
                : "Analytics will appear after the first collected events."}
            </p>
          </div>
        )}
      </div>
    </section>
  );
}

export default AnalyticsPage;
