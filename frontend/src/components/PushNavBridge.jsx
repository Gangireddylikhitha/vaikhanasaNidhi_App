import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { setPushNavHandler } from '../lib/pushNotifications';

/** Routes into the app when the user taps an FCM notification. */
export default function PushNavBridge() {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    return setPushNavHandler((path) => {
      if (path && location.pathname !== path) {
        console.log('[PushNavBridge] Navigating to target route:', path);
        navigate(path);
      }
    });
  }, [navigate, location.pathname]);

  return null;
}
