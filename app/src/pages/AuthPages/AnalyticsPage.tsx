import { RefreshCw } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { fetchAnalyticsSummary, type AnalyticsSummary } from "../../api/analytics";
import ActionButton from "../../components/ActionButton";
import { useAppSelector } from "../../store";
import styles from "./AnalyticsPage.module.css";

const donutColors = [
  "#2558b8",
  "#2a7e4e",
  "#9b5a1e",
  "#8a3ffc",
  "#c2410c",
  "#0f766e",
  "#be185d",
  "#4f46e5",
  "#6d6a00",
  "#64748b",
  "#8b5e3c"
];

function formatNumber(value: number) {
  return new Intl.NumberFormat(undefined, {
    maximumFractionDigits: 1
  }).format(value);
}

function formatDateRange(summary: AnalyticsSummary) {
  const formatter = new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium"
  });

  return `${formatter.format(new Date(summary.range.start))} - ${formatter.format(
    new Date(summary.range.end)
  )}`;
}

function getPercent(count: number, total: number) {
  if (total <= 0) {
    return "0%";
  }

  return `${Math.round((count / total) * 100)}%`;
}

function EmptyState({ label }: { label: string }) {
  return <p className={styles.emptyState}>{label}</p>;
}

function KpiCard({ label, value }: { label: string; value: number | string }) {
  return (
    <article className={styles.kpiCard}>
      <span className={styles.kpiLabel}>{label}</span>
      <strong className={styles.kpiValue}>{typeof value === "number" ? formatNumber(value) : value}</strong>
    </article>
  );
}

