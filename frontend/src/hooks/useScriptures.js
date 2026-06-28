import { useQueryClient } from '@tanstack/react-query';
import { useCustomQuery, useCustomMutation } from './useCustomApi';
import * as scriptureApi from '../api/scriptureApi';
import { isAdmin, isLoggedIn } from '../store/authStore';
import { ADMIN_QUERY_KEYS, invalidateAdminQueries } from './adminQueryKeys';

export const SCRIPTURES_QUERY_KEY = ADMIN_QUERY_KEYS.scriptures;

export function useScriptures(options = {}) {
  return useCustomQuery({
    queryKey: SCRIPTURES_QUERY_KEY,
    queryFn: scriptureApi.fetchScriptures,
    enabled: isLoggedIn() && isAdmin(),
    ...options,
  });
}

export function useSaveScripture(options = {}) {
  const queryClient = useQueryClient();
  const { onSuccess, onError, ...rest } = options;

  return useCustomMutation({
    mutationFn: scriptureApi.saveScriptureItem,
    onSuccess: (...args) => {
      invalidateAdminQueries(queryClient);
      onSuccess?.(...args);
    },
    onError,
    ...rest,
  });
}

export function useDeleteScripture(options = {}) {
  const queryClient = useQueryClient();
  const { onSuccess, onError, ...rest } = options;

  return useCustomMutation({
    mutationFn: scriptureApi.deleteScripture,
    onSuccess: (...args) => {
      invalidateAdminQueries(queryClient);
      onSuccess?.(...args);
    },
    onError,
    ...rest,
  });
}
