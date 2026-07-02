import { Navigate, useLocation } from 'react-router-dom';
import { isGuest, isVerifiedUser } from '../store/authStore';

/** Registered users must complete verification before accessing protected routes. */
export default function VerificationGuard({ children }) {
  const location = useLocation();
  const returnTo = `${location.pathname}${location.search}${location.hash}`;

  if (isGuest()) return children;

  if (!isVerifiedUser()) {
    return <Navigate to={`/verification?returnTo=${encodeURIComponent(returnTo)}`} replace />;
  }

  return children;
}
