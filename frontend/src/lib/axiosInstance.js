import axios from 'axios';
import { API_BASE_URL, refresh as refreshUrl } from './apiUrls';
import {
  getToken,
  getRefreshToken,
  updateTokens,
  clearAuthSession,
} from '../store/authStore';

const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 30000,
});

axiosInstance.interceptors.request.use((config) => {
  const token = getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// --- Automatic token refresh ---------------------------------------------
// When the access token expires the backend replies 401. We transparently
// exchange the (still valid) refresh token for a new pair, then retry the
// original request. The user never sees a login screen unless the 6-month
// refresh token itself has expired.

// Endpoints that must never trigger a refresh retry (they define the session).
const AUTH_ENDPOINTS = ['/auth/login', '/auth/admin/login', '/auth/signup', '/auth/guest', '/auth/refresh'];

let isRefreshing = false;
let pendingQueue = [];

function flushQueue(error, token) {
  pendingQueue.forEach(({ resolve, reject }) => {
    if (error) reject(error);
    else resolve(token);
  });
  pendingQueue = [];
}

async function performRefresh() {
  const refreshToken = getRefreshToken();
  if (!refreshToken) throw new Error('No refresh token');

  // Use a bare axios call so this request skips the interceptors above.
  const { data } = await axios.post(
    `${API_BASE_URL}${refreshUrl}`,
    { refreshToken },
    { headers: { 'Content-Type': 'application/json' }, timeout: 30000 },
  );

  updateTokens({ token: data.token, refreshToken: data.refreshToken });
  return data.token;
}

axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config;
    const status = error.response?.status;

    const isAuthCall = original?.url && AUTH_ENDPOINTS.some((p) => original.url.includes(p));

    if (status !== 401 || !original || original._retry || isAuthCall || !getRefreshToken()) {
      return Promise.reject(error);
    }

    // A refresh is already in flight — queue this request until it settles.
    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        pendingQueue.push({ resolve, reject });
      }).then((token) => {
        original.headers.Authorization = `Bearer ${token}`;
        return axiosInstance(original);
      });
    }

    original._retry = true;
    isRefreshing = true;

    try {
      const newToken = await performRefresh();
      flushQueue(null, newToken);
      original.headers.Authorization = `Bearer ${newToken}`;
      return axiosInstance(original);
    } catch (refreshError) {
      flushQueue(refreshError, null);
      // Refresh token is gone/expired — the session is truly over.
      clearAuthSession();
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('auth:logout'));
      }
      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  },
);

export default axiosInstance;
