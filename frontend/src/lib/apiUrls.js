import { Capacitor } from '@capacitor/core';

const DEFAULT_LOCAL_API = 'http://127.0.0.1:5000/api';
const PRODUCTION_API = 'https://api.vaikhanasanidhi.com/api';

// Call Capacitor directly here (instead of importing from ./native) to avoid a
// circular import: native.js -> pushNotifications.js -> userApi.js ->
// axiosInstance.js -> apiUrls.js -> native.js, which triggers a temporal
// dead zone ("Cannot access 'isNativeApp' before initialization").
function isNativeApp() {
  return Capacitor.isNativePlatform();
}

function isLocalBrowser() {
  if (typeof window === 'undefined') return import.meta.env.DEV;
  const host = window.location.hostname;
  return host === 'localhost' || host === '127.0.0.1';
}

function resolveApiBaseUrl() {
  // Mobile Android/iOS platform: always use production unless an override is set
  if (isNativeApp()) {
    return import.meta.env.VITE_API_BASE_URL?.trim() || PRODUCTION_API;
  }

  // Local development in browser (npm run dev):
  // Automatically use local backend so developers don't have to manually edit .env
  if (import.meta.env.DEV && isLocalBrowser()) {
    const configuredApi = import.meta.env.VITE_API_BASE_URL?.trim();
    if (configuredApi && !configuredApi.includes('api.vaikhanasanidhi.com')) {
      return configuredApi;
    }
    return DEFAULT_LOCAL_API;
  }

  return import.meta.env.VITE_API_BASE_URL?.trim() || PRODUCTION_API;
}

export const API_BASE_URL = resolveApiBaseUrl();

export const health = '/health';
export const signup = '/auth/signup';
export const login = '/auth/login';
export const adminLogin = '/auth/admin/login';
export const guest = '/auth/guest';
export const refresh = '/auth/refresh';
export const changePassword = '/auth/change-password';
export const forgotPasswordLookup = '/auth/forgot-password/lookup';
export const forgotPasswordSendOtp = '/auth/forgot-password/send-otp';
export const forgotPasswordReset = '/auth/forgot-password/reset';
export const me = '/auth/me';
export const logout = '/auth/logout';

export const adminDashboard = '/admin/dashboard';
export const adminUsers = '/admin/users';
export const adminScriptures = '/admin/scriptures';
export const adminScriptureById = (id) => `/admin/scriptures/${id}`;
export const adminScripturesReorder = '/admin/scriptures/reorder';
export const adminCategories = '/admin/categories';
export const adminCategoryById = (id) => `/admin/categories/${id}`;
export const adminSubcategories = '/admin/subcategories';
export const adminSubcategoryById = (id) => `/admin/subcategories/${id}`;
export const adminUploadScriptureImages = '/admin/uploads/scripture-images';
export const adminUploadBookPdf = '/admin/uploads/book-pdf';
export const adminUploadGalleryPhotos = '/admin/uploads/gallery-photos';
export const adminGalleryEvents = '/admin/gallery/events';
export const adminGalleryEventBySlug = (slug) => `/admin/gallery/events/${slug}`;
export const adminGalleryPhotos = '/admin/gallery/photos';
export const adminGalleryPhotoById = (id) => `/admin/gallery/photos/${id}`;

export const scriptures = '/scriptures';
export const recentScriptures = '/scriptures/recent';
export const scriptureById = (id) => `/scriptures/${id}`;
export const scripturePdf = (id) => `/scriptures/${id}/pdf`;
export const subcategories = '/subcategories';
export const categories = '/categories';
export const stats = '/stats';
export const galleryEvents = '/gallery/events';
export const galleryPhotos = '/gallery/photos';
export const panchangam = '/panchangam';

export const userData = '/users/me/data';
export const userFestivalSeen = '/users/me/festival-seen';
export const userSync = '/users/me/sync';
export const userBookmarks = '/users/me/bookmarks';
export const userBookmarkById = (id) => `/users/me/bookmarks/${id}`;
export const userProgress = '/users/me/progress';
export const userProgressById = (id) => `/users/me/progress/${id}`;
export const userPassword = '/users/me/password';
export const userSettings = '/users/me/settings';
export const userFcmToken = '/users/me/fcm-token';
export const userProfile = '/users/me';
export const userVerification = '/users/me/verification';
export const userVerificationProof = '/users/me/verification/proof';

export const adminVerification = '/admin/verification';
export const adminVerificationById = (id) => `/admin/verification/${id}`;
