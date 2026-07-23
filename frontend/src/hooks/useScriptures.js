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

/** Moves the given ids to the front of their current slots, in the new order — used for the optimistic drag update. */
function reorderSubset(list, ids) {
  const idSet = new Set(ids);
  const slots = [];
  list.forEach((item, i) => { if (idSet.has(item.id)) slots.push(i); });
  const next = [...list];
  ids.forEach((id, i) => {
    const item = list.find((x) => x.id === id);
    if (item && slots[i] !== undefined) next[slots[i]] = item;
  });
  return next;
}

export function useReorderScriptures(options = {}) {
  const queryClient = useQueryClient();
  const { onSuccess, onError, ...rest } = options;

  return useCustomMutation({
    mutationFn: scriptureApi.reorderScriptures,
    onMutate: async (ids) => {
      await queryClient.cancelQueries({ queryKey: SCRIPTURES_QUERY_KEY });
      const previous = queryClient.getQueryData(SCRIPTURES_QUERY_KEY);
      queryClient.setQueryData(SCRIPTURES_QUERY_KEY, (old) => reorderSubset(old || [], ids));
      return { previous };
    },
    onError: (err, ids, context) => {
      if (context?.previous) queryClient.setQueryData(SCRIPTURES_QUERY_KEY, context.previous);
      onError?.(err, ids, context);
    },
    onSuccess: (...args) => {
      invalidateAdminQueries(queryClient);
      onSuccess?.(...args);
    },
    ...rest,
  });
}
