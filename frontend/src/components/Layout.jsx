import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Home, Search, Bookmark, Calendar, User, Menu, X, Settings, LogOut, Info, Phone } from 'lucide-react';
import SettingsDrawer from './SettingsDrawer';
import GuestNavLink from './GuestNavLink';
import { WhatsAppIcon, InstagramIcon } from './SocialLinkIcons';
import { SOCIAL_LINKS, WHATSAPP_URL, INSTAGRAM_URL } from '../constants/socialLinks';
import SoundToggle from './SoundToggle';
import logo from '../assets/images/logo.png';
import vaikhanasaGuru from '../assets/images/vaikhanasaGuru.png';

const LOGO = '/vaikhanasa.png';

const NAV_LINKS = [
  { to: '/', icon: Home, label: 'హోం', en: 'Sacred' },
  { to: '/search', icon: Search, label: 'శోధన', en: 'Mantras' },
  { to: '/bookmarks', icon: Bookmark, label: 'బుక్మార్క్స్', en: 'Library' },
  { to: '/panchangam', icon: Calendar, label: 'పంచాంగం', en: 'Panchangam' },
  { to: '/profile', icon: User, label: 'ప్రొఫైల్', en: 'Profile' },
];

const DRAWER_EXTRA_LINKS = [
  { to: '/about', icon: Info, label: 'గురించి', en: 'About' },
  { to: '/contact', icon: Phone, label: 'సంప్రదింపు', en: 'Contact' },
];

const GOLD = '#E4B24B';
const GOLD_MID = '#C88F2D';

const SOCIAL_ICON_MAP = {
  whatsapp: WhatsAppIcon,
  instagram: InstagramIcon,
};

function SocialSidebarLinks({ onNavigate, compact = false }) {
  return (
    <div className={compact ? 'flex items-center gap-1' : 'px-4 py-3'}>
      {!compact && (
        <p className="text-[10px] uppercase tracking-widest text-muted mb-2 px-1 font-telugu" style={{ fontFamily: 'Tiro Telugu, serif' }}>
          మమ్మల్ని సంప్రదించండి
        </p>
      )}
      <div className={`flex ${compact ? 'items-center gap-1' : 'flex-col gap-2'}`}>
        {SOCIAL_LINKS.map(({ id, href, label, display }) => {
          const Icon = SOCIAL_ICON_MAP[id];
          return (
            <a
              key={id}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              onClick={onNavigate}
              className={compact ? 'sidebar-social-btn sidebar-social-btn--compact' : 'sidebar-social-btn'}
              aria-label={label}
              title={display}
            >
              <Icon size={compact ? 18 : 20} />
              {!compact && (
                <span className="min-w-0">
                  <span className="block text-sm font-semibold text-body">{label}</span>
                  <span className="block text-xs text-muted truncate">{display}</span>
                </span>
              )}
            </a>
          );
        })}
      </div>
    </div>
  );
}

