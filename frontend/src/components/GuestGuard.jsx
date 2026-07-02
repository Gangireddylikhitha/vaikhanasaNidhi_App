import { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { isGuest, isRegisteredUser, isVerifiedUser } from '../store/authStore';
import { useLoginPrompt } from '../context/LoginPromptContext';

/** Blocks guests (login popup) and unverified users (verification page). */
export default function GuestGuard({ children }) {
  const location = useLocation();
  const { requireLogin } = useLoginPrompt();
  const returnTo = `${location.pathname}${location.search}${location.hash}`;

  useEffect(() => {
    if (isGuest()) requireLogin(returnTo);
  }, [requireLogin, returnTo]);

  if (isGuest()) return <Navigate to="/" replace />;

  if (isRegisteredUser() && !isVerifiedUser()) {
    return <Navigate to="/verification" replace state={{ returnTo }} />;
  }

  return children;
}
