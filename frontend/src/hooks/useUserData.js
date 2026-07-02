import { useCallback } from 'react';
import { useQueryClient, useMutation } from '@tanstack/react-query';
import { useCustomQuery, useCustomMutation } from './useCustomApi';
import * as userApi from '../api/userApi';
import { isRegisteredUser, isLoggedIn, setAuthSession, getAuth, clearAuthSession } from '../store/authStore';
import {
  getBookmarks as getLocalBookmarks,
  addBookmark as addLocalBookmark,
  removeBookmark as removeLocalBookmark,
  isBookmarked as isLocalBookmarked,
  getReadingProgress as getLocalProgress,
  saveReadingProgress as saveLocalProgress,
  getSettings as getLocalSettings,
  saveSettings as saveLocalSettings,
} from '../store/useAppStore';

export const USER_DATA_KEY = ['user', 'data'];
export const USER_BOOKMARKS_KEY = ['user', 'bookmarks'];
export const USER_PROGRESS_KEY = ['user', 'progress'];
export const USER_SETTINGS_KEY = ['user', 'settings'];

export function useUserData(options = {}) {
  return useCustomQuery({
    queryKey: USER_DATA_KEY,
    queryFn: userApi.fetchUserData,
    enabled: isLoggedIn() && isRegisteredUser(),
    staleTime: 60 * 1000,
    ...options,
  });
}

export function useBookmarks(options = {}) {
  const registered = isRegisteredUser();
  return useCustomQuery({
    queryKey: USER_BOOKMARKS_KEY,
    queryFn: registered ? userApi.fetchBookmarks : async () => getLocalBookmarks(),
    enabled: isLoggedIn(),
    staleTime: 30 * 1000,
    ...options,
  });
}

export function useReadingProgress(options = {}) {
  const registered = isRegisteredUser();
  return useCustomQuery({
    queryKey: USER_PROGRESS_KEY,
    queryFn: registered ? userApi.fetchProgress : async () => getLocalProgress(),
    enabled: isLoggedIn(),
    staleTime: 30 * 1000,
    ...options,
  });
}

export function useUserSettings(options = {}) {
  const registered = isRegisteredUser();
  return useCustomQuery({
    queryKey: USER_SETTINGS_KEY,
    queryFn: registered ? userApi.fetchSettings : async () => getLocalSettings(),
    enabled: isLoggedIn(),
    staleTime: 60 * 1000,
    ...options,
  });
}

export function useBookmarkActions() {
  const queryClient = useQueryClient();
  const registered = isRegisteredUser();

  const addMutation = useMutation({
    mutationFn: async (scripture) => {
      if (registered) return userApi.addBookmarkApi(scripture);
      addLocalBookmark(scripture);
      return getLocalBookmarks();
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: USER_BOOKMARKS_KEY }),
  });

  const removeMutation = useMutation({
    mutationFn: async (scriptureId) => {
      if (registered) return userApi.removeBookmarkApi(scriptureId);
      removeLocalBookmark(scriptureId);
      return getLocalBookmarks();
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: USER_BOOKMARKS_KEY }),
  });

  const isBookmarked = useCallback((scriptureId, bookmarksList = []) => {
    if (registered && bookmarksList.length) {
      return bookmarksList.some((b) => b.scripture_id === scriptureId);
    }
    return isLocalBookmarked(scriptureId);
  }, [registered]);

  return { addMutation, removeMutation, isBookmarked, registered };
}

export function useProgressActions() {
  const queryClient = useQueryClient();
  const registered = isRegisteredUser();

  return useMutation({
    mutationFn: async ({ scripture, progress, lastVerse }) => {
      if (registered) return userApi.saveProgressApi(scripture, progress, lastVerse);
      saveLocalProgress(scripture, progress, lastVerse);
      return getLocalProgress();
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: USER_PROGRESS_KEY }),
  });
}

export function useSettingsActions() {
  const queryClient = useQueryClient();
  const registered = isRegisteredUser();

  return useMutation({
    mutationFn: async (settings) => {
      if (registered) return userApi.updateSettingsApi(settings);
      saveLocalSettings(settings);
      return settings;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: USER_SETTINGS_KEY }),
  });
}

export function useProfileUpdate() {
  const queryClient = useQueryClient();

  return useCustomMutation({
    mutationFn: userApi.updateProfileApi,
    onSuccess: (data) => {
      const auth = getAuth();
      if (data?.name) {
        setAuthSession({ token: auth.token, user: { ...auth, name: data.name, role: data.role, username: data.username } });
      }
      queryClient.invalidateQueries({ queryKey: ['auth', 'me'] });
    },
  });
}

export function useChangePassword() {
  return useCustomMutation({ mutationFn: userApi.changePasswordApi });
}

export function useDeleteAccount() {
  const queryClient = useQueryClient();
  return useCustomMutation({
    mutationFn: userApi.deleteAccountApi,
    onSuccess: () => {
      clearAuthSession();
      queryClient.clear();
    },
  });
}
