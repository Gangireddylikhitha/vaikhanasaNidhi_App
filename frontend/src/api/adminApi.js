import axiosInstance from '../lib/axiosInstance';
import { adminDashboard } from '../lib/apiUrls';

export async function fetchAdminDashboard() {
  const { data } = await axiosInstance.get(adminDashboard);
  return data;
}
