import { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { getAuth } from '../store/authStore';
import LoginPromptModal from '../components/LoginPromptModal';

const LoginPromptContext = createContext(null);

export function LoginPromptProvider({ children }) {
  const [open, setOpen] = useState(false);
  const redirectRef = useRef('/');
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const requireLogin = useCallback((returnTo) => {
    if (typeof returnTo === 'string' && returnTo && returnTo !== '/') {
      redirectRef.current = returnTo;
    }
    setOpen(true);
  }, []);

  const closeLoginPrompt = useCallback(() => {
    setOpen(false);
    redirectRef.current = '/';
  }, []);

  const onLoginSuccess = useCallback(() => {
    const target = redirectRef.current;
    redirectRef.current = '/';
    setOpen(false);
    queryClient.invalidateQueries();

    const auth = getAuth();
    const needsVerification = auth.role === 'user' && auth.verification_status !== 'approved';

    if (needsVerification) {
      const returnTo = target && target !== '/' ? target : '/categories';
      navigate(`/verification?returnTo=${encodeURIComponent(returnTo)}`, { replace: true });
      return;
    }

    if (target && target !== '/') {
      navigate(target, { replace: true });
    }
  }, [queryClient, navigate]);

  const value = useMemo(
    () => ({ requireLogin, closeLoginPrompt }),
    [requireLogin, closeLoginPrompt]
  );

  return (
    <LoginPromptContext.Provider value={value}>
      {children}
      <LoginPromptModal open={open} onClose={closeLoginPrompt} onSuccess={onLoginSuccess} />
    </LoginPromptContext.Provider>
  );
}

export function useLoginPrompt() {
  const ctx = useContext(LoginPromptContext);
  if (!ctx) {
    throw new Error('useLoginPrompt must be used within LoginPromptProvider');
  }
  return ctx;
}
