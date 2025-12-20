import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { MainLayout } from './components/layout/MainLayout';
import { PublicLayout } from './components/layout/PublicLayout';
import { ScrollToTop } from './components/layout';
import { Toaster } from './components/ui';
import { HomePage } from './pages/Home';
import { LearnPage } from './pages/Learn';
import { PracticePage } from './pages/Practice';
import { CompetePage, SpeedRunDetail } from './pages/Compete';
import { RoadmapPage } from './pages/Roadmap';
import { ProfilePage } from './pages/Profile';
import { LandingPage } from './pages/Landing';
import {
  FeaturesPage,
  PricingPage,
  AboutPage,
  ContactPage
} from './pages/Public';
import { LoginPage } from './pages/Auth/Login';
import { ForgotPasswordPage } from './pages/Auth/ForgotPasswordPage';
import { ResetPasswordPage } from './pages/Auth/ResetPasswordPage';
import { OnboardingPage } from './pages/Onboarding';
import { useUserStore } from './stores';
import { Cat } from 'lucide-react';

// Loading screen component
const LoadingScreen = () => (
  <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-4">
    <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center text-white animate-pulse">
      <Cat size={32} />
    </div>
    <div className="text-sm font-medium text-muted-foreground">Loading...</div>
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

function App() {
  const { initializeSession } = useUserStore();

  useEffect(() => {
    initializeSession();
  }, [initializeSession]);

  return (
    <BrowserRouter>
      <ScrollToTop />
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

        {/* Catch all - redirect to home (which will redirect to landing if not auth) */}
        <Route path="*" element={<Navigate to="/home" replace />} />
      </Routes>
      <Toaster />
    </BrowserRouter>
  );
}

export default App;
