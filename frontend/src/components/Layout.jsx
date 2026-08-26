import { useState, useEffect, useRef } from 'react';
import { isNativeApp } from '../lib/native';
import { pushNativeBackHandler } from '../lib/nativeBack';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Home, Search, Bookmark, Calendar, User, Menu, X, Settings, LogOut, Info, Phone, Shield, Sparkles, HeartHandshake } from 'lucide-react';
import SettingsDrawer from './SettingsDrawer';
import GuestNavLink from './GuestNavLink';
import { WhatsAppIcon, InstagramIcon } from './SocialLinkIcons';
import { SOCIAL_LINKS, WHATSAPP_URL, INSTAGRAM_URL, openWhatsAppChat } from '../constants/socialLinks';
import SoundToggle from './SoundToggle';
import { brandLogo as logo } from '../constants/brandAssets';
import vaikhanasaGuru from '../assets/images/vaikhanasaGuru.png';
import { isAdmin } from '../store/authStore';

const NAV_LINKS = [
  { to: '/', icon: Home, label: 'హోం', en: 'Sacred' },
  { to: '/search', icon: Search, label: 'శోధన', en: 'Mantras' },
  { to: '/bookmarks', icon: Bookmark, label: 'బుక్మార్క్స్', en: 'Library' },
  { to: '/panchangam', icon: Calendar, label: 'పంచాంగం', en: 'Panchangam' },
  { to: '/profile', icon: User, label: 'ప్రొఫైల్', en: 'Profile' },
];

