import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { MainLayout } from './components/layout/MainLayout';
import { PublicLayout } from './components/layout/PublicLayout';
import { ScrollToTop } from './components/layout';
import { HomePage } from './pages/Home';
import { LearnPage } from './pages/Learn';
import { PracticePage } from './pages/Practice';
import { CompetePage } from './pages/Compete';
import { RoadmapPage } from './pages/Roadmap';
import { ProfilePage } from './pages/Profile';
import { LandingPage } from './pages/Landing';
import {
  FeaturesPage,
  PricingPage,
  CoursesPage,
  AboutPage,
  ContactPage
} from './pages/Public';
import { LoginPage } from './pages/Auth/Login';
import { useUserStore } from './stores';

// Guard component to redirect unauthenticated users
const ProtectedRoute = ({ children }: { children: React.ReactElement }) => {
  const { isAuthenticated } = useUserStore();
  // For demo purposes, we might want to allow easy access, but strictly speaking:
  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }
  return children;
};

// Guard component to redirect authenticated users away from landing
const PublicRoute = ({ children }: { children: React.ReactElement }) => {
  const { isAuthenticated } = useUserStore();
  if (isAuthenticated) {
    return <Navigate to="/home" replace />;
  }
  return children;
};

function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <Routes>

        {/* Public Routes */}
        <Route element={<PublicLayout />}>
          <Route path="/" element={<PublicRoute><LandingPage /></PublicRoute>} />
          <Route path="/features" element={<PublicRoute><FeaturesPage /></PublicRoute>} />
          <Route path="/courses" element={<PublicRoute><CoursesPage /></PublicRoute>} />
          <Route path="/pricing" element={<PublicRoute><PricingPage /></PublicRoute>} />
          <Route path="/about" element={<PublicRoute><AboutPage /></PublicRoute>} />
          <Route path="/contact" element={<PublicRoute><ContactPage /></PublicRoute>} />
        </Route>

        <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />

        {/* Protected App Routes */}
        <Route element={<ProtectedRoute><MainLayout /></ProtectedRoute>}>
          <Route path="/home" element={<HomePage />} />
          <Route path="/learn" element={<LearnPage />} />
          <Route path="/learn/:lessonId" element={<LearnPage />} />
          <Route path="/practice" element={<PracticePage />} />
          <Route path="/practice/:problemId" element={<PracticePage />} />
          <Route path="/compete" element={<CompetePage />} />
          <Route path="/roadmap" element={<RoadmapPage />} />
          <Route path="/roadmap/:pathId" element={<RoadmapPage />} />
          <Route path="/profile" element={<ProfilePage />} />
        </Route>

        {/* Catch all - redirect to home (which will redirect to landing if not auth) */}
        <Route path="*" element={<Navigate to="/home" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
