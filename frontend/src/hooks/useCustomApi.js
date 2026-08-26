import { useQuery, useMutation } from '@tanstack/react-query';

export function useCustomQuery({ queryKey, queryFn, enabled = true, ...options }) {
  return useQuery({
    queryKey,
    queryFn,
    enabled,
    ...options,
  });
}

export function useCustomMutation({ mutationFn, ...options }) {
  return useMutation({
    mutationFn,
    ...options,
  });
}