export default function Layout({ children, onLogout }) {
  const location = useLocation();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 8);
    window.addEventListener('scroll', handler, { passive: true });
    return () => window.removeEventListener('scroll', handler);
  }, []);

  useEffect(() => {
    if (!drawerOpen) return undefined;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = prev; };
  }, [drawerOpen]);

  const isActive = (to) => location.pathname === to;

  return (
    <div className="min-h-dvh flex flex-col page-bg">

      {/* Top Navigation — desktop & tablet */}
      <header
        className={`hidden lg:flex fixed top-0 left-0 right-0 z-30 items-center justify-between px-8 h-16 transition-all duration-300 backdrop-blur-md ${scrolled ? 'border-b' : ''}`}
        style={{ background: 'var(--bg-nav)', borderColor: scrolled ? 'var(--border-subtle)' : 'transparent' }}
      >
        {/* Logo */}
        <Link to="/" className="flex items-center gap-3 flex-shrink-0">
          <div className="w-12 h-12 rounded-full flex items-center justify-center overflow-hidden" style={{ border: '1px solid var(--border-medium)', boxShadow: '0 0 12px rgba(200,143,45,0.2)' }}>
            <img src={LOGO} alt="Vaikhanasa Nidhi" className="w-10 h-10 object-contain" />
          </div>
          <span className="font-telugu font-bold text-lg gold-glow text-primary-gold" style={{ fontFamily: 'Tiro Telugu, serif' }}>
            వైఖానస నిధి
          </span>
        </Link>

        {/* Center nav links */}
        <nav className="flex items-center gap-1">
          {NAV_LINKS.map(({ to, label }) => (
            <GuestNavLink
              key={to}
              to={to}
              className="px-4 py-2 rounded-lg text-sm transition-all duration-200 font-telugu"
              style={{
                color: isActive(to) ? 'var(--text-primary)' : 'var(--text-muted)',
                fontFamily: 'Tiro Telugu, serif',
                background: isActive(to) ? 'var(--hover-bg)' : 'transparent',
              }}
            >
              {label}
            </GuestNavLink>
          ))}
          {DRAWER_EXTRA_LINKS.map(({ to, label }) => (
            <GuestNavLink
              key={to}
              to={to}
              className="px-3 py-2 rounded-lg text-sm transition-all duration-200 font-telugu opacity-80"
              style={{
                color: isActive(to) ? 'var(--text-primary)' : 'var(--text-muted)',
                fontFamily: 'Tiro Telugu, serif',
                background: isActive(to) ? 'var(--hover-bg)' : 'transparent',
              }}
            >
              {label}
            </GuestNavLink>
          ))}
        </nav>

        {/* Right icons */}
        <div className="flex items-center gap-1">
          <GuestNavLink to="/search" className="p-2.5 rounded-lg transition-colors hover:bg-white/5" style={{ color: GOLD }}>
            <Search size={18} />
          </GuestNavLink>
          <SoundToggle
            className="p-2.5 rounded-lg transition-colors hover:bg-white/5"
            iconSize={18}
          />
          <button onClick={() => setSettingsOpen(true)} className="p-2.5 rounded-lg transition-colors hover:bg-white/5" style={{ color: GOLD }}>
            <Settings size={18} />
          </button>
          <GuestNavLink to="/profile" className="p-2.5 rounded-lg transition-colors hover:bg-white/5" style={{ color: GOLD }}>
            <User size={18} />
          </GuestNavLink>
          <a
            href={WHATSAPP_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="sidebar-social-btn sidebar-social-btn--compact p-2.5"
            aria-label="WhatsApp Chat"
            title="Chat on WhatsApp: 79810 91684"
          >
            <WhatsAppIcon size={18} />
          </a>
          <a
            href={INSTAGRAM_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="sidebar-social-btn sidebar-social-btn--compact p-2.5"
            aria-label="Instagram"
            title="@ssri_vaikhanasam_app"
          >
            <InstagramIcon size={18} />
          </a>
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
        style={{ background: 'var(--bg-nav)', borderColor: scrolled ? 'var(--border-subtle)' : 'transparent' }}
      >
        <button onClick={() => setDrawerOpen(true)} className="p-2 text-primary-gold">
          <Menu size={22} />
        </button>
        <Link to="/" className="flex items-center gap-2">
          <img src={LOGO} alt="Vaikhanasa Nidhi" className="w-10 h-10 object-contain" style={{ filter: 'drop-shadow(0 0 8px rgba(200,143,45,0.35))' }} />
          <span className="font-telugu font-bold text-base gold-glow text-primary-gold" style={{ fontFamily: 'Tiro Telugu, serif' }}>
            వైఖానస నిధి
          </span>
        </Link>
        <SoundToggle
          className="p-2 rounded-lg transition-colors hover:bg-white/5"
          iconSize={19}
        />
      </header>

      {/* Mobile Nav Drawer */}
      <AnimatePresence>
        {drawerOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 lg:hidden" style={{ background: 'var(--bg-overlay)' }} onClick={() => setDrawerOpen(false)}
            />
            <motion.aside
              initial={{ x: '-100%' }} animate={{ x: 0 }} exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="nav-drawer z-50 lg:hidden"
            >
              <div className="flex-shrink-0 text-center sidebar-drawer-head" style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                <div className="flex items-center justify-end mb-2">
                  <button onClick={() => setDrawerOpen(false)} style={{ color: GOLD }} aria-label="Close menu">
                    <X size={20} />
                  </button>
                </div>
                <Link to="/about" onClick={() => setDrawerOpen(false)} className="sidebar-guru-wrap inline-flex">
                  <img
                    src={vaikhanasaGuru}
                    alt="Vaikhanasa Guru"
                    className="sidebar-guru-img"
                  />
                </Link>
                <h2 className="font-telugu font-bold text-xl gold-glow-strong mt-4 sidebar-drawer-title" style={{ fontFamily: 'Tiro Telugu, serif' }}>
                  వైఖానస నిధి
                </h2>
              
              </div>
              <div className="panel-scroll scrollbar-hide">
                <nav className="px-4 py-4 flex flex-col gap-1">
                  {NAV_LINKS.map(({ to, icon: Icon, label }) => (
                    <GuestNavLink
                      key={to}
                      to={to}
                      onClick={() => setDrawerOpen(false)}
                      className="flex items-center gap-3 px-4 py-3.5 rounded-xl font-telugu text-sm transition-all w-full text-left"
                      style={{
                        background: isActive(to) ? '#C88F2D18' : 'transparent',
                        color: isActive(to) ? GOLD : 'var(--text-primary)',
                        fontFamily: 'Tiro Telugu, serif',
                        textShadow: isActive(to) ? '0 0 10px rgba(228,178,75,0.35)' : '0 0 10px rgba(228,178,75,0.08)',
                      }}
                    >
                      <Icon size={18} />
                      {label}
                    </GuestNavLink>
                  ))}
                  <div className="my-2 h-px" style={{ background: 'var(--border-subtle)' }} />
                  {DRAWER_EXTRA_LINKS.map(({ to, icon: Icon, label }) => (
                    <GuestNavLink
                      key={to}
                      to={to}
                      onClick={() => setDrawerOpen(false)}
                      className="flex items-center gap-3 px-4 py-3.5 rounded-xl font-telugu text-sm transition-all w-full text-left"
                      style={{
                        background: isActive(to) ? '#C88F2D18' : 'transparent',
                        color: isActive(to) ? GOLD : 'var(--text-primary)',
                        fontFamily: 'Tiro Telugu, serif',
                        textShadow: isActive(to) ? '0 0 10px rgba(228,178,75,0.35)' : '0 0 10px rgba(228,178,75,0.08)',
                      }}
                    >
                      <Icon size={18} />
                      {label}
                    </GuestNavLink>
                  ))}
                </nav>
                <div className="border-t" style={{ borderColor: 'var(--border-subtle)' }}>
                  <SocialSidebarLinks onNavigate={() => setDrawerOpen(false)} />
                </div>
                <div className="px-4 pb-6 space-y-1">
                  <button
                    onClick={() => { setDrawerOpen(false); setSettingsOpen(true); }}
                    className="flex items-center gap-3 px-4 py-3 rounded-xl w-full font-telugu text-sm hover:bg-white/5 transition-all"
                    style={{ color: 'var(--text-primary)', fontFamily: 'Tiro Telugu, serif' }}
                  >
                    <Settings size={18} /> సెట్టింగ్స్
                  </button>
                  {onLogout && (
                    <button
                      onClick={() => { setDrawerOpen(false); onLogout(); }}
                      className="flex items-center gap-3 px-4 py-3 rounded-xl w-full font-telugu text-sm hover:bg-white/5 transition-all"
                      style={{ color: 'var(--text-primary)', fontFamily: 'Tiro Telugu, serif' }}
                    >
                      <LogOut size={18} /> లాగ్అవుట్
                    </button>
                  )}
                  <div className="mt-3 text-center text-xs" style={{ color: '#C88F2D44' }}>వైఖానస నిధి v3.0</div>
                </div>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main Content — document scroll on mobile (no nested overflow trap) */}
      <main className="flex-1 w-full min-w-0 pb-20 lg:pb-0 pt-14 lg:pt-16">
        {children}
      </main>

      {/* Mobile Bottom Tab Bar */}
      <nav
        className="lg:hidden fixed bottom-0 left-0 right-0 z-20 flex items-center backdrop-blur-md"
        style={{ background: 'var(--bg-nav)', borderTop: '1px solid var(--border-subtle)' }}
      >
        {NAV_LINKS.map(({ to, icon: Icon, label }) => {
          const active = isActive(to);
          return (
            <GuestNavLink key={to} to={to} className="flex-1 flex flex-col items-center py-2 gap-0.5 relative">
              {active && (
                <motion.div
                  layoutId="bottom-pill"
                  className="absolute -top-0.5 left-1/2 -translate-x-1/2 w-10 h-0.5 rounded-full"
                  style={{ background: GOLD, boxShadow: '0 0 8px rgba(228,178,75,0.6)' }}
                />
              )}
              <Icon size={20} strokeWidth={active ? 2.5 : 1.8} color={active ? GOLD_MID : 'var(--text-muted)'} />
              <span
                className="font-telugu text-[10px]"
                style={{ fontFamily: 'Tiro Telugu, serif', color: active ? GOLD : 'var(--text-muted)' }}
              >
                {label}
              </span>
            </GuestNavLink>
          );
        })}
      </nav>

      <SettingsDrawer open={settingsOpen} onClose={() => setSettingsOpen(false)} />
    </div>
  );
}
