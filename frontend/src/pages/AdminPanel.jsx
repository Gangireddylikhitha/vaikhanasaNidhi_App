import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import AdminSidebar from '../components/admin/AdminSidebar';
import AdminHeader from '../components/admin/AdminHeader';
import AdminDashboard from './adminPages/AdminDashboard';
import AdminScriptures from './adminPages/AdminScriptures';
import AdminCategories from './adminPages/AdminCategories';

export default function AdminPanel({ onLogout }) {
  const [tab, setTab] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  function handleTabChange(id) {
    setTab(id);
    setSidebarOpen(false);
  }

  return (
    <div className="min-h-screen flex page-bg">
      <AdminSidebar
        tab={tab}
        sidebarOpen={sidebarOpen}
        onTabChange={handleTabChange}
        onCloseSidebar={() => setSidebarOpen(false)}
        onLogout={onLogout}
      />

      <div className="flex-1 lg:ml-64 flex flex-col min-h-screen min-h-0 overflow-hidden">
        <AdminHeader
          tab={tab}
          onOpenSidebar={() => setSidebarOpen(true)}
          onLogout={onLogout}
        />

        <main className="flex-1 min-h-0 p-4 sm:p-6 overflow-x-hidden overflow-y-auto scrollbar-hide">
          <AnimatePresence mode="wait">
            <motion.div key={tab} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }} transition={{ duration: 0.15 }}>
              {tab === 'dashboard' && <AdminDashboard />}
              {tab === 'scriptures' && <AdminScriptures />}
              {tab === 'categories' && <AdminCategories />}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}
