import { useCustomQuery } from './useCustomApi';
import { fetchPublicSubcategories } from '../api/publicCategoryApi';
import { useIsVerified } from './useVerificationStatus';

export function usePublicSubcategories(parentKey, options = {}) {
  const verified = useIsVerified();
  return useCustomQuery({
    queryKey: ['subcategories', 'public', parentKey || 'all', verified],
    queryFn: () => fetchPublicSubcategories(parentKey),
    enabled: verified,
    staleTime: 5 * 60 * 1000,
    ...options,
  });
}
