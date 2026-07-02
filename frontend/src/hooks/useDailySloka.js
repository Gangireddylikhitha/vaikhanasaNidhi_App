import { useCustomQuery } from './useCustomApi';
import * as dailySlokaApi from '../api/dailySlokaApi';
import { getDailySahasranamaSloka } from '../lib/dailySloka';
import { isLoggedIn } from '../store/authStore';

export function useDailySloka(date = new Date(), options = {}) {
  const dateKey = date instanceof Date ? date.toISOString().slice(0, 10) : date;

  return useCustomQuery({
    queryKey: ['daily-sloka', dateKey],
    queryFn: () => dailySlokaApi.fetchDailySloka(dateKey),
    enabled: isLoggedIn(),
    staleTime: 60 * 60 * 1000,
    placeholderData: () => {
      const local = getDailySahasranamaSloka();
      return {
        telugu: local.telugu,
        meaning: local.meaning,
        source: local.source,
        index: null,
        total: null,
      };
    },
    ...options,
  });
}
