import axiosInstance from '../lib/axiosInstance';
import { stats } from '../lib/apiUrls';

export async function fetchPublicStats() {
  const { data } = await axiosInstance.get(stats);
  return data;
}
