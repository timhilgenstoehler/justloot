'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  fetchAnalyticsDashboard,
  type AnalyticsDashboard,
  type RunRow,
} from '../../../../src/services/statsService';
import styles from './stats.module.css';

const STATS_PASSWORD = 'lootlol';
const SESSION_KEY = 'loot-stats-unlocked';

function localToday(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function formatDateLabel(isoDate: string): string {
  const today = localToday();
  if (isoDate === today) return `Today (${isoDate})`;
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const y = yesterday.getFullYear();
  const m = String(yesterday.getMonth() + 1).padStart(2, '0');
  const d = String(yesterday.getDate()).padStart(2, '0');
  if (isoDate === `${y}-${m}-${d}`) return `Yesterday (${isoDate})`;
  return isoDate;
}

function groupRunsByDate(runs: RunRow[]): [string, RunRow[]][] {
  const map = new Map<string, RunRow[]>();
  for (const row of runs) {
    const list = map.get(row.activity_date) ?? [];
    list.push(row);
    map.set(row.activity_date, list);
  }
  return [...map.entries()].sort((a, b) => b[0].localeCompare(a[0]));
}

export default function StatsPage() {
  const [password, setPassword] = useState('');
  const [unlocked, setUnlocked] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<AnalyticsDashboard | null>(null);
  const today = localToday();

  const loadStats = useCallback(async (pwd: string) => {
    setLoading(true);
    setError(null);
    try {
      const dashboard = await fetchAnalyticsDashboard(pwd);
      setData(dashboard);
      setUnlocked(true);
      sessionStorage.setItem(SESSION_KEY, pwd);
    } catch {
      setError('Wrong password or failed to load stats.');
      setUnlocked(false);
      sessionStorage.removeItem(SESSION_KEY);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const saved = sessionStorage.getItem(SESSION_KEY);
    if (saved) loadStats(saved);
  }, [loadStats]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== STATS_PASSWORD) {
      setError('Wrong password.');
      return;
    }
    loadStats(password);
  };

  const handleLogout = () => {
    sessionStorage.removeItem(SESSION_KEY);
    setUnlocked(false);
    setData(null);
    setPassword('');
  };

  const runsByDate = useMemo(() => groupRunsByDate(data?.runs ?? []), [data?.runs]);

  const todayDau = data?.dau.find((row) => row.activity_date === today)?.dau ?? 0;
  const todayRuns = (data?.runs ?? [])
    .filter((row) => row.activity_date === today)
    .reduce((sum, row) => sum + row.run_count, 0);
  const todayPlayers = (data?.runs ?? []).filter((row) => row.activity_date === today).length;

  if (!unlocked) {
    return (
      <div className={styles.page}>
        <div className={styles.loginCard}>
          <h1 className={styles.title}>Just Loot Stats</h1>
          <p className={styles.subtitle}>Enter password to view analytics.</p>
          <form onSubmit={handleSubmit} className={styles.form}>
            <input
              type="password"
              className={styles.input}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              autoComplete="current-password"
            />
            {error && <p className={styles.error}>{error}</p>}
            <button type="submit" className={styles.button} disabled={loading}>
              {loading ? 'Loading…' : 'Unlock'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div>
          <h1 className={styles.title}>Analytics</h1>
          <p className={styles.subtitle}>
            Local calendar days · today is {today} · last 30 days
          </p>
        </div>
        <div className={styles.headerActions}>
          <button
            type="button"
            className={styles.refresh}
            onClick={() => loadStats(sessionStorage.getItem(SESSION_KEY) ?? STATS_PASSWORD)}
            disabled={loading}
          >
            {loading ? '…' : 'Refresh'}
          </button>
          <button type="button" className={styles.logout} onClick={handleLogout}>
            Lock
          </button>
        </div>
      </header>

      <div className={styles.summary}>
        <div className={styles.summaryCard}>
          <span className={styles.summaryLabel}>DAU today</span>
          <span className={styles.summaryValue}>{todayDau}</span>
        </div>
        <div className={styles.summaryCard}>
          <span className={styles.summaryLabel}>Runs today</span>
          <span className={styles.summaryValue}>{todayRuns}</span>
        </div>
        <div className={styles.summaryCard}>
          <span className={styles.summaryLabel}>Players with runs today</span>
          <span className={styles.summaryValue}>{todayPlayers}</span>
        </div>
      </div>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Daily Active Users</h2>
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Date</th>
                <th>DAU</th>
              </tr>
            </thead>
            <tbody>
              {(data?.dau ?? []).map((row) => (
                <tr key={row.activity_date} className={row.activity_date === today ? styles.todayRow : undefined}>
                  <td>{formatDateLabel(row.activity_date)}</td>
                  <td className={styles.num}>{row.dau}</td>
                </tr>
              ))}
              {(data?.dau ?? []).length === 0 && (
                <tr>
                  <td colSpan={2} className={styles.empty}>
                    No data yet
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Runs per user per day</h2>
        {runsByDate.length === 0 && <p className={styles.emptyBlock}>No runs recorded yet</p>}
        {runsByDate.map(([date, rows]) => {
          const dayTotal = rows.reduce((sum, r) => sum + r.run_count, 0);
          return (
            <div key={date} className={styles.dayGroup}>
              <div className={styles.dayHeader}>
                <span className={styles.dayTitle}>{formatDateLabel(date)}</span>
                <span className={styles.dayMeta}>
                  {rows.length} players · {dayTotal} runs
                </span>
              </div>
              <div className={styles.tableWrap}>
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th>Player</th>
                      <th>Runs</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((row) => (
                      <tr key={row.user_id}>
                        <td>{row.display_name}</td>
                        <td className={styles.num}>{row.run_count}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          );
        })}
      </section>
    </div>
  );
}
