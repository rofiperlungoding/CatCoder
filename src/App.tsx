import { useEffect, lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { MainLayout } from './components/layout/MainLayout';
import { PublicLayout } from './components/layout/PublicLayout';
import { ScrollToTop } from './components/layout';
import { Toaster } from './components/ui';
import { useUserStore, useUIStore } from './stores';
import { analytics } from './services/analytics';

// Lazy load page components for code splitting
const HomePage = lazy(() => import('./pages/Home').then(m => ({ default: m.HomePage })));
const LearnPage = lazy(() => import('./pages/Learn').then(m => ({ default: m.LearnPage })));
const PracticePage = lazy(() => import('./pages/Practice').then(m => ({ default: m.PracticePage })));
const CompetePage = lazy(() => import('./pages/Compete').then(m => ({ default: m.CompetePage })));
const SpeedRunDetail = lazy(() => import('./pages/Compete').then(m => ({ default: m.SpeedRunDetail })));
const RoadmapPage = lazy(() => import('./pages/Roadmap').then(m => ({ default: m.RoadmapPage })));
const ProfilePage = lazy(() => import('./pages/Profile').then(m => ({ default: m.ProfilePage })));
const LandingPage = lazy(() => import('./pages/Landing').then(m => ({ default: m.LandingPage })));
const FeaturesPage = lazy(() => import('./pages/Public').then(m => ({ default: m.FeaturesPage })));
const PricingPage = lazy(() => import('./pages/Public').then(m => ({ default: m.PricingPage })));
const AboutPage = lazy(() => import('./pages/Public').then(m => ({ default: m.AboutPage })));
const ContactPage = lazy(() => import('./pages/Public').then(m => ({ default: m.ContactPage })));
const LoginPage = lazy(() => import('./pages/Auth/Login').then(m => ({ default: m.LoginPage })));
const AuthCallback = lazy(() => import('./pages/Auth/AuthCallback').then(m => ({ default: m.AuthCallback })));
const ForgotPasswordPage = lazy(() => import('./pages/Auth/ForgotPasswordPage').then(m => ({ default: m.ForgotPasswordPage })));
const ResetPasswordPage = lazy(() => import('./pages/Auth/ResetPasswordPage').then(m => ({ default: m.ResetPasswordPage })));
const OnboardingPage = lazy(() => import('./pages/Onboarding').then(m => ({ default: m.OnboardingPage })));
const NotFoundPage = lazy(() => import('./pages/NotFound').then(m => ({ default: m.NotFoundPage })));
const HoneypotPage = lazy(() => import('./pages/Honeypot').then(m => ({ default: m.HoneypotPage })));
const PublicProfilePage = lazy(() => import('./pages/PublicProfile').then(m => ({ default: m.PublicProfilePage })));

// Loading screen component
const LoadingScreen = () => (
  <div className="min-h-screen bg-background flex flex-col items-center justify-center">
    <div className="flex flex-col items-center justify-center space-y-8 animate-in fade-in duration-700">
      <div className="relative flex items-center justify-center">
        <div className="w-16 h-16 flex items-center justify-center text-foreground z-10 relative animate-pulse">
          <img src="/logo.png" alt="CatCoder Logo" className="w-8 h-8 object-contain" />
        </div>
        <div className="absolute inset-0 rounded-full border border-foreground/10"></div>
        <div className="absolute -inset-1 rounded-full border-[1.5px] border-foreground/80 border-t-transparent border-l-transparent animate-spin duration-1000"></div>
      </div>
      <div className="flex flex-col items-center gap-2">
        <div className="text-xs font-medium tracking-[0.4em] text-foreground/60 uppercase pl-1 animate-pulse">
          CatCoder
        </div>
      </div>
    </div>
  </div>
);

// Guard component to redirect unauthenticated users
const ProtectedRoute = ({ children }: { children: React.ReactElement }) => {
  const { isAuthenticated, isLoading } = useUserStore();

  if (isLoading) {
    return <LoadingScreen />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }
  return children;
};

// Guard component to redirect authenticated users away from landing
const PublicRoute = ({ children }: { children: React.ReactElement }) => {
  const { isAuthenticated, isLoading } = useUserStore();

  if (isLoading) {
    return <LoadingScreen />;
  }

  if (isAuthenticated) {
    return <Navigate to="/home" replace />;
  }
  return children;
};

// Track page views
const PageTracker = () => {
  const location = useLocation();

  useEffect(() => {
    analytics.logPageView(location.pathname + location.search);
  }, [location]);

  return null;
};

import { ReloadPrompt } from './components/pwa/ReloadPrompt';

function App() {
  const { initializeSession } = useUserStore();
  const { addToast } = useUIStore();

  useEffect(() => {
    // Check for storage access (Issue #3)
    try {
      localStorage.setItem('storage_test', 'test');
      localStorage.removeItem('storage_test');
    } catch (e) {
      console.warn('Storage access blocked:', e);
      addToast('warning', 'Storage access blocked. Progress may not be saved.');
    }
    initializeSession();
  }, [initializeSession, addToast]);

  return (
    <BrowserRouter>
      <ReloadPrompt />
      <PageTracker />
      <ScrollToTop />
      <Suspense fallback={<LoadingScreen />}>
        <Routes>

          {/* Public Routes */}
          <Route element={<PublicLayout />}>
            <Route path="/" element={<PublicRoute><LandingPage /></PublicRoute>} />
            <Route path="/features" element={<PublicRoute><FeaturesPage /></PublicRoute>} />
            <Route path="/pricing" element={<PublicRoute><PricingPage /></PublicRoute>} />
            <Route path="/about" element={<PublicRoute><AboutPage /></PublicRoute>} />
            <Route path="/contact" element={<PublicRoute><ContactPage /></PublicRoute>} />
          </Route>

          <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
          <Route path="/auth/callback" element={<AuthCallback />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />
          <Route path="/onboarding" element={<PublicRoute><OnboardingPage /></PublicRoute>} />

          {/* Protected App Routes */}
          <Route element={<ProtectedRoute><MainLayout /></ProtectedRoute>}>
            <Route path="/home" element={<HomePage />} />
            <Route path="/learn" element={<LearnPage />} />
            <Route path="/learn/:lessonId" element={<LearnPage />} />
            <Route path="/practice" element={<PracticePage />} />
            <Route path="/practice/:problemId" element={<PracticePage />} />
            <Route path="/compete" element={<CompetePage />} />
            <Route path="/compete/:runId" element={<SpeedRunDetail />} />
            <Route path="/roadmap" element={<RoadmapPage />} />
            <Route path="/roadmap/:pathId" element={<RoadmapPage />} />
            <Route path="/profile" element={<ProfilePage />} />
          </Route>

          {/* Honeypot Routes - Not linked in navigation */}
          {/* Requirements: 10.1, 10.5 - Define routes for common attack targets */}
          <Route path="/admin" element={<HoneypotPage />} />
          <Route path="/wp-admin" element={<HoneypotPage />} />
          <Route path="/administrator" element={<HoneypotPage />} />
          <Route path="/dashboard/admin" element={<HoneypotPage />} />

          {/* Public Profile Route - Shareable CatCoder profile link */}
          <Route path="/catcoder/:username" element={<PublicProfilePage />} />

          {/* 404 Not Found */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </Suspense>
      <Toaster />
    </BrowserRouter>
  );
}

export default App;
