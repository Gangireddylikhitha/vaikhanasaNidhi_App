import axiosInstance from '../lib/axiosInstance';
import {
  userVerification,
  adminVerification,
  adminVerificationById,
} from '../lib/apiUrls';

export async function fetchMyVerification() {
  const { data } = await axiosInstance.get(userVerification);
  return data;
}

export async function submitVerification(payload) {
  const { data } = await axiosInstance.post(userVerification, payload);
  return data;
}

export async function fetchAdminVerifications(params = {}) {
  const { data } = await axiosInstance.get(adminVerification, { params });
  return data;
}

export async function reviewVerification(id, payload) {
  const { data } = await axiosInstance.patch(adminVerificationById(id), payload);
  return data;
}
