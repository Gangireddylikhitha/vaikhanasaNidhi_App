import { useState, useEffect } from 'react';
import { getTodayDailySloka, msUntilMidnight } from '../lib/dailySloka';

/**
 * Daily Vishnu Sahasranama śloka from frontend static data only
 * (`src/data/sahasraNamalu.js`). Rolls over at local midnight.
 */
export function useDailySloka() {
  const [tick, setTick] = useState(0);

  useEffect(() => {
    let timer;
    const schedule = () => {
      timer = setTimeout(() => {
        setTick((t) => t + 1);
        schedule();
      }, msUntilMidnight());
    };
    schedule();
    return () => clearTimeout(timer);
  }, []);

  // tick forces re-read after midnight
  void tick;

  return {
    data: getTodayDailySloka(),
    refetch: () => setTick((t) => t + 1),
  };
}
