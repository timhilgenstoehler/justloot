import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect } from 'react';
import { recordDailyActive } from '../services/analyticsService';
import { getLocalActivityDate } from '../utils/activityDate';

const DAU_STORAGE_KEY = 'loot-analytics-dau-date';

/** Records DAU once per user per local calendar day. */
export function useAnalytics(userId: string | undefined): void {
  useEffect(() => {
    if (!userId) return;

    let cancelled = false;

    (async () => {
      const today = getLocalActivityDate();
      const lastRecorded = await AsyncStorage.getItem(DAU_STORAGE_KEY);
      if (cancelled || lastRecorded === today) return;

      try {
        await recordDailyActive(today);
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
