import axiosInstance from '../lib/axiosInstance';
import { adminCategories, adminCategoryById, adminSubcategories, adminSubcategoryById } from '../lib/apiUrls';

export async function fetchCategories() {
  const { data } = await axiosInstance.get(adminCategories);
  return data;
}

export async function fetchCategoryById(id) {
  const { data } = await axiosInstance.get(adminCategoryById(id));
  return data;
}

export async function createCategory(payload) {
  const { data } = await axiosInstance.post(adminCategories, payload);
  return data;
}

export async function updateCategory(id, payload) {
  const { data } = await axiosInstance.put(adminCategoryById(id), payload);
  return data;
}

export async function saveCategoryItem({ isEdit, ...form }) {
  if (isEdit) return updateCategory(form.id, form);
  return createCategory(form);
}

export async function deleteCategory(id) {
  const { data } = await axiosInstance.delete(adminCategoryById(id));
  return data;
}

export async function fetchSubcategories(parentKey) {
  const params = parentKey ? { parent_key: parentKey } : {};
  const { data } = await axiosInstance.get(adminSubcategories, { params });
  return data;
}

export async function createSubcategory(payload) {
  const { data } = await axiosInstance.post(adminSubcategories, payload);
  return data;
}

export async function updateSubcategory(id, payload) {
  const { data } = await axiosInstance.put(adminSubcategoryById(id), payload);
  return data;
}

export async function saveSubcategoryItem({ isEdit, ...form }) {
  if (isEdit) return updateSubcategory(form.id, form);
  return createSubcategory(form);
}

export async function deleteSubcategory(id) {
  const { data } = await axiosInstance.delete(adminSubcategoryById(id));
  return data;
}
