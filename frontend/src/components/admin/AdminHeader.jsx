import { LayoutDashboard, LogOut } from 'lucide-react';
import { ADMIN_TABS, GOLD_TEXT } from '../../constants/adminConstants';

export default function AdminHeader({ tab, onOpenSidebar, onLogout }) {
  const activeTab = ADMIN_TABS.find((t) => t.id === tab);

  return (
    <header className="sticky top-0 z-20 flex items-center gap-4 px-4 sm:px-6 h-16 backdrop-blur-md"
      style={{ background: 'var(--bg-nav)', borderBottom: '1px solid var(--border-subtle)' }}>
      <button type="button" className="lg:hidden p-2 rounded-xl hover:bg-white/5" onClick={onOpenSidebar}
        style={{ color: GOLD_TEXT }}>
        <LayoutDashboard size={20} />
      </button>
      <div>
        <h1 className="font-bold text-base gold-glow">{activeTab?.label}</h1>
        <p className="text-xs text-muted hidden sm:block">Manage your sacred content</p>
      </div>
      <div className="ml-auto flex items-center gap-3">
        <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold"
          style={{ background: '#C88F2D18', color: GOLD_TEXT, border: '1px solid #C88F2D33' }}>
          <span className="w-2 h-2 rounded-full bg-green-400" />
          Admin
        </div>
        <button type="button" onClick={onLogout}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-red-400 hover:bg-red-500/10 transition-colors">
          <LogOut size={13} /> Logout
        </button>
      </div>
    </header>
  );
}
