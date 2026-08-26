import { useCustomQuery } from './useCustomApi';
import { fetchAdminDashboard } from '../api/adminApi';
import { isAdmin, isLoggedIn } from '../store/authStore';
import { ADMIN_QUERY_KEYS } from './adminQueryKeys';

export const ADMIN_DASHBOARD_QUERY_KEY = ADMIN_QUERY_KEYS.dashboard;

export function useAdminDashboard(options = {}) {
  return useCustomQuery({
    queryKey: ADMIN_DASHBOARD_QUERY_KEY,
    queryFn: fetchAdminDashboard,
    enabled: isLoggedIn() && isAdmin(),
    ...options,
  });
}
