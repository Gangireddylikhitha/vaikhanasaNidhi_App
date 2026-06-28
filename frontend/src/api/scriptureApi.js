import axiosInstance from '../lib/axiosInstance';
import { adminScriptures, adminScriptureById } from '../lib/apiUrls';

export async function fetchScriptures() {
  const { data } = await axiosInstance.get(adminScriptures);
  return data;
}

export async function fetchScriptureById(id) {
  const { data } = await axiosInstance.get(adminScriptureById(id));
  return data;
}

export async function createScripture(payload) {
  const { data } = await axiosInstance.post(adminScriptures, payload);
  return data;
}

export async function updateScripture(id, payload) {
  const { data } = await axiosInstance.put(adminScriptureById(id), payload);
  return data;
}

export async function saveScriptureItem(form) {
  if (form.id) return updateScripture(form.id, form);
  return createScripture(form);
}

export async function deleteScripture(id) {
  const { data } = await axiosInstance.delete(adminScriptureById(id));
  return data;
}
