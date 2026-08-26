import { useCallback, useEffect, useState } from 'react';
import { getSettings, saveSettings } from '../store/useAppStore';
import { applyTheme } from '../lib/theme';
import { isRegisteredUser } from '../store/authStore';
import { updateSettingsApi } from '../api/userApi';

export function useThemeMode() {
  const [themeMode, setThemeMode] = useState(() => getSettings().themeMode || 'dark');

  useEffect(() => {
    function onThemeChange(e) {
      setThemeMode(e.detail?.themeMode || getSettings().themeMode || 'dark');
    }
    window.addEventListener('themechange', onThemeChange);
    return () => window.removeEventListener('themechange', onThemeChange);
  }, []);

  const setMode = useCallback((mode) => {
    const next = { ...getSettings(), themeMode: mode };
    saveSettings(next);
    applyTheme(next);
    setThemeMode(mode);
    if (isRegisteredUser()) {
      updateSettingsApi(next).catch(() => {});
    }
  }, []);

  const toggle = useCallback(() => {
    setMode(themeMode === 'dark' ? 'light' : 'dark');
  }, [themeMode, setMode]);

  return { themeMode, setMode, toggle, isDark: themeMode === 'dark' };
}
