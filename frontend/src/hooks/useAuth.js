import { useQueryClient } from '@tanstack/react-query';
import { useCustomQuery, useCustomMutation } from './useCustomApi';
import * as authApi from '../api/authApi';
import { setAuthSession, clearAuthSession } from '../store/authStore';
import { syncLocalDataToServer } from '../lib/syncLocalData';
import { registerPushNotifications, unregisterPushNotifications } from '../lib/pushNotifications';
import { USER_BOOKMARKS_KEY, USER_PROGRESS_KEY, USER_SETTINGS_KEY } from './useUserData';
import { ADMIN_QUERY_KEYS } from './adminQueryKeys';

export const AUTH_ME_QUERY_KEY = ['auth', 'me'];

function useAuthSessionMutation(mutationFn, options = {}) {
  const { onSuccess, ...rest } = options;

  return useCustomMutation({
    mutationFn,
    onSuccess: (data, ...args) => {
      if (data?.token && data?.user) {
        setAuthSession(data);
      }
      onSuccess?.(data, ...args);
    },
    ...rest,
  });
}

export function useSignup(options) {
  return useCustomMutation({
    mutationFn: authApi.signupUser,
    ...options,
  });
}

export function useLogin(options) {
  const queryClient = useQueryClient();
  const { onSuccess, ...rest } = options || {};

  return useAuthSessionMutation(authApi.loginUser, {
    ...rest,
    onSuccess: async (data, ...args) => {
      if (data?.user?.role !== 'admin') {
        try {
          await syncLocalDataToServer();
          queryClient.invalidateQueries({ queryKey: USER_BOOKMARKS_KEY });
          queryClient.invalidateQueries({ queryKey: USER_PROGRESS_KEY });
          queryClient.invalidateQueries({ queryKey: USER_SETTINGS_KEY });
        } catch {
          // sync is best-effort; login still succeeds
        }
        registerPushNotifications().catch(() => {});
      }
      onSuccess?.(data, ...args);
    },
  });
}

export function useAdminLogin(options) {
  const queryClient = useQueryClient();
  const { onSuccess, ...rest } = options || {};

  return useAuthSessionMutation(authApi.adminLoginUser, {
    ...rest,
    onSuccess: (data, ...args) => {
      queryClient.invalidateQueries({ queryKey: ADMIN_QUERY_KEYS.dashboard });
      queryClient.invalidateQueries({ queryKey: ADMIN_QUERY_KEYS.users });
      onSuccess?.(data, ...args);
    },
  });
}

export function useGuestLogin(options) {
  return useAuthSessionMutation(authApi.guestLoginUser, options);
}

export function useChangePasswordLogin(options) {
  return useCustomMutation({
    mutationFn: authApi.changePassword,
    ...options,
  });
}

export function useMe(options = {}) {
  return useCustomQuery({
    queryKey: AUTH_ME_QUERY_KEY,
    queryFn: authApi.fetchMe,
    retry: false,
    ...options,
  });
}

export function useLogout(options = {}) {
  const queryClient = useQueryClient();
  const { onSuccess, ...rest } = options;

  return useCustomMutation({
    mutationFn: async () => {
      await unregisterPushNotifications();
      return authApi.logoutUser();
    },
    onSuccess: (...args) => {
      clearAuthSession();
      queryClient.removeQueries({ queryKey: ['user'] });
      onSuccess?.(...args);
    },
    onError: async () => {
      await unregisterPushNotifications();
      clearAuthSession();
      queryClient.removeQueries({ queryKey: ['user'] });
    },
    ...rest,
  });
}
