import { keepPreviousData } from '@tanstack/react-query';
import { useCustomQuery } from './useCustomApi';
import { fetchAdminUsers } from '../api/adminApi';
import { isAdmin, isLoggedIn } from '../store/authStore';
import { ADMIN_QUERY_KEYS } from './adminQueryKeys';

export function useAdminUsers({ page = 1, limit = 20, q = '' } = {}, options = {}) {
  const params = { page, limit, q };
  return useCustomQuery({
    queryKey: ADMIN_QUERY_KEYS.users(params),
    queryFn: () => fetchAdminUsers(params),
    enabled: isLoggedIn() && isAdmin(),
    placeholderData: keepPreviousData,
    ...options,
  });
}
