import { useState, useEffect } from 'react';

import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import { AnimatePresence, motion } from 'framer-motion';

import Layout from './components/Layout';
import AppToaster from './components/AppToaster';

import Splash from './pages/Splash';

import Onboarding from './pages/Onboarding';

import Home from './pages/Home';

import Reader from './pages/Reader';

import SearchPage from './pages/SearchPage';

import Bookmarks from './pages/Bookmarks';

import Panchangam from './pages/Panchangam';

import Profile from './pages/Profile';

import CategoriesPage from './pages/CategoriesPage';

import SubcategoryPage from './pages/SubcategoryPage';

import LoginPage from './pages/LoginPage';

import AdminPanel from './pages/AdminPanel';

import { hasSeenOnboarding, getSettings } from './store/useAppStore';

import { isLoggedIn, isAdmin } from './store/authStore';

import { applyTheme } from './lib/theme';

import { useLogout } from './hooks/useAuth';



const queryClient = new QueryClient({

  defaultOptions: {

    queries: {

      staleTime: 60 * 1000,

      retry: 1,

    },

  },

});



function PageWrapper({ children }) {

  const location = useLocation();

  return (

    <AnimatePresence mode="wait">

      <motion.div

        key={location.pathname}

        initial={{ opacity: 0, y: 8 }}

        animate={{ opacity: 1, y: 0 }}

        exit={{ opacity: 0, y: -8 }}

        transition={{ duration: 0.2 }}

      >

        {children}

      </motion.div>

    </AnimatePresence>

  );

}



function AppContent() {

  const [phase, setPhase] = useState('splash'); // 'splash' | 'onboarding' | 'login' | 'app' | 'admin'

  const logoutMutation = useLogout();



  useEffect(() => {

    applyTheme(getSettings());

  }, []);



  function afterSplash() {

    if (isLoggedIn()) {

      setPhase(isAdmin() ? 'admin' : 'app');

    } else if (hasSeenOnboarding()) {

      setPhase('login');

    } else {

      setPhase('onboarding');

    }

  }



  function handleLogin() {

    setPhase(isAdmin() ? 'admin' : 'app');

  }



  function handleLogout() {

    logoutMutation.mutate(undefined, {

      onSettled: () => setPhase('login'),

    });

  }



  if (phase === 'splash') return <Splash onDone={afterSplash} />;

  if (phase === 'onboarding') return <Onboarding onDone={() => setPhase('login')} />;

  if (phase === 'login') {
    return (
      <>
        <LoginPage onLogin={handleLogin} />
        <AppToaster />
      </>
    );
  }

  if (phase === 'admin') {
    return (
      <>
        <AdminPanel onLogout={handleLogout} />
        <AppToaster />
      </>
    );
  }



  return (

    <BrowserRouter>

      <AppRoutes onLogout={handleLogout} />

      <AppToaster />

    </BrowserRouter>

  );

}



export default function App() {

  return (

    <QueryClientProvider client={queryClient}>

      <AppContent />

    </QueryClientProvider>

  );

}



function AppRoutes({ onLogout }) {

  return (

    <Layout onLogout={onLogout}>

      <PageWrapper>

        <Routes>

          <Route path="/" element={<Home />} />

          <Route path="/read/:id" element={<Reader />} />

          <Route path="/search" element={<SearchPage />} />

          <Route path="/bookmarks" element={<Bookmarks />} />

          <Route path="/panchangam" element={<Panchangam />} />

          <Route path="/profile" element={<Profile />} />

          <Route path="/categories" element={<CategoriesPage />} />

          <Route path="/categories/:categoryKey" element={<SubcategoryPage />} />

        </Routes>

      </PageWrapper>

    </Layout>

  );

}


