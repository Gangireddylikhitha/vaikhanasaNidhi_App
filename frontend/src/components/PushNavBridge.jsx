import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { setPushNavHandler } from '../lib/pushNotifications';

/** Routes into the app when the user taps an FCM notification. */
export default function PushNavBridge() {
  const navigate = useNavigate();

  useEffect(() => setPushNavHandler((path) => {
    if (path) navigate(path);
  }), [navigate]);

  return null;
}
