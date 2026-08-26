import axiosInstance from '../lib/axiosInstance';
import { panchangam } from '../lib/apiUrls';
import { toIstDateKey } from '../lib/panchangamSource';

export async function fetchPanchangam(date, options = {}) {
  const dateStr = date instanceof Date ? toIstDateKey(date) : date;
  const params = { date: dateStr, ...options };
  const { data } = await axiosInstance.get(panchangam, { params });
  return data;
}
