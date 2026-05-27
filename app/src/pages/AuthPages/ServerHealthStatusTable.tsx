import { ChevronDown, ChevronRight } from "lucide-react";
import { Fragment, useMemo, useState } from "react";
import type { AnalyticsCountBucket } from "../../api/analytics";
import styles from "./AnalyticsPage.module.css";

type StatusDetailRow = {
  count: number;
  key: string;
  label: string;
};

type StatusGroupRow = {
  children: StatusDetailRow[];
  count: number;
  key: string;
  label: string;
};

const STATUS_GROUPS = [
  {
    key: "2xx",
    label: "2xx",
    children: []
  },
  {
    key: "3xx",
    label: "3xx",
    children: ["300", "301", "302", "304", "3xx other"]
  },
  {
    key: "4xx",
    label: "4xx",
    children: ["400", "401", "403", "404", "409", "413", "415", "429", "4xx other"]
  },
  {
    key: "5xx",
    label: "5xx",
    children: ["500", "502", "5xx other"]
  }
] as const;

const OTHER_STATUS_LABEL = "other";

function formatNumber(value: number) {
  return new Intl.NumberFormat(undefined, {
    maximumFractionDigits: 1
  }).format(value);
}

function getCount(countsByLabel: Map<string, number>, label: string) {
  return countsByLabel.get(label) ?? 0;
}

function getStatusRows(rows: AnalyticsCountBucket[]): StatusGroupRow[] {
  const countsByLabel = new Map(rows.map((row) => [row.label, row.count]));
  const statusRows = STATUS_GROUPS.map((group): StatusGroupRow => {
    if (group.children.length === 0) {
      return {
        key: group.key,
        label: group.label,
        count: getCount(countsByLabel, group.key),
        children: []
      };
    }

    const children = group.children.map((label) => ({
      key: `${group.key}-${label}`,
      label,
      count: getCount(countsByLabel, label)
    }));

    return {
      key: group.key,
      label: group.label,
      count: children.reduce((total, child) => total + child.count, 0),
      children
    };
  });

  if (countsByLabel.has(OTHER_STATUS_LABEL)) {
    statusRows.push({
      key: OTHER_STATUS_LABEL,
      label: OTHER_STATUS_LABEL,
      count: getCount(countsByLabel, OTHER_STATUS_LABEL),
      children: []
    });
  }

  return statusRows;
}

function EmptyState({ label }: { label: string }) {
  return <p className={styles.emptyState}>{label}</p>;
}

export function ServerHealthStatusTable({
  emptyLabel,
  rows,
  valueLabel
}: {
  emptyLabel: string;
  rows: AnalyticsCountBucket[];
  valueLabel: string;
}) {
  const [expandedRows, setExpandedRows] = useState<Set<string>>(() => new Set());
  const statusRows = useMemo(() => getStatusRows(rows), [rows]);

  function toggleRow(rowKey: string) {
    setExpandedRows((current) => {
      const nextRows = new Set(current);

      if (nextRows.has(rowKey)) {
        nextRows.delete(rowKey);
      } else {
        nextRows.add(rowKey);
      }

      return nextRows;
    });
  }

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
        {statusRows.map((row) => {
          const hasChildren = row.children.length > 0;
          const isExpanded = expandedRows.has(row.key);
          const ToggleIcon = isExpanded ? ChevronDown : ChevronRight;

          return (
            <Fragment key={row.key}>
              <tr
                className={
                  hasChildren
                    ? `${styles.statusGroupRow} ${styles.statusGroupRowInteractive}`
                    : styles.statusGroupRow
                }
                onClick={hasChildren ? () => toggleRow(row.key) : undefined}
              >
                <td>
                  {hasChildren ? (
                    <button
                      type="button"
                      className={styles.statusRowToggle}
                      aria-expanded={isExpanded}
                      onClick={(event) => {
                        event.stopPropagation();
                        toggleRow(row.key);
                      }}
                    >
                      <ToggleIcon
                        className={styles.statusToggleIcon}
                        size={15}
                        aria-hidden="true"
                      />
                      <span>{row.label}</span>
                    </button>
                  ) : (
                    <span className={styles.statusRowLabel}>{row.label}</span>
                  )}
                </td>
                <td>{formatNumber(row.count)}</td>
              </tr>
              {hasChildren && isExpanded
                ? row.children.map((child) => (
                    <tr key={child.key} className={styles.statusDetailRow}>
                      <td>
                        <span className={styles.statusDetailLabel}>{child.label}</span>
                      </td>
                      <td>{formatNumber(child.count)}</td>
                    </tr>
                  ))
                : null}
            </Fragment>
          );
        })}
      </tbody>
    </table>
  );
}
