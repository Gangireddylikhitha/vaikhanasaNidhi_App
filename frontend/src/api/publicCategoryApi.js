import axiosInstance from '../lib/axiosInstance';
import { subcategories } from '../lib/apiUrls';

export async function fetchPublicSubcategories(parentKey) {
  const { data } = await axiosInstance.get(subcategories, {
    params: parentKey ? { parent_key: parentKey } : undefined,
  });
  return data;
}
