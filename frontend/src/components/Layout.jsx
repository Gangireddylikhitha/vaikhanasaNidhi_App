import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Home, Search, Bookmark, Calendar, User, Menu, X, Settings, Bell, LogOut } from 'lucide-react';
import SettingsDrawer from './SettingsDrawer';
import logo from '../assets/images/logo.png';

const NAV_LINKS = [
  { to: '/', icon: Home, label: 'హోం', en: 'Sacred' },
  { to: '/search', icon: Search, label: 'శోధన', en: 'Mantras' },
  { to: '/bookmarks', icon: Bookmark, label: 'బుక్మార్క్స్', en: 'Library' },
  { to: '/panchangam', icon: Calendar, label: 'పంచాంగం', en: 'Panchangam' },
  { to: '/profile', icon: User, label: 'ప్రొఫైల్', en: 'Profile' },
];

const GOLD = '#E4B24B';
const GOLD_MID = '#C88F2D';
const BG_DARK = '#0a0a0a';
const BG_NAV = 'rgba(10, 10, 10, 0.92)';

export default function Layout({ children, onLogout }) {
  const location = useLocation();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 8);
    window.addEventListener('scroll', handler);
    return () => window.removeEventListener('scroll', handler);
  }, []);

  const isActive = (to) => location.pathname === to;

  return (
    <div className="min-h-screen flex flex-col" style={{ background: BG_DARK }}>

      {/* Top Navigation — desktop & tablet */}
      <header
        className={`hidden lg:flex fixed top-0 left-0 right-0 z-30 items-center justify-between px-8 h-16 transition-all duration-300 backdrop-blur-md ${scrolled ? 'border-b' : ''}`}
        style={{ background: BG_NAV, borderColor: scrolled ? '#C88F2D22' : 'transparent' }}
      >
        {/* Logo */}
        <Link to="/" className="flex items-center gap-3 flex-shrink-0">
          <div className="w-9 h-9 rounded-full flex items-center justify-center overflow-hidden" style={{ border: '1px solid #C88F2D44' }}>
            <img src={logo} alt="logo" className="w-7 h-7 object-contain" />
          </div>
          <span className="font-telugu font-bold text-lg gold-glow" style={{ fontFamily: 'Tiro Telugu, serif' }}>
            వైఖానస నిధి
          </span>
        </Link>

        {/* Center nav links */}
        <nav className="flex items-center gap-1">
          {NAV_LINKS.map(({ to, label, en }) => (
            <Link
              key={to}
              to={to}
              className="px-4 py-2 rounded-lg text-sm transition-all duration-200 font-telugu"
              style={{
                color: isActive(to) ? GOLD : '#C88F2D99',
                fontFamily: 'Tiro Telugu, serif',
                background: isActive(to) ? '#C88F2D15' : 'transparent',
                textShadow: isActive(to) ? '0 0 12px rgba(228,178,75,0.4)' : 'none',
              }}
            >
              {label}
            </Link>
          ))}
        </nav>

        {/* Right icons */}
        <div className="flex items-center gap-1">
          <Link to="/search" className="p-2.5 rounded-lg transition-colors hover:bg-white/5" style={{ color: GOLD }}>
            <Search size={18} />
          </Link>
          <button className="p-2.5 rounded-lg transition-colors hover:bg-white/5" style={{ color: GOLD }}>
            <Bell size={18} />
          </button>
          <button onClick={() => setSettingsOpen(true)} className="p-2.5 rounded-lg transition-colors hover:bg-white/5" style={{ color: GOLD }}>
            <Settings size={18} />
          </button>
          <Link to="/profile" className="p-2.5 rounded-lg transition-colors hover:bg-white/5" style={{ color: GOLD }}>
            <User size={18} />
          </Link>
          {onLogout && (
            <button onClick={onLogout} className="p-2.5 rounded-lg transition-colors hover:bg-white/5 ml-1" style={{ color: '#C88F2D88' }}>
              <LogOut size={18} />
            </button>
          )}
        </div>
      </header>

      {/* Mobile Header */}
      <header
        className={`lg:hidden fixed top-0 left-0 right-0 z-20 flex items-center justify-between px-4 h-14 transition-all duration-300 backdrop-blur-md ${scrolled ? 'border-b' : ''}`}
        style={{ background: BG_NAV, borderColor: scrolled ? '#C88F2D22' : 'transparent' }}
      >
        <button onClick={() => setDrawerOpen(true)} className="p-2" style={{ color: GOLD }}>
          <Menu size={22} />
        </button>
        <Link to="/" className="flex items-center gap-2">
          <img src={logo} alt="logo" className="w-9 h-9 object-contain" />
          <span className="font-telugu font-bold text-base gold-glow" style={{ fontFamily: 'Tiro Telugu, serif' }}>
            వైఖానస నిధి
          </span>
        </Link>
        <button onClick={() => setSettingsOpen(true)} className="p-2" style={{ color: GOLD }}>
          <Settings size={20} />
        </button>
      </header>

      {/* Mobile Nav Drawer */}
      <AnimatePresence>
        {drawerOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/70 z-40 lg:hidden" onClick={() => setDrawerOpen(false)}
            />
            <motion.aside
              initial={{ x: '-100%' }} animate={{ x: 0 }} exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="fixed left-0 top-0 h-full w-72 z-50 shadow-2xl flex flex-col lg:hidden"
              style={{ background: '#111111', borderRight: '1px solid #C88F2D22' }}
            >
              <div className="flex items-center justify-between px-5 py-5" style={{ borderBottom: '1px solid #C88F2D22' }}>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center overflow-hidden" style={{ border: '1px solid #C88F2D44' }}>
                    <img src={logo} alt="logo" className="w-7 h-7 object-contain" />
                  </div>
                  <div>
                    <div className="font-telugu font-bold gold-glow" style={{ fontFamily: 'Tiro Telugu, serif' }}>వైఖానస నిధి</div>
                    <div className="text-xs" style={{ color: '#C88F2D66' }}>Sacred Library</div>
                  </div>
                </div>
                <button onClick={() => setDrawerOpen(false)} style={{ color: GOLD }}><X size={20} /></button>
              </div>
              <nav className="flex-1 px-4 py-6 flex flex-col gap-1">
                {NAV_LINKS.map(({ to, icon: Icon, label }) => (
                  <Link
                    key={to}
                    to={to}
                    onClick={() => setDrawerOpen(false)}
                    className="flex items-center gap-3 px-4 py-3.5 rounded-xl font-telugu text-sm transition-all"
                    style={{
                      background: isActive(to) ? '#C88F2D18' : 'transparent',
                      color: isActive(to) ? GOLD : '#C88F2D99',
                      fontFamily: 'Tiro Telugu, serif',
                      textShadow: isActive(to) ? '0 0 10px rgba(228,178,75,0.35)' : 'none',
                    }}
                  >
                    <Icon size={18} />
                    {label}
                  </Link>
                ))}
              </nav>
              <div className="px-4 pb-6 space-y-1">
                <button
                  onClick={() => { setDrawerOpen(false); setSettingsOpen(true); }}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl w-full font-telugu text-sm hover:bg-white/5 transition-all"
                  style={{ color: '#C88F2D99', fontFamily: 'Tiro Telugu, serif' }}
                >
                  <Settings size={18} /> సెట్టింగ్స్
                </button>
                {onLogout && (
                  <button
                    onClick={() => { setDrawerOpen(false); onLogout(); }}
                    className="flex items-center gap-3 px-4 py-3 rounded-xl w-full font-telugu text-sm hover:bg-white/5 transition-all"
                    style={{ color: '#C88F2D66', fontFamily: 'Tiro Telugu, serif' }}
                  >
                    <LogOut size={18} /> లాగ్అవుట్
                  </button>
                )}
                <div className="mt-3 text-center text-xs" style={{ color: '#C88F2D44' }}>వైఖానస నిధి v3.0</div>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main className="flex-1 pb-20 lg:pb-0 pt-14 lg:pt-16 overflow-x-hidden min-w-0">
        {children}
      </main>

      {/* Mobile Bottom Tab Bar */}
      <nav
        className="lg:hidden fixed bottom-0 left-0 right-0 z-20 flex items-center backdrop-blur-md"
        style={{ background: BG_NAV, borderTop: '1px solid #C88F2D22' }}
      >
        {NAV_LINKS.map(({ to, icon: Icon, label }) => {
          const active = isActive(to);
          return (
            <Link key={to} to={to} className="flex-1 flex flex-col items-center py-2 gap-0.5 relative">
              {active && (
                <motion.div
                  layoutId="bottom-pill"
                  className="absolute -top-0.5 left-1/2 -translate-x-1/2 w-10 h-0.5 rounded-full"
                  style={{ background: GOLD, boxShadow: '0 0 8px rgba(228,178,75,0.6)' }}
                />
              )}
              <Icon size={20} strokeWidth={active ? 2.5 : 1.8} color={active ? GOLD_MID : '#555'} />
              <span
                className="font-telugu text-[10px]"
                style={{ fontFamily: 'Tiro Telugu, serif', color: active ? GOLD : '#555' }}
              >
                {label}
              </span>
            </Link>
          );
        })}
      </nav>

      <SettingsDrawer open={settingsOpen} onClose={() => setSettingsOpen(false)} />
    </div>
  );
}
