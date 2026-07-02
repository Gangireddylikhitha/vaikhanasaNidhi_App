import axiosInstance from '../lib/axiosInstance';
import { dailySloka } from '../lib/apiUrls';

export async function fetchDailySloka(date) {
  const dateStr = date instanceof Date ? date.toISOString().slice(0, 10) : date;
  const { data } = await axiosInstance.get(dailySloka, {
    params: dateStr ? { date: dateStr } : undefined,
  });
  return data;
}
