import { useCustomQuery } from './useCustomApi';
import * as publicScriptureApi from '../api/publicScriptureApi';
import { isLoggedIn } from '../store/authStore';

export const PUBLIC_SCRIPTURES_KEY = ['scriptures', 'public'];

export function usePublicScriptures(params = {}, options = {}) {
  return useCustomQuery({
    queryKey: [...PUBLIC_SCRIPTURES_KEY, params],
    queryFn: () => publicScriptureApi.fetchPublicScriptures(params),
    enabled: isLoggedIn(),
    staleTime: 5 * 60 * 1000,
    ...options,
  });
}

export function useRecentScriptures(limit = 8, options = {}) {
  return useCustomQuery({
    queryKey: [...PUBLIC_SCRIPTURES_KEY, 'recent', limit],
    queryFn: () => publicScriptureApi.fetchRecentScriptures(limit),
    enabled: isLoggedIn(),
    staleTime: 5 * 60 * 1000,
    ...options,
  });
}

export function usePublicScripture(id, options = {}) {
  return useCustomQuery({
    queryKey: [...PUBLIC_SCRIPTURES_KEY, id],
    queryFn: () => publicScriptureApi.fetchPublicScriptureById(id),
    enabled: isLoggedIn() && Boolean(id),
    staleTime: 5 * 60 * 1000,
    ...options,
  });
}
