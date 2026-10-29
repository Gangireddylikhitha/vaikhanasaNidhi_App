import axiosInstance from '../lib/axiosInstance';
import * as urls from '../lib/apiUrls';

export async function signupUser({ name, username, email, password }) {
  const { data } = await axiosInstance.post(urls.signup, {
    name,
    username,
    email,
    password,
  });
  return data;
}

export async function loginUser({ username, identifier, password }) {
  const { data } = await axiosInstance.post(urls.login, {
    username: username || identifier,
    identifier: identifier || username,
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

export async function changePassword({ username, current_password, new_password }) {
  const { data } = await axiosInstance.post(urls.changePassword, {
    username,
    current_password,
    new_password,
  });
  return data;
}

export async function forgotPasswordLookup({ identifier }) {
  const { data } = await axiosInstance.post(urls.forgotPasswordLookup, {
    identifier,
  });
  return data;
}

export async function forgotPasswordSendOtp({ identifier, email }) {
  const { data } = await axiosInstance.post(urls.forgotPasswordSendOtp, {
    identifier,
    email,
  });
  return data;
}

export async function forgotPasswordReset({ identifier, email, otp, new_password }) {
  const { data } = await axiosInstance.post(urls.forgotPasswordReset, {
    identifier,
    email,
    otp,
    new_password,
  });
  return data;
}

export async function checkHealth() {
  const { data } = await axiosInstance.get(urls.health);
  return data;
}
