import { useCustomQuery } from './useCustomApi';
import * as publicScriptureApi from '../api/publicScriptureApi';
import { useIsVerified } from './useVerificationStatus';

export const PUBLIC_SCRIPTURES_KEY = ['scriptures', 'public'];

export function usePublicScriptures(params = {}, options = {}) {
  const verified = useIsVerified();
  return useCustomQuery({
    queryKey: [...PUBLIC_SCRIPTURES_KEY, params, verified],
    queryFn: () => publicScriptureApi.fetchPublicScriptures(params),
    enabled: verified,
    staleTime: 5 * 60 * 1000,
    ...options,
  });
}

export function useRecentScriptures(limit = 8, options = {}) {
  const verified = useIsVerified();
  return useCustomQuery({
    queryKey: [...PUBLIC_SCRIPTURES_KEY, 'recent', limit, verified],
    queryFn: () => publicScriptureApi.fetchRecentScriptures(limit),
    enabled: verified,
    staleTime: 5 * 60 * 1000,
    ...options,
  });
}

export function usePublicScripture(id, options = {}) {
  const verified = useIsVerified();
  return useCustomQuery({
    queryKey: [...PUBLIC_SCRIPTURES_KEY, id, verified],
    queryFn: () => publicScriptureApi.fetchPublicScriptureById(id),
    enabled: verified && Boolean(id),
    staleTime: 5 * 60 * 1000,
    ...options,
  });
}
