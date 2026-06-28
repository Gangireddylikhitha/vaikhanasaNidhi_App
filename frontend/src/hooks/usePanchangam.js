import { useCustomQuery } from './useCustomApi';
import * as panchangamApi from '../api/panchangamApi';
import { getPanchangamForDate } from '../lib/panchangam';
import { isLoggedIn } from '../store/authStore';

function toDateKey(date) {
  const d = date instanceof Date ? date : new Date(date);
  return d.toISOString().slice(0, 10);
}

export function usePanchangam(date = new Date(), options = {}) {
  const dateKey = toDateKey(date);

  return useCustomQuery({
    queryKey: ['panchangam', dateKey],
    queryFn: () => panchangamApi.fetchPanchangam(dateKey),
    enabled: isLoggedIn(),
    staleTime: 60 * 60 * 1000,
    placeholderData: () => getPanchangamForDate(date),
    ...options,
  });
}
