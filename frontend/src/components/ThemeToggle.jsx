import { Moon, Sun } from 'lucide-react';
import { useThemeMode } from '../hooks/useThemeMode';

export default function ThemeToggle({ className = '', size = 18 }) {
  const { themeMode, toggle } = useThemeMode();
  const isDark = themeMode === 'dark';

  return (
    <button
      type="button"
      onClick={toggle}
      className={`theme-toggle-btn ${className}`}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      title={isDark ? 'Light mode' : 'Dark mode'}
    >
      {isDark ? <Sun size={size} /> : <Moon size={size} />}
    </button>
  );
}
