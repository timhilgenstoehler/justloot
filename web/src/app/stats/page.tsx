'use client';

import { useCallback, useEffect, useState } from 'react';
import {
  fetchAnalyticsDashboard,
  type AnalyticsDashboard,
} from '../../../../src/services/statsService';
import styles from './stats.module.css';

const STATS_PASSWORD = 'lootlol';
const SESSION_KEY = 'loot-stats-unlocked';

export default function StatsPage() {
  const [password, setPassword] = useState('');
  const [unlocked, setUnlocked] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<AnalyticsDashboard | null>(null);

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

  const todayDau = data?.dau[0]?.dau ?? 0;
  const totalRunsToday = (data?.runs ?? [])
    .filter((r) => r.activity_date === data?.dau[0]?.activity_date)
    .reduce((sum, r) => sum + r.run_count, 0);

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div>
          <h1 className={styles.title}>Analytics</h1>
          <p className={styles.subtitle}>UTC dates · last 30 days DAU · last 14 days runs</p>
        </div>
        <button type="button" className={styles.logout} onClick={handleLogout}>
          Lock
        </button>
      </header>

      <div className={styles.summary}>
        <div className={styles.summaryCard}>
          <span className={styles.summaryLabel}>Latest DAU</span>
          <span className={styles.summaryValue}>{todayDau}</span>
        </div>
        <div className={styles.summaryCard}>
          <span className={styles.summaryLabel}>Runs (latest day)</span>
          <span className={styles.summaryValue}>{totalRunsToday}</span>
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
                <tr key={row.activity_date}>
                  <td>{row.activity_date}</td>
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
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Date</th>
                <th>Player</th>
                <th>Runs</th>
              </tr>
            </thead>
            <tbody>
              {(data?.runs ?? []).map((row) => (
                <tr key={`${row.activity_date}-${row.user_id}`}>
                  <td>{row.activity_date}</td>
                  <td>{row.display_name}</td>
                  <td className={styles.num}>{row.run_count}</td>
                </tr>
              ))}
              {(data?.runs ?? []).length === 0 && (
                <tr>
                  <td colSpan={3} className={styles.empty}>
                    No runs recorded yet
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
