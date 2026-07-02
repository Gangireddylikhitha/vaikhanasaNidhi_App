import axiosInstance from '../lib/axiosInstance';
import {
  userData,
  userSync,
  userBookmarks,
  userBookmarkById,
  userProgress,
  userProgressById,
  userSettings,
  userProfile,
  userPassword,
} from '../lib/apiUrls';

export async function fetchUserData() {
  const { data } = await axiosInstance.get(userData);
  return data;
}

export async function syncUserDataApi(payload) {
  const { data } = await axiosInstance.post(userSync, payload);
  return data;
}

export async function fetchBookmarks() {
  const { data } = await axiosInstance.get(userBookmarks);
  return data;
}

export async function addBookmarkApi(scripture) {
  const { data } = await axiosInstance.post(userBookmarks, {
    scripture_id: scripture.id,
    title_telugu: scripture.title_telugu,
    category: scripture.category,
    deity: scripture.deity || '',
  });
  return data;
}

export async function removeBookmarkApi(scriptureId) {
  const { data } = await axiosInstance.delete(userBookmarkById(scriptureId));
  return data;
}

export async function fetchProgress() {
  const { data } = await axiosInstance.get(userProgress);
  return data;
}

export async function saveProgressApi(scripture, progress, lastVerse) {
  const { data } = await axiosInstance.put(userProgress, {
    scripture_id: scripture.id,
    title_telugu: scripture.title_telugu,
    category: scripture.category,
    progress,
    last_verse: lastVerse,
  });
  return data;
}

export async function fetchSettings() {
  const { data } = await axiosInstance.get(userSettings);
  return data;
}

export async function updateSettingsApi(settings) {
  const { data } = await axiosInstance.patch(userSettings, settings);
  return data;
}

export async function updateProfileApi(payload) {
  const { data } = await axiosInstance.patch(userProfile, payload);
  return data;
}

export async function changePasswordApi(payload) {
  const { data } = await axiosInstance.patch(userPassword, payload);
  return data;
}

export async function deleteAccountApi(password) {
  const { data } = await axiosInstance.delete(userProfile, { data: { password } });
  return data;
}

export async function removeProgressApi(scriptureId) {
  const { data } = await axiosInstance.delete(userProgressById(scriptureId));
  return data;
}
