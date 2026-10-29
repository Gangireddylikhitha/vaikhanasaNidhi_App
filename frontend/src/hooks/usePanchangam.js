import { useCustomQuery } from './useCustomApi';
import * as panchangamApi from '../api/panchangamApi';
import { toIstDateKey } from '../lib/panchangamSource';

export function usePanchangam(date = new Date(), options = {}) {
  const dateKey = toIstDateKey(date);
  const { lat, lon, timezone, enabled = true, ...queryOptions } = options;

  return useCustomQuery({
    queryKey: ['panchangam', dateKey, lat, lon, timezone],
    queryFn: () => panchangamApi.fetchPanchangam(dateKey, {
      ...(lat != null && { latitude: lat }),
      ...(lon != null && { longitude: lon }),
      ...(timezone && { timezone }),
    }),
    enabled,
    staleTime: 60 * 60 * 1000,
    ...queryOptions,
  });
}
