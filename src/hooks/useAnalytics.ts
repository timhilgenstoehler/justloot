import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect } from 'react';
import { recordDailyActive } from '../services/analyticsService';

const DAU_STORAGE_KEY = 'loot-analytics-dau-date';

function todayUtc(): string {
  return new Date().toISOString().slice(0, 10);
}

/** Records DAU once per user per calendar day (UTC). */
export function useAnalytics(userId: string | undefined): void {
  useEffect(() => {
    if (!userId) return;

    let cancelled = false;

    (async () => {
      const today = todayUtc();
      const lastRecorded = await AsyncStorage.getItem(DAU_STORAGE_KEY);
      if (cancelled || lastRecorded === today) return;

      try {
        await recordDailyActive();
        if (!cancelled) await AsyncStorage.setItem(DAU_STORAGE_KEY, today);
      } catch (err) {
        console.warn('Analytics DAU failed:', err);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [userId]);
}
