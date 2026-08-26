import { useEffect } from 'react';
import { getSettings, saveSettings } from '../store/useAppStore';
import { applyTheme } from '../lib/theme';
import { isRegisteredUser } from '../store/authStore';
import { fetchSettings } from '../api/userApi';

/** Applies saved theme on mount and syncs from server when logged in. */
export default function ThemeProvider({ children }) {
  useEffect(() => {
    async function initTheme() {
      let settings = getSettings();
      applyTheme(settings);

      if (isRegisteredUser()) {
        try {
          const server = await fetchSettings();
          if (server && typeof server === 'object') {
            settings = { ...settings, ...server };
            saveSettings(settings);
            applyTheme(settings);
          }
        } catch {
          // use local settings
        }
      }
    }

    initTheme();

    function onStorage(e) {
      if (e.key === 'vaikhanasa-nidhi') {
        applyTheme(getSettings());
      }
    }

    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  return children;
}