function CountryDonut({ countries }: { countries: AnalyticsSummary["demographics"]["countries"] }) {
  const total = countries.reduce((nextTotal, country) => nextTotal + country.count, 0);
  const circumference = 2 * Math.PI * 34;
  let offset = 0;

  if (total <= 0) {
    return (
      <div className={styles.chartEmpty}>
        <EmptyState label="No demographics yet." />
      </div>
    );
  }

  return (
    <div className={styles.chartGrid}>
      <svg className={styles.donut} viewBox="0 0 100 100" role="img" aria-label="Visitor countries">
        <circle className={styles.donutTrack} cx="50" cy="50" r="34" />
        {countries.map((country, index) => {
          const segmentLength = (country.count / total) * circumference;
          const segmentOffset = offset;
          offset += segmentLength;

          return (
            <circle
              key={country.country}
              className={styles.donutSegment}
              cx="50"
              cy="50"
              r="34"
              stroke={donutColors[index % donutColors.length]}
              strokeDasharray={`${segmentLength} ${circumference - segmentLength}`}
              strokeDashoffset={-segmentOffset}
            />
          );
        })}
      </svg>
      <ul className={styles.legend}>
        {countries.map((country, index) => (
          <li key={country.country} className={styles.legendItem}>
            <span
              className={styles.legendSwatch}
              style={{ backgroundColor: donutColors[index % donutColors.length] }}
            />
            <span>{country.country}</span>
            <strong>{getPercent(country.count, total)}</strong>
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
  const isAdmin = user?.role === "admin";

  const topClassRows = useMemo(
    () =>
      summary?.characters.topClasses.map((row) => ({
        label: row.name,
        count: row.count
      })) ?? [],
    [summary?.characters.topClasses]
  );
  const topSpeciesRows = useMemo(
    () =>
      summary?.characters.topSpecies.map((row) => ({
        label: row.name,
        count: row.count
      })) ?? [],
    [summary?.characters.topSpecies]
  );
  const topRouteRows = useMemo(
    () =>
      summary?.usage.topRoutes.map((row) => ({
        label: row.route,
        count: row.count
      })) ?? [],
    [summary?.usage.topRoutes]
  );

  useEffect(() => {
    if (!isAdmin) {
      return undefined;
    }

    let cancelled = false;
    const abortController = new AbortController();

    setStatus("loading");
    setError(null);

    void fetchAnalyticsSummary({
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
  }, [isAdmin, refreshSignal]);

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
          </div>
          <ActionButton
            icon={<RefreshCw size={16} aria-hidden="true" />}
            fullWidth={false}
            loading={status === "loading"}
            onClick={() => setRefreshSignal((currentSignal) => currentSignal + 1)}
          >
            Refresh
          </ActionButton>
        </header>

        {error ? <div className={styles.error}>{error}</div> : null}

        {summary ? (
          <>
            <div className={styles.kpiGrid}>
              <KpiCard label="Unique Visitors" value={summary.visitors.uniqueVisitors} />
              <KpiCard label="Sessions" value={summary.visitors.uniqueSessions} />
              <KpiCard label="Page Views" value={summary.visitors.pageViews} />
              <KpiCard label="Active Characters" value={summary.characters.activeSaved} />
            </div>

            <div className={styles.sectionGrid}>
              <section className={styles.section}>
                <div className={styles.sectionHeader}>
                  <h3>Demographics</h3>
                  <span>{formatNumber(summary.visitors.authenticatedVisitors)} authenticated</span>
                </div>
                <CountryDonut countries={summary.demographics.countries} />
              </section>

              <section className={styles.section}>
                <div className={styles.sectionHeader}>
                  <h3>Usage</h3>
                  <span>{formatNumber(summary.health.analyticsEvents)} events</span>
                </div>
                <div className={styles.metricList}>
                  <KpiCard label="Characters Created" value={summary.usage.characterCreated} />
                  <KpiCard label="Sheets Opened" value={summary.usage.characterSheetOpened} />
                  <KpiCard label="Codex Searches" value={summary.usage.codexSearches} />
                  <KpiCard label="Support Tickets" value={summary.usage.supportFeedbackSubmitted} />
                </div>
              </section>
            </div>

            <div className={styles.sectionGrid}>
              <section className={styles.section}>
                <div className={styles.sectionHeader}>
                  <h3>Top Routes</h3>
                  <span>{formatNumber(summary.health.apiRequests)} API requests</span>
                </div>
                <CountTable emptyLabel="No route data yet." rows={topRouteRows} valueLabel="Views" />
              </section>

              <section className={styles.section}>
                <div className={styles.sectionHeader}>
                  <h3>Server Health</h3>
                  <span>Status and latency</span>
                </div>
                <div className={styles.splitTables}>
                  <CountTable
                    emptyLabel="No status data yet."
                    rows={summary.health.statusFamilies}
                    valueLabel="Requests"
                  />
                  <CountTable
                    emptyLabel="No latency data yet."
                    rows={summary.health.latencyBuckets}
                    valueLabel="Requests"
                  />
                </div>
              </section>
            </div>

            <div className={styles.sectionGrid}>
              <section className={styles.section}>
                <div className={styles.sectionHeader}>
                  <h3>Characters</h3>
                  <span>Average level {formatNumber(summary.characters.averageLevel)}</span>
                </div>
                <div className={styles.compactStats}>
                  <span>Created this year: {formatNumber(summary.characters.createdThisYear)}</span>
                  <span>Deleted: {formatNumber(summary.characters.deleted)}</span>
                </div>
                <div className={styles.splitTables}>
                  <CountTable emptyLabel="No class data yet." rows={topClassRows} valueLabel="Sheets" />
                  <CountTable emptyLabel="No species data yet." rows={topSpeciesRows} valueLabel="Sheets" />
                </div>
              </section>

              <section className={styles.section}>
                <div className={styles.sectionHeader}>
                  <h3>Users</h3>
                  <span>{formatNumber(summary.users.verified)} verified</span>
                </div>
                <div className={styles.metricList}>
                  <KpiCard label="Active Users" value={summary.users.active} />
                  <KpiCard label="Verified Users" value={summary.users.verified} />
                  <KpiCard label="Created This Year" value={summary.users.createdThisYear} />
                  <KpiCard label="Anonymous Visitors" value={summary.visitors.unknownVisitors} />
                </div>
              </section>
            </div>
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
