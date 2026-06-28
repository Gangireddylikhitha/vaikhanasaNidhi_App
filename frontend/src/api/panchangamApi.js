import axiosInstance from '../lib/axiosInstance';
import { panchangam } from '../lib/apiUrls';

export async function fetchPanchangam(date) {
  const dateStr = date instanceof Date ? date.toISOString().slice(0, 10) : date;
  const { data } = await axiosInstance.get(panchangam, { params: { date: dateStr } });
  return data;
}
