import { LayoutDashboard, LogOut, Home } from 'lucide-react';
import { ADMIN_TABS, GOLD_TEXT } from '../../constants/adminConstants';
import ThemeToggle from '../ThemeToggle';
import SoundToggle from '../SoundToggle';

export default function AdminHeader({ tab, onOpenSidebar, onLogout, onExitToApp }) {
  const activeTab = ADMIN_TABS.find((t) => t.id === tab);

  return (
    <header className="admin-mobile-header sticky top-0 z-20 flex items-center gap-3 px-3 sm:px-6 h-14 lg:h-20 flex-shrink-0 backdrop-blur-md"
      style={{ background: 'var(--bg-nav)', borderBottom: '1px solid var(--border-subtle)' }}>
      <button type="button" className="lg:hidden p-1.5 rounded-xl hover:bg-white/5" onClick={onOpenSidebar}
        style={{ color: GOLD_TEXT }}>
        <LayoutDashboard size={18} />
      </button>
      <div>
        <h1 className="font-bold text-sm sm:text-base gold-glow">{activeTab?.label}</h1>
        <p className="text-xs text-muted hidden sm:block">Manage your sacred content</p>
      </div>
      <div className="ml-auto flex items-center gap-2 sm:gap-3">
        <SoundToggle
          className="p-1.5 sm:p-2 rounded-xl hover:bg-white/5 transition-colors"
          iconSize={17}
        />
        <ThemeToggle />
        <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold"
          style={{ background: '#C88F2D18', color: GOLD_TEXT, border: '1px solid #C88F2D33' }}>
          <span className="w-2 h-2 rounded-full bg-green-400" />
          Admin
        </div>
        {onExitToApp && (
          <button type="button" onClick={onExitToApp}
            className="p-1.5 sm:p-2 rounded-xl hover:bg-white/5 transition-colors"
            style={{ color: GOLD_TEXT }}
            aria-label="Back to App"
            title="Back to App">
            <Home size={17} />
          </button>
        )}
        <button type="button" onClick={onLogout}
          className="p-1.5 sm:p-2 rounded-xl text-red-400 hover:bg-red-500/10 transition-colors"
          aria-label="Logout"
          title="Logout">
          <LogOut size={17} />
        </button>
      </div>
    </header>
  );
}
