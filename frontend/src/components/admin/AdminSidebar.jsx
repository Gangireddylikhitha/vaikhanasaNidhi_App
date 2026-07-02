import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, LogOut, X } from 'lucide-react';
import { ADMIN_TABS, GOLD_TEXT } from '../../constants/adminConstants';
import logo from '../../assets/images/logo.png';

export default function AdminSidebar({ tab, sidebarOpen, onTabChange, onCloseSidebar, onLogout, pendingVerifications = 0 }) {
  return (
    <>
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 z-40 lg:hidden"
            onClick={onCloseSidebar} />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {(sidebarOpen || true) && (
          <aside className={`
            fixed top-0 left-0 h-full z-50 flex flex-col w-64 shadow-2xl transition-transform duration-300
            ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
            lg:translate-x-0 lg:z-30
          `} style={{ background: 'var(--drawer-bg)', borderRight: '1px solid var(--border-subtle)' }}>

            <div className="flex items-center gap-3 px-5 py-6" style={{ borderBottom: '1px solid #C88F2D22' }}>
              <div className="w-10 h-10 rounded-full flex items-center justify-center overflow-hidden flex-shrink-0"
                style={{ border: '1px solid #C88F2D44' }}>
                <img src={logo} alt="logo" className="w-7 h-7 object-contain" />
              </div>
              <div className="min-w-0">
                <div className="font-bold text-sm truncate gold-glow" style={{ fontFamily: 'Tiro Telugu, serif' }}>
                  వైఖానస నిధి
                </div>
                <div className="text-xs text-muted">Admin Panel</div>
              </div>
              <button type="button" className="ml-auto lg:hidden p-1" onClick={onCloseSidebar}
                style={{ color: GOLD_TEXT }}><X size={18} /></button>
            </div>

            <nav className="flex-1 px-3 py-5 space-y-1">
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

            <div className="px-3 pb-5">
              <button type="button" onClick={onLogout}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold hover:bg-white/5 transition-all text-muted">
                <LogOut size={17} /> Logout
              </button>
            </div>
          </aside>
        )}
      </AnimatePresence>
    </>
  );
}
