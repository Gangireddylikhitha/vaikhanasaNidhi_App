import axiosInstance from '../lib/axiosInstance';
import { adminDashboard, adminUsers } from '../lib/apiUrls';

export async function fetchAdminDashboard() {
  const { data } = await axiosInstance.get(adminDashboard);
  return data;
}

export async function fetchAdminUsers({ page = 1, limit = 20, q = '' } = {}) {
  const { data } = await axiosInstance.get(adminUsers, {
    params: { page, limit, q: q.trim() || undefined },
  });
  return data;
}
