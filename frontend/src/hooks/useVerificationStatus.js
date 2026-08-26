import { useEffect, useState } from 'react';
import { getVerificationStatus } from '../store/authStore';

/** Reactive verification status — re-renders when admin approves or status updates. */
export function useVerificationStatus() {
  const [status, setStatus] = useState(getVerificationStatus);

  useEffect(() => {
    const onChange = (e) => setStatus(e.detail?.status ?? getVerificationStatus());
    window.addEventListener('auth:verification', onChange);
    return () => window.removeEventListener('auth:verification', onChange);
  }, []);

  return status;
}

export function useIsVerified() {
  return useVerificationStatus() === 'approved';
}
