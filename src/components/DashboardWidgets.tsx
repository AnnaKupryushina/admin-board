import { useEffect, useMemo, useState } from "react";
import styles from "./DashboardWidgets.module.scss";
import {
  fetchMetrics,
  fetchRevenueSeries,
  fetchActivity,
  subscribeActivity,
} from "../services/dashboardService";
import type { RevenuePoint, ActivityItem } from "../types";

function Sparkline({ points }: { points: number[] }) {
  const w = 120;
  const h = 32;
  const max = Math.max(...points, 1);
  const min = Math.min(...points);
  const step = points.length > 1 ? w / (points.length - 1) : w;
  const d = points
    .map((p, i) => {
      const x = Math.round(i * step);
      const y = Math.round(h - ((p - min) / (max - min || 1)) * (h - 4) - 2);
      return `${i === 0 ? "M" : "L"} ${x} ${y}`;
    })
    .join(" ");

  return (
    <svg
      width={w}
      height={h}
      viewBox={`0 0 ${w} ${h}`}
      className={styles.sparkline}
    >
      <path
        d={d}
        fill="none"
        stroke="var(--accent)"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function formatCurrency(n: number) {
  return `$${n.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

export default function DashboardWidgets() {
  const [metrics, setMetrics] = useState<any | null>(null);
  const [revenue, setRevenue] = useState<RevenuePoint[]>([]);
  const [activity, setActivity] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 3;

  const loadAll = async () => {
    setLoading(true);
    try {
      const [m, r, a] = await Promise.all([
        fetchMetrics(),
        fetchRevenueSeries(),
        fetchActivity(),
      ]);
      setMetrics(m);
      setRevenue(r);
      setActivity(a);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAll();
    const unsub = subscribeActivity((items) => {
      // prepend new items
      setActivity((prev) => [...items, ...prev]);
    });
    return () => unsub();
  }, []);

  const totalPages = Math.max(1, Math.ceil(activity.length / PAGE_SIZE));
  // keep page in range when activity changes
  useEffect(() => {
    setPage((p) => Math.min(p, totalPages));
  }, [totalPages]);

  const goPrev = () => setPage((p) => (p > 1 ? p - 1 : 1));
  const goNext = () => setPage((p) => (p < totalPages ? p + 1 : totalPages));

  const revenueValues = useMemo(() => revenue.map((p) => p.value), [revenue]);

  return (
    <section className={styles.widgets} aria-live="polite">
      <div className={styles.widget}>
        <div className={styles.metricTop}>
          <div className={styles.metricTitle}>Active users</div>
          <div className={styles.metricValue}>
            {metrics ? metrics.active : "—"}
          </div>
        </div>
        <div className={styles.metricBottom}>
          <Sparkline
            points={(revenueValues.length
              ? revenueValues
              : Array.from({ length: 8 }, () => 0)
            ).slice(-8)}
          />
          <div className={styles.metricHint}>
            of {metrics ? metrics.users.toLocaleString() : "—"} total users
          </div>
        </div>
      </div>

      <div className={styles.widget}>
        <div className={styles.metricTop}>
          <div className={styles.metricTitle}>Revenue (24h)</div>
          <div className={styles.metricValue}>
            {metrics ? formatCurrency(metrics.revenue) : "—"}
          </div>
        </div>
        <div className={styles.metricBottom}>
          <Sparkline points={revenueValues.slice(-24).map((v) => v)} />
          <div className={styles.metricHint}>
            conversion {metrics ? `${metrics.conversion}%` : "—"}
          </div>
        </div>
      </div>

      <div className={styles.widget}>
        <div className={styles.widgetHeader}>
          <div className={styles.title}>Recent activity</div>
          <div>
            <button
              className={styles.smallBtn}
              onClick={loadAll}
              disabled={loading}
            >
              {loading ? "Refreshing…" : "Refresh"}
            </button>
          </div>
        </div>
        <ul className={styles.activityList}>
          {activity.length === 0 && (
            <li className={styles.empty}>No activity yet</li>
          )}
          {activity
            .slice((page - 1) * PAGE_SIZE, (page - 1) * PAGE_SIZE + PAGE_SIZE)
            .map((a) => (
              <li key={a.id} className={styles.activityItem}>
                <div className={styles.activityLeft}>
                  <div className={styles.activityUser}>{a.user}</div>
                  <div className={styles.activityAction}>{a.action}</div>
                </div>
                <div className={styles.activityTime}>
                  {new Date(a.when).toLocaleTimeString()}
                </div>
              </li>
            ))}
        </ul>
        <div className={styles.pagination}>
          <button
            className={styles.smallBtn}
            onClick={goPrev}
            disabled={page === 1}
          >
            Prev
          </button>
          <div className={styles.pageInfo}>
            <span>
              Page {page} of {totalPages}
            </span>
          </div>
          <button
            className={styles.smallBtn}
            onClick={goNext}
            disabled={page === totalPages}
          >
            Next
          </button>
        </div>
      </div>
    </section>
  );
}
