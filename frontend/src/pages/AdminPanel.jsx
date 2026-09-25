import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import AdminSidebar from '../components/admin/AdminSidebar';
import AdminHeader from '../components/admin/AdminHeader';
import AdminDashboard from './adminPages/AdminDashboard';
import AdminUsers from './adminPages/AdminUsers';
import AdminScriptures from './adminPages/AdminScriptures';
import AdminCategories from './adminPages/AdminCategories';
import AdminGallery from './adminPages/AdminGallery';
import AdminVerifications from './adminPages/AdminVerifications';
import { setAppBackHandler, pushNativeBackHandler } from '../lib/nativeBack';

export default function AdminPanel({ onLogout }) {
  const navigate = useNavigate();
  const [tab, setTab] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const tabRef = useRef(tab);
  const sidebarOpenRef = useRef(sidebarOpen);
  const tabHistoryRef = useRef([]);

  tabRef.current = tab;
  sidebarOpenRef.current = sidebarOpen;

  function handleExitToApp() {
    navigate('/');
  }

  function handleTabChange(id) {
    setTab((prev) => {
      if (prev !== id) tabHistoryRef.current.push(prev);
      return id;
    });
    setSidebarOpen(false);
  }

  // Primary admin back: previous tab / dashboard (never exit from Scriptures etc.)
  useEffect(() => {
    return setAppBackHandler(() => {
      if (sidebarOpenRef.current) {
        setSidebarOpen(false);
        return true;
      }
      if (tabHistoryRef.current.length > 0) {
        setTab(tabHistoryRef.current.pop());
        return true;
      }
      if (tabRef.current !== 'dashboard') {
        setTab('dashboard');
        return true;
      }
      navigate('/');
      return true;
    });
  }, [navigate]);

  // Extra overlay handlers stay available for future modals
  useEffect(() => {
    if (!sidebarOpen) return undefined;
    return pushNativeBackHandler(() => {
      setSidebarOpen(false);
      return true;
    });
  }, [sidebarOpen]);

  return (
    <div className="admin-shell flex page-bg h-full min-h-0 w-full">
      <AdminSidebar
        tab={tab}
        sidebarOpen={sidebarOpen}
        onTabChange={handleTabChange}
        onCloseSidebar={() => setSidebarOpen(false)}
        onLogout={onLogout}
      />

      <div className="flex-1 lg:ml-64 flex flex-col min-h-0 h-full overflow-hidden">
        <AdminHeader
          tab={tab}
          onOpenSidebar={() => setSidebarOpen(true)}
          onLogout={onLogout}
          onExitToApp={handleExitToApp}
        />

        <main className="admin-main-scroll flex-1 min-h-0 p-4 sm:p-6 overflow-x-hidden overflow-y-auto scrollbar-hide">
          <AnimatePresence mode="wait">
            <motion.div key={tab} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }} transition={{ duration: 0.15 }}>
              {tab === 'dashboard' && (
                <AdminDashboard
                  onOpenUsers={() => handleTabChange('users')}
                  onOpenVerifications={() => handleTabChange('verifications')}
                />
              )}
              {tab === 'users' && <AdminUsers />}
              {tab === 'verifications' && <AdminVerifications />}
              {tab === 'scriptures' && <AdminScriptures />}
              {tab === 'gallery' && <AdminGallery />}
              {tab === 'categories' && <AdminCategories />}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}
