import { useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { setAppBackHandler } from '../lib/nativeBack';

function pathKey(location) {
  return `${location.pathname}${location.search}${location.hash}`;
}

/**
 * Keeps an explicit in-app path stack so Android back goes to the previous
 * screen instead of finishing the Activity.
 */
export default function NativeBackBridge() {
  const location = useLocation();
  const navigate = useNavigate();
  const stackRef = useRef([pathKey(location)]);
  const locationRef = useRef(location);
  locationRef.current = location;

  useEffect(() => {
    const key = pathKey(location);
    const stack = stackRef.current;
    const top = stack[stack.length - 1];
    if (key === top) return;

    const existing = stack.lastIndexOf(key);
    if (existing >= 0) {
      stackRef.current = stack.slice(0, existing + 1);
    } else {
      stack.push(key);
      stackRef.current = stack;
    }
  }, [location]);

  useEffect(() => {
    return setAppBackHandler(() => {
      const stack = stackRef.current;
      const loc = locationRef.current;

      if (stack.length > 1) {
        stack.pop();
        const prev = stack[stack.length - 1] || '/';
        navigate(prev);
        return true;
      }

      if (loc.pathname !== '/') {
        stackRef.current = ['/'];
        navigate('/');
        return true;
      }

      return false;
    });
  }, [navigate]);

  return null;
}
