import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, LogOut, X } from 'lucide-react';
import { ADMIN_TABS, GOLD_TEXT } from '../../constants/adminConstants';
import vaikhanasaGuru from '../../assets/images/vaikhanasaGuru.png';

function SidebarHeader({ onClose, showClose = false }) {
  return (
    <div
      className="flex-shrink-0 text-center sidebar-drawer-head"
      style={{ borderBottom: '1px solid var(--border-subtle)' }}
    >
      {showClose && (
        <div className="flex items-center justify-end mb-2">
          <button type="button" onClick={onClose} style={{ color: GOLD_TEXT }} aria-label="Close menu">
            <X size={20} />
          </button>
        </div>
      )}
      <div className="sidebar-guru-wrap inline-flex">
        <img src={vaikhanasaGuru} alt="Vaikhanasa Guru" className="sidebar-guru-img" />
      </div>
      <h2
        className="font-telugu font-bold text-xl gold-glow-strong mt-4 sidebar-drawer-title"
        style={{ fontFamily: 'Tiro Telugu, serif' }}
      >
        వైఖానస నిధి
      </h2>
      <p className="text-xs text-muted mt-1">Admin Panel</p>
    </div>
  );
}
function SidebarNav({ tab, onTabChange, onLogout, pendingVerifications, className = '' }) {
  return (
    <>
      <nav className={`flex-1 px-3 py-4 space-y-1 ${className}`}>
        {ADMIN_TABS.map(({ id, label, icon: Icon }) => (
          <button key={id} type="button" onClick={() => onTabChange(id)}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all text-left"
            style={{
              background: tab === id ? '#C88F2D18' : 'transparent',
              color: tab === id ? GOLD_TEXT : '#C88F2D99',
              textShadow: tab === id ? '0 0 10px rgba(228,178,75,0.35)' : 'none',
            }}>
            <Icon size={17} />
            {label}
            {id === 'verifications' && pendingVerifications > 0 && (
              <span className="ml-1 min-w-[1.25rem] h-5 px-1.5 rounded-full text-[10px] font-bold flex items-center justify-center"
                style={{ background: '#d97706', color: '#fff' }}>
                {pendingVerifications}
              </span>
            )}
            {tab === id && <ChevronRight size={14} className="ml-auto" />}
          </button>
        ))}
      </nav>

      <div className="px-3 pb-5 flex-shrink-0">
        <button type="button" onClick={onLogout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold hover:bg-white/5 transition-all text-muted">
          <LogOut size={17} /> Logout
        </button>
      </div>
    </>
  );
}

export default function AdminSidebar({ tab, sidebarOpen, onTabChange, onCloseSidebar, onLogout, pendingVerifications = 0 }) {
  return (
    <>
      {/* Mobile / tablet drawer — same layout as user app sidebar */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 lg:hidden"
            style={{ background: 'var(--bg-overlay)' }}
            onClick={onCloseSidebar}
          />
        )}
      </AnimatePresence>

      <motion.aside
        initial={false}
        animate={{ x: sidebarOpen ? 0 : '-100%' }}
        transition={{ type: 'spring', damping: 30, stiffness: 300 }}
        className="nav-drawer z-50 lg:hidden"
      >
        <SidebarHeader onClose={onCloseSidebar} showClose />

        <div className="panel-scroll scrollbar-hide flex flex-col flex-1 min-h-0">          <SidebarNav
            tab={tab}
            onTabChange={onTabChange}
            onLogout={onLogout}
            pendingVerifications={pendingVerifications}
            className="px-4"
          />
        </div>
      </motion.aside>

      {/* Desktop sidebar — guru image + title (same as user app) */}
      <aside
        className="hidden lg:flex fixed top-0 left-0 h-full z-30 flex-col w-64 shadow-2xl overflow-hidden"
        style={{ background: 'var(--drawer-bg)', borderRight: '1px solid var(--border-subtle)' }}
      >
        <SidebarHeader />

        <div className="panel-scroll scrollbar-hide flex flex-col flex-1 min-h-0">
          <SidebarNav
            tab={tab}
            onTabChange={onTabChange}
            onLogout={onLogout}
            pendingVerifications={pendingVerifications}
          />
        </div>
      </aside>    </>
  );
}
