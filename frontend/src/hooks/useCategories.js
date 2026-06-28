import { useQueryClient } from '@tanstack/react-query';
import { useCustomQuery, useCustomMutation } from './useCustomApi';
import * as categoryApi from '../api/categoryApi';
import { isAdmin, isLoggedIn } from '../store/authStore';
import { ADMIN_QUERY_KEYS, invalidateAdminQueries } from './adminQueryKeys';

export const CATEGORIES_QUERY_KEY = ADMIN_QUERY_KEYS.categories;

export function useCategories(options = {}) {
  return useCustomQuery({
    queryKey: CATEGORIES_QUERY_KEY,
    queryFn: categoryApi.fetchCategories,
    enabled: isLoggedIn() && isAdmin(),
    ...options,
  });
}

export function useSaveCategory(options = {}) {
  const queryClient = useQueryClient();
  const { onSuccess, onError, ...rest } = options;

  return useCustomMutation({
    mutationFn: categoryApi.saveCategoryItem,
    onSuccess: (...args) => {
      invalidateAdminQueries(queryClient);
      onSuccess?.(...args);
    },
    onError,
    ...rest,
  });
}

export function useDeleteCategory(options = {}) {
  const queryClient = useQueryClient();
  const { onSuccess, onError, ...rest } = options;

  return useCustomMutation({
    mutationFn: categoryApi.deleteCategory,
    onSuccess: (...args) => {
      invalidateAdminQueries(queryClient);
      onSuccess?.(...args);
    },
    onError,
    ...rest,
  });
}

export const SUBCATEGORIES_QUERY_KEY = ['admin', 'subcategories'];

export function useSubcategories(parentKeyOrOptions, maybeOptions) {
  let parentKey;
  let options = {};
  if (typeof parentKeyOrOptions === 'string' || parentKeyOrOptions === undefined) {
    parentKey = parentKeyOrOptions;
    options = maybeOptions || {};
  } else {
    options = parentKeyOrOptions || {};
  }

  return useCustomQuery({
    queryKey: parentKey ? [...SUBCATEGORIES_QUERY_KEY, parentKey] : SUBCATEGORIES_QUERY_KEY,
    queryFn: () => categoryApi.fetchSubcategories(parentKey),
    enabled: isLoggedIn() && isAdmin(),
    ...options,
  });
}

export function useSaveSubcategory(options = {}) {
  const queryClient = useQueryClient();
  const { onSuccess, onError, ...rest } = options;

  return useCustomMutation({
    mutationFn: categoryApi.saveSubcategoryItem,
    onSuccess: (...args) => {
      invalidateAdminQueries(queryClient);
      onSuccess?.(...args);
    },
    onError,
    ...rest,
  });
}

export function useDeleteSubcategory(options = {}) {
  const queryClient = useQueryClient();
  const { onSuccess, onError, ...rest } = options;

  return useCustomMutation({
    mutationFn: categoryApi.deleteSubcategory,
    onSuccess: (...args) => {
      invalidateAdminQueries(queryClient);
      onSuccess?.(...args);
    },
    onError,
    ...rest,
  });
}
