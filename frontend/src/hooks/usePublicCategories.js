import { useCustomQuery } from './useCustomApi';
import * as publicCategoryApi from '../api/publicCategoryApi';
import { enrichCategories } from '../utils/categoryAssets';
import { useIsVerified } from './useVerificationStatus';

export const PUBLIC_CATEGORIES_KEY = ['categories', 'public'];

export function usePublicCategories(options = {}) {
  const verified = useIsVerified();
  return useCustomQuery({
    queryKey: [...PUBLIC_CATEGORIES_KEY, verified],
    queryFn: async () => {
      const data = await publicCategoryApi.fetchPublicCategories();
      return enrichCategories(data);
    },
    enabled: verified,
    staleTime: 10 * 60 * 1000,
    ...options,
  });
}
