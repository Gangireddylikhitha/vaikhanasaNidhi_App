import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, useLocation, useNavigate } from 'react-router-dom';
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
import Gallery from './pages/Gallery';
import AboutPage from './pages/AboutPage';
import ContactPage from './pages/ContactPage';
import VerificationPage from './pages/VerificationPage';
import LoginPage from './pages/LoginPage';
import AdminPanel from './pages/AdminPanel';
import { hasSeenOnboarding, getSettings } from './store/useAppStore';
import { isLoggedIn, isAdmin, isRegisteredUser, isVerifiedUser } from './store/authStore';
import { applyTheme } from './lib/theme';
import ThemeProvider from './components/ThemeProvider';
import { useLogout } from './hooks/useAuth';
import { LoginPromptProvider } from './context/LoginPromptContext';
import GuestGuard from './components/GuestGuard';
import VerificationGuard from './components/VerificationGuard';

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
  const [phase, setPhase] = useState('splash');
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
    if (isAdmin()) {
      setPhase('admin');
      return;
    }
    if (isRegisteredUser() && !isVerifiedUser()) {
      sessionStorage.setItem('post-login-verification', '1');
    }
    setPhase('app');
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
      <LoginPromptProvider>
        <AppRoutes onLogout={handleLogout} />
        <AppToaster />
      </LoginPromptProvider>
    </BrowserRouter>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AppContent />
      </ThemeProvider>
    </QueryClientProvider>
  );
}

function PostLoginVerificationRedirect() {
  const navigate = useNavigate();

  useEffect(() => {
    if (sessionStorage.getItem('post-login-verification') === '1') {
      sessionStorage.removeItem('post-login-verification');
      if (isRegisteredUser() && !isVerifiedUser()) {
        navigate('/verification', { replace: true });
      }
    }
  }, [navigate]);

  return null;
}

function Guarded({ children }) {
  return (
    <GuestGuard>
      <VerificationGuard>{children}</VerificationGuard>
    </GuestGuard>
  );
}

function AppRoutes({ onLogout }) {
  return (
    <Layout onLogout={onLogout}>
      <PostLoginVerificationRedirect />
      <PageWrapper>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/verification" element={<VerificationPage />} />
          <Route path="/read/:id" element={<Guarded><Reader /></Guarded>} />
          <Route path="/search" element={<Guarded><SearchPage /></Guarded>} />
          <Route path="/bookmarks" element={<Guarded><Bookmarks /></Guarded>} />
          <Route path="/panchangam" element={<Guarded><Panchangam /></Guarded>} />
          <Route path="/profile" element={<Guarded><Profile /></Guarded>} />
          <Route path="/categories" element={<Guarded><CategoriesPage /></Guarded>} />
          <Route path="/categories/:categoryKey" element={<Guarded><SubcategoryPage /></Guarded>} />
          <Route path="/gallery" element={<Guarded><Gallery /></Guarded>} />
          <Route path="/about" element={<Guarded><AboutPage /></Guarded>} />
          <Route path="/contact" element={<Guarded><ContactPage /></Guarded>} />
        </Routes>
      </PageWrapper>
    </Layout>
  );
}
