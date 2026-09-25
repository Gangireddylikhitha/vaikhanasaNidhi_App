import { useCustomQuery } from './useCustomApi';
import * as publicStatsApi from '../api/publicStatsApi';
import { useIsVerified } from './useVerificationStatus';

export function usePublicStats(options = {}) {
  const verified = useIsVerified();
  return useCustomQuery({
    queryKey: ['stats', 'public', verified],
    queryFn: publicStatsApi.fetchPublicStats,
    enabled: verified,
    staleTime: 5 * 60 * 1000,
    ...options,
  });
}
