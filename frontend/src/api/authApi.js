import axiosInstance from '../lib/axiosInstance';
import * as urls from '../lib/apiUrls';

export async function signupUser({ name, username, password }) {
  const { data } = await axiosInstance.post(urls.signup, {
    name,
    username,
    password,
  });
  return data;
}

export async function loginUser({ username, password }) {
  const { data } = await axiosInstance.post(urls.login, {
    username,
    password,
  });
  return data;
}

export async function adminLoginUser({ username, password }) {
  const { data } = await axiosInstance.post(urls.adminLogin, {
    username,
    password,
  });
  return data;
}

export async function guestLoginUser() {
  const { data } = await axiosInstance.post(urls.guest);
  return data;
}

export async function fetchMe() {
  const { data } = await axiosInstance.get(urls.me);
  return data;
}

export async function logoutUser() {
  const { data } = await axiosInstance.post(urls.logout);
  return data;
}

export async function checkHealth() {
  const { data } = await axiosInstance.get(urls.health);
  return data;
}
