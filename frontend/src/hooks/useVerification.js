import { useQueryClient } from '@tanstack/react-query';
import { useCustomMutation, useCustomQuery } from './useCustomApi';
import * as verificationApi from '../api/verificationApi';
import { isRegisteredUser, updateVerificationStatus } from '../store/authStore';

export const VERIFICATION_KEY = ['verification', 'me'];

export function useMyVerification(options = {}) {
  return useCustomQuery({
    queryKey: VERIFICATION_KEY,
    queryFn: async () => {
      const data = await verificationApi.fetchMyVerification();
      if (data?.verification_status) {
        updateVerificationStatus(data.verification_status);
      }
      return data;
    },
    enabled: isRegisteredUser(),
    staleTime: 30 * 1000,
    ...options,
  });
}

export function useSubmitVerification(options = {}) {
  const queryClient = useQueryClient();
  const { onSuccess, ...rest } = options;
  return useCustomMutation({
    mutationFn: verificationApi.submitVerification,
    onSuccess: (data, ...args) => {
      if (data?.verification_status) {
        updateVerificationStatus(data.verification_status);
      }
      queryClient.invalidateQueries({ queryKey: VERIFICATION_KEY });
      onSuccess?.(data, ...args);
    },
    ...rest,
  });
}

export function useAdminVerifications(status = 'all', options = {}) {
  return useCustomQuery({
    queryKey: ['admin', 'verification', status],
    queryFn: () => verificationApi.fetchAdminVerifications({ status }),
    staleTime: 30 * 1000,
    ...options,
  });
}

export function useReviewVerification(options = {}) {
  return useCustomMutation({
    mutationFn: ({ id, ...payload }) => verificationApi.reviewVerification(id, payload),
    ...options,
  });
}
