import axiosInstance from '../lib/axiosInstance';
import { subcategories, categories } from '../lib/apiUrls';

export async function fetchPublicCategories() {
  const { data } = await axiosInstance.get(categories);
  return data;
}

export async function fetchPublicSubcategories(parentKey) {
  const { data } = await axiosInstance.get(subcategories, {
    params: parentKey ? { parent_key: parentKey } : undefined,
  });
  return data;
}
