import { isLoggedIn } from '../store/authStore';
import { useCustomQuery } from './useCustomApi';
import { fetchPublicSubcategories } from '../api/publicCategoryApi';

export function usePublicSubcategories(parentKey, options = {}) {
  return useCustomQuery({
    queryKey: ['subcategories', 'public', parentKey || 'all'],
    queryFn: () => fetchPublicSubcategories(parentKey),
    enabled: isLoggedIn(),
    staleTime: 5 * 60 * 1000,
    ...options,
  });
}
