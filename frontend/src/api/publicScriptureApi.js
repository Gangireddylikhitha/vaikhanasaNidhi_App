import axiosInstance from '../lib/axiosInstance';
import { scriptures, scriptureById, recentScriptures } from '../lib/apiUrls';

export async function fetchPublicScriptures(params = {}) {
  const { data } = await axiosInstance.get(scriptures, { params });
  return data;
}

export async function fetchRecentScriptures(limit = 8) {
  const { data } = await axiosInstance.get(recentScriptures, { params: { limit } });
  return data;
}

export async function fetchPublicScriptureById(id) {
  const { data } = await axiosInstance.get(scriptureById(id));
  return data;
}