const DRAWER_EXTRA_LINKS = [
  { to: '/japam', icon: Sparkles, label: 'జపం', en: 'Japam' },
  { to: '/support', icon: HeartHandshake, label: ' సేవా సహకారం ', en: 'Support' },
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
          const isWhatsApp = id === 'whatsapp';
          return (
            <a
              key={id}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => {
                if (isWhatsApp) openWhatsAppChat(e);
                onNavigate?.(e);
              }}
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
  const mainRef = useRef(null);
  const native = isNativeApp();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const admin = isAdmin();

  useEffect(() => {
    const el = native ? mainRef.current : null;
    const handler = () => {
      const y = el ? el.scrollTop : window.scrollY;
      setScrolled(y > 8);
    };
    const target = el || window;
    target.addEventListener('scroll', handler, { passive: true });
    return () => target.removeEventListener('scroll', handler);
  }, [native]);

  useEffect(() => {
    if (!drawerOpen) return undefined;
    if (native && mainRef.current) {
      const main = mainRef.current;
      const prev = main.style.overflow;
      main.style.overflow = 'hidden';
      return () => { main.style.overflow = prev; };
    }
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = prev; };
  }, [drawerOpen, native]);

  useEffect(() => {
    if (!drawerOpen && !settingsOpen) return undefined;
    return pushNativeBackHandler(() => {
      if (settingsOpen) {
        setSettingsOpen(false);
        return true;
      }
      if (drawerOpen) {
        setDrawerOpen(false);
        return true;
      }
      return false;
    });
  }, [drawerOpen, settingsOpen]);

  const isActive = (to) => location.pathname === to;
  const isReaderRoute = location.pathname.startsWith('/read/');

  return (
    <div className="app-shell min-h-dvh flex flex-col page-bg">

      {/* Top Navigation — desktop & tablet */}
      <header
        className={`hidden lg:flex fixed top-0 left-0 right-0 z-30 items-center justify-between gap-3 px-6 h-20 transition-all duration-300 backdrop-blur-md ${scrolled ? 'border-b' : ''}`}
        style={{ background: 'var(--bg-nav)', borderColor: scrolled ? 'var(--border-subtle)' : 'transparent' }}
      >
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 flex-shrink-0">
          <div className="w-12 h-12 rounded-full flex items-center justify-center overflow-hidden" style={{ border: '1px solid var(--border-medium)', boxShadow: '0 0 12px rgba(200,143,45,0.2)' }}>
            <img src={logo} alt="Vaikhanasa Nidhi" className="w-9 h-9 object-contain" />
          </div>
          <span className="font-telugu font-bold text-lg gold-glow text-primary-gold whitespace-nowrap" style={{ fontFamily: 'Tiro Telugu, serif' }}>
            వైఖానస నిధి
          </span>
        </Link>

        {/* Center nav links */}
        <nav className="flex items-center gap-1 flex-1 min-w-0 justify-center overflow-x-auto scrollbar-hide">
          {NAV_LINKS.map(({ to, label }) => (
            <GuestNavLink
              key={to}
              to={to}
              className="px-3 py-2 rounded-lg text-sm transition-all duration-200 font-telugu flex-shrink-0 whitespace-nowrap"
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
              className="px-2.5 py-2 rounded-lg text-sm transition-all duration-200 font-telugu opacity-80 flex-shrink-0 whitespace-nowrap"
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
        <div className="flex items-center gap-0.5 flex-shrink-0">
          <GuestNavLink to="/search" className="p-2 rounded-lg transition-colors hover:bg-white/5" style={{ color: GOLD }} title="Search">
            <Search size={18} />
          </GuestNavLink>
          <SoundToggle
            className="p-2 rounded-lg transition-colors hover:bg-white/5"
            iconSize={18}
          />
          <button onClick={() => setSettingsOpen(true)} className="p-2 rounded-lg transition-colors hover:bg-white/5" style={{ color: GOLD }} title="Settings">
            <Settings size={18} />
          </button>
          <a
            href={WHATSAPP_URL}
            target="_blank"
            rel="noopener noreferrer"
            onClick={openWhatsAppChat}
            className="sidebar-social-btn sidebar-social-btn--compact p-2"
            aria-label="WhatsApp Chat"
            title="Chat on WhatsApp: 79810 91684"
          >
            <WhatsAppIcon size={18} />
          </a>
          <a
            href={INSTAGRAM_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="sidebar-social-btn sidebar-social-btn--compact p-2"
            aria-label="Instagram"
            title="@ssri_vaikhanasam_app"
          >
            <InstagramIcon size={18} />
          </a>
          {admin && (
            <Link to="/admin" className="p-2 rounded-lg transition-colors hover:bg-white/5" style={{ color: GOLD }} title="Admin Panel">
              <Shield size={18} />
            </Link>
          )}
          {onLogout && (
            <button
              onClick={onLogout}
              className="flex items-center justify-center p-2 rounded-lg transition-colors hover:bg-white/5 ml-1 flex-shrink-0"
              style={{ color: GOLD, border: '1px solid var(--border-medium)' }}
              title="Logout"
              aria-label="Logout"
            >
              <LogOut size={18} />
            </button>
          )}
        </div>
      </header>

      {/* Mobile Header */}
      <header
        className={`app-mobile-header lg:hidden fixed top-0 left-0 right-0 z-20 flex items-center justify-between px-3 h-14 transition-all duration-300 backdrop-blur-md ${scrolled ? 'border-b' : ''}`}
        style={{ background: 'var(--bg-nav)', borderColor: scrolled ? 'var(--border-subtle)' : 'transparent' }}
      >
        <button onClick={() => setDrawerOpen(true)} className="p-1.5 text-primary-gold">
          <Menu size={20} />
        </button>
        <Link to="/" className="flex items-center gap-1.5">
          <img src={logo} alt="Vaikhanasa Nidhi" className="w-9 h-9 object-contain" style={{ filter: 'drop-shadow(0 0 8px rgba(200,143,45,0.35))' }} />
          <span className="font-telugu font-bold text-sm gold-glow text-primary-gold" style={{ fontFamily: 'Tiro Telugu, serif' }}>
            వైఖానస నిధి
          </span>
        </Link>
        <SoundToggle
          className="p-1.5 rounded-lg transition-colors hover:bg-white/5"
          iconSize={17}
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
                  {DRAWER_EXTRA_LINKS.map(({ to, icon: Icon, label }) => {
                    const isSupport = to === '/support';
                    return (
                      <GuestNavLink
                        key={to}
                        to={to}
                        onClick={() => setDrawerOpen(false)}
                        className={`flex items-center justify-between px-4 py-3.5 rounded-xl font-telugu text-sm transition-all w-full text-left ${
                          isSupport && !isActive(to) ? 'border border-amber-500/30' : ''
                        }`}
                        style={{
                          background: isActive(to) ? '#C88F2D25' : isSupport ? 'rgba(200, 143, 45, 0.12)' : 'transparent',
                          color: isActive(to) || isSupport ? GOLD : 'var(--text-primary)',
                          fontFamily: 'Tiro Telugu, serif',
                          textShadow: isActive(to) ? '0 0 10px rgba(228,178,75,0.35)' : '0 0 10px rgba(228,178,75,0.08)',
                        }}
                      >
                        <span className="flex items-center gap-3">
                          <Icon size={18} color={isSupport ? GOLD : undefined} />
                          {label}
                        </span>
                        {isSupport && (
                          <span className="text-[10px] px-2 py-0.5 rounded-full font-bold uppercase bg-amber-500/20 text-amber-300 border border-amber-500/40">
                            UPI
                          </span>
                        )}
                      </GuestNavLink>
                    );
                  })}
                </nav>
                <div className="border-t" style={{ borderColor: 'var(--border-subtle)' }}>
                  <SocialSidebarLinks onNavigate={() => setDrawerOpen(false)} />
                </div>
                <div className="px-4 pb-6 space-y-1">
                  {admin && (
                    <Link
                      to="/admin"
                      onClick={() => setDrawerOpen(false)}
                      className="flex items-center gap-3 px-4 py-3 rounded-xl w-full font-telugu text-sm hover:bg-white/5 transition-all"
                      style={{ color: GOLD, fontFamily: 'Tiro Telugu, serif' }}
                    >
                      <Shield size={18} /> అడ్మిన్ ప్యానెల్
                    </Link>
                  )}
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
      <main
        ref={mainRef}
        className={`app-main-scroll flex-1 w-full min-w-0 min-h-0 ${isReaderRoute ? 'pb-2' : 'pb-20'} lg:pb-0 ${native ? '' : 'pt-14'} lg:pt-20`}
      >
        {children}
      </main>

      {/* Mobile Bottom Tab Bar — hidden on scripture reader for book immersion */}
      {!isReaderRoute && (
      <nav
        className="app-bottom-nav lg:hidden fixed bottom-0 left-0 right-0 z-20 flex items-center backdrop-blur-md"
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
      )}

      <SettingsDrawer open={settingsOpen} onClose={() => setSettingsOpen(false)} />
    </div>
  );
}
